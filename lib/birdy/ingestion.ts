/**
 * lib/birdy/ingestion.ts
 * Document ingestion pipeline — the orchestrator.
 *
 * PIPELINE:
 *   1. Fetch document from URL (UploadThing CDN)
 *   2. Parse text (PDF / text / HTML)
 *   3. Split into overlapping chunks
 *   4. Persist chunks to birdy_document_chunks
 *   5. Generate embeddings for each chunk (Ollama nomic-embed-text)
 *   6. Persist embedding metadata to birdy_embeddings
 *   7. Upsert embedding vector via pgvector raw SQL
 *   8. Mark document as READY (or ERROR on failure)
 *
 * CONCURRENCY:
 *   Runs as a background task (setImmediate) — never blocks HTTP responses.
 *   Embedding batches use concurrency=3 to avoid overwhelming Ollama.
 *
 * RESILIENCE:
 *   Each stage catches independently. On parse failure → document.status = ERROR.
 *   On embedding failure → chunks are stored, document is READY but not searchable
 *   via vectors (falls back to full-text search).
 */

import { prisma } from '@/lib/prisma'
import { parseFromUrl } from './parsers'
import { splitText } from './chunker'
import { nomicEmbedder, isEmbeddingAvailable } from './embedding'
import { ensureVectorSetup, upsertEmbedding } from './pgvector'

const CHUNK_SIZE    = 500   // chars per chunk (~125 tokens)
const CHUNK_OVERLAP = 80    // overlap chars
const EMBED_BATCH   = 3     // parallel embedding requests to Ollama

export interface IngestionResult {
  documentId:  string
  status:      'ready' | 'error'
  chunkCount:  number
  wordCount:   number
  embedded:    boolean
  error?:      string
}

/**
 * ingestDocument() — main entry point.
 * Runs synchronously and returns a result (called in background via setImmediate).
 */
export async function ingestDocument(documentId: string): Promise<IngestionResult> {
  const doc = await prisma.birdyDocument.findUnique({ where: { id: documentId } })
  if (!doc) throw new Error(`Document ${documentId} not found`)

  // Mark as processing
  await prisma.birdyDocument.update({
    where: { id: documentId },
    data:  { status: 'PROCESSING', updatedAt: new Date() },
  })

  let chunkCount  = 0
  let wordCount   = 0
  let embedded    = false

  try {
    // ── Step 1: Parse ─────────────────────────────────────────────────────
    const parsed = await parseFromUrl(doc.storageUrl, doc.mimeType)
    wordCount = parsed.wordCount

    if (!parsed.text || parsed.text.length < 20) {
      throw new Error('Document appears empty or could not be parsed')
    }

    // ── Step 2: Chunk ─────────────────────────────────────────────────────
    const chunks = splitText(parsed.text, CHUNK_SIZE, CHUNK_OVERLAP)
    chunkCount   = chunks.length

    if (!chunks.length) throw new Error('No chunks produced from document')

    // ── Step 3: Persist chunks ────────────────────────────────────────────
    // Delete any existing chunks (re-ingestion support)
    await prisma.birdyDocumentChunk.deleteMany({ where: { documentId } })

    const chunkRecords = await prisma.$transaction(
      chunks.map(c => prisma.birdyDocumentChunk.create({
        data: {
          documentId,
          chunkIndex: c.index,
          content:    c.content,
          tokenCount: c.tokenEst,
          startChar:  c.startChar,
          endChar:    c.endChar,
        },
      }))
    )

    // ── Step 4: Embed + store vectors ─────────────────────────────────────
    await ensureVectorSetup()
    const canEmbed = await isEmbeddingAvailable()

    if (canEmbed) {
      // Create embedding metadata rows first
      await prisma.birdyEmbedding.deleteMany({ where: { documentId } })
      const embeddingRecords = await prisma.$transaction(
        chunkRecords.map(cr => prisma.birdyEmbedding.create({
          data: {
            chunkId:    cr.id,
            documentId,
            sessionId:  doc.sessionId,
            namespace:  doc.namespace,
            preview:    cr.content.slice(0, 200),
          },
        }))
      )

      // Embed in batches
      const texts     = chunkRecords.map(cr => cr.content)
      const vectors   = await nomicEmbedder.embedBatch(texts, EMBED_BATCH)

      // Write vectors via raw SQL
      await Promise.all(
        embeddingRecords.map((er, i) => upsertEmbedding(er.id, vectors[i]))
      )

      embedded = true
    } else {
      console.warn(`[ingestion] Ollama unavailable — ${documentId} stored without embeddings (full-text only)`)
    }

    // ── Step 5: Mark ready ────────────────────────────────────────────────
    await prisma.birdyDocument.update({
      where: { id: documentId },
      data:  { status: 'READY', chunkCount, wordCount, updatedAt: new Date() },
    })

    console.log(`[ingestion] ✓ ${doc.name} — ${chunkCount} chunks, ${wordCount} words, embedded=${embedded}`)
    return { documentId, status: 'ready', chunkCount, wordCount, embedded }

  } catch (err) {
    const msg = (err as Error).message
    console.error(`[ingestion] ✗ ${doc.name}:`, msg)

    await prisma.birdyDocument.update({
      where: { id: documentId },
      data:  { status: 'ERROR', errorMsg: msg.slice(0, 500), updatedAt: new Date() },
    }).catch(() => {})

    return { documentId, status: 'error', chunkCount, wordCount, embedded, error: msg }
  }
}

/**
 * scheduleIngestion() — fire-and-forget wrapper.
 * Call this from API routes to start ingestion without awaiting.
 */
export function scheduleIngestion(documentId: string): void {
  setImmediate(async () => {
    try {
      await ingestDocument(documentId)
    } catch (err) {
      console.error('[ingestion] Unhandled error in background job:', err)
    }
  })
}
