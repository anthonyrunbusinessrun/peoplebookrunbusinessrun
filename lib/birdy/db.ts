/**
 * lib/birdy/db.ts
 * Birdy database operations — single source of truth for all Birdy queries.
 */
import { prisma } from '@/lib/prisma'

const MAX_MESSAGES = 20
const MAX_CONVS    = 30

// ── Conversations ─────────────────────────────────────────────────────────────
export async function getConversations(sessionId: string) {
  return prisma.birdyConversation.findMany({
    where: { sessionId }, orderBy: { updatedAt: 'desc' }, take: MAX_CONVS,
    select: { id: true, title: true, module: true, createdAt: true, updatedAt: true, _count: { select: { messages: true } } },
  })
}

export async function createConversation(sessionId: string, firstMessage?: string, module?: string) {
  const title = firstMessage
    ? firstMessage.slice(0, 60).trim() + (firstMessage.length > 60 ? '…' : '')
    : 'New conversation'
  return prisma.birdyConversation.create({ data: { sessionId, title, module }, select: { id: true, title: true, createdAt: true } })
}

export async function getConversation(id: string, sessionId: string) {
  return prisma.birdyConversation.findFirst({ where: { id, sessionId } })
}

// ── Messages ──────────────────────────────────────────────────────────────────
export async function getMessages(conversationId: string, sessionId: string) {
  const conv = await getConversation(conversationId, sessionId)
  if (!conv) return null
  return prisma.birdyMessage.findMany({
    where: { conversationId }, orderBy: { createdAt: 'asc' }, take: MAX_MESSAGES,
    select: { id: true, role: true, content: true, modelUsed: true, provider: true, actionKey: true, citations: true, createdAt: true },
  })
}

export async function getMessageHistory(conversationId: string) {
  const msgs = await prisma.birdyMessage.findMany({
    where: { conversationId }, orderBy: { createdAt: 'asc' }, take: MAX_MESSAGES,
    select: { role: true, content: true },
  })
  return msgs.map((m: { role: string; content: string }) => ({
    role:    m.role === 'USER' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }))
}

export async function saveMessage(data: {
  conversationId: string
  role:           'USER' | 'ASSISTANT'
  content:        string
  modelUsed?:     string
  provider?:      string
  tokensIn?:      number
  tokensOut?:     number
  latencyMs?:     number
  actionKey?:     string
  citations?:     unknown
}) {
  const [message] = await prisma.$transaction([
    prisma.birdyMessage.create({ data: {
      conversationId: data.conversationId,
      role:           data.role as 'USER' | 'ASSISTANT',
      content:        data.content,
      modelUsed:      data.modelUsed,
      provider:       data.provider,
      tokensIn:       data.tokensIn,
      tokensOut:      data.tokensOut,
      latencyMs:      data.latencyMs,
      actionKey:      data.actionKey,
      citations:      data.citations as object ?? undefined,
    } }),
    prisma.birdyConversation.update({ where: { id: data.conversationId }, data: { updatedAt: new Date() } }),
  ])
  return message
}

// ── Knowledge ─────────────────────────────────────────────────────────────────
export async function getDocuments(sessionId: string) {
  return prisma.birdyDocument.findMany({
    where: { sessionId }, orderBy: { createdAt: 'desc' }, take: 50,
    select: { id: true, name: true, mimeType: true, sizeBytes: true, status: true, chunkCount: true, wordCount: true, errorMsg: true, createdAt: true },
  })
}

export async function createDocument(data: { sessionId: string; name: string; mimeType: string; sizeBytes?: number; storageUrl: string; namespace?: string }) {
  return prisma.birdyDocument.create({ data: { ...data, namespace: data.namespace ?? 'default' } })
}

export async function pruneOldConversations() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const { count } = await prisma.birdyConversation.deleteMany({ where: { updatedAt: { lt: cutoff } } })
  return count
}
