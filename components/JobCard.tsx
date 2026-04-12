import { formatDate, getStatusBadge } from '@/lib/utils'
export default function JobCard({ role, onClick }: { role: any, onClick: () => void }) {
  const isHigh = role.priority === 'High'
  return (
    <div onClick={onClick} className={"card p-6 group " + (isHigh ? "border-l-4 border-l-crimson-500" : "")}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">{role.department}</span>
        <span className={getStatusBadge(role.status)}>{role.status}</span>
      </div>
      <h3 className="text-lg font-serif text-navy-900 mb-2 group-hover:text-crimson-500 transition-colors">{role.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{role.notes}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full">{role.type}</span>
        {role.shift && <span className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full">{role.shift}</span>}
        {role.openings > 1 && <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold">{role.openings} openings</span>}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Posted {formatDate(role.opened)}</span>
        <span className={"text-xs font-bold "+(isHigh?"text-red-500":role.priority==="Medium"?"text-blue-500":"text-gray-400")}>
          {isHigh ? "Urgent" : role.priority === "Medium" ? "Priority" : "Standard"}
        </span>
      </div>
    </div>
  )
}
