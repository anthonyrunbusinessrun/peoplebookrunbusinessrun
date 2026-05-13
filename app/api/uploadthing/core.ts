import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  // ── Existing: resume uploads for job applications ─────────────────────
  resumeUploader: f({
    pdf:     { maxFileSize: '8MB' },
    'application/msword': { maxFileSize: '8MB' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '8MB' },
  })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      console.log('Resume uploaded:', file.name, file.url)
      return { url: file.url, name: file.name }
    }),

  // ── Birdy knowledge base: document uploads ────────────────────────────
  // After upload, the client calls /api/birdy/knowledge/ingest to trigger parsing.
  birdyDocumentUploader: f({
    pdf:      { maxFileSize: '32MB' },
    text:     { maxFileSize: '8MB'  },
    'text/markdown':     { maxFileSize: '8MB' },
    'text/plain':        { maxFileSize: '8MB' },
    'application/msword':{ maxFileSize: '16MB'},
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '16MB' },
  })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      console.log('[birdy/knowledge] Document uploaded:', file.name, file.url)
      // Ingestion is triggered client-side by calling /api/birdy/knowledge/ingest
      // with the returned url, name, and type.
      return { url: file.url, name: file.name, type: file.type, size: file.size }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
