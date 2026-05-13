/**
 * GET /api/birdy/admin
 * System health, infrastructure status, routing table, and performance stats.
 * Used by the Admin tab in Birdy panel.
 */
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAvailableModels } from '@/lib/birdy/embedding'
import { listWorkflows } from '@/lib/birdy/agents/workflows'
import { listTools } from '@/lib/birdy/agents'
import { registerBuiltinTools } from '@/lib/birdy/agents/tools'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

registerBuiltinTools()

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')

  // Parallel status checks — all non-fatal
  const [dbCheck, ollamaModels, usageStats, agentStats, docCount] = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`.then(() => true),
    getAvailableModels(),
    sessionId
      ? prisma.birdyUsageLog.aggregate({
          where: { createdAt: { gte: new Date(Date.now() - 24 * 3600_000) } },
          _count: { id: true },
          _avg: { latencyMs: true, ragLatencyMs: true },
          _sum: { tokensOut: true, ragChunksUsed: true },
        })
      : Promise.resolve(null),
    sessionId
      ? prisma.birdyAgentTask.groupBy({
          by: ['status'],
          _count: { id: true },
          where: { sessionId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600_000) } },
        })
      : Promise.resolve([]),
    prisma.birdyDocument.count({ where: { status: 'READY', ...(sessionId ? { sessionId } : {}) } }),
  ])

  const db           = dbCheck.status === 'fulfilled' ? dbCheck.value : false
  const models       = ollamaModels.status === 'fulfilled' ? ollamaModels.value : []
  const stats        = usageStats.status === 'fulfilled' ? usageStats.value : null
  const agentSummary = agentStats.status === 'fulfilled' ? agentStats.value : []
  const docsReady    = docCount.status === 'fulfilled' ? docCount.value : 0

  const REQUIRED_MODELS = ['nomic-embed-text', 'phi4', 'deepseek-coder-v2', 'qwen3']
  const ollamaConnected = models.length > 0

  const modelStatus = REQUIRED_MODELS.map(required => ({
    model:     required,
    available: models.some(m => m.startsWith(required.split(':')[0])),
  }))

  // Routing table (static — matches router.ts logic)
  const routingTable = [
    { intent: 'Strategic / complex',  provider: 'Claude',          model: 'claude-sonnet-4-20250514', trigger: '>200 words or strategic keywords' },
    { intent: 'Code / technical',     provider: 'Ollama',          model: 'deepseek-coder-v2:16b',    trigger: 'Code-related keywords' },
    { intent: 'Reasoning / explain',  provider: 'Ollama',          model: 'qwen3:32b',                trigger: '50+ words or explain/how/why' },
    { intent: 'Simple / utility',     provider: 'Ollama',          model: 'phi4',                     trigger: 'Short messages' },
    { intent: 'Embeddings',           provider: 'Ollama',          model: 'nomic-embed-text',         trigger: 'RAG pipeline (automatic)' },
    { intent: 'Fallback (all)',        provider: 'Claude',          model: 'claude-sonnet-4-20250514', trigger: 'Any Ollama failure' },
  ]

  // P50/P95 latency (last 24h from DB — approximate via sorted sample)
  let p50 = 0, p95 = 0
  try {
    const latencies = await prisma.birdyUsageLog.findMany({
      where:   { createdAt: { gte: new Date(Date.now() - 24 * 3600_000) }, latencyMs: { not: null } },
      select:  { latencyMs: true },
      orderBy: { latencyMs: 'asc' },
      take:    200,
    })
    if (latencies.length) {
      p50 = latencies[Math.floor(latencies.length * 0.50)]?.latencyMs ?? 0
      p95 = latencies[Math.floor(latencies.length * 0.95)]?.latencyMs ?? 0
    }
  } catch {}

  return NextResponse.json({
    infrastructure: {
      database:  { connected: db },
      claude:    { configured: !!process.env.ANTHROPIC_API_KEY, model: 'claude-sonnet-4-20250514' },
      ollama:    { connected: ollamaConnected, baseUrl: process.env.OLLAMA_BASE_URL ?? null, models: modelStatus },
      pgvector:  { configured: db },
    },
    routing: routingTable,
    platform: {
      workflows:     listWorkflows().map(w => ({ id: w.id, name: w.name, category: w.category, steps: w.steps.length })),
      tools:         listTools().map(t => ({ name: t.name, description: t.description })),
      docsIndexed:   docsReady,
    },
    performance: {
      last24h: {
        requests:       stats?._count.id     ?? 0,
        tokensOut:      stats?._sum.tokensOut ?? 0,
        ragChunksUsed:  stats?._sum.ragChunksUsed ?? 0,
        avgLatencyMs:   Math.round(stats?._avg.latencyMs ?? 0),
        avgRagLatencyMs: Math.round(stats?._avg.ragLatencyMs ?? 0),
        p50LatencyMs:   p50,
        p95LatencyMs:   p95,
      },
      agentTasks: agentSummary,
    },
  })
}
