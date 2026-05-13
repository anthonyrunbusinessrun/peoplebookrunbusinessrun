/**
 * lib/birdy/pgvector.ts
 * pgvector runtime setup and all vector operations.
 *
 * WHY RAW SQL:
 *   Prisma 5.x has no native vector(768) type support.
 *   The BirdyEmbedding model in schema.prisma holds all regular columns.
 *   This module adds the vector column, manages the ANN index,
 *   and owns every INSERT / SELECT that touches vectors.
 *
 * CALL ensureVectorSetup() once at app startup or lazily before first use.
 * It is idempotent — safe to call repeatedly.
 */

import { prisma } from '@/lib/prisma'

let setupComplete = false

export async function ensureVectorSetup(): Promise<void> {
  if (setupComplete) return
  try {
    // 1. Enable pgvector extension (requires pg superuser or rds_superuser)
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`

    // 2. Add vector column if not present
    await prisma.$executeRaw`
      ALTER TABLE birdy_embeddings
      ADD COLUMN IF NOT EXISTS embedding vector(768)
    `

    // 3. Create IVFFlat index for ANN cosine search
    //    lists=50 is appropriate for < 1M rows; increase for larger datasets
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS birdy_embeddings_ivfflat
      ON birdy_embeddings
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 50)
    `

    setupComplete = true
    console.log('[pgvector] Setup complete')
  } catch (err) {
    // Non-fatal: if pgvector unavailable, RAG is disabled but app still works
    console.warn('[pgvector] Setup failed — RAG will be disabled:', (err as Error).message)
  }
}

// ── Write ──────────────────────────────────────────────────────────────────

/**
 * Upsert an embedding for a chunk.
 * Must be called AFTER the BirdyEmbedding row is created via Prisma.
 */
export async function upsertEmbedding(
  embeddingId: string,
  vector: number[],
): Promise<void> {
  const vectorStr = `[${vector.join(',')}]`
  await prisma.$executeRaw`
    UPDATE birdy_embeddings
    SET    embedding = ${vectorStr}::vector
    WHERE  id = ${embeddingId}
  `
}

// ── Read ───────────────────────────────────────────────────────────────────

export interface SimilarChunk {
  embeddingId: string
  chunkId:     string
  documentId:  string
  documentName: string
  preview:     string
  content:     string
  score:       number   // 0–1 cosine similarity
  namespace:   string
}

/**
 * Find the top-K most similar chunks to a query vector.
 * Uses cosine distance (1 - cosine_similarity) via pgvector `<=>` operator.
 */
export async function similaritySearch(
  queryVector:  number[],
  namespace:    string,
  topK:         number = 5,
  minScore:     number = 0.65,
): Promise<SimilarChunk[]> {
  const vectorStr = `[${queryVector.join(',')}]`

  const rows = await prisma.$queryRaw<Array<{
    embedding_id: string
    chunk_id:     string
    document_id:  string
    document_name: string
    preview:      string
    content:      string
    score:        number
    namespace:    string
  }>>`
    SELECT
      e.id           AS embedding_id,
      e.chunk_id,
      e.document_id,
      d.name         AS document_name,
      e.preview,
      c.content,
      1 - (e.embedding <=> ${vectorStr}::vector) AS score,
      e.namespace
    FROM  birdy_embeddings  e
    JOIN  birdy_document_chunks c ON c.id = e.chunk_id
    JOIN  birdy_documents       d ON d.id = e.document_id
    WHERE e.namespace = ${namespace}
      AND e.embedding IS NOT NULL
      AND 1 - (e.embedding <=> ${vectorStr}::vector) >= ${minScore}
    ORDER BY score DESC
    LIMIT ${topK}
  `

  return rows.map(r => ({
    embeddingId:  r.embedding_id,
    chunkId:      r.chunk_id,
    documentId:   r.document_id,
    documentName: r.document_name,
    preview:      r.preview,
    content:      r.content,
    score:        Number(r.score),
    namespace:    r.namespace,
  }))
}

/**
 * Full-text fallback search — used when pgvector is unavailable
 * or the query embedding fails. Uses Postgres ILIKE.
 */
export async function fullTextSearch(
  query:     string,
  namespace: string,
  topK:      number = 5,
): Promise<SimilarChunk[]> {
  const term = `%${query.slice(0, 100)}%`
  const rows = await prisma.$queryRaw<Array<{
    chunk_id:     string
    document_id:  string
    document_name: string
    preview:      string
    content:      string
    namespace:    string
  }>>`
    SELECT
      c.id      AS chunk_id,
      d.id      AS document_id,
      d.name    AS document_name,
      e.preview,
      c.content,
      e.namespace
    FROM  birdy_document_chunks c
    JOIN  birdy_documents       d ON d.id  = c.document_id
    LEFT JOIN birdy_embeddings  e ON e.chunk_id = c.id
    WHERE (c.content ILIKE ${term} OR d.name ILIKE ${term})
      AND d.namespace = ${namespace}
      AND d.status    = 'READY'
    ORDER BY c.chunk_index
    LIMIT ${topK}
  `
  return rows.map(r => ({
    embeddingId:  '',
    chunkId:      r.chunk_id,
    documentId:   r.document_id,
    documentName: r.document_name,
    preview:      r.preview ?? r.content.slice(0, 200),
    content:      r.content,
    score:        0.5,
    namespace:    r.namespace ?? namespace,
  }))
}
