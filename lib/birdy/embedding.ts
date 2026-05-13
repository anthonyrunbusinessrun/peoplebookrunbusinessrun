/**
 * lib/birdy/embedding.ts
 * Embedding provider — nomic-embed-text (768-dim) via Ollama.
 * Includes per-model availability check so routing degrades gracefully
 * while large models are still being pulled on first boot.
 */

export interface IEmbeddingProvider {
  readonly modelName: string
  readonly dimensions: number
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[], concurrency?: number): Promise<number[][]>
}

// ── Model availability cache ───────────────────────────────────────────────
// Avoids hammering /api/tags on every request.
const modelAvailabilityCache = new Map<string, { available: boolean; checkedAt: number }>()
const AVAILABILITY_TTL = 30_000 // 30 seconds

async function isModelAvailable(baseUrl: string, modelName: string): Promise<boolean> {
  const key  = `${baseUrl}:${modelName}`
  const cached = modelAvailabilityCache.get(key)
  if (cached && Date.now() - cached.checkedAt < AVAILABILITY_TTL) {
    return cached.available
  }
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(3_000) })
    if (!res.ok) { modelAvailabilityCache.set(key, { available: false, checkedAt: Date.now() }); return false }
    const d = await res.json()
    const prefix    = modelName.split(':')[0]
    const available = d.models?.some((m: { name: string }) =>
      m.name === modelName || m.name.startsWith(prefix)
    ) ?? false
    modelAvailabilityCache.set(key, { available, checkedAt: Date.now() })
    return available
  } catch {
    modelAvailabilityCache.set(key, { available: false, checkedAt: Date.now() })
    return false
  }
}

// ── Nomic embedder ─────────────────────────────────────────────────────────

export class NomicEmbedder implements IEmbeddingProvider {
  readonly modelName  = 'nomic-embed-text'
  readonly dimensions = 768

  private get baseUrl(): string {
    return process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  }

  async embed(text: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ model: this.modelName, prompt: text.slice(0, 8000) }),
      signal:  AbortSignal.timeout(15_000),
    })
    if (!res.ok) throw new Error(`Ollama embed ${res.status}: ${await res.text()}`)
    const data = await res.json()
    if (!Array.isArray(data.embedding)) throw new Error('Embedding response missing vector')
    return data.embedding as number[]
  }

  async embedBatch(texts: string[], concurrency = 4): Promise<number[][]> {
    const results: number[][] = new Array(texts.length)
    for (let i = 0; i < texts.length; i += concurrency) {
      const batch  = texts.slice(i, i + concurrency)
      const embeds = await Promise.all(batch.map(t => this.embed(t)))
      for (let j = 0; j < embeds.length; j++) results[i + j] = embeds[j]
    }
    return results
  }
}

export const nomicEmbedder = new NomicEmbedder()

/**
 * isEmbeddingAvailable() — checks specifically for nomic-embed-text.
 * Returns false while the model is still being pulled on first boot.
 */
export async function isEmbeddingAvailable(): Promise<boolean> {
  const base = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  return isModelAvailable(base, 'nomic-embed-text')
}

/**
 * getAvailableModels() — returns all currently-ready Ollama models.
 * Used by the admin panel and router for degraded-mode awareness.
 */
export async function getAvailableModels(): Promise<string[]> {
  const base = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  try {
    const res = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(3_000) })
    if (!res.ok) return []
    const d = await res.json()
    return (d.models ?? []).map((m: { name: string }) => m.name)
  } catch { return [] }
}

/**
 * invalidateModelCache() — force re-check on next request.
 * Call this after a new model pull completes.
 */
export function invalidateModelCache(): void {
  modelAvailabilityCache.clear()
}
