import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  parentName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  zipCode: z.string().trim().regex(/^\d{5}(?:-\d{4})?$/),
  school: z.string().trim().min(2).max(200),
  childCount: z.coerce.number().int().min(1).max(20),
  consent: z.union([z.literal('true'), z.literal(true)]).transform(() => true),
})

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Please check the form fields.' }, { status: 400 })
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
    const { prisma } = await import('@/lib/prisma')
    const submission = await prisma.enrollmentRequest.create({ data: parsed.data })
    return NextResponse.json({ ok: true, id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('enrollment submission failed', error)
    return NextResponse.json({ error: 'Unable to save your enrollment request.' }, { status: 500 })
  }
}

