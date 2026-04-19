'use client'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

export default function JobModal({ role, onClose }: { role: any; onClose: () => void }) {
  const router = useRouter()

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(5,9,49,0.82)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', borderRadius: 0, boxShadow: '0 24px 64px rgba(5,9,49,0.4)' }}>

        {/* Modal header */}
        <div style={{
          background: 'linear-gradient(123deg, #050931, #182f64)',
          padding: '28px 28px 24px',
          position: 'relative',
          borderBottom: '3px solid #c0152a',
        }}>
          {/* Stripe */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: 'linear-gradient(172deg, #7e0606, #b70000 32%, #810000)' }} />

          <div style={{ paddingLeft: 16 }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#8299c0', marginBottom: 8 }}>
              {role.department}
            </div>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fff', lineHeight: 1.1 }}>
              {role.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              width: 32, height: 32,
              borderRadius: 0,
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* About */}
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#c0152a', marginBottom: 10 }}>
              About This Role
            </div>
            <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: '#505e78', lineHeight: 1.7 }}>
              {role.notes}
            </p>
          </div>

          {/* Details */}
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#c0152a', marginBottom: 10 }}>
              Details
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                role.status,
                role.type,
                role.priority + ' Priority',
                'Posted ' + formatDate(role.opened),
              ].map(t => (
                <span key={t} style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#505e78',
                  background: '#f5f4f0',
                  border: '1px solid #e0deda',
                  padding: '4px 12px',
                  borderRadius: 0,
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Schedule */}
          {role.shift && (
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#c0152a', marginBottom: 10 }}>
                Schedule
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[role.shift, role.hours].filter(Boolean).map(t => (
                  <span key={t} style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: '#505e78', background: '#f5f4f0', border: '1px solid #e0deda', padding: '4px 12px', borderRadius: 0,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {role.status === 'Open' ? (
            <button
              onClick={() => { onClose(); router.push('/apply?role=' + encodeURIComponent(role.title)) }}
              style={{
                width: '100%',
                background: '#c0152a',
                color: '#fff',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                padding: '14px 0',
                border: 'none',
                borderRadius: 0,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#991020')}
              onMouseLeave={e => (e.currentTarget.style.background = '#c0152a')}
            >
              Apply for This Role →
            </button>
          ) : (
            <div style={{
              width: '100%',
              background: '#f5f4f0',
              color: '#8299c0',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              padding: '14px 0',
              textAlign: 'center',
              borderRadius: 0,
            }}>
              {role.status === 'Filled' ? 'Role Has Been Filled' : 'Currently On Hold'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
