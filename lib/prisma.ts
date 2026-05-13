/**
 * lib/prisma.ts
 * Singleton Prisma client with Railway-optimised connection pooling.
 *
 * TUNING RATIONALE:
 *   Railway Postgres free tier: ~97 max connections
 *   Next.js warm instances: 1 (Railway starts one container)
 *   Prisma default pool: number_of_CPUs * 2 + 1 → usually 5–9 on Railway
 *
 *   We explicitly cap at 5 connections and add:
 *   - pool_timeout:       10s  → fast fail if no connection available (avoids piling up)
 *   - connect_timeout:     5s  → Railway pod-to-pod network is fast; 5s is generous
 *   - statement_timeout:  30s  → kills runaway queries before Railway's 60s request timeout
 *   - idle_in_transaction: 15s → reclaims connections left open by aborted tx
 *
 *   These parameters go in the DATABASE_URL query string (pgvector/psql wire protocol).
 *   Prisma passes them to the underlying pg driver.
 */

import { PrismaClient } from '@prisma/client'

function buildClient(): PrismaClient {
  const base = process.env.DATABASE_URL
  if (!base) throw new Error('DATABASE_URL is not set')

  // Compose query params — don't double-add them if already present
  const url = new URL(base)

  const defaults: Record<string, string> = {
    connection_limit:                    '5',
    pool_timeout:                        '10',
    connect_timeout:                     '5',
    statement_timeout:                   '30000',   // ms
    idle_in_transaction_session_timeout: '15000',   // ms
  }

  for (const [k, v] of Object.entries(defaults)) {
    if (!url.searchParams.has(k)) url.searchParams.set(k, v)
  }

  return new PrismaClient({
    datasources: { db: { url: url.toString() } },
    log: process.env.NODE_ENV === 'development'
      ? [{ level: 'warn', emit: 'stdout' }, { level: 'error', emit: 'stdout' }]
      : [{ level: 'error', emit: 'stdout' }],
    errorFormat: 'minimal',
  })
}

// Global singleton — prevents new clients on every hot-reload in dev
const g = globalThis as { _prisma?: PrismaClient }

export const prisma: PrismaClient = g._prisma ?? buildClient()

if (process.env.NODE_ENV !== 'production') {
  g._prisma = prisma
}

// Graceful shutdown — important for Railway's SIGTERM on deploys
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
