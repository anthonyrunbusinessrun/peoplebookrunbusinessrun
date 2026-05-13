/**
 * lib/birdy/agents/tools.ts
 * Built-in tool implementations for Birdy's agent runtime.
 * Each tool is self-contained: typed I/O, timeout, error handling.
 */

import { registerTool, type Tool } from '.'
import type { AgentContext, ToolResult } from './types'
import { retrieve } from '../retrieval'
import { claudeProvider, phi4Provider } from '../providers'

// ── knowledge_search ───────────────────────────────────────────────────────

const knowledgeSearchTool: Tool = {
  name:        'knowledge_search',
  description: 'Search the Rayland knowledge base using semantic similarity',
  timeoutMs:   10_000,
  parameters: {
    query:     { type: 'string',  description: 'Search query',        required: true },
    namespace: { type: 'string',  description: 'Document namespace',  required: false },
    topK:      { type: 'number',  description: 'Max results (1-10)',  required: false },
  },
  async execute(params, ctx): Promise<ToolResult> {
    const query     = String(params.query ?? '')
    const namespace = String(params.namespace ?? 'default')
    const topK      = Math.min(Number(params.topK ?? 5), 10)
    if (!query) return { success: false, data: null, error: 'query is required' }
    const result = await retrieve(query, namespace, { topK, minScore: 0.55 })
    return {
      success: true,
      data:    result.chunks.map(c => ({ documentName: c.documentName, content: c.content, score: c.score })),
      metadata: { method: result.method, count: result.chunks.length, latencyMs: result.latencyMs },
    }
  },
}

// ── ai_completion ──────────────────────────────────────────────────────────

const aiCompletionTool: Tool = {
  name:        'ai_completion',
  description: 'Generate AI text using the appropriate model for the task',
  timeoutMs:   45_000,
  parameters: {
    prompt:   { type: 'string',  description: 'Prompt to complete',  required: true },
    model:    { type: 'string',  description: '"claude" | "phi4"',   required: false },
    maxWords: { type: 'number',  description: 'Target word count',   required: false },
  },
  async execute(params, ctx): Promise<ToolResult> {
    const prompt = String(params.prompt ?? '')
    const model  = String(params.model ?? 'phi4')
    if (!prompt) return { success: false, data: null, error: 'prompt required' }

    const provider = model === 'claude' ? claudeProvider : phi4Provider
    const system   = 'You are Birdy, a precise enterprise AI assistant for Rayland Inc. Be concise and professional.'
    let text = ''
    const t0 = Date.now()

    try {
      for await (const chunk of provider.stream([{ role: 'user', content: prompt }], system)) {
        if (chunk.delta) text += chunk.delta
        if (chunk.done)  break
      }
      return { success: true, data: text.trim(), metadata: { model: provider.modelName, latencyMs: Date.now() - t0 } }
    } catch (err) {
      return { success: false, data: null, error: (err as Error).message }
    }
  },
}

// ── format_markdown ────────────────────────────────────────────────────────

const formatMarkdownTool: Tool = {
  name:        'format_markdown',
  description: 'Format and structure text as clean markdown',
  timeoutMs:   5_000,
  parameters: {
    content: { type: 'string', description: 'Raw content to format', required: true },
    style:   { type: 'string', description: '"report" | "list" | "table"', required: false },
  },
  async execute(params): Promise<ToolResult> {
    const content = String(params.content ?? '').trim()
    if (!content) return { success: false, data: null, error: 'content required' }
    // Lightweight formatting — ensure headers, clean bullets, trim
    const formatted = content
      .replace(/^([A-Z][^.!?\n]{15,60}):\s*$/gm, '## $1')   // Lines like "Key Findings:" → headers
      .replace(/^\s*[-•]\s+/gm, '- ')                         // Normalize bullets
      .replace(/\n{3,}/g, '\n\n')                             // Max double newlines
      .trim()
    return { success: true, data: formatted }
  },
}

// ── get_roles ──────────────────────────────────────────────────────────────

const getRolesTool: Tool = {
  name:        'get_roles',
  description: 'Fetch current open roles from Rayland Inc. Airtable',
  timeoutMs:   10_000,
  parameters:  {},
  async execute(): Promise<ToolResult> {
    try {
      const { getRoles } = await import('../../../lib/airtable')
      const roles = await getRoles()
      const open  = roles.filter(r => r.status === 'OPEN' || r.status === 'Open')
      return {
        success: true,
        data:    open,
        metadata: { total: roles.length, open: open.length },
      }
    } catch (err) {
      return { success: false, data: [], error: (err as Error).message }
    }
  },
}

// ── Register all tools ─────────────────────────────────────────────────────

export function registerBuiltinTools(): void {
  registerTool(knowledgeSearchTool)
  registerTool(aiCompletionTool)
  registerTool(formatMarkdownTool)
  registerTool(getRolesTool)
}
