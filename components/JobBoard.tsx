'use client'
import { useState, useMemo } from 'react'
import JobCard from './JobCard'
import JobModal from './JobModal'

const STATUSES = ['All', 'Open', 'On Hold', 'Filled', 'Urgent']
const DEPTS = ['All', 'Operations', 'Maintenance', 'Compliance', 'Administration', 'Training', 'Technology', 'Management']

export default function JobBoard({ roles }: { roles: any[] }) {
  const [status, setStatus]   = useState('All')
  const [dept, setDept]       = useState('All')
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState<any>(null)

  const filtered = useMemo(() => roles.filter(r => {
    if (status === 'Urgent' && r.priority !== 'High') return false
    if (status !== 'All' && status !== 'Urgent' && r.status !== status) return false
    if (dept !== 'All' && r.department !== dept) return false
    if (search) {
      const q = search.toLowerCase()
      return r.title.toLowerCase().includes(q) || r.department.toLowerCase().includes(q) || (r.notes || '').toLowerCase().includes(q)
    }
    return true
  }), [roles, status, dept, search])

  return (
    <section id="roles" style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Crimson stripe accent */}
          <div style={{ width: 4, height: 48, background: 'linear-gradient(172deg, #7e0606, #b70000 32%, #810000)', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#8299c0', marginBottom: 4 }}>
              Open Positions
            </div>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#212c42', lineHeight: 1 }}>
              {status === 'All' ? 'All Positions' : status === 'Urgent' ? 'Urgent Positions' : `${status} Positions`}
            </h2>
          </div>
        </div>
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8299c0' }}>
          {filtered.length} Role{filtered.length !== 1 ? 's' : ''} Found
        </span>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff',
        border: '1px solid #e0deda',
        borderLeft: '3px solid #c0152a',
        padding: '16px 20px',
        marginBottom: 12,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
      }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8299c0', marginRight: 8 }}>
          Status
        </div>
        {STATUSES.map(s => {
          const isActive = s === status
          const isUrgent = s === 'Urgent'
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={isActive ? (isUrgent ? 'filter-pill filter-pill-red' : 'filter-pill filter-pill-active') : 'filter-pill'}
            >
              {isUrgent && isActive ? '● ' : ''}{s}
            </button>
          )
        })}

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search roles..."
          style={{
            marginLeft: 'auto',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: '#212c42',
            border: '1px solid #d1d0cb',
            borderRadius: 0,
            padding: '6px 14px',
            outline: 'none',
            width: 160,
            background: '#f5f4f0',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#c0152a')}
          onBlur={e => (e.currentTarget.style.borderColor = '#d1d0cb')}
        />
      </div>

      {/* Department filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 40 }}>
        {DEPTS.map(d => {
          const isActive = d === dept
          return (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={isActive ? 'filter-pill filter-pill-active' : 'filter-pill'}
              style={{ fontSize: 11 }}
            >
              {d}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#8299c0',
        }}>
          No roles match your filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: '#e0deda' }}>
          {filtered.map(r => (
            <div key={r.id} style={{ background: '#f5f4f0' }}>
              <JobCard role={r} onClick={() => setSelected(r)} />
            </div>
          ))}
        </div>
      )}

      {selected && <JobModal role={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
