import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().default(''),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(5).max(5000),
})

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Please check the form fields.' }, { status: 400 })
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
    const { prisma } = await import('@/lib/prisma')
    const submission = await prisma.contactSubmission.create({ data: parsed.data })
    return NextResponse.json({ ok: true, id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('contact submission failed', error)
    return NextResponse.json({ error: 'Unable to save your message.' }, { status: 500 })
  }
}

