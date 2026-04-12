import Link from 'next/link'
export default function Hero({ roles }: { roles: any[] }) {
  const open   = roles.filter(r => r.status === 'Open').length
  const depts  = new Set(roles.map(r => r.department)).size
  const urgent = roles.filter(r => r.status === 'Open' && r.priority === 'High').length
  return (
    <section className="bg-navy-900 py-20 px-4 text-center relative overflow-hidden">
        <span className="inline-block border border-red-800 text-red-400 text-xs tracking-widest uppercase px-4 py-1 rounded-full mb-6">
          Now Hiring — Ray Land Inc.
        </span>
        <h1 className="text-5xl font-serif text-white mb-4 leading-tight">
          Join the Team.<br/>Stable engineering // Design Innovation //  Perpetual service
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          At Ray Land, Inc we are passionate about excellent service & consistently exceeding our customer’s expectations. With our goal in heart, we are challenged with performing better today than we did yesterday, meeting our demanding schedule requirements on time, to provide our clients with satisfaction they deserve. We blend technology, equipment and people in impassioned efficiency & organization. 
        </p>
        <div className="flex justify-center gap-12 mb-10">
          {[{n:open,l:'Open Roles'},{n:depts,l:'Departments'},{n:urgent,l:'Urgent Hires'}].map(s => (
            <div key={s.l}>
              <div className="text-4xl font-serif text-yellow-400">{s.n}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/apply" className="btn-primary">Apply Now</Link>
          <a href="#roles" className="btn-secondary">View Openings</a>
        </div>
      </div>
    </section>
  )
}
