import { NextRequest, NextResponse } from 'next/server'
import { getDocuments, createDocument } from '@/lib/birdy/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  const docs = await getDocuments(sessionId)
  return NextResponse.json({ documents: docs })
}

export async function POST(req: NextRequest) {
  let body: { sessionId?: string; name?: string; mimeType?: string; storageUrl?: string; sizeBytes?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { sessionId, name, mimeType, storageUrl } = body
  if (!sessionId || !name || !mimeType || !storageUrl) {
    return NextResponse.json({ error: 'sessionId, name, mimeType, storageUrl required' }, { status: 400 })
  }

  const doc = await createDocument({ sessionId, name, mimeType, storageUrl, sizeBytes: body.sizeBytes })
  return NextResponse.json({ document: doc }, { status: 201 })
}
