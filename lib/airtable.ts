import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!)

export async function getRoles() {
  const records = await base(process.env.AIRTABLE_ROLES_TABLE!)
    .select({ sort: [{ field: 'Status', direction: 'asc' }] }).all()
  return records.map(r => ({
    id:         r.id,
    title:      r.get('Role Title')       as string ?? '',
    department: r.get('Department')       as string ?? '',
    status:     (r.get('Status')          as any)?.name ?? 'Open',
    priority:   (r.get('Priority')        as any)?.name ?? 'Medium',
    type:       (r.get('Employment Type') as any)?.name ?? 'Full-Time',
    opened:     r.get('Date Opened')      as string ?? '',
    notes:      r.get('Notes')            as string ?? '',
    shift:      (r.get('Shift Required')  as any)?.name ?? null,
    hours:      r.get('Shift Hours')      as string ?? null,
    openings:   r.get('Headcount Needed') as number ?? 1,
  }))
}

function mapSource(source?: string): string {
  const map: Record<string, string> = {
    'Walk-in': 'Walk-In', 'Walk-In': 'Walk-In',
    'Indeed': 'Indeed', 'Referral': 'Referral',
    'rayland.com': 'rayland.com', 'LinkedIn': 'LinkedIn',
    'Other': 'Other', 'PeopleBook Portal': 'PeopleBook Portal',
  }
  return source ? (map[source] ?? 'PeopleBook Portal') : 'PeopleBook Portal'
}

// Postgres → Airtable: called on every new form submission
export async function createApplicantInAirtable(a: any): Promise<string | null> {
  try {
    const fields: Record<string, any> = {
      'flde9vGp44KhjGEVp': a.fullName       ?? '',
      'fldUADnCVHXY9qNzG': a.email          ?? '',
      'fld3bI1wz5aDVizU6': a.phone          ?? '',
      'fldbfpZicElq5uJyt': 'New',
      'fldAfdexZklgVAO4U': new Date().toISOString().split('T')[0],
      'fldSvWaKfte3ML6Se': mapSource(a.source),
      'fldvwFYuDoZnibiSe': a.cityLocation    ?? '',
      'fld0Vf3zwR88Xm5XX': a.workAuthorization ?? '',
      'flddZIBprKLaG9yZM': a.shiftPreference ? [a.shiftPreference] : [],
      'fldbiTW4HxULW6PwN': a.q1  ?? '',
      'fld3RpTCPyqib1I18': a.q2  ?? '',
      'fldKGGBUcUPOgGP5B': a.q3  ?? '',
      'fldbjGxg6IcIGjYQR': a.q8  ?? '',
      'fld3mfhRBAq9JVuDg': a.q15 ?? '',
    }

    if (a.resumeData?.base64) {
      fields['fldVvojhsidRjJDDk'] = [{ url: `data:${a.resumeData.type};base64,${a.resumeData.base64}`, filename: a.resumeData.name }]
    }

    const record = await base(process.env.AIRTABLE_APPLICANTS_TABLE!).create(fields, { typecast: true })
    console.log('✅ Airtable sync success:', a.fullName, '→', record.id)
    return record.id  // return airtableId so we can store it in Postgres
  } catch (e) {
    console.error('Airtable sync error:', e)
    return null
  }
}

// Airtable → Postgres: called from /api/webhook/airtable
export async function getApplicantFromAirtable(airtableId: string) {
  try {
    const record = await base(process.env.AIRTABLE_APPLICANTS_TABLE!).find(airtableId)
    return {
      airtableId: record.id,
      fullName:          record.get('flde9vGp44KhjGEVp') as string ?? '',
      email:             record.get('fldUADnCVHXY9qNzG') as string ?? '',
      phone:             record.get('fld3bI1wz5aDVizU6') as string ?? '',
      stage:             (record.get('fldbfpZicElq5uJyt') as any)?.name ?? 'New',
      cityLocation:      record.get('fldvwFYuDoZnibiSe') as string ?? '',
      source:            (record.get('fldSvWaKfte3ML6Se') as any)?.name ?? '',
      workAuthorization: (record.get('fld0Vf3zwR88Xm5XX') as any)?.name ?? '',
      shiftPreference:   (record.get('flddZIBprKLaG9yZM') as any)?.[0]?.name ?? '',
      q1:  record.get('fldbiTW4HxULW6PwN') as string ?? '',
      q2:  record.get('fld3RpTCPyqib1I18') as string ?? '',
      q3:  record.get('fldKGGBUcUPOgGP5B') as string ?? '',
      q8:  record.get('fldbjGxg6IcIGjYQR') as string ?? '',
      q15: record.get('fld3mfhRBAq9JVuDg') as string ?? '',
    }
  } catch (e) {
    console.error('Airtable fetch error:', e)
    return null
  }
}
