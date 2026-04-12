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
    shift:      (r.get('Shift')           as any)?.name ?? null,
    hours:      r.get('Hours')            as string ?? null,
    openings:   r.get('Openings')         as number ?? 1,
  }))
}

// Map form source values to exact Airtable option names
function mapSource(source?: string): string {
  const map: Record<string, string> = {
    'Walk-in':          'Walk-In',
    'walk-in':          'Walk-In',
    'rayland.com':      'rayland.com',
    'Indeed':           'Indeed',
    'Referral':         'Referral',
    'LinkedIn':         'LinkedIn',
    'Other':            'Other',
    'PeopleBook Portal':'PeopleBook Portal',
    'Company Website':  'Company Website',
  }
  return source ? (map[source] ?? 'PeopleBook Portal') : 'PeopleBook Portal'
}

export async function createApplicantInAirtable(a: any) {
  try {
    console.log('Syncing to Airtable:', a.fullName, '| Source:', a.source)
    await base(process.env.AIRTABLE_APPLICANTS_TABLE!).create({
      'Full Name':    a.fullName,
      'Email':        a.email        ?? '',
      'Phone':        a.phone        ?? '',
      'Stage':        'New',
      'Date Applied': new Date().toISOString().split('T')[0],
      'Source':       mapSource(a.source),
      'City / Location':                             a.cityLocation        ?? '',
      'Work Authorization':                          a.workAuthorization   ?? '',
      'Shift Preference':                            a.shiftPreference     ?? '',
      'Q1 — Tell Us Your Story':                     a.q1  ?? '',
      'Q2 — What Does Punctuality Mean to You?':     a.q2  ?? '',
      'Q3 — How Do You Manage Competing Priorities?':a.q3  ?? '',
      'Q8 — What Does Quality Work Mean to You?':    a.q8  ?? '',
      'Q15 — What Should We Know That\'s Not on Your Resume?': a.q15 ?? '',
    })
    console.log('Airtable sync success:', a.fullName)
  } catch (e) {
    console.error('Airtable sync error:', e)
  }
}
