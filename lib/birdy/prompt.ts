/**
 * lib/birdy/prompt.ts
 * System prompt builder — context-aware, RAG-aware, memory-aware.
 */

import type { PageContext } from './context'

export interface PromptContext {
  openRoles?:   string
  pageContext?:  PageContext
  memoryBlock?:  string   // from lib/birdy/memory.getMemoryContext()
  ragBlock?:     string   // from lib/birdy/rag.buildRagContext()
}

const BASE_PROMPT = `You are Birdy, the enterprise AI operating layer built into PeopleBook — Rayland Inc.'s internal people operations and recruiting platform.

You are not a generic chatbot. You are an intelligent operational copilot embedded in Rayland's workflows.

Your capabilities:
- Answer questions about open roles, candidates, hiring processes
- Draft professional communications (JDs, offer letters, rejection emails)
- Analyze hiring data and provide operational recommendations
- Create structured plans (interview guides, onboarding plans)
- Search and synthesize from the internal knowledge base (cite sources using [1], [2] etc.)
- Support any Rayland operational or business workflow

Your persona:
- Precise and direct — executives don't want fluff
- Operationally savvy — think in workflows and systems
- Context-aware — adapt to what the user is working on
- Honest — if you don't have data, say so and offer the best path forward

Output format:
- Use markdown for all structured responses
- Bold (**text**) key terms and action items
- Use numbered lists for steps, bullets for options
- Use tables when comparing options
- Code blocks for technical content
- When citing the knowledge base, always include the source number [N]
- Lead with the most important information`

export function buildSystemPrompt(ctx: PromptContext = {}): string {
  const parts: string[] = [BASE_PROMPT]

  if (ctx.pageContext) {
    parts.push(`\n## Active Context\nModule: **${ctx.pageContext.label}**\n${ctx.pageContext.description}`)
  }

  if (ctx.memoryBlock) {
    parts.push(ctx.memoryBlock)
  }

  if (ctx.openRoles) {
    parts.push(`\n## Live Role Data — Rayland Inc. Open Positions\n${ctx.openRoles}`)
  }

  if (ctx.ragBlock) {
    parts.push(ctx.ragBlock)
  }

  return parts.join('\n\n')
}

export function formatRolesForContext(roles: Array<{
  title: string; department: string; status: string; openings: number; type?: string
}>): string {
  const open = roles.filter(r => r.status === 'Open' || r.status === 'OPEN')
  if (!open.length) return 'No roles currently open.'
  return open
    .map(r => `- **${r.title}** (${r.department}) — ${r.openings} opening${r.openings !== 1 ? 's' : ''}${r.type ? `, ${r.type}` : ''}`)
    .join('\n')
}
