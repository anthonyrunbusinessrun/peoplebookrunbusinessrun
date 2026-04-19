'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      background: '#dddddd',
      borderBottom: scrolled ? '2px solid #c0152a' : '2px solid transparent',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'border-color 0.3s',
      fontFamily: "'Lato', sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Image src="/raylandlogo.png" alt="Ray Land Inc." width={38} height={38} style={{ objectFit: 'contain', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#212c42', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              People<span style={{ color: '#c0152a' }}>Book</span>
            </span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 9, fontWeight: 600, color: '#8299c0', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              Ray Land Inc.
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
          {[
            { href: '/', label: 'Roles' },
            { href: '/apply', label: 'Apply' },
            { href: 'https://rayland.com', label: 'rayland.com', external: true },
          ].map(({ href, label, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#505e78',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c0152a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#505e78')}
            >
              {label}
            </a>
          ))}
          <Link href="/apply" style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#c0152a',
            border: '1px solid #c0152a',
            padding: '7px 20px',
            borderRadius: 0,
            textDecoration: 'none',
            transition: 'all 0.2s',
            background: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#c0152a'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c0152a' }}
          >
            Apply Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          className="md:hidden"
          aria-label="Menu"
        >
          <div style={{ width: 22, height: 2, background: '#212c42', marginBottom: 5, transition: 'transform 0.2s', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <div style={{ width: 22, height: 2, background: '#212c42', marginBottom: 5, opacity: open ? 0 : 1 }} />
          <div style={{ width: 22, height: 2, background: '#212c42', transition: 'transform 0.2s', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#dddddd', borderTop: '1px solid #c5c4c0', padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/" onClick={() => setOpen(false)} style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#505e78', textDecoration: 'none' }}>Roles</Link>
          <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#505e78', textDecoration: 'none' }}>rayland.com</a>
          <Link href="/apply" onClick={() => setOpen(false)} style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#fff', background: '#c0152a', padding: '10px 20px', textDecoration: 'none', textAlign: 'center' }}>Apply Now</Link>
        </div>
      )}
    </nav>
  )
}
