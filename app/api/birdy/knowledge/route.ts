import { NextRequest, NextResponse } from 'next/server'
import { getDocuments } from '@/lib/birdy/db'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  const docs = await getDocuments(sessionId)
  return NextResponse.json({ documents: docs })
}

// DELETE a document and its chunks/embeddings
export async function DELETE(req: NextRequest) {
  const { id, sessionId } = await req.json()
  if (!id || !sessionId) return NextResponse.json({ error: 'id + sessionId required' }, { status: 400 })

  const doc = await prisma.birdyDocument.findFirst({ where: { id, sessionId } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.birdyDocument.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
