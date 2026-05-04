import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: '10MB' },
    'application/msword': { maxFileSize: '10MB' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '10MB' },
  })
    .middleware(async () => {
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Resume uploaded:', file.name, file.url)
      return { url: file.url, name: file.name }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
