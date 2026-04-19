import Link from 'next/link'

type Role = { status?: string; department?: string; priority?: string }

export default function Hero({ roles = [] }: { roles?: Role[] }) {
  const open   = roles.filter(r => r.status === 'Open').length
  const depts  = new Set(roles.map(r => r.department).filter(Boolean)).size
  const urgent = roles.filter(r => r.status === 'Open' && r.priority === 'High').length

  return (
    <section style={{
      background: 'linear-gradient(172deg, rgba(3,1,1,0.88), rgba(21,29,44,0.96)), url("/raylandlogo.png") center/cover no-repeat',
      backgroundColor: '#0a1628',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 480,
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Crimson sidebar stripe */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 8,
        background: 'linear-gradient(172deg, #7e0606, #b70000 32%, #810000 69%, #830000)',
      }} />

      {/* Silver diagonal accent top-right */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: 220, height: 220,
        background: 'radial-gradient(circle at 100% 0, rgba(221,221,221,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 48px 72px 56px', width: '100%' }}>

        {/* Eyebrow */}
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            color: '#8299c0',
          }}>
            Now Hiring · Ray Land Inc. · Est. 2002
          </span>
        </div>

        {/* Main heading */}
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#ffffff',
          lineHeight: 1.05,
          letterSpacing: '0.03em',
          marginBottom: 12,
          maxWidth: 700,
        }}>
          People<span style={{ color: '#c0152a' }}>Book</span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.62em', letterSpacing: '0.08em' }}>
            Recruiting Portal
          </span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 16,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 8,
          letterSpacing: '0.05em',
        }}>
          Stable Engineering&nbsp;
          <span style={{ color: '#c0152a', fontWeight: 600 }}>//</span>
          &nbsp;Design Innovation&nbsp;
          <span style={{ color: '#c0152a', fontWeight: 600 }}>//</span>
          &nbsp;Perpetual Service
        </p>

        <p style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 15,
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 40,
          maxWidth: 520,
          lineHeight: 1.6,
        }}>
          Every great operating system begins with people — not technology, not process. People.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 48, marginBottom: 44, flexWrap: 'wrap' }}>
          {[
            { n: open,   l: 'Open Roles' },
            { n: depts,  l: 'Departments' },
            { n: urgent, l: 'Urgent Hires' },
          ].map(s => (
            <div key={s.l} style={{ borderLeft: '2px solid rgba(192,21,42,0.5)', paddingLeft: 16 }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 40, fontWeight: 700, color: '#e8c96b', lineHeight: 1 }}>
                {s.n}
              </div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#8299c0', marginTop: 4 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/apply" className="btn-primary">Apply Now</Link>
          <a href="#roles" className="btn-ghost">View Openings</a>
        </div>
      </div>
    </section>
  )
}
