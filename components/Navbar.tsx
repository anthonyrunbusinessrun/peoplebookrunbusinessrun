'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <style>{`
        .rl-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'Rajdhani', sans-serif;
        }

        /* ── Top stripe band ── */
        .rl-nav-stripe {
          height: 10px;
          background:
            repeating-linear-gradient(
              -55deg,
              #b70000 0px,
              #b70000 28px,
              #ffffff 28px,
              #ffffff 44px,
              #b70000 44px
            );
        }

        /* ── Main nav bar ── */
        .rl-nav-bar {
          background: radial-gradient(circle at 0% 0%, #ffffff 9%, #d9d9d9 32%, #d9d9d9 68%, #aeaeae);
          border-bottom: 2px solid rgba(180,0,0,0.25);
        }
        .rl-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 58px;
        }

        /* Logo */
        .rl-logo-wrap { display:flex; align-items:center; gap:12px; text-decoration:none; }
        .rl-logo-name { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:20px; color:#212c42; letter-spacing:0.06em; text-transform:uppercase; line-height:1; }
        .rl-logo-name span { color:#b70000; }
        .rl-logo-sub  { font-family:'Rajdhani',sans-serif; font-size:8px; font-weight:600; color:#8299c0; letter-spacing:0.28em; text-transform:uppercase; margin-top:2px; }

        /* Desktop links */
        .rl-nav-links { display:flex; align-items:center; gap:28px; }
        .rl-nav-a { font-family:'Rajdhani',sans-serif; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#505e78; text-decoration:none; transition:color 0.15s; }
        .rl-nav-a:hover { color:#b70000; }

        /* CTA ghost button */
        .rl-nav-cta { font-family:'Rajdhani',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.18em; color:#b70000; border:1.5px solid #b70000; padding:6px 18px; text-decoration:none; background:transparent; transition:all 0.2s; white-space:nowrap; }
        .rl-nav-cta:hover { background:#b70000; color:#fff; }

        /* Hamburger */
        .rl-hamburger { background:none; border:none; cursor:pointer; padding:4px; display:none; }

        /* Mobile menu */
        .rl-mobile-menu {
          background: radial-gradient(circle at 0% 0%, #f0f0f0 0%, #d0d0d0 100%);
          border-top: 1px solid rgba(180,0,0,0.2);
          padding: 16px 28px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rl-mobile-a { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:0.14em; color:#505e78; text-decoration:none; }
        .rl-mobile-cta { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.18em; color:#fff; background:#b70000; padding:10px 20px; text-decoration:none; text-align:center; }

        @media (max-width: 768px) {
          .rl-nav-links { display: none; }
          .rl-hamburger { display: block; }
        }
      `}</style>

      <div className="rl-navbar">
        {/* Diagonal stripe band */}
        <div className="rl-nav-stripe" />

        {/* Main bar */}
        <div className="rl-nav-bar">
          <div className="rl-nav-inner">

            {/* Logo */}
            <Link href="/" className="rl-logo-wrap">
              <Image
                src="/raylandlogo.png"
                alt="Ray Land Inc."
                width={36}
                height={36}
                style={{ objectFit: 'contain', borderRadius: '50%' }}
              />
              <div>
                <div className="rl-logo-name">People<span>Book</span></div>
                <div className="rl-logo-sub">Ray Land Inc.</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="rl-nav-links">
              <a href="/" className="rl-nav-a">Roles</a>
              <a href="/apply" className="rl-nav-a">Apply</a>
              <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-nav-a">rayland.com</a>
              <Link href="/apply" className="rl-nav-cta">Apply Now</Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="rl-hamburger"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <div style={{ width:22, height:2, background:'#212c42', marginBottom:5, transition:'transform 0.2s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
              <div style={{ width:22, height:2, background:'#212c42', marginBottom:5, opacity: open ? 0 : 1 }} />
              <div style={{ width:22, height:2, background:'#212c42', transition:'transform 0.2s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="rl-mobile-menu">
            <a href="/" className="rl-mobile-a" onClick={() => setOpen(false)}>Roles</a>
            <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-mobile-a">rayland.com</a>
            <Link href="/apply" className="rl-mobile-cta" onClick={() => setOpen(false)}>Apply Now</Link>
          </div>
        )}
      </div>
    </>
  )
}
