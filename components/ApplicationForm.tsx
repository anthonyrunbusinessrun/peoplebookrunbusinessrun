'use client'
import { useState } from 'react'
export default function ApplicationForm({ roles }: { roles: any[] }) {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async () => {
    if (!form.fullName?.trim() || !form.email?.trim()) return alert('Name and email are required.')
    setBusy(true)
    try {
      const r = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (r.ok) setDone(true)
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }
  if (done) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-2xl font-serif text-navy-900 mb-3">Application Received!</h2>
      <p className="text-gray-500 leading-relaxed">
        Thank you for applying. Our team will reach out within 5–7 business days.<br /><br />
        <strong className="text-navy-900">Ray Land Inc. — We move people forward.</strong>
      </p>
    </div>
  )
  const inp = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-400 transition-colors"
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-4">
      <p className="text-xs uppercase tracking-widest text-red-600 font-bold">Personal Information</p>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Full Name *</label><input className={inp} onChange={set('fullName')} /></div>
        <div><label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Email *</label><input type="email" className={inp} onChange={set('email')} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Phone</label><input className={inp} onChange={set('phone')} /></div>
        <div><label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">City</label><input className={inp} onChange={set('cityLocation')} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Applying For</label>
          <select className={inp} onChange={set('roleTitle')}>
            <option value="">General Application</option>
            {roles.map((r: any) => <option key={r.id} value={r.title}>{r.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Work Authorization *</label>
          <select className={inp} onChange={set('workAuthorization')}>
            <option value="">Select...</option>
            <option>Authorized</option>
            <option>Needs Sponsorship</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Shift Preference</label>
          <select className={inp} onChange={set('shiftPreference')}>
            <option value="">Select...</option>
            {['Days','Nights','Weekends','Rotating','On-Call','Flex'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">How Did You Hear?</label>
          <select className={inp} onChange={set('source')}>
            <option value="">Select...</option>
            {['Indeed','Referral','rayland.com','LinkedIn','Walk-in','Other'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <hr className="border-gray-100" />
      <p className="text-xs uppercase tracking-widest text-red-600 font-bold">Application Questions</p>
      {[
        ['q1',  'Q1 — Tell Us Your Story *',            'In your own words, who are you and what drives you?'],
        ['q2',  'Q2 — What Does Punctuality Mean? *',   'Mindset, preparation, showing up...'],
        ['q3',  'Q3 — Competing Priorities?',           'Describe a specific time...'],
        ['q8',  'Q8 — What Is Quality Work to You?',    'Give a specific example.'],
        ['q15', 'Q15 — Not on Your Resume?',            'Anything about yourself not on paper?'],
      ].map(([k, l, p]) => (
        <div key={k}>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">{l}</label>
          <textarea className={inp + " resize-y min-h-20"} placeholder={p} onChange={set(k)} />
        </div>
      ))}
      <button onClick={submit} disabled={busy}
        className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors tracking-wide text-base">
        {busy ? 'Submitting...' : 'Submit Application →'}
      </button>
    </div>
  )
}
