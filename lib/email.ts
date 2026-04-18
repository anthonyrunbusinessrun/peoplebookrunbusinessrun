import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const NOTIFY = [
  'anthony@runbusiness.com',
  'kaye@runbusiness.com',
  'ereika@runbusiness.com',
  'ray@rayland.com',
]

export async function sendApplicationNotification(a: any) {
  const {
    fullName, email, phone, cityLocation,
    workAuthorization, shiftPreference, source,
    roleTitle, q1, q2, q3, q8, q15, resumeData,
  } = a

  const qBlock = (label: string, value: string | null) =>
    value ? `
    <div style="padding:12px 16px;background:#f9f8f6;border-radius:6px;margin-bottom:8px;border-left:3px solid #c0152a">
      <p style="color:#c0152a;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 5px;font-weight:700">${label}</p>
      <p style="margin:0;font-size:13px;color:#0a1628;line-height:1.6">${value}</p>
    </div>` : ''

  const recruiterHtml = `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
  <div style="background:#0a1628;padding:28px 32px;border-bottom:4px solid #c0152a">
    <p style="color:#c0152a;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 4px;font-weight:700">PeopleBook · Ray Land Inc.</p>
    <h1 style="color:white;margin:0;font-size:22px;font-weight:400;font-family:Georgia,serif">New Application Received</h1>
    <span style="background:#c0152a;color:white;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block;margin-top:8px;letter-spacing:1px">
      ${roleTitle || 'General Application'}
    </span>
  </div>
  <div style="padding:28px 32px;background:white">
    <table width="100%" style="border-collapse:collapse;margin-bottom:20px">
      <tr>
        <td style="padding:10px 12px;background:#f9f8f6;border-bottom:1px solid #ece9e2"><strong>Name:</strong> ${fullName || '—'}</td>
        <td style="padding:10px 12px;background:#f9f8f6;border-bottom:1px solid #ece9e2"><strong>Email:</strong> ${email || '—'}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #ece9e2"><strong>Phone:</strong> ${phone || '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece9e2"><strong>City:</strong> ${cityLocation || '—'}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;background:#f9f8f6"><strong>Shift:</strong> ${shiftPreference || '—'}</td>
        <td style="padding:10px 12px;background:#f9f8f6"><strong>Source:</strong> ${source || '—'}</td>
      </tr>
    </table>

    ${resumeData ? `
    <div style="padding:12px 16px;background:#f0f7f0;border-radius:6px;border:1px solid #c8e6c9;margin-bottom:16px">
      <p style="margin:0;font-size:12px;color:#2d8a4e;font-weight:700">📎 Resume attached: ${resumeData.name}</p>
    </div>` : `
    <div style="padding:12px 16px;background:#fff8f0;border-radius:6px;border:1px solid #ffe0b2;margin-bottom:16px">
      <p style="margin:0;font-size:12px;color:#e65100">No resume attached</p>
    </div>`}

    ${qBlock('Q1 — Tell Us Your Story', q1)}
    ${qBlock('Q2 — Punctuality', q2)}
    ${qBlock('Q3 — Competing Priorities', q3)}
    ${qBlock('Q8 — Quality Work', q8)}
    ${qBlock('Q15 — Not on Resume', q15)}

    <div style="text-align:center;margin-top:24px">
      <a href="https://airtable.com/appGGFKuFxQ3Z0Wuz"
        style="background:#c0152a;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px">
        VIEW IN PEOPLEBOOK →
      </a>
    </div>
  </div>
  <div style="background:#0a1628;padding:16px 32px;text-align:center">
    <p style="color:#4a6080;font-size:11px;margin:0">PeopleBook · Ray Land Inc. · Stable Engineering // Design Innovation // Perpetual Service</p>
  </div>
</div>`

  const applicantHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
  <div style="background:#0a1628;padding:32px;text-align:center;border-bottom:4px solid #c0152a">
    <h1 style="color:white;font-size:22px;font-weight:400;margin:0 0 6px;font-family:Georgia,serif">Ray Land Inc.</h1>
    <p style="color:#9a9890;font-size:12px;margin:0">Stable Engineering // Design Innovation // Perpetual Service</p>
  </div>
  <div style="padding:32px;text-align:center;background:white">
    <div style="font-size:44px;margin-bottom:12px">✓</div>
    <h2 style="font-size:20px;color:#0a1628;font-weight:400;margin:0 0 10px;font-family:Georgia,serif">
      Application Received, ${fullName?.split(' ')[0] || 'there'}!
    </h2>
    <p style="font-size:14px;color:#4b5568;line-height:1.7;margin:0 0 16px">
      Thank you for applying to <strong>Ray Land Inc.</strong><br/>
      Our team will be in touch within <strong>5–7 business days</strong>.
    </p>
    <div style="background:#f9f8f6;border-radius:8px;padding:14px 20px;text-align:left;margin:16px 0">
      <p style="margin:0 0 6px;font-size:13px;color:#0a1628"><strong>Role:</strong> ${roleTitle || 'General Application'}</p>
      <p style="margin:0 0 6px;font-size:13px;color:#0a1628"><strong>Submitted:</strong> ${new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}</p>
      ${resumeData ? `<p style="margin:0;font-size:13px;color:#2d8a4e"><strong>✓ Resume received:</strong> ${resumeData.name}</p>` : ''}
    </div>
    <p style="font-size:12px;color:#9a9890;margin-top:16px">
      Questions? <a href="mailto:anthony@runbusiness.com" style="color:#c0152a">anthony@runbusiness.com</a>
    </p>
    <p style="color:#c0152a;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-top:20px">
      We move people forward.
    </p>
  </div>
  <div style="background:#0a1628;padding:14px;text-align:center">
    <p style="color:#4a6080;font-size:11px;margin:0">Ray Land Inc. · PeopleBook Recruiting Portal</p>
  </div>
</div>`

  try {
    // Build attachments array for email
    const attachments = resumeData?.base64
      ? [{ filename: resumeData.name, content: resumeData.base64 }]
      : []

    // Notify all recruiters
    await resend.emails.send({
      from:        'PeopleBook <noreply@runbusiness.com>',
      to:          NOTIFY,
      subject:     `New Application — ${fullName} (${roleTitle || 'General'})`,
      html:        recruiterHtml,
      attachments,
    })

    // Confirm to applicant
    if (email) {
      await resend.emails.send({
        from:    'PeopleBook <noreply@runbusiness.com>',
        to:      [email],
        subject: `Application Received — ${fullName}`,
        html:    applicantHtml,
      })
    }

    console.log('✅ Emails sent for:', fullName)
  } catch (err: any) {
    console.error('Email send error:', err?.message || err)
  }
}
