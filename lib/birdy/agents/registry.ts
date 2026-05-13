/**
 * lib/birdy/agents/registry.ts
 * Central tool registry — single source of truth for all agent tools.
 */

import { type Tool } from './types'

const REGISTRY = new Map<string, Tool>()

export function registerTool(tool: Tool): void {
  if (REGISTRY.has(tool.name)) {
    console.warn(`[tool-registry] Overwriting tool: ${tool.name}`)
  }
  REGISTRY.set(tool.name, tool)
}

export function getTool(name: string): Tool | undefined {
  return REGISTRY.get(name)
}

export function listTools(): Tool[] {
  return Array.from(REGISTRY.values())
}

export function hasTool(name: string): boolean {
  return REGISTRY.has(name)
}
