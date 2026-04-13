'use client'
import { useState, useMemo } from 'react'
import JobCard from './JobCard'
import JobModal from './JobModal'

const STATUSES = ['All', 'Open', 'On Hold', 'Filled', 'Urgent']
const DEPTS    = ['All', 'Operations', 'Maintenance', 'Compliance', 'Administration', 'Training', 'Technology', 'Management']

export default function JobBoard({ roles }: { roles: any[] }) {
  const [status,   setStatus]   = useState('All')
  const [dept,     setDept]     = useState('All')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<any>(null)

  const filtered = useMemo(() => roles.filter(r => {
    if (status === 'Urgent' && r.priority !== 'High') return false
    if (status !== 'All' && status !== 'Urgent' && r.status !== status) return false
    if (dept !== 'All' && r.department !== dept) return false
    if (search) {
      const q = search.toLowerCase()
      return r.title.toLowerCase().includes(q) ||
             r.department.toLowerCase().includes(q) ||
             r.notes.toLowerCase().includes(q)
    }
    return true
  }), [roles, status, dept, search])

  return (
    <section id="roles" className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={
              "px-4 py-2 rounded-full text-xs font-bold transition-colors " +
              (s === 'Urgent'
                ? status === s
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : status === s
                  ? "bg-navy-900 text-yellow-400"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200")
            }>
            {s === 'Urgent' ? '🔴 Urgent' : s}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search roles..."
          className="ml-auto border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-red-400 w-40" />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {DEPTS.map(d => (
          <button key={d} onClick={() => setDept(d)}
            className={
              "px-4 py-1.5 rounded-full text-xs transition-colors " +
              (dept === d
                ? "bg-red-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-red-400")
            }>
            {d}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-navy-900">
          {status === 'All' ? 'All Positions' : status === 'Urgent' ? '🔴 Urgent Positions' : status + ' Positions'}
        </h2>
        <span className="text-sm text-gray-400">{filtered.length} role{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      {filtered.length === 0
        ? <div className="text-center py-20 text-gray-400">No roles match your filter.</div>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(r => <JobCard key={r.id} role={r} onClick={() => setSelected(r)} />)}
          </div>
      }
      {selected && <JobModal role={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
