/**
 * Model router — selects the best AI provider based on message intent.
 * Routes from fastest/cheapest → slowest/most capable.
 *
 * Routing table:
 *   simple / short       → phi4       (Ollama, fast)
 *   coding / technical   → deepseek   (Ollama, code-optimised)
 *   reasoning / explain  → qwen3      (Ollama, strong reasoning)
 *   complex / strategic  → Claude     (always available fallback too)
 */

import {
  IModelProvider,
  claudeProvider,
  phi4Provider,
  deepseekProvider,
  qwen3Provider,
} from './providers'

const CODE_TOKENS = [
  'code', 'function', 'bug', 'debug', 'implement', 'syntax', 'error',
  'typescript', 'javascript', 'python', 'sql', 'api', 'component',
  'class', 'import', 'export', 'const', 'async', 'await', 'react',
  'prisma', 'query', 'database', 'migration', 'script', 'fix',
]

const STRATEGIC_TOKENS = [
  'strategy', 'plan', 'analyse', 'analyze', 'compare', 'evaluate',
  'recommend', 'decide', 'architecture', 'roadmap', 'priorities',
  'business', 'market', 'growth', 'forecast', 'budget',
]

export type Intent = 'simple' | 'code' | 'reasoning' | 'strategic'

export interface RoutingDecision {
  provider: IModelProvider
  intent: Intent
  reason: string
  fallback: IModelProvider // always Claude
}

const ollamaAvailable = !!process.env.OLLAMA_BASE_URL

export function routeMessage(userMessage: string): RoutingDecision {
  const text = userMessage.toLowerCase()
  const wordCount = text.split(/\s+/).length

  // Always use Claude if Ollama not configured
  if (!ollamaAvailable) {
    return {
      provider: claudeProvider,
      intent: 'strategic',
      reason: 'Claude (Ollama not configured)',
      fallback: claudeProvider,
    }
  }

  if (wordCount > 200 || STRATEGIC_TOKENS.some(t => text.includes(t))) {
    return {
      provider: claudeProvider,
      intent: 'strategic',
      reason: 'Complex/strategic task → Claude',
      fallback: claudeProvider,
    }
  }

  if (CODE_TOKENS.some(t => text.includes(t))) {
    return {
      provider: deepseekProvider,
      intent: 'code',
      reason: 'Code task → deepseek-coder',
      fallback: claudeProvider,
    }
  }

  if (
    wordCount > 50 ||
    text.includes('explain') ||
    text.includes('how') ||
    text.includes('why') ||
    text.includes('what') ||
    text.includes('when')
  ) {
    return {
      provider: qwen3Provider,
      intent: 'reasoning',
      reason: 'Reasoning task → qwen3',
      fallback: claudeProvider,
    }
  }

  return {
    provider: phi4Provider,
    intent: 'simple',
    reason: 'Short/simple → phi4',
    fallback: claudeProvider,
  }
}
