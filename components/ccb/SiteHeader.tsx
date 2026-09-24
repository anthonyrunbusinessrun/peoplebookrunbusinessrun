'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navigation } from '@/lib/site-data'

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link href="/" className="brand" aria-label="Citrus County Blessings home">
          <Image src="/ccb/logo.webp" width={170} height={65} alt="Citrus County Blessings" priority />
        </Link>
        <button className="mobile-nav-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
        <nav className={open ? 'nav-links nav-open' : 'nav-links'} aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <a className="button button-small" href="https://secure.qgiv.com/for/citruscountyblessings/" target="_blank" rel="noreferrer">Donate</a>
        </nav>
      </div>
    </header>
  )
}

