import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/birdy/rate-limiter'
import { routeMessage } from '@/lib/birdy/router'
import { buildSystemPrompt, formatRolesForContext } from '@/lib/birdy/prompt'
import { detectModule } from '@/lib/birdy/context'
import { getConversation, getMessageHistory, saveMessage, createConversation } from '@/lib/birdy/db'
import { logUsage } from '@/lib/birdy/usage-logger'
import { buildRagContext } from '@/lib/birdy/rag'
import { getMemoryContext, maybeScheduleSummary } from '@/lib/birdy/memory'
import { getRoles } from '@/lib/airtable'

export const runtime    = 'nodejs'
export const dynamic    = 'force-dynamic'
export const maxDuration = 55

const inFlight = new Set<string>()
const enc      = new TextEncoder()
const sse      = (obj: object) => enc.encode(`data: ${JSON.stringify(obj)}\n\n`)

export async function POST(req: NextRequest) {
  // ── Rate limit ─────────────────────────────────────────────────────────
  const id = getRateLimitIdentifier(req)
  const rl = checkRateLimit(id, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit reached. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  // ── Parse body ─────────────────────────────────────────────────────────
  let body: {
    message?: unknown; conversationId?: unknown; sessionId?: unknown
    pageModule?: unknown; actionKey?: unknown; namespace?: unknown
  }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { message, conversationId, sessionId, pageModule, actionKey, namespace } = body
  if (typeof message   !== 'string' || !message.trim())   return NextResponse.json({ error: 'message required'   }, { status: 400 })
  if (typeof sessionId !== 'string' || !sessionId.trim()) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  const msg  = message.trim().slice(0, 16_000)
  const sid  = sessionId.trim()
  const cid  = typeof conversationId === 'string' ? conversationId.trim() : null
  const mod  = typeof pageModule === 'string' ? pageModule : 'unknown'
  const akey = typeof actionKey  === 'string' ? actionKey  : undefined
  const ns   = typeof namespace  === 'string' ? namespace  : 'default'

  // ── Dedup guard ────────────────────────────────────────────────────────
  const dedupKey = `${sid}:${cid ?? 'new'}:${msg.slice(0, 40)}`
  if (inFlight.has(dedupKey)) return NextResponse.json({ error: 'Already in progress' }, { status: 409 })
  inFlight.add(dedupKey)

  // ── Resolve conversation ───────────────────────────────────────────────
  let convId: string
  try {
    if (!cid) {
      const conv = await createConversation(sid, msg, mod)
      convId = conv.id
    } else {
      const conv = await getConversation(cid, sid)
      if (!conv) { inFlight.delete(dedupKey); return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
      convId = cid
    }
  } catch {
    inFlight.delete(dedupKey)
    return NextResponse.json({ error: 'Database error' }, { status: 503 })
  }

  // ── Load all context in parallel ───────────────────────────────────────
  // history + roles + memory + RAG — all non-fatal on failure
  const [histResult, rolesResult, memResult, ragResult] = await Promise.allSettled([
    getMessageHistory(convId),
    getRoles(),
    getMemoryContext(sid),
    buildRagContext(msg, ns),
  ])

  const history     = histResult.status  === 'fulfilled' ? histResult.value  : []
  const roleList    = rolesResult.status === 'fulfilled' ? rolesResult.value : []
  const memoryBlock = memResult.status   === 'fulfilled' ? memResult.value   : ''
  const ragCtx      = ragResult.status   === 'fulfilled' ? ragResult.value   : null
  const pageCtx     = detectModule(mod)

  const systemPrompt = buildSystemPrompt({
    openRoles:   formatRolesForContext(roleList),
    pageContext:  pageCtx,
    memoryBlock,
    ragBlock:    ragCtx?.systemBlock,
  })

  // ── Save user message ──────────────────────────────────────────────────
  try {
    await saveMessage({ conversationId: convId, role: 'USER', content: msg, actionKey: akey })
  } catch {
    inFlight.delete(dedupKey)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 503 })
  }

  // ── Route to provider ──────────────────────────────────────────────────
  const routing       = routeMessage(msg)
  const messagesForAI = [...history, { role: 'user' as const, content: msg }]
  let   fullContent   = ''
  const startTime     = Date.now()

  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (obj: object) => { try { ctrl.enqueue(sse(obj)) } catch {} }

      // First event: metadata for the client
      send({
        conversationId: convId,
        model:          routing.provider.modelName,
        intent:         routing.intent,
        ragUsed:        (ragCtx?.chunksUsed ?? 0) > 0,
        citations:      ragCtx?.citations ?? [],
      })

      const tryProvider = async (provider: typeof routing.provider) => {
        fullContent = ''
        for await (const chunk of provider.stream(messagesForAI, systemPrompt)) {
          if (chunk.error) throw new Error(chunk.error)
          if (chunk.delta) { fullContent += chunk.delta; send({ delta: chunk.delta }) }
          if (chunk.done)  return
        }
      }

      let usageStatus: 'success' | 'error' | 'fallback' = 'success'

      try {
        await tryProvider(routing.provider)
      } catch {
        if (routing.fallback !== routing.provider) {
          usageStatus = 'fallback'
          try   { await tryProvider(routing.fallback) }
          catch { usageStatus = 'error'; send({ error: 'AI service unavailable', done: true }); ctrl.close(); inFlight.delete(dedupKey); return }
        } else {
          usageStatus = 'error'
          send({ error: 'AI service unavailable', done: true })
          ctrl.close(); inFlight.delete(dedupKey); return
        }
      }

      const latencyMs = Date.now() - startTime

      // Async persistence — never block the stream
      if (fullContent.trim()) {
        saveMessage({
          conversationId: convId,
          role:       'ASSISTANT',
          content:    fullContent,
          modelUsed:  routing.provider.modelName,
          provider:   routing.provider.providerName,
          latencyMs,
          actionKey:  akey,
          citations:  (ragCtx?.citations ?? undefined) as object | undefined,
        }).then(() => {
          // Schedule memory summarization after saving
          maybeScheduleSummary(convId, sid)
        }).catch(console.error)
      }

      logUsage({
        sessionId:      sid,
        conversationId: convId,
        provider:       routing.provider.providerName,
        model:          routing.provider.modelName,
        intent:         routing.intent,
        tokensOut:      Math.ceil(fullContent.length / 4),
        latencyMs,
        status:         usageStatus,
        pageModule:     mod,
        actionKey:      akey,
        ragChunksUsed:  ragCtx?.chunksUsed,
        ragLatencyMs:   ragCtx?.latencyMs,
      } as Parameters<typeof logUsage>[0]).catch(console.error)

      send({ done: true })
      ctrl.close()
      inFlight.delete(dedupKey)
    },
    cancel() { inFlight.delete(dedupKey) },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':          'text/event-stream',
      'Cache-Control':         'no-store',
      'X-Accel-Buffering':     'no',
      'Connection':            'keep-alive',
      'X-RateLimit-Remaining': String(rl.remaining),
    },
  })
}
