'use client'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
export default function JobModal({ role, onClose }: { role: any, onClose: () => void }) {
  const router = useRouter()
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto shadow-2xl">
        <div className="bg-navy-900 border-b-2 border-crimson-500 p-7 rounded-t-2xl relative">
          <p className="text-red-400 text-xs uppercase tracking-widest mb-1">{role.department}</p>
          <h2 className="text-white font-serif text-2xl">{role.title}</h2>
          <button onClick={onClose}
            className="absolute top-5 right-5 text-white w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            ✕
          </button>
        </div>
        <div className="p-7 space-y-5">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-yellow-600 mb-2">About This Role</h3>
            <p className="text-gray-600 leading-relaxed">{role.notes}</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-yellow-600 mb-3">Details</h3>
            <div className="flex flex-wrap gap-2">
              {[role.status, role.type, role.priority+' Priority', 'Posted '+formatDate(role.opened)].map(t => (
                <span key={t} className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
          {role.shift && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-yellow-600 mb-2">Schedule</h3>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full">{role.shift}</span>
                {role.hours && <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full">{role.hours}</span>}
              </div>
            </div>
          )}
          {role.status === 'Open'
            ? <button
                onClick={() => { onClose(); router.push('/apply?role=' + encodeURIComponent(role.title)) }}
                className="w-full bg-crimson-500 hover:bg-crimson-600 text-white font-bold py-3.5 rounded-xl transition-colors">
                Apply for This Role →
              </button>
            : <div className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl text-center">
                {role.status === 'Filled' ? 'Role Has Been Filled' : 'Currently On Hold'}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
