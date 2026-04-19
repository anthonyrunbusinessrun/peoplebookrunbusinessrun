import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ApplicationForm from '@/components/ApplicationForm'
import { getRoles } from '@/lib/airtable'

export default async function ApplyPage() {
  const roles = await getRoles()

  return (
    <main style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      <Navbar />

      {/* Apply page hero banner */}
      <div style={{
        background: 'linear-gradient(123deg, #050931, #182f64)',
        borderBottom: '3px solid #c0152a',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Stripe */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: 'linear-gradient(172deg, #7e0606, #b70000 32%, #810000)' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', paddingLeft: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#8299c0', marginBottom: 10 }}>
            Join the Team
          </div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 40, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fff', lineHeight: 1.1, marginBottom: 10 }}>
            Apply to Ray Land Inc.
          </h1>
          <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Our team reviews every submission personally.
          </p>
        </div>
      </div>

      {/* Form area */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <ApplicationForm roles={roles.filter((r: any) => r.status === 'Open')} />
      </div>

      <Footer />
    </main>
  )
}
