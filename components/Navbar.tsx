'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');
        .rl-nav-wrap { position:sticky; top:0; z-index:50; }
        .rl-nav-bar {
          height: 72px;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          background: radial-gradient(circle at 0% 0%, #ffffff 9%, #d9d9d9 32%, #d9d9d9 68%, #aeaeae 100%);
        }
        .rl-nav-logo {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 28px;
        }
        .rl-logo { display:flex; align-items:center; gap:12px; text-decoration:none; }
        .rl-logo-name { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:20px; color:#1a2540; letter-spacing:0.05em; text-transform:uppercase; line-height:1.1; }
        .rl-logo-name span { color:#b70000; }
        .rl-logo-sub { font-family:'Rajdhani',sans-serif; font-size:8px; font-weight:600; color:#8299c0; letter-spacing:0.26em; text-transform:uppercase; }
        .rl-nav-right {
          display: flex;
          align-items: stretch;
          flex-shrink: 0;
        }
        .rl-stripe-block {
          width: 220px;
          height: 72px;
          background-image: url('/nav-stripes.png');
          background-size: cover;
          background-position: left center;
          flex-shrink: 0;
        }
        .rl-hamburger-btn {
          width: 58px;
          background: #111;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          flex-shrink: 0;
          padding: 0;
        }
        .rl-ham-line { display:block; width:22px; height:2px; background:#fff; transition:all 0.2s; border-radius:1px; }
        .rl-dropdown {
          background: #1a2540;
          border-top: 3px solid #b70000;
          padding: 20px 28px 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px rgba(5,9,49,0.3);
        }
        .rl-dropdown-link {
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: color 0.15s;
        }
        .rl-dropdown-link:hover { color:#e8c96b; }
        .rl-dropdown-cta {
          margin-top: 16px;
          font-family: 'Rajdhani',sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #fff;
          background: #b70000;
          padding: 12px 24px;
          text-decoration: none;
          text-align: center;
          display: block;
        }
        .rl-dropdown-cta:hover { background:#991020; }
      `}</style>

      <div className="rl-nav-wrap">
        <div className="rl-nav-bar">

          {/* Logo only on left */}
          <div className="rl-nav-logo">
            <Link href="/" className="rl-logo">
              <Image src="/raylandlogo.png" alt="Ray Land Inc." width={40} height={40}
                style={{ objectFit:'contain', borderRadius:'50%' }} />
              <div>
                <div className="rl-logo-name">People<span>Book</span></div>
                <div className="rl-logo-sub">Ray Land Inc.</div>
              </div>
            </Link>
          </div>

          {/* Right end: stripe image + hamburger */}
          <div className="rl-nav-right">
            <div className="rl-stripe-block" />
            <button className="rl-hamburger-btn" onClick={() => setOpen(!open)} aria-label="Menu">
              <span className="rl-ham-line" style={{ transform: open ? 'rotate(45deg) translate(0,7px)' : 'none' }} />
              <span className="rl-ham-line" style={{ opacity: open ? 0 : 1 }} />
              <span className="rl-ham-line" style={{ transform: open ? 'rotate(-45deg) translate(0,-7px)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Dropdown menu */}
        {open && (
          <div className="rl-dropdown">
            <a href="/" className="rl-dropdown-link" onClick={() => setOpen(false)}>Roles</a>
            <a href="/apply" className="rl-dropdown-link" onClick={() => setOpen(false)}>Apply</a>
            <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-dropdown-link">rayland.com</a>
            <Link href="/apply" className="rl-dropdown-cta" onClick={() => setOpen(false)}>Apply Now →</Link>
          </div>
        )}
      </div>
    </>
  )
}
