/**
 * Birdy database operations — all queries go through here.
 * Keeps DB access explicit, paginated, and safe.
 */

import { prisma } from '@/lib/prisma'
import type { BirdyRole } from '@prisma/client'

const MAX_MESSAGES_PER_CONV = 20   // conversation window limit
const MAX_CONVERSATIONS = 30       // max conversations per session
const CONV_EXPIRE_DAYS = 30        // prune conversations older than this

// ── Conversations ────────────────────────────────────────────────────────────

export async function getConversations(sessionId: string) {
  return prisma.birdyConversation.findMany({
    where: { sessionId },
    orderBy: { updatedAt: 'desc' },
    take: MAX_CONVERSATIONS,
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  })
}

export async function createConversation(sessionId: string, firstMessage?: string) {
  const title = firstMessage
    ? firstMessage.slice(0, 60).trim() + (firstMessage.length > 60 ? '…' : '')
    : 'New conversation'

  return prisma.birdyConversation.create({
    data: { sessionId, title },
    select: { id: true, title: true, createdAt: true },
  })
}

export async function getConversation(id: string, sessionId: string) {
  return prisma.birdyConversation.findFirst({
    where: { id, sessionId }, // sessionId scoping prevents cross-session access
  })
}

// ── Messages ─────────────────────────────────────────────────────────────────

export async function getMessages(conversationId: string, sessionId: string) {
  // Verify conversation belongs to this session
  const conv = await getConversation(conversationId, sessionId)
  if (!conv) return null

  return prisma.birdyMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: MAX_MESSAGES_PER_CONV,   // cap to avoid huge history payloads
    select: {
      id: true,
      role: true,
      content: true,
      modelUsed: true,
      provider: true,
      createdAt: true,
    },
  })
}

export async function getMessageHistory(conversationId: string) {
  // Returns last N messages for AI context — minimal fields only
  const msgs = await prisma.birdyMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: MAX_MESSAGES_PER_CONV,
    select: { role: true, content: true },
  })

  return msgs.map(m => ({
    role: m.role === 'USER' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }))
}

export async function saveMessage(data: {
  conversationId: string
  role: BirdyRole
  content: string
  modelUsed?: string
  provider?: string
  tokensIn?: number
  tokensOut?: number
  latencyMs?: number
}) {
  const [message] = await prisma.$transaction([
    prisma.birdyMessage.create({ data }),
    // Touch the conversation updatedAt so it sorts to top
    prisma.birdyConversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    }),
  ])
  return message
}

// ── Maintenance ───────────────────────────────────────────────────────────────

/**
 * Prune old conversations — call this from a cron or periodically.
 * Deletes conversations older than CONV_EXPIRE_DAYS with no recent messages.
 */
export async function pruneOldConversations() {
  const cutoff = new Date(Date.now() - CONV_EXPIRE_DAYS * 24 * 60 * 60 * 1000)
  const { count } = await prisma.birdyConversation.deleteMany({
    where: { updatedAt: { lt: cutoff } },
  })
  return count
}
