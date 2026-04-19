import Image from 'next/image'

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(123deg, #050931, #182f64)',
      fontFamily: "'Rajdhani', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Crimson stripe top */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #c0152a, #7e0606 50%, #c0152a)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 48px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, marginBottom: 48 }}>

          {/* Brand block */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            {/* Crimson stripe */}
            <div style={{ width: 4, alignSelf: 'stretch', background: 'linear-gradient(172deg, #7e0606, #b70000 32%, #810000)', flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Image src="/raylandlogo.png" alt="Ray Land Inc." width={48} height={48} style={{ objectFit: 'contain', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.05em', lineHeight: 1.1 }}>
                    People<span style={{ color: '#c0152a' }}>Book</span>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#8299c0', marginTop: 2 }}>
                    Ray Land Inc.
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 300 }}>
                Passionate about excellent service &amp; consistently exceeding expectations. We blend technology, equipment, and people in passionate efficiency.
              </p>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#8299c0', marginBottom: 16 }}>Portal</div>
              {[
                { href: '/', label: 'All Roles' },
                { href: '/apply', label: 'Apply Now' },
              ].map(l => (
                <div key={l.href} style={{ marginBottom: 10 }}>
                  <a href={l.href} style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e8c96b')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  >{l.label}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#8299c0', marginBottom: 16 }}>Ray Land</div>
              {[
                { href: 'https://rayland.com', label: 'rayland.com' },
                { href: 'https://rayland.com', label: 'About Us' },
              ].map(l => (
                <div key={l.label} style={{ marginBottom: 10 }}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e8c96b')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  >{l.label}</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>
            Stable Engineering // Design Innovation // Perpetual Service
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
            © 2026 Ray Land Inc. · PeopleBook Recruiting Portal · Powered by BOSS
          </p>
        </div>
      </div>
    </footer>
  )
}
