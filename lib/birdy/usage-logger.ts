import { prisma } from '@/lib/prisma'

export interface UsageLogEntry {
  sessionId:      string
  conversationId?: string
  provider:       string
  model:          string
  intent?:        string
  tokensIn?:      number
  tokensOut?:     number
  latencyMs?:     number
  ragChunksUsed?: number
  ragLatencyMs?:  number
  status?:        'success' | 'error' | 'fallback'
  errorMessage?:  string
  pageModule?:    string
  actionKey?:     string
}

export async function logUsage(entry: UsageLogEntry): Promise<void> {
  try {
    await prisma.birdyUsageLog.create({
      data: {
        sessionId:      entry.sessionId,
        conversationId: entry.conversationId,
        provider:       entry.provider,
        model:          entry.model,
        intent:         entry.intent,
        tokensIn:       entry.tokensIn  ?? 0,
        tokensOut:      entry.tokensOut ?? 0,
        latencyMs:      entry.latencyMs,
        ragChunksUsed:  entry.ragChunksUsed,
        ragLatencyMs:   entry.ragLatencyMs,
        status:         entry.status ?? 'success',
        errorMessage:   entry.errorMessage,
        pageModule:     entry.pageModule,
        actionKey:      entry.actionKey,
      },
    })
  } catch (err) {
    console.error('[birdy/usage-logger] Write failed:', err)
  }
}

export async function getRecentActivity(sessionId: string, limit = 20) {
  return prisma.birdyUsageLog.findMany({
    where:   { sessionId },
    orderBy: { createdAt: 'desc' },
    take:    limit,
    select: {
      id: true, provider: true, model: true, intent: true,
      tokensIn: true, tokensOut: true, latencyMs: true,
      ragChunksUsed: true, ragLatencyMs: true,
      status: true, pageModule: true, actionKey: true, createdAt: true,
    },
  })
}

export async function getUsageStats(sessionId: string) {
  const result = await prisma.birdyUsageLog.aggregate({
    where:  { sessionId, status: 'success' },
    _sum:   { tokensIn: true, tokensOut: true, ragChunksUsed: true },
    _count: { id: true },
    _avg:   { latencyMs: true, ragLatencyMs: true },
  })
  return {
    totalRequests:   result._count.id,
    totalTokensIn:   result._sum.tokensIn      ?? 0,
    totalTokensOut:  result._sum.tokensOut     ?? 0,
    totalRagChunks:  result._sum.ragChunksUsed ?? 0,
    avgLatencyMs:    Math.round(result._avg.latencyMs    ?? 0),
    avgRagLatencyMs: Math.round(result._avg.ragLatencyMs ?? 0),
  }
}
