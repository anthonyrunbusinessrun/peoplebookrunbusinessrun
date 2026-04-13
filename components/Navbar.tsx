'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="bg-navy-900 border-b-2 border-crimson-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/raylandlogo.png" alt="Ray Land Inc." width={40} height={40} className="rounded-full object-contain" />
          <span className="text-white font-serif text-lg"><span className="text-yellow-400">PeopleBook</span></span>
        </Link>
        {open && (
          <div className="md:hidden bg-navy-900 px-4 pb-4 flex flex-col gap-3 border-t border-navy-800">
            <Link href="/" className="text-gray-300 text-sm pt-3">All Roles</Link>
            <Link href="/apply" className="bg-crimson-500 text-white text-sm font-bold px-4 py-2 rounded-lg text-center">Apply Now</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
