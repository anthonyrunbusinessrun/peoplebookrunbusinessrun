/**
 * lib/birdy/agents/types.ts
 * Core type contracts for the Birdy agent runtime.
 */

// ── Tool system ────────────────────────────────────────────────────────────

export interface ToolParam {
  type:        'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  required?:   boolean
}

export interface ToolResult {
  success:  boolean
  data:     unknown
  error?:   string
  metadata?: Record<string, unknown>
}

export interface AgentContext {
  sessionId:      string
  taskId:         string
  pageModule?:    string
  conversationId?: string
}

export interface Tool {
  name:        string
  description: string
  parameters:  Record<string, ToolParam>
  timeoutMs?:  number     // default: 30_000
  execute(params: Record<string, unknown>, ctx: AgentContext): Promise<ToolResult>
}

// ── Workflow system ────────────────────────────────────────────────────────

export type StepStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped'

export interface WorkflowStep {
  name:           string
  tool:           string           // tool name from registry
  params?:        Record<string, unknown>
  promptTemplate?: string          // if set, uses AI to generate params dynamically
  skipOnError?:   boolean
}

export interface Workflow {
  id:          string
  name:        string
  description: string
  category:    string
  steps:       WorkflowStep[]
  inputSchema: Record<string, ToolParam>
}

export interface WorkflowRun {
  taskId:    string
  workflow:  Workflow
  input:     Record<string, unknown>
  ctx:       AgentContext
  stepResults: Array<{ step: string; result: ToolResult; status: StepStatus; latencyMs: number }>
  output?:   unknown
  status:    'running' | 'completed' | 'failed'
}
