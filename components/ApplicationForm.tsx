'use client'
import React, { useState, useRef } from 'react'

export default function ApplicationForm({ roles }: { roles: any[] }) {
  const [done, setDone]         = useState(false)
  const [busy, setBusy]         = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm]         = useState<Record<string, string>>({})
  const [resume, setResume]     = useState<File | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (!file.name.match(/\.(pdf|doc|docx)$/i)) { alert('Please upload a PDF or Word document.'); return }
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB.'); return }
    setResume(file)
    setResumeUrl(null)

    // Upload immediately to get a public URL
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('files', file, file.name)
      const res = await fetch('/api/uploadthing', {
        method: 'POST',
        headers: { 'x-uploadthing-package': 'nextjs-app' },
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data?.[0]?.url || data?.data?.[0]?.url
        if (url) {
          setResumeUrl(url)
          console.log('Resume uploaded:', url)
        }
      }
    } catch (e) {
      console.error('Upload error:', e)
      // Still allow submission — will use raw file as fallback
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    if (!form.fullName?.trim() || !form.email?.trim()) return alert('Full name and email are required.')
    if (uploading) return alert('Please wait — resume is still uploading.')
    setBusy(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))

      if (resumeUrl) {
        // Preferred: send public URL so Airtable can attach it
        fd.append('resumeUrl', resumeUrl)
        fd.append('resumeName', resume?.name || 'resume.pdf')
      } else if (resume) {
        // Fallback: send raw file (email attachment only, won't attach to Airtable)
        fd.append('resume', resume, resume.name)
      }

      const r = await fetch('/api/apply', { method: 'POST', body: fd })
      if (r.ok) setDone(true)
      else { const err = await r.json().catch(() => ({})); alert(err.error || 'Something went wrong.') }
    } catch { alert('Network error. Please try again.') }
    finally { setBusy(false) }
  }

  if (done) return (
    <div style={{ background: '#fff', borderLeft: '6px solid #c0152a', padding: '48px 40px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 48, color: '#c0152a', marginBottom: 16 }}>✓</div>
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#212c42', marginBottom: 12 }}>Application Received</h2>
      <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 14, color: '#505e78', lineHeight: 1.7 }}>
        Thank you for applying. Our team reviews every submission personally.<br />We will be in touch within <strong>5–7 business days.</strong>
      </p>
      <div style={{ marginTop: 24, fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#8299c0' }}>
        Ray Land Inc. // We Move People Forward
      </div>
    </div>
  )

  return (
    <div style={{ background: '#fff', borderLeft: '4px solid #c0152a', padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <style>{`
        .rl-inp { width:100%; font-family:'Rajdhani',sans-serif; font-size:14px; font-weight:500; color:#212c42; border:1px solid #d1d0cb; border-radius:0; padding:10px 14px; outline:none; background:#fff; transition:border-color 0.15s; box-sizing:border-box; }
        .rl-inp:focus { border-color:#c0152a; }
        .rl-submit { width:100%; background:#c0152a; color:#fff; font-family:'Rajdhani',sans-serif; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; padding:16px 0; border:none; border-radius:0; cursor:pointer; transition:background 0.2s; }
        .rl-submit:hover:not(:disabled) { background:#991020; }
        .rl-submit:disabled { background:#d1d0cb; cursor:not-allowed; }
        .rl-drop { border:2px dashed #d1d0cb; background:#f5f4f0; padding:28px 24px; text-align:center; cursor:pointer; transition:all 0.2s; }
        .rl-drop:hover { border-color:#c0152a; }
        .rl-drop.over { border-color:#c0152a; background:rgba(192,21,42,0.03); }
        .rl-drop.has-file { border-color:#166534; background:rgba(22,101,52,0.03); }
        .rl-drop.uploading { border-color:#c9a84c; background:rgba(201,168,76,0.05); }
      `}</style>

      {/* Personal Info */}
      <div>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.25em', color:'#c0152a', marginBottom:16, paddingBottom:8, borderBottom:'1px solid #e0deda', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:3, height:14, background:'#c0152a' }} />Personal Information
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[['fullName','Full Name *','text'],['email','Email *','email'],['phone','Phone','text'],['cityLocation','City','text']].map(([k,l,t]) => (
            <div key={k}>
              <label style={{ display:'block', fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#8299c0', marginBottom:6 }}>{l}</label>
              <input type={t} className="rl-inp" onChange={set(k)} />
            </div>
          ))}
        </div>
      </div>

      {/* Position */}
      <div>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.25em', color:'#c0152a', marginBottom:16, paddingBottom:8, borderBottom:'1px solid #e0deda', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:3, height:14, background:'#c0152a' }} />Position Details
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <label style={{ display:'block', fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#8299c0', marginBottom:6 }}>Applying For</label>
            <select className="rl-inp" onChange={set('roleTitle')}>
              <option value="">General Application</option>
              {roles.map((r: any) => <option key={r.id} value={r.title}>{r.title}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#8299c0', marginBottom:6 }}>Work Authorization *</label>
            <select className="rl-inp" onChange={set('workAuthorization')}>
              <option value="">Select...</option>
              <option>Authorized</option><option>Needs Sponsorship</option>
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#8299c0', marginBottom:6 }}>Shift Preference</label>
            <select className="rl-inp" onChange={set('shiftPreference')}>
              <option value="">Select...</option>
              {['Days','Nights','Weekends','Rotating','On-Call','Flex'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#8299c0', marginBottom:6 }}>How Did You Hear?</label>
            <select className="rl-inp" onChange={set('source')}>
              <option value="">Select...</option>
              {['Indeed','Referral','rayland.com','LinkedIn','Walk-in','Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Resume Upload */}
      <div>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.25em', color:'#c0152a', marginBottom:16, paddingBottom:8, borderBottom:'1px solid #e0deda', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:3, height:14, background:'#c0152a' }} />Resume / CV
        </div>
        <div
          className={`rl-drop${dragOver ? ' over' : ''}${uploading ? ' uploading' : resume ? ' has-file' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] || null) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display:'none' }}
            onChange={e => handleFile(e.target.files?.[0] || null)} />
          {uploading ? (
            <div>
              <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:14, fontWeight:600, color:'#c9a84c', textTransform:'uppercase', letterSpacing:'0.1em' }}>⟳ Uploading {resume?.name}...</p>
              <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:'#8299c0', marginTop:4 }}>Please wait</p>
            </div>
          ) : resume ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
              <span style={{ color: resumeUrl ? '#166534' : '#c9a84c', fontSize:20 }}>{resumeUrl ? '✓' : '!'}</span>
              <div style={{ textAlign:'left' }}>
                <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:14, fontWeight:600, color:'#212c42' }}>{resume.name}</p>
                <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:'#8299c0', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  {(resume.size/1024).toFixed(0)} KB · {resumeUrl ? '✓ Uploaded to cloud' : 'Saved locally'}
                </p>
              </div>
              <button onClick={e => { e.stopPropagation(); setResume(null); setResumeUrl(null); if (fileInputRef.current) fileInputRef.current.value='' }}
                style={{ marginLeft:12, background:'none', border:'none', color:'#c0152a', fontSize:18, cursor:'pointer', fontWeight:700 }}>×</button>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:28, color:'#d1d0cb', marginBottom:8 }}>↑</div>
              <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:14, fontWeight:600, color:'#505e78', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                Drop your resume or <span style={{ color:'#c0152a' }}>browse files</span>
              </p>
              <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:'#8299c0', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:6 }}>PDF, DOC, DOCX — max 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.25em', color:'#c0152a', marginBottom:16, paddingBottom:8, borderBottom:'1px solid #e0deda', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:3, height:14, background:'#c0152a' }} />Application Questions
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {[
            ['q1','Q1 — Tell Us Your Story *','In your own words, who are you and what drives you?'],
            ['q2','Q2 — What Does Punctuality Mean? *','Mindset, preparation, showing up...'],
            ['q3','Q3 — Competing Priorities?','Describe a specific time...'],
            ['q8','Q8 — What Is Quality Work to You?','Give a specific example.'],
            ['q15','Q15 — Not on Your Resume?','Anything about yourself not on paper?'],
          ].map(([k,l,p]) => (
            <div key={k}>
              <label style={{ display:'block', fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#8299c0', marginBottom:6 }}>{l}</label>
              <textarea placeholder={p} onChange={set(k)} className="rl-inp" style={{ resize:'vertical', minHeight:80, lineHeight:1.6 }} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={submit} disabled={busy || uploading} className="rl-submit">
        {busy ? 'Submitting...' : uploading ? 'Waiting for upload...' : 'Submit Application →'}
      </button>
    </div>
  )
}
