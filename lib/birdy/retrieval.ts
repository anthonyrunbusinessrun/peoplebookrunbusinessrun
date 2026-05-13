/**
 * lib/birdy/retrieval.ts
 * Semantic retrieval service — the query-time half of RAG.
 *
 * FLOW:
 *   1. Embed the user query (nomic-embed-text, 768-dim)
 *   2. Cosine similarity search via pgvector (top-K, min score threshold)
 *   3. If embedding unavailable, fall back to full-text ILIKE search
 *   4. Return ranked results with document attribution
 *
 * NAMESPACE:
 *   All searches are scoped to a namespace (default: sessionId or "default").
 *   This allows team/project isolation without separate databases.
 *
 * OBSERVABILITY:
 *   Returns latency metrics for the usage log.
 */

import { nomicEmbedder, isEmbeddingAvailable } from './embedding'
import { similaritySearch, fullTextSearch, type SimilarChunk } from './pgvector'

export { type SimilarChunk }

export interface RetrievalResult {
  chunks:       SimilarChunk[]
  method:       'vector' | 'fulltext' | 'none'
  latencyMs:    number
  queryLength:  number
}

const DEFAULT_TOP_K    = 5
const DEFAULT_MIN_SCORE = 0.65

/**
 * retrieve() — the primary retrieval function used in the RAG pipeline.
 */
export async function retrieve(
  query:     string,
  namespace: string,
  options?: {
    topK?:     number
    minScore?: number
  }
): Promise<RetrievalResult> {
  const t0      = Date.now()
  const topK    = options?.topK     ?? DEFAULT_TOP_K
  const minScore = options?.minScore ?? DEFAULT_MIN_SCORE

  if (!query.trim()) {
    return { chunks: [], method: 'none', latencyMs: 0, queryLength: 0 }
  }

  // Try vector search first
  const canEmbed = await isEmbeddingAvailable()
  if (canEmbed) {
    try {
      const vector = await nomicEmbedder.embed(query)
      const chunks = await similaritySearch(vector, namespace, topK, minScore)
      return {
        chunks,
        method:      'vector',
        latencyMs:   Date.now() - t0,
        queryLength: query.length,
      }
    } catch (err) {
      console.warn('[retrieval] Vector search failed, falling back to full-text:', err)
    }
  }

  // Full-text fallback
  try {
    const chunks = await fullTextSearch(query, namespace, topK)
    return {
      chunks,
      method:      'fulltext',
      latencyMs:   Date.now() - t0,
      queryLength: query.length,
    }
  } catch (err) {
    console.error('[retrieval] Full-text search also failed:', err)
    return { chunks: [], method: 'none', latencyMs: Date.now() - t0, queryLength: query.length }
  }
}
