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

    await base(process.env.AIRTABLE_APPLICANTS_TABLE!).create({
      // Full Name (primary)
      'flde9vGp44KhjGEVp': a.fullName       ?? '',
      // Email
      'fldUADnCVHXY9qNzG': a.email          ?? '',
      // Phone
      'fld3bI1wz5aDVizU6': a.phone          ?? '',
      // Stage
      'fldbfpZicElq5uJyt': 'New',
      // Date Applied
      'fldAfdexZklgVAO4U': new Date().toISOString().split('T')[0],
      // Source
      'fldSvWaKfte3ML6Se': mapSource(a.source),
      // City / Location
      'fldvwFYuDoZnibiSe': a.cityLocation   ?? '',
      // Visa / Work Authorization
      'fld0Vf3zwR88Xm5XX': a.workAuthorization ?? '',
      // Shift Preference (multipleSelects)
      'flddZIBprKLaG9yZM': a.shiftPreference ? [a.shiftPreference] : [],
      // Q1 — Tell Us Your Story
      'fldbiTW4HxULW6PwN': a.q1  ?? '',
      // Q2 — What Does Punctuality Mean to You?
      'fld3RpTCPyqib1I18': a.q2  ?? '',
      // Q3 — How Do You Manage Competing Priorities?
      'fldKGGBUcUPOgGP5B': a.q3  ?? '',
      // Q8 — What Does Quality Work Mean to You?
      'fldbjGxg6IcIGjYQR': a.q8  ?? '',
      // Q15 — What Should We Know That's Not on Your Resume?
      'fld3mfhRBAq9JVuDg': a.q15 ?? '',
    }, { typecast: true })

    console.log('✅ Airtable sync success:', a.fullName)
  } catch (e) {
    console.error('Airtable sync error:', e)
  }
}
