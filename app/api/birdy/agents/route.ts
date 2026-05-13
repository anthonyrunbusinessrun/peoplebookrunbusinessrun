/**
 * GET /api/birdy/agents — list agent tasks for a session
 * DELETE /api/birdy/agents/:id — cancel a task
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  const tasks = await prisma.birdyAgentTask.findMany({
    where:   { sessionId },
    orderBy: { createdAt: 'desc' },
    take:    20,
    select: {
      id: true, workflowId: true, workflowName: true, status: true,
      stepCount: true, stepsTotal: true, errorMessage: true,
      startedAt: true, completedAt: true, createdAt: true,
      _count: { select: { toolCalls: true } },
    },
  })
  return NextResponse.json({ tasks })
}
