import { PrismaClient } from '@prisma/client'

// Connection limit: keeps Railway Postgres connections bounded.
// Railway free tier allows ~97 connections; we cap each process at 5.
// If you scale to multiple Railway instances, set this lower (3).
function buildPrismaClient() {
  const url = process.env.DATABASE_URL ?? ''
  // Append pool settings if not already present
  const pooledUrl = url.includes('connection_limit')
    ? url
    : `${url}${url.includes('?') ? '&' : '?'}connection_limit=5&pool_timeout=10`

  return new PrismaClient({
    datasources: { db: { url: pooledUrl } },
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
  })
}

const g = globalThis as { _prisma?: PrismaClient }
export const prisma: PrismaClient = g._prisma ?? buildPrismaClient()
if (process.env.NODE_ENV !== 'production') g._prisma = prisma
