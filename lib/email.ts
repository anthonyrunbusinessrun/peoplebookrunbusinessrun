import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const NOTIFY = [
  'anthony@runbusiness.com',
  'ereika@runbusiness.com',
  'ray@rayland.com',
  'kaye@runbusiness.com',
]

export async function sendApplicationNotification(a: any) {
  console.log('=== EMAIL NOTIFICATION START ===')
  console.log('API Key present:', !!process.env.RESEND_API_KEY)
  console.log('API Key prefix:', process.env.RESEND_API_KEY?.slice(0, 12))
  console.log('Sending to:', NOTIFY)
  console.log('Applicant:', a.fullName, a.email)

  try {
    // Notification email to all 4 recruiters
    console.log('Sending recruiter notification...')
    const recruiterResult = await resend.emails.send({
      from:    'PeopleBook <onboarding@resend.dev>',
      to:      NOTIFY,
      subject: `New Application — ${a.fullName} (${a.roleTitle || 'General Application'})`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#0a1628;padding:24px;border-bottom:3px solid #c0152a">
    <h1 style="color:white;margin:0;font-size:20px;font-weight:400">New Application Received</h1>
    <p style="color:#9a9890;margin:4px 0 0;font-size:12px">PeopleBook · Ray Land Inc. · BOSS Recruiting Portal</p>
    <span style="background:#c0152a;color:white;font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px;display:inline-block;margin-top:8px">
      ${a.roleTitle || 'General Application'}
    </span>
  </div>
  <div style="padding:24px;background:#fff">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr>
        <td style="padding:9px 12px;background:#f5f4f0"><strong>Name:</strong> ${a.fullName || '—'}</td>
        <td style="padding:9px 12px;background:#f5f4f0"><strong>Email:</strong> ${a.email || '—'}</td>
      </tr>
      <tr>
        <td style="padding:9px 12px"><strong>Phone:</strong> ${a.phone || '—'}</td>
        <td style="padding:9px 12px"><strong>City:</strong> ${a.cityLocation || '—'}</td>
      </tr>
      <tr>
        <td style="padding:9px 12px;background:#f5f4f0"><strong>Role:</strong> ${a.roleTitle || 'General'}</td>
        <td style="padding:9px 12px;background:#f5f4f0"><strong>Work Auth:</strong> ${a.workAuthorization || '—'}</td>
      </tr>
      <tr>
        <td style="padding:9px 12px"><strong>Shift:</strong> ${a.shiftPreference || '—'}</td>
        <td style="padding:9px 12px"><strong>Source:</strong> ${a.source || '—'}</td>
      </tr>
    </table>
    ${a.q1 ? `<div style="padding:12px;background:#f5f4f0;border-radius:5px;margin-bottom:8px">
      <p style="color:#c0152a;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;font-weight:700">Q1 — Tell Us Your Story</p>
      <p style="margin:0;font-size:13px;color:#0a1628">${a.q1}</p>
    </div>` : ''}
    ${a.q2 ? `<div style="padding:12px;background:#f5f4f0;border-radius:5px;margin-bottom:8px">
      <p style="color:#c0152a;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;font-weight:700">Q2 — Punctuality</p>
      <p style="margin:0;font-size:13px;color:#0a1628">${a.q2}</p>
    </div>` : ''}
    ${a.q8 ? `<div style="padding:12px;background:#f5f4f0;border-radius:5px;margin-bottom:8px">
      <p style="color:#c0152a;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;font-weight:700">Q8 — Quality Work</p>
      <p style="margin:0;font-size:13px;color:#0a1628">${a.q8}</p>
    </div>` : ''}
    ${a.q15 ? `<div style="padding:12px;background:#f5f4f0;border-radius:5px;margin-bottom:8px">
      <p style="color:#c0152a;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;font-weight:700">Q15 — Not on Resume</p>
      <p style="margin:0;font-size:13px;color:#0a1628">${a.q15}</p>
    </div>` : ''}
    <div style="text-align:center;margin-top:20px">
      <a href="https://airtable.com/appGGFKuFxQ3Z0Wuz"
        style="background:#c0152a;color:white;padding:11px 24px;border-radius:7px;text-decoration:none;font-weight:700;font-size:13px">
        View in PeopleBook Airtable →
      </a>
    </div>
  </div>
  <div style="background:#0a1628;padding:14px;text-align:center">
    <p style="color:#4b5568;font-size:11px;margin:0">PeopleBook · Ray Land Inc. · Stable Engineering // Design Innovation // Perpetual Service</p>
  </div>
</div>`,
    })

    console.log('Recruiter email result:', JSON.stringify(recruiterResult))

    // Confirmation email to applicant
    if (a.email) {
      console.log('Sending applicant confirmation to:', a.email)
      const applicantResult = await resend.emails.send({
        from:    'PeopleBook <onboarding@resend.dev>',
        to:      [a.email],
        subject: `Application Received — ${a.fullName}`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
  <div style="background:#0a1628;padding:32px;text-align:center;border-bottom:3px solid #c0152a">
    <h1 style="color:white;font-size:22px;font-weight:400;margin:0 0 6px">Ray Land Inc.</h1>
    <p style="color:#9a9890;font-size:12px;margin:0">Stable Engineering // Design Innovation // Perpetual Service</p>
  </div>
  <div style="padding:32px;text-align:center;background:#fff">
    <div style="font-size:44px;margin-bottom:12px">&#10003;</div>
    <h2 style="font-size:20px;color:#0a1628;font-weight:400;margin:0 0 10px">
      Application Received, ${a.fullName?.split(' ')[0] || 'there'}!
    </h2>
    <p style="font-size:14px;color:#4b5568;line-height:1.7;margin:0 0 16px">
      Thank you for applying to <strong>Ray Land Inc.</strong><br/>
      Our team will be in touch within <strong>5-7 business days</strong>.
    </p>
    <div style="background:#f5f4f0;border-radius:8px;padding:14px 20px;text-align:left;margin:16px 0">
      <p style="margin:0 0 6px;font-size:13px;color:#0a1628"><strong>Role:</strong> ${a.roleTitle || 'General Application'}</p>
      <p style="margin:0;font-size:13px;color:#0a1628"><strong>Submitted:</strong> ${new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}</p>
    </div>
    <p style="font-size:12px;color:#9a9890">
      Questions? Contact <a href="mailto:anthony@runbusiness.com" style="color:#c0152a">anthony@runbusiness.com</a>
    </p>
    <p style="color:#c0152a;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin-top:16px">
      We move people forward.
    </p>
  </div>
  <div style="background:#0a1628;padding:14px;text-align:center">
    <p style="color:#4b5568;font-size:11px;margin:0">Ray Land Inc. · PeopleBook Recruiting Portal</p>
  </div>
</div>`,
      })
      console.log('Applicant email result:', JSON.stringify(applicantResult))
    }

    console.log('=== EMAIL NOTIFICATION COMPLETE ===')

  } catch (err: any) {
    console.error('=== EMAIL SEND ERROR ===')
    console.error('Error message:', err?.message)
    console.error('Error status:', err?.statusCode)
    console.error('Full error:', JSON.stringify(err))
  }
}
