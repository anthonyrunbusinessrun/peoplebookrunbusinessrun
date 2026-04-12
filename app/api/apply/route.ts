import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic' // email integration active
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createApplicantInAirtable } from '@/lib/airtable'
import { sendApplicationNotification } from '@/lib/email'

const Schema = z.object({
  fullName:          z.string().min(2),
  email:             z.string().email(),
  phone:             z.string().optional(),
  roleTitle:         z.string().optional(),
  cityLocation:      z.string().optional(),
  availabilityDate:  z.string().optional(),
  salaryExpectation: z.string().optional(),
  workAuthorization: z.string().optional(),
  shiftPreference:   z.string().optional(),
  source:            z.string().optional(),
  q1:  z.string().optional(),
  q2:  z.string().optional(),
  q3:  z.string().optional(),
  q5:  z.string().optional(),
  q8:  z.string().optional(),
  q15: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json())

    // 1. Save to PostgreSQL
    const applicant = await prisma.applicant.create({
      data: {
        fullName:          data.fullName,
        email:             data.email,
        phone:             data.phone,
        stage:             'NEW',
        cityLocation:      data.cityLocation,
        availabilityDate:  data.availabilityDate ? new Date(data.availabilityDate) : null,
        salaryExpectation: data.salaryExpectation
          ? parseFloat(data.salaryExpectation.replace(/[^0-9.]/g, '')) : null,
        workAuthorization: data.workAuthorization,
        shiftPreference:   data.shiftPreference,
        source:            data.source,
        dateApplied:       new Date(),
        q1:  data.q1,
        q2:  data.q2,
        q3:  data.q3,
        q5:  data.q5,
        q8:  data.q8,
        q15: data.q15,
      },
    })

    // 2. Sync to Airtable
    try {
      await createApplicantInAirtable({ ...applicant, roleTitle: data.roleTitle })
    } catch (e) {
      console.error('Airtable sync error:', e)
    }

    // 3. Send email notifications to 4 recruiters + applicant confirmation
    await sendApplicationNotification({ ...applicant, roleTitle: data.roleTitle })

    return NextResponse.json({ success: true, id: applicant.id }, { status: 201 })

  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: 'Validation failed', details: e.errors }, { status: 400 })
    console.error('Apply error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
