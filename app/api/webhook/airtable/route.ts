import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { getApplicantFromAirtable } from '@/lib/airtable'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const airtableId = body.airtableId || body.recordId || body.id

    if (!airtableId) return NextResponse.json({ error: 'Missing airtableId' }, { status: 400 })

    const data = await getApplicantFromAirtable(airtableId)
    if (!data || !data.fullName) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const stageMap: Record<string, any> = {
      'New': 'NEW', 'Screening': 'SCREENING', 'Interview': 'INTERVIEW',
      'Offer': 'OFFER', 'Hired': 'HIRED', 'Rejected': 'REJECTED', 'On Hold': 'ON_HOLD',
    }
    const stage = stageMap[data.stage] ?? 'NEW'

    const applicant = await prisma.applicant.upsert({
      where:  { airtableId },
      update: {
        fullName: data.fullName, email: data.email || undefined,
        phone: data.phone || undefined, stage,
        cityLocation: data.cityLocation || undefined,
        source: data.source || undefined,
        workAuthorization: data.workAuthorization || undefined,
        shiftPreference: data.shiftPreference || undefined,
        q1: data.q1 || undefined, q2: data.q2 || undefined,
        q3: data.q3 || undefined, q8: data.q8 || undefined, q15: data.q15 || undefined,
      },
      create: {
        airtableId, fullName: data.fullName,
        email: data.email || null, phone: data.phone || null, stage,
        cityLocation: data.cityLocation || null, source: data.source || null,
        workAuthorization: data.workAuthorization || null,
        shiftPreference: data.shiftPreference || null, dateApplied: new Date(),
        q1: data.q1 || null, q2: data.q2 || null, q3: data.q3 || null,
        q8: data.q8 || null, q15: data.q15 || null,
      },
    })

    console.log('✅ Airtable→Postgres sync:', applicant.fullName)
    return NextResponse.json({ success: true, id: applicant.id })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'PeopleBook sync webhook active ✅' })
}
