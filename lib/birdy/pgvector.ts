/**
 * lib/birdy/pgvector.ts
 * pgvector runtime setup and all vector operations.
 * Prisma does not support vector(768) natively — all vector I/O uses $queryRaw.
 */
import { prisma } from '@/lib/prisma'

let setupComplete = false

export async function ensureVectorSetup(): Promise<void> {
  if (setupComplete) return
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`
    await prisma.$executeRaw`ALTER TABLE birdy_embeddings ADD COLUMN IF NOT EXISTS embedding vector(768)`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS birdy_embeddings_ivfflat ON birdy_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50)`
    setupComplete = true
    console.log('[pgvector] Setup complete')
  } catch (err) {
    console.warn('[pgvector] Setup failed — RAG disabled:', (err as Error).message)
  }
}

export async function upsertEmbedding(embeddingId: string, vector: number[]): Promise<void> {
  const vectorStr = `[${vector.join(',')}]`
  await prisma.$executeRaw`UPDATE birdy_embeddings SET embedding = ${vectorStr}::vector WHERE id = ${embeddingId}`
}

export interface SimilarChunk {
  embeddingId:  string
  chunkId:      string
  documentId:   string
  documentName: string
  preview:      string
  content:      string
  score:        number
  namespace:    string
}

export async function similaritySearch(
  queryVector: number[],
  namespace:   string,
  topK:        number = 5,
  minScore:    number = 0.65,
): Promise<SimilarChunk[]> {
  const vectorStr = `[${queryVector.join(',')}]`
  type Row = { embedding_id: string; chunk_id: string; document_id: string; document_name: string; preview: string; content: string; score: number; namespace: string }

  const rows = await prisma.$queryRaw<Row[]>`
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
  return (rows as Array<{ embedding_id: string; chunk_id: string; document_id: string; document_name: string; preview: string; content: string; score: number; namespace: string }>).map(r => ({
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

export async function fullTextSearch(
  query:     string,
  namespace: string,
  topK:      number = 5,
): Promise<SimilarChunk[]> {
  const term = `%${query.slice(0, 100)}%`
  type FTRow = { chunk_id: string; document_id: string; document_name: string; preview: string | null; content: string; namespace: string | null }

  const rows = await prisma.$queryRaw<FTRow[]>`
    SELECT c.id AS chunk_id, d.id AS document_id, d.name AS document_name,
           e.preview, c.content, e.namespace
    FROM   birdy_document_chunks c
    JOIN   birdy_documents       d ON d.id  = c.document_id
    LEFT JOIN birdy_embeddings   e ON e.chunk_id = c.id
    WHERE (c.content ILIKE ${term} OR d.name ILIKE ${term})
      AND d.namespace = ${namespace} AND d.status = 'READY'
    ORDER BY c.chunk_index LIMIT ${topK}
  `
  return (rows as Array<{ chunk_id: string; document_id: string; document_name: string; preview: string | null; content: string; namespace: string | null }>).map(r => ({
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
