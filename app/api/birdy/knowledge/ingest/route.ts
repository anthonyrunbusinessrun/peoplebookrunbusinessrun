/**
 * POST /api/birdy/knowledge/ingest
 * Trigger ingestion for an already-uploaded document.
 * Returns immediately; ingestion runs in background via setImmediate.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createDocument } from '@/lib/birdy/db'
import { scheduleIngestion } from '@/lib/birdy/ingestion'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: {
    sessionId?: string; name?: string; mimeType?: string
    storageUrl?: string; sizeBytes?: number; namespace?: string
  }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { sessionId, name, mimeType, storageUrl, sizeBytes, namespace } = body

  if (!sessionId || !name || !mimeType || !storageUrl) {
    return NextResponse.json(
      { error: 'sessionId, name, mimeType, storageUrl are required' },
      { status: 400 }
    )
  }

  // Create the document record (status: PENDING)
  const doc = await createDocument({
    sessionId,
    name,
    mimeType,
    storageUrl,
    sizeBytes,
    namespace: namespace ?? 'default',
  })

  // Fire background ingestion
  scheduleIngestion(doc.id)

  return NextResponse.json(
    { document: doc, message: 'Ingestion started' },
    { status: 202 }
  )
}
