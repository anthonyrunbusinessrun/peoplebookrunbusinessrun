'use client'
import React, { useState, useRef } from 'react'

export default function ApplicationForm({ roles }: { roles: any[] }) {
  const [done, setDone]         = useState(false)
  const [busy, setBusy]         = useState(false)
  const [form, setForm]         = useState<Record<string, string>>({})
  const [resume, setResume]     = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleFile = (file: File | null) => {
    if (!file) return
    if (!file.name.match(/\.(pdf|doc|docx)$/i)) { alert('Please upload a PDF or Word document.'); return }
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB.'); return }
    setResume(file)
  }

  const submit = async () => {
    if (!form.fullName?.trim() || !form.email?.trim()) return alert('Full name and email are required.')
    setBusy(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (resume) fd.append('resume', resume, resume.name)
      const r = await fetch('/api/apply', { method: 'POST', body: fd })
      if (r.ok) setDone(true)
      else { const err = await r.json().catch(() => ({})); alert(err.error || 'Something went wrong.') }
    } catch { alert('Network error. Please try again.') }
    finally { setBusy(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: '#212c42',
    border: '1px solid #d1d0cb',
    borderRadius: 0,
    padding: '10px 14px',
    outline: 'none',
    background: '#fff',
    transition: 'border-color 0.15s',
  }
  const lbl: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: '#8299c0',
    marginBottom: 6,
  }
  const sectionHead: React.CSSProperties = {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
    color: '#c0152a',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '1px solid #e0deda',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }

  if (done) return (
    <div style={{ background: '#fff', borderLeft: '6px solid #c0152a', padding: '48px 40px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 48, color: '#c0152a', marginBottom: 16 }}>✓</div>
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#212c42', marginBottom: 12 }}>
        Application Received
      </h2>
      <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: '#505e78', lineHeight: 1.7 }}>
        Thank you for applying. Our team reviews every submission personally.<br />
        We will be in touch within <strong>5–7 business days.</strong>
      </p>
      <div style={{ marginTop: 24, fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#8299c0' }}>
        Ray Land Inc. // We Move People Forward
      </div>
    </div>
  )

  return (
    <div style={{ background: '#fff', borderLeft: '4px solid #c0152a', padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Personal Info */}
      <div>
        <div style={sectionHead}>
          <div style={{ width: 3, height: 16, background: '#c0152a', flexShrink: 0 }} />
          Personal Information
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={lbl}>Full Name *</label>
            <input style={inp} onChange={set('fullName')}
              onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')} />
          </div>
          <div>
            <label style={lbl}>Email *</label>
            <input type="email" style={inp} onChange={set('email')}
              onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')} />
          </div>
          <div>
            <label style={lbl}>Phone</label>
            <input style={inp} onChange={set('phone')}
              onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')} />
          </div>
          <div>
            <label style={lbl}>City</label>
            <input style={inp} onChange={set('cityLocation')}
              onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')} />
          </div>
        </div>
      </div>

      {/* Position */}
      <div>
        <div style={sectionHead}>
          <div style={{ width: 3, height: 16, background: '#c0152a', flexShrink: 0 }} />
          Position Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={lbl}>Applying For</label>
            <select style={inp} onChange={set('roleTitle')}
              onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')}>
              <option value="">General Application</option>
              {roles.map((r: any) => <option key={r.id} value={r.title}>{r.title}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Work Authorization *</label>
            <select style={inp} onChange={set('workAuthorization')}
              onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')}>
              <option value="">Select...</option>
              <option>Authorized</option>
              <option>Needs Sponsorship</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Shift Preference</label>
            <select style={inp} onChange={set('shiftPreference')}
              onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')}>
              <option value="">Select...</option>
              {['Days','Nights','Weekends','Rotating','On-Call','Flex'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>How Did You Hear?</label>
            <select style={inp} onChange={set('source')}
              onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')}>
              <option value="">Select...</option>
              {['Indeed','Referral','rayland.com','LinkedIn','Walk-in','Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Resume Upload */}
      <div>
        <div style={sectionHead}>
          <div style={{ width: 3, height: 16, background: '#c0152a', flexShrink: 0 }} />
          Resume / CV
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] || null) }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#c0152a' : resume ? '#166534' : '#d1d0cb'}`,
            background: dragOver ? 'rgba(192,21,42,0.03)' : resume ? 'rgba(22,101,52,0.03)' : '#f5f4f0',
            padding: '28px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files?.[0] || null)} />
          {resume ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={{ color: '#166534', fontSize: 20 }}>✓</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, color: '#212c42' }}>{resume.name}</p>
                <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: '#8299c0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{(resume.size / 1024).toFixed(0)} KB · Ready</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setResume(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                style={{ marginLeft: 12, background: 'none', border: 'none', color: '#c0152a', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>×</button>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, color: '#d1d0cb', marginBottom: 8 }}>↑</div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, color: '#505e78', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Drop your resume or <span style={{ color: '#c0152a', textDecoration: 'underline' }}>browse files</span>
              </p>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: '#8299c0', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>PDF, DOC, DOCX — max 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div>
        <div style={sectionHead}>
          <div style={{ width: 3, height: 16, background: '#c0152a', flexShrink: 0 }} />
          Application Questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            ['q1',  'Q1 — Tell Us Your Story *',          'In your own words, who are you and what drives you?'],
            ['q2',  'Q2 — What Does Punctuality Mean? *', 'Mindset, preparation, showing up...'],
            ['q3',  'Q3 — Competing Priorities?',         'Describe a specific time...'],
            ['q8',  'Q8 — What Is Quality Work to You?',  'Give a specific example.'],
            ['q15', 'Q15 — Not on Your Resume?',          'Anything about yourself not on paper?'],
          ].map(([k, l, p]) => (
            <div key={k}>
              <label style={lbl}>{l}</label>
              <textarea
                placeholder={p}
                onChange={set(k)}
                style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
                onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
                onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={busy}
        style={{
          width: '100%',
          background: busy ? '#d1d0cb' : '#c0152a',
          color: '#fff',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          padding: '16px 0',
          border: 'none',
          borderRadius: 0,
          cursor: busy ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#991020' }}
        onMouseLeave={e => { if (!busy) e.currentTarget.style.background = '#c0152a' }}
      >
        {busy ? 'Submitting...' : 'Submit Application →'}
      </button>
    </div>
  )
}
