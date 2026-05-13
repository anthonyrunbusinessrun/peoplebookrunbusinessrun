/**
 * GET /api/birdy/knowledge/search?q=...&namespace=...&sessionId=...
 * Semantic search over the knowledge base.
 * Used by the Knowledge tab search UI.
 */
import { NextRequest, NextResponse } from 'next/server'
import { retrieve } from '@/lib/birdy/retrieval'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q         = req.nextUrl.searchParams.get('q')
  const namespace = req.nextUrl.searchParams.get('namespace') ?? 'default'
  const sessionId = req.nextUrl.searchParams.get('sessionId')

  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'q parameter required' }, { status: 400 })
  }
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const result = await retrieve(q.trim(), namespace, { topK: 8, minScore: 0.5 })

  return NextResponse.json({
    results:    result.chunks,
    method:     result.method,
    latencyMs:  result.latencyMs,
    count:      result.chunks.length,
  })
}
