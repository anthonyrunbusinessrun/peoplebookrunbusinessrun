/**
 * lib/birdy/embedding.ts
 * Embedding provider abstraction — nomic-embed-text (768-dim) via Ollama.
 *
 * DESIGN:
 *   IEmbeddingProvider is the interface. NomicEmbedder is the production impl.
 *   If Ollama is unreachable, calls throw and callers handle gracefully —
 *   documents are stored without embeddings and fall back to full-text search.
 *
 * DIMENSIONS: nomic-embed-text outputs 768-dimensional vectors.
 *   Match this in the pgvector column: vector(768).
 */

export interface IEmbeddingProvider {
  readonly modelName: string
  readonly dimensions: number
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[], concurrency?: number): Promise<number[][]>
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
    if (!Array.isArray(data.embedding)) throw new Error('Embedding response missing')
    return data.embedding as number[]
  }

  async embedBatch(texts: string[], concurrency = 4): Promise<number[][]> {
    const results: number[][] = new Array(texts.length)
    // Process in batches to respect Ollama's single-threaded nature
    for (let i = 0; i < texts.length; i += concurrency) {
      const batch  = texts.slice(i, i + concurrency)
      const embeds = await Promise.all(batch.map(t => this.embed(t)))
      for (let j = 0; j < embeds.length; j++) {
        results[i + j] = embeds[j]
      }
    }
    return results
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────

export const nomicEmbedder = new NomicEmbedder()

/**
 * isEmbeddingAvailable() — lightweight health check.
 * Returns true if Ollama is running and nomic-embed-text is loaded.
 */
export async function isEmbeddingAvailable(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/api/tags`,
      { signal: AbortSignal.timeout(3_000) }
    )
    if (!res.ok) return false
    const d = await res.json()
    return d.models?.some((m: { name: string }) => m.name.startsWith('nomic')) ?? false
  } catch {
    return false
  }
}
