import Link from 'next/link'

type Role = { status?: string; department?: string; priority?: string }

export default function Hero({ roles = [] }: { roles?: Role[] }) {
  const open   = roles.filter(r => r.status === 'Open').length
  const depts  = new Set(roles.map(r => r.department).filter(Boolean)).size
  const urgent = roles.filter(r => r.status === 'Open' && r.priority === 'High').length

  return (
    <>
      <style>{`
        .rl-hero-btn-primary { display:inline-block; background:#c0152a; color:#fff; font-family:'Rajdhani',sans-serif; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.16em; padding:12px 32px; border:none; border-radius:0; text-decoration:none; transition:background 0.2s; cursor:pointer; }
        .rl-hero-btn-primary:hover { background:#991020; }
        .rl-hero-btn-ghost  { display:inline-block; background:transparent; color:#fff; font-family:'Rajdhani',sans-serif; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.16em; padding:11px 32px; border:1.5px solid rgba(255,255,255,0.45); border-radius:0; text-decoration:none; transition:all 0.2s; }
        .rl-hero-btn-ghost:hover  { border-color:#fff; background:rgba(255,255,255,0.08); }
      `}</style>

      <section style={{
        /* Deep navy → royal blue — exact RayLand footer gradient */
        background: 'linear-gradient(123deg, #050931 0%, #0d1f5c 40%, #182f64 70%, #1a3a7a 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 480,
        display: 'flex',
        alignItems: 'center',
      }}>

        {/* Crimson left sidebar stripe */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 8,
          background: 'linear-gradient(172deg, #7e0606, #b70000 32%, #810000 69%, #830000)',
        }} />

        {/* Subtle diagonal stripe overlay (echoes the navbar) */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `repeating-linear-gradient(
            -55deg,
            transparent 0px,
            transparent 60px,
            rgba(255,255,255,0.015) 60px,
            rgba(255,255,255,0.015) 80px
          )`,
        }} />

        {/* Radial glow top-right */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 400, height: 400,
          background: 'radial-gradient(circle at 100% 0%, rgba(24,47,100,0.6) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 48px 72px 56px', width: '100%', position: 'relative' }}>

          {/* Eyebrow */}
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#8299c0', marginBottom: 16 }}>
            Now Hiring · Ray Land Inc. · Est. 2002
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff', lineHeight: 1.05, letterSpacing: '0.03em', marginBottom: 14, maxWidth: 680 }}>
            People<span style={{ color: '#c0152a' }}>Book</span>
            <br />
          </h1>

          {/* Tagline */}
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.55)', marginBottom: 6, letterSpacing: '0.05em' }}>
            Stable Engineering&nbsp;
            <span style={{ color: '#c0152a', fontWeight: 700 }}>//</span>
            &nbsp;Design Innovation&nbsp;
            <span style={{ color: '#c0152a', fontWeight: 700 }}>//</span>
            &nbsp;Perpetual Service
          </p>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 18, color: 'rgba(255,255,255,0.38)', marginBottom: 44, maxWidth: 480, lineHeight: 1.65 }}>
            Every great operating system begins with people — not technology, not process. People.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 44, marginBottom: 44, flexWrap: 'wrap' }}>
            {[
              { n: open,   l: 'Open Roles' },
              { n: depts,  l: 'Departments' },
              { n: urgent, l: 'Urgent Hires' },
            ].map(s => (
              <div key={s.l} style={{ borderLeft: '2px solid rgba(192,21,42,0.55)', paddingLeft: 16 }}>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 42, fontWeight: 700, color: '#e8c96b', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#8299c0', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/apply" className="rl-hero-btn-primary">Apply Now</Link>
            <a href="#roles" className="rl-hero-btn-ghost">View Openings</a>
          </div>
        </div>
      </section>
    </>
  )
}
