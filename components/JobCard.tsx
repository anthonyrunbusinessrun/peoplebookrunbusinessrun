import { formatDate, getStatusBadge } from '@/lib/utils'

export default function JobCard({ role, onClick }: { role: any; onClick: () => void }) {
  const isUrgent = role.priority === 'High'

  return (
    <div
      onClick={onClick}
      className="card"
      style={{
        padding: '24px 24px 20px',
        borderLeftColor: isUrgent ? '#c0152a' : '#d1d0cb',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: '#8299c0',
          background: '#f5f4f0',
          padding: '3px 8px',
        }}>
          {role.department}
        </span>
        <span className={getStatusBadge(role.status)}>{role.status}</span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 20,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: '#212c42',
        marginBottom: 8,
        lineHeight: 1.15,
        transition: 'color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = '#c0152a')}
        onMouseLeave={e => (e.currentTarget.style.color = '#212c42')}
      >
        {role.title}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 13,
        color: '#505e78',
        lineHeight: 1.6,
        marginBottom: 16,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
      }}>
        {role.notes}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {[role.type, role.shift].filter(Boolean).map((tag: string) => (
          <span key={tag} style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#505e78',
            background: '#f5f4f0',
            border: '1px solid #e0deda',
            padding: '3px 10px',
            borderRadius: 0,
          }}>
            {tag}
          </span>
        ))}
        {role.openings > 1 && (
          <span style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#c0152a',
            background: 'rgba(192,21,42,0.06)',
            border: '1px solid rgba(192,21,42,0.2)',
            padding: '3px 10px',
            borderRadius: 0,
          }}>
            {role.openings} Openings
          </span>
        )}
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f0efe9' }}>
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: '#8299c0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Posted {formatDate(role.opened)}
        </span>
        {isUrgent && (
          <span style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#c0152a',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            ● Urgent
          </span>
        )}
      </div>
    </div>
  )
}
