/**
 * lib/birdy/memory.ts
 * Long-term conversation memory — summarization + retrieval.
 *
 * DESIGN:
 *   After a conversation accumulates SUMMARY_THRESHOLD messages,
 *   a background job summarizes the oldest unsummarized messages using
 *   phi4 (fast local model). The summary is stored in BirdyMemorySummary.
 *
 *   On each new request, recent summaries for this session are fetched
 *   and injected into the system prompt as a <memory> block.
 *
 *   This gives Birdy persistent operational context across conversations:
 *   "I remember we discussed your Q3 hiring plan last week…"
 *
 * LIMITS:
 *   - Max 3 summaries injected per request (~1500 chars budget)
 *   - Summaries expire after 90 days (not implemented yet, future task)
 *   - Summary generation is fire-and-forget, never blocks response
 */

import { prisma } from '@/lib/prisma'
import { phi4Provider, claudeProvider } from './providers'

const SUMMARY_THRESHOLD = 15   // messages before summarization triggers
const MAX_SUMMARIES_CTX = 3    // summaries injected per request
const SUMMARY_MAX_CHARS = 500  // per summary in the context block

// ── Retrieval ─────────────────────────────────────────────────────────────

/**
 * getMemoryContext() — inject into system prompt before each response.
 * Returns a formatted string block, or '' if no relevant memory exists.
 */
export async function getMemoryContext(sessionId: string): Promise<string> {
  try {
    const summaries = await prisma.birdyMemorySummary.findMany({
      where:   { sessionId },
      orderBy: { createdAt: 'desc' },
      take:    MAX_SUMMARIES_CTX,
      select:  { summary: true, createdAt: true, messageCount: true },
    })

    if (!summaries.length) return ''

    const lines = summaries
      .reverse()  // chronological order
      .map((s: { summary: string; createdAt: Date; messageCount: number }) => {
        const age = formatAge(s.createdAt)
        return `- (${age}, ~${s.messageCount} messages) ${s.summary.slice(0, SUMMARY_MAX_CHARS)}`
      })
      .join('\n')

    return `\n## Session Memory\nPrevious interactions with this user:\n${lines}`
  } catch (err) {
    console.warn('[memory] Failed to retrieve context:', err)
    return ''
  }
}

// ── Summarization ─────────────────────────────────────────────────────────

/**
 * maybeScheduleSummary() — called after saving each assistant message.
 * Checks if summarization is needed and schedules it as a background job.
 */
export function maybeScheduleSummary(conversationId: string, sessionId: string): void {
  setImmediate(() => summarizeIfNeeded(conversationId, sessionId).catch(console.error))
}

async function summarizeIfNeeded(conversationId: string, sessionId: string): Promise<void> {
  // Count messages in this conversation
  const totalMessages = await prisma.birdyMessage.count({ where: { conversationId } })
  if (totalMessages < SUMMARY_THRESHOLD) return

  // Count already-summarized messages
  const existing = await prisma.birdyMemorySummary.findFirst({
    where:   { conversationId },
    orderBy: { createdAt: 'desc' },
    select:  { toMessageId: true, messageCount: true },
  })

  // Get messages not yet summarized
  const messages = await prisma.birdyMessage.findMany({
    where:   {
      conversationId,
      ...(existing?.toMessageId ? {
        createdAt: {
          gt: (await prisma.birdyMessage.findUnique({
            where:  { id: existing.toMessageId },
            select: { createdAt: true },
          }))?.createdAt ?? new Date(0)
        }
      } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take:    SUMMARY_THRESHOLD,
    select:  { id: true, role: true, content: true },
  })

  if (messages.length < SUMMARY_THRESHOLD) return

  // Build transcript for summarization
  const transcript = messages
    .map((m: { id: string; role: string; content: string }) => `${m.role === 'USER' ? 'User' : 'Birdy'}: ${m.content.slice(0, 300)}`)
    .join('\n\n')

  const summaryPrompt = `Summarize this conversation in 2-3 sentences. Focus on: decisions made, tasks discussed, key context. Be concise and factual. Do not editorialize.

Conversation:
${transcript}`

  // Use phi4 (fast local) or Claude as fallback
  let summary = ''
  let model   = 'phi4'

  try {
    const msgs = [{ role: 'user' as const, content: summaryPrompt }]
    for await (const chunk of phi4Provider.stream(msgs, 'You are a concise summarization assistant.')) {
      if (chunk.delta) summary += chunk.delta
      if (chunk.done)  break
    }
  } catch {
    // Fallback to Claude
    try {
      model = 'claude-sonnet-4-20250514'
      const resp = await claudeProvider.stream(
        [{ role: 'user', content: summaryPrompt }],
        'You are a concise summarization assistant.'
      )
      for await (const chunk of resp) {
        if (chunk.delta) summary += chunk.delta
        if (chunk.done)  break
      }
    } catch (err) {
      console.warn('[memory] Both providers failed for summarization:', err)
      return
    }
  }

  if (!summary.trim()) return

  await prisma.birdyMemorySummary.create({
    data: {
      sessionId,
      conversationId,
      summary:      summary.trim().slice(0, 1000),
      messageCount: messages.length,
      fromMessageId: messages[0].id,
      toMessageId:   messages[messages.length - 1].id,
      model,
    },
  })

  console.log(`[memory] Summary created for conv ${conversationId} (${messages.length} msgs)`)
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatAge(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const hours  = Math.round(diffMs / 3_600_000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(diffMs / 86_400_000)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
