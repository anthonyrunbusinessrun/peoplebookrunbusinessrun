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

export async function createApplicantInAirtable(a: any) {
  try {
    await base(process.env.AIRTABLE_APPLICANTS_TABLE!).create({
      'Full Name':    a.fullName,
      'Email':        a.email   ?? '',
      'Phone':        a.phone   ?? '',
      'Stage':        'New',
      'Date Applied': new Date().toISOString().split('T')[0],
      'Source':       a.source  ?? 'PeopleBook Portal',
      'Q1 — Tell Us Your Story':                 a.q1 ?? '',
      'Q2 — What Does Punctuality Mean to You?': a.q2 ?? '',
      'Q8 — What Does Quality Work Mean to You?':a.q8 ?? '',
    })
  } catch (e) { console.error('Airtable sync error:', e) }
}
