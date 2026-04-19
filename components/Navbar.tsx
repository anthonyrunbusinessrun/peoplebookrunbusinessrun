'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{ background: '#dddddd', borderBottom: scrolled ? '2px solid #c0152a' : '2px solid transparent', position: 'sticky', top: 0, zIndex: 50, transition: 'border-color 0.3s' }}>
      <style>{`
        .rl-nav-link { font-family:'Rajdhani',sans-serif; font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.12em; color:#505e78; text-decoration:none; transition:color 0.15s; }
        .rl-nav-link:hover { color:#c0152a; }
        .rl-nav-cta { font-family:'Rajdhani',sans-serif; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.15em; color:#c0152a; border:1px solid #c0152a; padding:7px 20px; text-decoration:none; transition:all 0.2s; background:transparent; border-radius:0; }
        .rl-nav-cta:hover { background:#c0152a; color:#fff; }
        .rl-mobile-link { font-family:'Rajdhani',sans-serif; font-weight:600; font-size:14px; text-transform:uppercase; letter-spacing:0.12em; color:#505e78; text-decoration:none; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Image src="/raylandlogo.png" alt="Ray Land Inc." width={38} height={38} style={{ objectFit: 'contain', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 20, color: '#212c42', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              People<span style={{ color: '#c0152a' }}>Book</span>
            </span>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, fontWeight: 600, color: '#8299c0', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              Ray Land Inc.
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
          <a href="/" className="rl-nav-link">Roles</a>
          <a href="/apply" className="rl-nav-link">Apply</a>
          <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-nav-link">rayland.com</a>
          <Link href="/apply" className="rl-nav-cta">Apply Now</Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="md:hidden" aria-label="Menu">
          <div style={{ width: 22, height: 2, background: '#212c42', marginBottom: 5, transition: 'transform 0.2s', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <div style={{ width: 22, height: 2, background: '#212c42', marginBottom: 5, opacity: open ? 0 : 1 }} />
          <div style={{ width: 22, height: 2, background: '#212c42', transition: 'transform 0.2s', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#dddddd', borderTop: '1px solid #c5c4c0', padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <a href="/" onClick={() => setOpen(false)} className="rl-mobile-link">Roles</a>
          <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-mobile-link">rayland.com</a>
          <Link href="/apply" onClick={() => setOpen(false)} style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#fff', background: '#c0152a', padding: '10px 20px', textDecoration: 'none', textAlign: 'center' }}>Apply Now</Link>
        </div>
      )}
    </nav>
  )
}
