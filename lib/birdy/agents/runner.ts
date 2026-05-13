/**
 * lib/birdy/agents/runner.ts
 * Agent execution engine — runs workflows step-by-step with audit logging.
 *
 * DESIGN:
 *   - Each step executes one tool with a timeout envelope
 *   - Results are persisted to BirdyToolCall (audit trail)
 *   - Task status tracked in BirdyAgentTask
 *   - Errors are caught per-step; skipOnError steps don't abort the workflow
 *   - Final output: aggregation of all step results
 */

import { prisma } from '@/lib/prisma'
import { getTool } from './registry'
import { registerBuiltinTools } from './tools'
import type { Workflow, AgentContext, WorkflowRun, ToolResult } from './types'

// Ensure tools are registered at module load time
registerBuiltinTools()

export class AgentRunner {
  /**
   * run() — execute a workflow and persist all state.
   * Designed to be called from a background job (setImmediate / queue).
   */
  static async run(
    taskId:   string,
    workflow: Workflow,
    input:    Record<string, unknown>,
    ctx:      AgentContext,
  ): Promise<WorkflowRun> {
    // Mark task as running
    await prisma.birdyAgentTask.update({
      where: { id: taskId },
      data:  { status: 'RUNNING', startedAt: new Date(), stepsTotal: workflow.steps.length },
    })

    const run: WorkflowRun = {
      taskId,
      workflow,
      input,
      ctx,
      stepResults: [],
      status: 'running',
    }

    let lastSuccessData: unknown = input

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]
      const tool = getTool(step.name ?? step.tool)

      if (!tool) {
        const err = `Tool "${step.name ?? step.tool}" not found in registry`
        run.stepResults.push({ step: step.name, result: { success: false, data: null, error: err }, status: 'error', latencyMs: 0 })
        if (!step.skipOnError) { run.status = 'failed'; break }
        continue
      }

      // Merge workflow input + step params + last step output as context
      const params: Record<string, unknown> = {
        ...input,
        ...(step.params ?? {}),
        _previousOutput: lastSuccessData,
      }

      const t0     = Date.now()
      let   result: ToolResult
      try {
        // Timeout envelope
        result = await Promise.race([
          tool.execute(params, ctx),
          new Promise<ToolResult>((_, rej) =>
            setTimeout(() => rej(new Error(`Tool timeout after ${tool.timeoutMs ?? 30_000}ms`)), tool.timeoutMs ?? 30_000)
          ),
        ])
      } catch (err) {
        result = { success: false, data: null, error: (err as Error).message }
      }

      const latencyMs = Date.now() - t0
      const status    = result.success ? 'done' : (step.skipOnError ? 'skipped' : 'error')

      run.stepResults.push({ step: step.name, result, status, latencyMs })

      // Persist tool call
      await prisma.birdyToolCall.create({
        data: {
          taskId,
          toolName:    tool.name,
          stepName:    step.name,
          inputJson:   params as object,
          outputJson:  result as object,
          status:      result.success ? 'success' : 'error',
          latencyMs,
          errorMessage: result.error,
        },
      }).catch(console.error)

      // Update step count
      await prisma.birdyAgentTask.update({
        where: { id: taskId },
        data:  { stepCount: i + 1 },
      }).catch(console.error)

      if (!result.success && !step.skipOnError) {
        run.status = 'failed'
        break
      }

      if (result.success) lastSuccessData = result.data
    }

    // Compile final output
    run.output = run.stepResults
      .filter(r => r.status === 'done')
      .map(r => ({ step: r.step, data: r.result.data }))

    if (run.status !== 'failed') run.status = 'completed'

    // Persist final task state
    await prisma.birdyAgentTask.update({
      where: { id: taskId },
      data: {
        status:      run.status === 'completed' ? 'COMPLETED' : 'FAILED',
        outputJson:  run.output as object,
        completedAt: new Date(),
        errorMessage: run.status === 'failed'
          ? run.stepResults.findLast(r => r.status === 'error')?.result.error
          : undefined,
      },
    }).catch(console.error)

    return run
  }
}
