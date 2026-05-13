/**
 * lib/birdy/chunker.ts
 * Recursive character text splitter — no external dependencies.
 *
 * ALGORITHM:
 *   Attempts to split on progressively smaller units until chunks
 *   are within the target size. Respects paragraph, sentence, and
 *   word boundaries before resorting to character splits.
 *
 * TUNING:
 *   chunkSize=500 chars (~125 tokens) is conservative.
 *   chunkOverlap=80 chars preserves sentence context at boundaries.
 *   Adjust for your retrieval use case — larger chunks = more context per
 *   result but lower recall precision.
 */

export interface Chunk {
  content:    string
  startChar:  number
  endChar:    number
  index:      number
  tokenEst:   number   // rough estimate: chars / 4
}

const SEPARATORS = ['\n\n\n', '\n\n', '\n', '. ', '! ', '? ', '; ', ': ', ' ', '']

export function splitText(
  text:         string,
  chunkSize:    number = 500,
  chunkOverlap: number = 80,
): Chunk[] {
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  if (!cleanText) return []

  const rawChunks = recursiveSplit(cleanText, SEPARATORS, chunkSize)
  return mergeChunks(rawChunks, cleanText, chunkSize, chunkOverlap)
}

function recursiveSplit(text: string, separators: string[], chunkSize: number): string[] {
  if (text.length <= chunkSize) return [text]

  const sep = separators[0]
  const rest = separators.slice(1)

  if (!sep && sep !== '') {
    // Last resort: hard cut
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize))
    }
    return chunks
  }

  const parts = text.split(sep).filter(p => p.trim())
  const result: string[] = []

  for (const part of parts) {
    if (part.length <= chunkSize) {
      result.push(part)
    } else {
      result.push(...recursiveSplit(part, rest, chunkSize))
    }
  }

  return result
}

function mergeChunks(
  rawChunks:    string[],
  originalText: string,
  chunkSize:    number,
  overlap:      number,
): Chunk[] {
  const result: Chunk[] = []
  let buffer   = ''
  let bufStart = 0
  let charPos  = 0

  for (const raw of rawChunks) {
    const candidate = buffer ? buffer + ' ' + raw : raw

    if (candidate.length > chunkSize && buffer) {
      // Flush current buffer as a chunk
      result.push(makeChunk(buffer, bufStart, result.length))

      // Overlap: keep last `overlap` chars as start of next chunk
      const overlapText = buffer.length > overlap ? buffer.slice(-overlap) : buffer
      buffer   = overlapText + ' ' + raw
      bufStart = charPos - overlapText.length
    } else {
      if (!buffer) bufStart = charPos
      buffer = candidate
    }

    charPos += raw.length + 1
  }

  if (buffer.trim()) {
    result.push(makeChunk(buffer, bufStart, result.length))
  }

  return result
}

function makeChunk(content: string, startChar: number, index: number): Chunk {
  const c = content.trim()
  return {
    content:  c,
    startChar,
    endChar:  startChar + c.length,
    index,
    tokenEst: Math.ceil(c.length / 4),
  }
}
