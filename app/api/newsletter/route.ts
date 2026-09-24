import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ email: z.string().trim().email().max(200) })

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
    const { prisma } = await import('@/lib/prisma')
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { active: true },
      create: parsed.data,
    })
    return NextResponse.json({ ok: true, id: subscriber.id }, { status: 201 })
  } catch (error) {
    console.error('newsletter subscription failed', error)
    return NextResponse.json({ error: 'Unable to subscribe.' }, { status: 500 })
  }
}

