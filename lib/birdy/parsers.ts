/**
 * lib/birdy/parsers.ts
 * Document text extraction. Runs in Node.js runtime routes only.
 */
export interface ParseResult {
  text: string; wordCount: number; pages?: number; meta?: Record<string, string>
}

export async function parseFromUrl(url: string, mimeType: string): Promise<ParseResult> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return parseBuffer(buffer, mimeType)
}

export async function parseBuffer(buffer: Buffer, mimeType: string): Promise<ParseResult> {
  const mime = mimeType.toLowerCase()
  if (mime === 'application/pdf' || mime.endsWith('/pdf')) return parsePdf(buffer)
  if (mime.includes('html')) return parseHtml(buffer.toString('utf-8'))
  return parsePlainText(buffer.toString('utf-8'))
}

async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  // Use require() to avoid ESM/CJS interop issues with pdf-parse
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{
    text: string; numpages: number; info: Record<string, string>
  }>
  const data = await pdfParse(buffer)
  const text = cleanText(data.text)
  return { text, wordCount: countWords(text), pages: data.numpages, meta: { title: data.info?.Title ?? '', author: data.info?.Author ?? '' } }
}

function parseHtml(html: string): ParseResult {
  const text = cleanText(
    html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  )
  return { text, wordCount: countWords(text) }
}

function parsePlainText(raw: string): ParseResult {
  const text = cleanText(raw)
  return { text, wordCount: countWords(text) }
}

function cleanText(raw: string): string {
  return raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, '  ')
    .replace(/[ ]{4,}/g, '   ').replace(/\n{4,}/g, '\n\n\n').trim()
}
function countWords(text: string): number { return text.split(/\s+/).filter(Boolean).length }
