/**
 * app/api/birdy/chat/route.ts
 * Birdy AI streaming chat endpoint — Server-Sent Events (SSE).
 *
 * PERFORMANCE NOTES:
 *   - Airtable roles are now cached (lib/birdy/cache) → no API call per message
 *   - DB message history fetches are capped at 20 rows with minimal field selection
 *   - Assistant message is saved asynchronously (non-blocking) after stream completes
 *   - Request deduplication via in-flight map prevents duplicate concurrent AI calls
 *   - Rate limiting via lib/birdy/rate-limiter (sliding window, per IP)
 *
 * STREAMING:
 *   Uses ReadableStream with SSE encoding.
 *   nginx (when deployed) has proxy_buffering=off for this route.
 *   Railway's edge also respects X-Accel-Buffering: no.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/birdy/rate-limiter'
import { routeMessage } from '@/lib/birdy/router'
import { buildSystemPrompt, formatRolesForContext } from '@/lib/birdy/prompt'
import {
  getConversation,
  getMessageHistory,
  saveMessage,
  createConversation,
} from '@/lib/birdy/db'
import { getRoles } from '@/lib/airtable'

export const runtime    = 'nodejs'
export const dynamic    = 'force-dynamic'
export const maxDuration = 55   // Railway cuts connections at ~60s

// ── Request deduplication ─────────────────────────────────────────────────────
// Prevents two identical simultaneous requests from hitting the AI twice.
// Key: `${sessionId}:${conversationId}:${message.slice(0,40)}`
const inFlight = new Set<string>()

// ── SSE helpers ───────────────────────────────────────────────────────────────
const enc = new TextEncoder()
function sseData(obj: object): Uint8Array {
  return enc.encode(`data: ${JSON.stringify(obj)}\n\n`)
}

export async function POST(req: NextRequest) {
  // ── 1. Rate limit ──────────────────────────────────────────────────────────
  const identifier = getRateLimitIdentifier(req)
  const rl = checkRateLimit(identifier, { limit: 10, windowMs: 60_000 })

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before sending another message.' },
      {
        status: 429,
        headers: {
          'Retry-After':           String(rl.retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  // ── 2. Parse + validate ────────────────────────────────────────────────────
  let body: { message?: unknown; conversationId?: unknown; sessionId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { message, conversationId, sessionId } = body

  if (typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'message is required and must be a non-empty string' }, { status: 400 })
  }
  if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const trimmedMessage = message.trim().slice(0, 16_000)
  const sid = sessionId.trim()
  const cid = typeof conversationId === 'string' ? conversationId.trim() : null

  // ── 3. Deduplication guard ─────────────────────────────────────────────────
  const dedupKey = `${sid}:${cid ?? 'new'}:${trimmedMessage.slice(0, 40)}`
  if (inFlight.has(dedupKey)) {
    return NextResponse.json({ error: 'Request already in progress' }, { status: 409 })
  }
  inFlight.add(dedupKey)

  // ── 4. Resolve conversation ────────────────────────────────────────────────
  let convId: string
  try {
    if (!cid) {
      const conv = await createConversation(sid, trimmedMessage)
      convId = conv.id
    } else {
      const conv = await getConversation(cid, sid)
      if (!conv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      convId = cid
    }
  } catch (err) {
    inFlight.delete(dedupKey)
    console.error('[birdy/chat] DB error resolving conversation:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 503 })
  }

  // ── 5. Load history + context (parallelised, both non-fatal on failure) ────
  const [history, roles] = await Promise.allSettled([
    getMessageHistory(convId),
    getRoles(),   // ← now cached — returns instantly on cache hit
  ])

  const msgHistory  = history.status  === 'fulfilled' ? history.value  : []
  const roleList    = roles.status    === 'fulfilled' ? roles.value    : []

  const systemPrompt = buildSystemPrompt({
    openRoles: formatRolesForContext(roleList),
  })

  // ── 6. Save user message ───────────────────────────────────────────────────
  try {
    await saveMessage({ conversationId: convId, role: 'USER', content: trimmedMessage })
  } catch (err) {
    inFlight.delete(dedupKey)
    console.error('[birdy/chat] DB error saving user message:', err)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 503 })
  }

  // ── 7. Route to provider ───────────────────────────────────────────────────
  const routing      = routeMessage(trimmedMessage)
  const messagesForAI = [
    ...msgHistory,
    { role: 'user' as const, content: trimmedMessage },
  ]

  // ── 8. Stream ─────────────────────────────────────────────────────────────
  let fullContent = ''
  const startTime = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        try { controller.enqueue(sseData(obj)) } catch { /* client disconnected */ }
      }

      // First event: tell client the conversationId and model being used
      send({ conversationId: convId, model: routing.provider.modelName })

      const tryProvider = async (provider: typeof routing.provider) => {
        fullContent = ''   // reset on fallback
        for await (const chunk of provider.stream(messagesForAI, systemPrompt)) {
          if (chunk.error) throw new Error(chunk.error)
          if (chunk.delta) {
            fullContent += chunk.delta
            send({ delta: chunk.delta })
          }
          if (chunk.done) return
        }
      }

      try {
        await tryProvider(routing.provider)
      } catch (primaryErr) {
        // Fallback to Claude if the Ollama provider fails
        if (routing.fallback !== routing.provider) {
          console.warn('[birdy/chat] Primary provider failed, falling back to Claude:', primaryErr)
          try {
            await tryProvider(routing.fallback)
          } catch (fallbackErr) {
            console.error('[birdy/chat] Fallback also failed:', fallbackErr)
            send({ error: 'AI service temporarily unavailable. Please try again.', done: true })
            controller.close()
            inFlight.delete(dedupKey)
            return
          }
        } else {
          console.error('[birdy/chat] Provider failed (no fallback):', primaryErr)
          send({ error: 'AI service temporarily unavailable. Please try again.', done: true })
          controller.close()
          inFlight.delete(dedupKey)
          return
        }
      }

      // Save assistant message asynchronously — don't block the stream close
      if (fullContent.trim()) {
        saveMessage({
          conversationId: convId,
          role:           'ASSISTANT',
          content:        fullContent,
          modelUsed:      routing.provider.modelName,
          provider:       routing.provider.providerName,
          latencyMs:      Date.now() - startTime,
        }).catch(err => console.error('[birdy/chat] Failed to save assistant message:', err))
      }

      send({ done: true })
      controller.close()
      inFlight.delete(dedupKey)
    },
    cancel() {
      // Client disconnected — clean up
      inFlight.delete(dedupKey)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':          'text/event-stream',
      'Cache-Control':         'no-store, no-cache, must-revalidate',
      'X-Accel-Buffering':     'no',
      'X-RateLimit-Remaining': String(rl.remaining),
      'Connection':            'keep-alive',
    },
  })
}
