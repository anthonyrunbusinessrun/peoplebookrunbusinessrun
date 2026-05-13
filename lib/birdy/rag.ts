/**
 * lib/birdy/rag.ts
 * RAG pipeline — retrieval → context formatting → citation tracking.
 *
 * Injects retrieved knowledge into the Birdy system prompt.
 * Tracks citations so the UI can display source references.
 *
 * CONTEXT BUDGET:
 *   Each chunk is trimmed to 400 chars. Top-5 = ~2000 chars.
 *   Injected AFTER memory context, BEFORE end of system prompt.
 *   Total system prompt budget: ~6000 chars (well within all models).
 *
 * CITATION FORMAT:
 *   Chunks are numbered [1], [2] etc. in the context block.
 *   Birdy is instructed to reference these numbers in responses.
 *   Citations stored in BirdyMessage.citations JSON field.
 */

import { retrieve, type SimilarChunk } from './retrieval'

export interface Citation {
  index:        number
  chunkId:      string
  documentName: string
  score:        number
  preview:      string
}

export interface RagContext {
  systemBlock:  string            // injected into system prompt
  citations:    Citation[]
  chunksUsed:   number
  method:       'vector' | 'fulltext' | 'none'
  latencyMs:    number
  skipped:      boolean           // true if no docs or retrieval failed
}

const CHUNK_DISPLAY_CHARS = 400  // trim chunks in the prompt to save tokens

/**
 * buildRagContext() — called before each AI response.
 * Returns both the text block for the system prompt and citation metadata.
 */
export async function buildRagContext(
  query:     string,
  namespace: string,
): Promise<RagContext> {
  const result = await retrieve(query, namespace)

  if (!result.chunks.length) {
    return {
      systemBlock: '',
      citations:   [],
      chunksUsed:  0,
      method:      result.method,
      latencyMs:   result.latencyMs,
      skipped:     true,
    }
  }

  const citations: Citation[] = result.chunks.map((chunk, i) => ({
    index:        i + 1,
    chunkId:      chunk.chunkId,
    documentName: chunk.documentName,
    score:        Math.round(chunk.score * 100) / 100,
    preview:      chunk.preview.slice(0, 120),
  }))

  // Build the context block for the system prompt
  const contextLines = result.chunks.map((chunk, i) => {
    const trimmed = chunk.content.slice(0, CHUNK_DISPLAY_CHARS)
    const ellipsis = chunk.content.length > CHUNK_DISPLAY_CHARS ? '…' : ''
    return `[${i + 1}] From "${chunk.documentName}" (relevance: ${Math.round(chunk.score * 100)}%):\n${trimmed}${ellipsis}`
  })

  const systemBlock = `
## Internal Knowledge Base
The following excerpts from Rayland's internal documents are relevant to this request.
Cite sources using [1], [2] etc. when referencing this content.

${contextLines.join('\n\n---\n\n')}

When using information from the knowledge base, always cite the source number.`

  return {
    systemBlock,
    citations,
    chunksUsed:  result.chunks.length,
    method:      result.method,
    latencyMs:   result.latencyMs,
    skipped:     false,
  }
}
