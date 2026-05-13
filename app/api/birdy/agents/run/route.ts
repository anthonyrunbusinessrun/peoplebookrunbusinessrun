/**
 * POST /api/birdy/agents/run
 * Enqueue and execute an agent workflow.
 * Returns immediately with taskId; execution runs in background.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkflow } from '@/lib/birdy/agents/workflows'
import { AgentRunner } from '@/lib/birdy/agents/runner'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: { sessionId?: string; workflowId?: string; input?: Record<string, unknown> }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { sessionId, workflowId, input = {} } = body
  if (!sessionId)  return NextResponse.json({ error: 'sessionId required'  }, { status: 400 })
  if (!workflowId) return NextResponse.json({ error: 'workflowId required' }, { status: 400 })

  const workflow = getWorkflow(workflowId)
  if (!workflow) return NextResponse.json({ error: `Unknown workflow: ${workflowId}` }, { status: 404 })

  // Create task record
  const task = await prisma.birdyAgentTask.create({
    data: {
      sessionId,
      workflowId,
      workflowName: workflow.name,
      inputJson:    input,
      stepsTotal:   workflow.steps.length,
    },
  })

  const ctx = { sessionId, taskId: task.id }

  // Run in background
  setImmediate(() => {
    AgentRunner.run(task.id, workflow, input, ctx)
      .catch(err => {
        console.error(`[agents/run] Unhandled error in task ${task.id}:`, err)
        prisma.birdyAgentTask.update({
          where: { id: task.id },
          data:  { status: 'FAILED', errorMessage: (err as Error).message, completedAt: new Date() },
        }).catch(console.error)
      })
  })

  return NextResponse.json({ taskId: task.id, status: 'queued', workflow: workflow.name }, { status: 202 })
}
