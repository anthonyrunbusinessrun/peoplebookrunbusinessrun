'use client'
import { useState } from 'react'
import Link from 'next/link'
export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="bg-navy-900 border-b-2 border-crimson-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-crimson-500 flex items-center justify-center font-bold text-white text-sm">RL</div>
          <span className="text-white font-serif text-lg">Ray Land <span className="text-yellow-400">PeopleBook</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {['Operations','Maintenance','Compliance','Administration'].map(d => (
            <Link key={d} href={"/?dept="+d} className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">{d}</Link>
          ))}
          <Link href="/apply" className="bg-crimson-500 hover:bg-crimson-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">Apply Now</Link>
        </div>
        <button className="md:hidden text-white text-xl" onClick={() => setOpen(!open)}>&#9776;</button>
      </div>
      {open && (
        <div className="md:hidden bg-navy-900 px-4 pb-4 flex flex-col gap-3 border-t border-navy-800">
          <Link href="/" className="text-gray-400 text-sm pt-3">All Roles</Link>
          <Link href="/apply" className="bg-crimson-500 text-white text-sm font-bold px-4 py-2 rounded-lg text-center">Apply Now</Link>
        </div>
      )}
    </nav>
  )
}
