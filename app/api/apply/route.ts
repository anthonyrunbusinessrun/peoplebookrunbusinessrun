import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { createApplicantInAirtable } from '@/lib/airtable'
import { sendApplicationNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const get = (k: string) => (formData.get(k) as string) || ''

    const fullName = get('fullName').trim()
    const email    = get('email').trim()

    if (!fullName || fullName.length < 2)
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    if (!email || !email.includes('@'))
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })

    // Handle resume file
    const resumeFile = formData.get('resume') as File | null
    let resumeData: { name: string; base64: string; type: string } | null = null
    if (resumeFile && resumeFile.size > 0) {
      const buffer = await resumeFile.arrayBuffer()
      resumeData = {
        name:   resumeFile.name,
        base64: Buffer.from(buffer).toString('base64'),
        type:   resumeFile.type || 'application/pdf',
      }
    }

    const applicantData = {
      fullName,
      email,
      phone:             get('phone')             || null,
      stage:             'NEW' as const,
      cityLocation:      get('cityLocation')       || null,
      workAuthorization: get('workAuthorization')  || null,
      shiftPreference:   get('shiftPreference')    || null,
      source:            get('source')             || null,
      dateApplied:       new Date(),
      q1:  get('q1')  || null,
      q2:  get('q2')  || null,
      q3:  get('q3')  || null,
      q8:  get('q8')  || null,
      q15: get('q15') || null,
    }

    // 1. Sync to Airtable FIRST — get back the airtableId
    const airtableId = await createApplicantInAirtable({ ...applicantData, roleTitle: get('roleTitle'), resumeData })

    // 2. Save to Postgres WITH the airtableId so they're linked
    const applicant = await prisma.applicant.create({
      data: {
        ...applicantData,
        airtableId: airtableId ?? undefined,
      },
    })

    // 3. Send email notifications
    await sendApplicationNotification({
      ...applicant,
      roleTitle: get('roleTitle'),
      resumeData,
    })

    return NextResponse.json({ success: true, id: applicant.id }, { status: 201 })

  } catch (e) {
    console.error('Apply error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
