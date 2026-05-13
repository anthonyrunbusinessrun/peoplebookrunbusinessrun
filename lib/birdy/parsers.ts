/**
 * lib/birdy/parsers.ts
 * Document text extraction layer.
 *
 * Supports: PDF, plain text, markdown, and HTML (stripped).
 * Returns clean UTF-8 text suitable for chunking and embedding.
 *
 * PDF NOTE: pdf-parse has a known Next.js issue where it tries to read
 * test fixtures from disk. Workaround: dynamic import + suppress the error.
 * Always works in `runtime = 'nodejs'` routes.
 */

export interface ParseResult {
  text:      string
  wordCount: number
  pages?:    number
  meta?:     Record<string, string>
}

/**
 * Parse a document from its URL.
 * Fetches the file and routes to the correct parser by MIME type.
 */
export async function parseFromUrl(url: string, mimeType: string): Promise<ParseResult> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return parseBuffer(buffer, mimeType)
}

export async function parseBuffer(buffer: Buffer, mimeType: string): Promise<ParseResult> {
  const mime = mimeType.toLowerCase()

  if (mime === 'application/pdf' || mime.endsWith('/pdf')) {
    return parsePdf(buffer)
  }

  if (mime.includes('html')) {
    return parseHtml(buffer.toString('utf-8'))
  }

  // Plain text, markdown, CSV, JSON, etc.
  return parsePlainText(buffer.toString('utf-8'))
}

// ── Parsers ────────────────────────────────────────────────────────────────

async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  // Dynamic import avoids build-time issues with pdf-parse
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  const text = cleanText(data.text)
  return {
    text,
    wordCount: countWords(text),
    pages:     data.numpages,
    meta: {
      author:  data.info?.Author  ?? '',
      title:   data.info?.Title   ?? '',
      creator: data.info?.Creator ?? '',
    },
  }
}

function parseHtml(html: string): ParseResult {
  // Strip tags, decode entities, normalise whitespace
  const text = cleanText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g,  '&')
      .replace(/&lt;/g,   '<')
      .replace(/&gt;/g,   '>')
      .replace(/&quot;/g, '"')
  )
  return { text, wordCount: countWords(text) }
}

function parsePlainText(raw: string): ParseResult {
  const text = cleanText(raw)
  return { text, wordCount: countWords(text) }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/[ ]{4,}/g, '   ')  // collapse long runs of spaces
    .replace(/\n{4,}/g, '\n\n\n') // max 3 consecutive newlines
    .trim()
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}
