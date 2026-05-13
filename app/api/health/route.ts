/**
 * app/api/health/route.ts
 * Comprehensive system health endpoint.
 * Railway calls this to determine if the service is alive.
 * Also used by the admin panel and deployment validation.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureVectorSetup } from '@/lib/birdy/pgvector'
import { getAvailableModels } from '@/lib/birdy/embedding'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

let vectorInitDone = false

export async function GET() {
  const t0    = Date.now()
  const checks: Record<string, unknown> = {}
  let   allCriticalOk = true

  // ── Database ─────────────────────────────────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: 'ok' }
  } catch (err) {
    checks.database = { status: 'error', error: (err as Error).message }
    allCriticalOk   = false
  }

  // ── pgvector (lazy init on first health check) ────────────────────────────
  if (!vectorInitDone && checks.database && (checks.database as { status: string }).status === 'ok') {
    try {
      await ensureVectorSetup()
      vectorInitDone = true
      checks.pgvector = { status: 'ok', justInitialized: true }
    } catch (err) {
      checks.pgvector = { status: 'error', error: (err as Error).message }
      // Non-critical — RAG falls back to full-text
    }
  } else {
    checks.pgvector = { status: vectorInitDone ? 'ok' : 'pending' }
  }

  // ── Claude API key ────────────────────────────────────────────────────────
  const claudeKey = !!process.env.ANTHROPIC_API_KEY
  checks.claude = { status: claudeKey ? 'ok' : 'error', configured: claudeKey }
  if (!claudeKey) allCriticalOk = false

  // ── Ollama (non-critical — graceful degradation to Claude) ───────────────
  if (process.env.OLLAMA_BASE_URL) {
    try {
      const models = await getAvailableModels()
      checks.ollama = {
        status: models.length > 0 ? 'ok' : 'degraded',
        connected: true,
        models: models.slice(0, 8),
        baseUrl: process.env.OLLAMA_BASE_URL,
      }
    } catch {
      checks.ollama = { status: 'offline', connected: false, note: 'Routing to Claude fallback' }
    }
  } else {
    checks.ollama = { status: 'not_configured', note: 'Set OLLAMA_BASE_URL to enable local models' }
  }

  const latencyMs = Date.now() - t0
  const status    = allCriticalOk ? 'ok' : 'degraded'

  return NextResponse.json(
    {
      status,
      service:   'birdy',
      version:   'production-alpha',
      latencyMs,
      checks,
      ts: new Date().toISOString(),
    },
    {
      status: allCriticalOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
