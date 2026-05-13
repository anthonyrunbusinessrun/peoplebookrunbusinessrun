import { NextRequest, NextResponse } from 'next/server'
import { getConversations, createConversation } from '@/lib/birdy/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }
  const conversations = await getConversations(sessionId)
  return NextResponse.json({ conversations })
}

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json()
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }
  const conv = await createConversation(sessionId)
  return NextResponse.json({ conversation: conv }, { status: 201 })
}
