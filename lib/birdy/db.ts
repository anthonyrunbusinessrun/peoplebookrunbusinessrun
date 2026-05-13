/**
 * lib/birdy/db.ts
 * Birdy database operations — single source of truth for all Birdy queries.
 */

import { prisma } from '@/lib/prisma'
import type { BirdyRole } from '@prisma/client'

const MAX_MESSAGES_PER_CONV = 20
const MAX_CONVERSATIONS      = 30
const CONV_EXPIRE_DAYS        = 30

// ── Conversations ─────────────────────────────────────────────────────────────

export async function getConversations(sessionId: string) {
  return prisma.birdyConversation.findMany({
    where:   { sessionId },
    orderBy: { updatedAt: 'desc' },
    take:    MAX_CONVERSATIONS,
    select: {
      id:        true,
      title:     true,
      module:    true,
      createdAt: true,
      updatedAt: true,
      _count:    { select: { messages: true } },
    },
  })
}

export async function createConversation(sessionId: string, firstMessage?: string, module?: string) {
  const title = firstMessage
    ? firstMessage.slice(0, 60).trim() + (firstMessage.length > 60 ? '…' : '')
    : 'New conversation'
  return prisma.birdyConversation.create({
    data:   { sessionId, title, module },
    select: { id: true, title: true, createdAt: true },
  })
}

export async function getConversation(id: string, sessionId: string) {
  return prisma.birdyConversation.findFirst({ where: { id, sessionId } })
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getMessages(conversationId: string, sessionId: string) {
  const conv = await getConversation(conversationId, sessionId)
  if (!conv) return null
  return prisma.birdyMessage.findMany({
    where:   { conversationId },
    orderBy: { createdAt: 'asc' },
    take:    MAX_MESSAGES_PER_CONV,
    select:  { id: true, role: true, content: true, modelUsed: true, provider: true, actionKey: true, createdAt: true },
  })
}

export async function getMessageHistory(conversationId: string) {
  const msgs = await prisma.birdyMessage.findMany({
    where:   { conversationId },
    orderBy: { createdAt: 'asc' },
    take:    MAX_MESSAGES_PER_CONV,
    select:  { role: true, content: true },
  })
  return msgs.map(m => ({
    role:    m.role === 'USER' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }))
}

export async function saveMessage(data: {
  conversationId: string
  role:           BirdyRole
  content:        string
  modelUsed?:     string
  provider?:      string
  tokensIn?:      number
  tokensOut?:     number
  latencyMs?:     number
  actionKey?:     string
}) {
  const [message] = await prisma.$transaction([
    prisma.birdyMessage.create({ data }),
    prisma.birdyConversation.update({
      where: { id: data.conversationId },
      data:  { updatedAt: new Date() },
    }),
  ])
  return message
}

// ── Knowledge base ────────────────────────────────────────────────────────────

export async function getDocuments(sessionId: string) {
  return prisma.birdyDocument.findMany({
    where:   { sessionId },
    orderBy: { createdAt: 'desc' },
    take:    50,
    select:  { id: true, name: true, mimeType: true, sizeBytes: true, status: true, chunkCount: true, createdAt: true },
  })
}

export async function createDocument(data: {
  sessionId:  string
  name:       string
  mimeType:   string
  sizeBytes?: number
  storageUrl: string
  namespace?: string
}) {
  return prisma.birdyDocument.create({ data })
}

// ── Maintenance ────────────────────────────────────────────────────────────────

export async function pruneOldConversations() {
  const cutoff = new Date(Date.now() - CONV_EXPIRE_DAYS * 24 * 60 * 60 * 1000)
  const { count } = await prisma.birdyConversation.deleteMany({
    where: { updatedAt: { lt: cutoff } },
  })
  return count
}
