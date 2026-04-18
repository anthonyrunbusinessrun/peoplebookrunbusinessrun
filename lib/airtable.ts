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
    'Walk-in':           'Walk-In',
    'walk-in':           'Walk-In',
    'Walk-In':           'Walk-In',
    'Indeed':            'Indeed',
    'Referral':          'Referral',
    'rayland.com':       'rayland.com',
    'LinkedIn':          'LinkedIn',
    'Other':             'Other',
    'PeopleBook Portal': 'PeopleBook Portal',
    'Company Website':   'Company Website',
  }
  return source ? (map[source] ?? 'PeopleBook Portal') : 'PeopleBook Portal'
}

export async function createApplicantInAirtable(a: any) {
  try {
    console.log('Syncing to Airtable:', a.fullName, '| Source:', a.source)

    // Build the fields object
    const fields: Record<string, any> = {
      'flde9vGp44KhjGEVp': a.fullName       ?? '',  // Full Name
      'fldUADnCVHXY9qNzG': a.email          ?? '',  // Email
      'fld3bI1wz5aDVizU6': a.phone          ?? '',  // Phone
      'fldbfpZicElq5uJyt': 'New',                    // Stage
      'fldAfdexZklgVAO4U': new Date().toISOString().split('T')[0], // Date Applied
      'fldSvWaKfte3ML6Se': mapSource(a.source),      // Source
      'fldvwFYuDoZnibiSe': a.cityLocation    ?? '',  // City
      'fld0Vf3zwR88Xm5XX': a.workAuthorization ?? '', // Work Auth
      'flddZIBprKLaG9yZM': a.shiftPreference ? [a.shiftPreference] : [], // Shift
      'fldbiTW4HxULW6PwN': a.q1  ?? '',  // Q1
      'fld3RpTCPyqib1I18': a.q2  ?? '',  // Q2
      'fldKGGBUcUPOgGP5B': a.q3  ?? '',  // Q3
      'fldbjGxg6IcIGjYQR': a.q8  ?? '',  // Q8
      'fld3mfhRBAq9JVuDg': a.q15 ?? '',  // Q15
    }

    // Attach resume to the Resume field (fldVvojhsidRjJDDk) if provided
    // Airtable accepts attachments via URL — we use a data URI for base64
    if (a.resumeData?.base64) {
      const dataUri = `data:${a.resumeData.type};base64,${a.resumeData.base64}`
      fields['fldVvojhsidRjJDDk'] = [{ url: dataUri, filename: a.resumeData.name }]
    }

    await base(process.env.AIRTABLE_APPLICANTS_TABLE!).create(fields, { typecast: true })

    console.log('✅ Airtable sync success:', a.fullName)
  } catch (e) {
    console.error('Airtable sync error:', e)
  }
}
