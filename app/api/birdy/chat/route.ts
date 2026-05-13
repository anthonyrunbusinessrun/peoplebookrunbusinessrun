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

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Stream timeout — Railway cuts connections after ~60s by default
export const maxDuration = 55

export async function POST(req: NextRequest) {
  // ── 1. Rate limit ─────────────────────────────────────────────────────────
  const identifier = getRateLimitIdentifier(req)
  const rl = checkRateLimit(identifier, { limit: 10, windowMs: 60_000 })

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before sending another message.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  // ── 2. Parse + validate ───────────────────────────────────────────────────
  let body: { message?: string; conversationId?: string; sessionId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { message, conversationId, sessionId } = body

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const trimmedMessage = message.trim().slice(0, 16_000) // hard cap

  // ── 3. Resolve conversation ───────────────────────────────────────────────
  let convId = conversationId
  if (!convId) {
    const conv = await createConversation(sessionId, trimmedMessage)
    convId = conv.id
  } else {
    const conv = await getConversation(convId, sessionId)
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
  }

  // ── 4. Load history + context ─────────────────────────────────────────────
  const [history, roles] = await Promise.all([
    getMessageHistory(convId),
    getRoles().catch(() => []),   // non-fatal — Birdy works without role context
  ])

  const systemPrompt = buildSystemPrompt({
    openRoles: formatRolesForContext(roles),
  })

  // ── 5. Save user message ──────────────────────────────────────────────────
  await saveMessage({
    conversationId: convId,
    role: 'USER',
    content: trimmedMessage,
  })

  // ── 6. Route to AI provider ───────────────────────────────────────────────
  const routing = routeMessage(trimmedMessage)
  const messagesForAI = [
    ...history,
    { role: 'user' as const, content: trimmedMessage },
  ]

  // ── 7. Stream response ────────────────────────────────────────────────────
  const encoder = new TextEncoder()
  let fullContent = ''
  const startTime = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send conversation ID so client can persist it
      send({ conversationId: convId, model: routing.provider.modelName })

      const tryProvider = async (provider: typeof routing.provider) => {
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
      } catch {
        // Fallback to Claude if primary Ollama provider fails
        if (routing.fallback !== routing.provider) {
          fullContent = ''
          try {
            await tryProvider(routing.fallback)
          } catch (err2) {
            send({ error: 'AI service temporarily unavailable', done: true })
            controller.close()
            return
          }
        } else {
          send({ error: 'AI service temporarily unavailable', done: true })
          controller.close()
          return
        }
      }

      // Persist assistant message (non-blocking to avoid holding the stream)
      saveMessage({
        conversationId: convId!,
        role: 'ASSISTANT',
        content: fullContent,
        modelUsed: routing.provider.modelName,
        provider: routing.provider.providerName,
        latencyMs: Date.now() - startTime,
      }).catch(console.error)

      send({ done: true })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',  // disable nginx/Railway proxy buffering
      'X-RateLimit-Remaining': String(rl.remaining),
    },
  })
}
