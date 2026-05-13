import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureVectorSetup } from '@/lib/birdy/pgvector'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// pgvector setup runs once on first health check (Railway calls this on startup)
let vectorReady = false

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}

  // Database ping
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  // pgvector setup (idempotent — safe to call on every cold start)
  if (!vectorReady && checks.database === 'ok') {
    try {
      await ensureVectorSetup()
      vectorReady = true
      checks.pgvector = 'ok'
    } catch {
      checks.pgvector = 'error'
    }
  } else {
    checks.pgvector = vectorReady ? 'ok' : 'error'
  }

  const allOk = Object.values(checks).every(v => v === 'ok')
  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, ts: new Date().toISOString() },
    { status: allOk ? 200 : 207 }
  )
}
