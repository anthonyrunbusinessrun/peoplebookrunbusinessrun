'use client'
import React, { useState, useRef } from 'react'

export default function ApplicationForm({ roles }: { roles: any[] }) {
  const [done, setDone]     = useState(false)
  const [busy, setBusy]     = useState(false)
  const [form, setForm]     = useState<Record<string, string>>({})
  const [resume, setResume] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleFile = (file: File | null) => {
    if (!file) return
    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      alert('Please upload a PDF or Word document (.pdf, .doc, .docx).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB.')
      return
    }
    setResume(file)
  }

  const submit = async () => {
    if (!form.fullName?.trim() || !form.email?.trim())
      return alert('Full name and email are required.')
    setBusy(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (resume) fd.append('resume', resume, resume.name)

      const r = await fetch('/api/apply', { method: 'POST', body: fd })
      if (r.ok) setDone(true)
      else {
        const err = await r.json().catch(() => ({}))
        alert(err.error || 'Something went wrong. Please try again.')
      }
    } catch (e) {
      console.error(e)
      alert('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
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
  const lbl = "block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1"

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">

      {/* Personal Info */}
      <p className="text-xs uppercase tracking-widest text-red-600 font-bold">Personal Information</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={lbl}>Full Name *</label><input className={inp} onChange={set('fullName')} /></div>
        <div><label className={lbl}>Email *</label><input type="email" className={inp} onChange={set('email')} /></div>
        <div><label className={lbl}>Phone</label><input className={inp} onChange={set('phone')} /></div>
        <div><label className={lbl}>City</label><input className={inp} onChange={set('cityLocation')} /></div>
      </div>

      {/* Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Applying For</label>
          <select className={inp} onChange={set('roleTitle')}>
            <option value="">General Application</option>
            {roles.map((r: any) => <option key={r.id} value={r.title}>{r.title}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Work Authorization *</label>
          <select className={inp} onChange={set('workAuthorization')}>
            <option value="">Select...</option>
            <option>Authorized</option>
            <option>Needs Sponsorship</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Shift Preference</label>
          <select className={inp} onChange={set('shiftPreference')}>
            <option value="">Select...</option>
            {['Days','Nights','Weekends','Rotating','On-Call','Flex'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>How Did You Hear?</label>
          <select className={inp} onChange={set('source')}>
            <option value="">Select...</option>
            {['Indeed','Referral','rayland.com','LinkedIn','Walk-in','Other'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Resume Upload */}
      <div>
        <p className="text-xs uppercase tracking-widest text-red-600 font-bold mb-3">Resume / CV</p>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] || null) }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragOver      ? 'border-red-400 bg-red-50'
            : resume      ? 'border-green-400 bg-green-50'
            : 'border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0] || null)}
          />
          {resume ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-green-500 text-2xl">✓</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">{resume.name}</p>
                <p className="text-xs text-gray-400">{(resume.size / 1024).toFixed(0)} KB · Ready to submit</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setResume(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="ml-4 text-red-400 hover:text-red-600 text-xl font-bold leading-none"
              >×</button>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm font-medium text-gray-700">
                Drop your resume here or <span className="text-red-600 underline">browse files</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — max 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <hr className="border-gray-100" />
      <p className="text-xs uppercase tracking-widest text-red-600 font-bold">Application Questions</p>
      {[
        ['q1',  'Q1 — Tell Us Your Story *',          'In your own words, who are you and what drives you?'],
        ['q2',  'Q2 — What Does Punctuality Mean? *', 'Mindset, preparation, showing up...'],
        ['q3',  'Q3 — Competing Priorities?',         'Describe a specific time...'],
        ['q8',  'Q8 — What Is Quality Work to You?',  'Give a specific example.'],
        ['q15', 'Q15 — Not on Your Resume?',          'Anything about yourself not on paper?'],
      ].map(([k, l, p]) => (
        <div key={k}>
          <label className={lbl}>{l}</label>
          <textarea className={inp + ' resize-y min-h-20'} placeholder={p} onChange={set(k)} />
        </div>
      ))}

      <button
        onClick={submit}
        disabled={busy}
        className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors tracking-wide text-base"
      >
        {busy ? 'Submitting...' : 'Submit Application →'}
      </button>
    </div>
  )
}
