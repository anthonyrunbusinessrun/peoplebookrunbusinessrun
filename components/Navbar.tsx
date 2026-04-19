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

        .rl-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: stretch;
          height: 80px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        /* Dark red left strip — exact rayland.com sidebar adapted as nav left */
        .rl-nav-red {
          width: 56px;
          flex-shrink: 0;
          background: linear-gradient(172deg, #7e0606, #b70000 32%, #810000 69%, #830000);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Main silver/white section */
        .rl-nav-main {
          flex: 1;
          background: radial-gradient(circle at 0% 0%, #ffffff 9%, #e8e8e8 32%, #e0e0e0 68%, #c8c8c8 100%);
          display: flex;
          align-items: center;
          padding: 0 32px;
          gap: 36px;
          position: relative;
          overflow: hidden;
        }

        /* The diagonal silver overlay in top-right — matching rayland.com */
        .rl-nav-main::after {
          content: '';
          position: absolute;
          top: -10px;
          right: -20px;
          width: 280px;
          height: 120px;
          background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(200,200,200,0.5) 40%, rgba(180,180,180,0.8) 60%, rgba(160,160,160,0.4) 100%);
          transform: skewX(-20deg);
          pointer-events: none;
        }

        /* Logo */
        .rl-logo { display:flex; align-items:center; gap:12px; text-decoration:none; flex-shrink:0; }
        .rl-logo-name { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:20px; color:#1a2540; letter-spacing:0.05em; text-transform:uppercase; line-height:1.1; }
        .rl-logo-name span { color:#b70000; }
        .rl-logo-sub { font-family:'Rajdhani',sans-serif; font-size:8px; font-weight:600; color:#8299c0; letter-spacing:0.26em; text-transform:uppercase; }

        /* Nav links */
        .rl-nav-links { display:flex; align-items:center; gap:32px; }
        .rl-nav-a { font-family:'Lato',sans-serif; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#505e78; text-decoration:none; transition:color 0.15s; }
        .rl-nav-a:hover { color:#b70000; }

        /* Apply CTA */
        .rl-nav-cta { font-family:'Rajdhani',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.18em; color:#b70000; border:1.5px solid #b70000; padding:7px 20px; text-decoration:none; background:transparent; transition:all 0.2s; white-space:nowrap; border-radius:0; }
        .rl-nav-cta:hover { background:#b70000; color:#fff; }

        /* Hamburger lines */
        .rl-ham-line { display:block; width:20px; height:2px; background:#fff; margin:4px 0; transition:all 0.2s; border-radius:1px; }

        /* Mobile menu */
        .rl-mobile-menu { background:#1a2540; border-top:3px solid #b70000; padding:16px 24px 20px; display:flex; flex-direction:column; gap:14px; position:sticky; top:80px; z-index:49; }
        .rl-mobile-a { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:0.14em; color:rgba(255,255,255,0.8); text-decoration:none; }
        .rl-mobile-cta { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.18em; color:#fff; background:#b70000; padding:10px 20px; text-decoration:none; text-align:center; }

        @media (max-width: 768px) {
          .rl-nav-links { display:none; }
          .rl-nav-cta { display:none; }
        }
        @media (min-width: 769px) {
          .rl-ham-btn { display:none; }
        }
      `}</style>

      <div className="rl-navbar">
        {/* Red left strip with hamburger */}
        <div className="rl-nav-red" onClick={() => setOpen(!open)}>
          <div>
            <span className="rl-ham-line" style={{ transform: open ? 'rotate(45deg) translate(0,6px)' : 'none' }} />
            <span className="rl-ham-line" style={{ opacity: open ? 0 : 1 }} />
            <span className="rl-ham-line" style={{ transform: open ? 'rotate(-45deg) translate(0,-6px)' : 'none' }} />
          </div>
        </div>

        {/* Silver main bar */}
        <div className="rl-nav-main">
          <Link href="/" className="rl-logo">
            <Image src="/raylandlogo.png" alt="Ray Land Inc." width={42} height={42} style={{ objectFit:'contain', borderRadius:'50%' }} />
            <div>
              <div className="rl-logo-name">People<span>Book</span></div>
              <div className="rl-logo-sub">Ray Land Inc.</div>
            </div>
          </Link>

          <div className="rl-nav-links">
            <a href="/" className="rl-nav-a">Roles</a>
            <a href="/apply" className="rl-nav-a">Apply</a>
            <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-nav-a">rayland.com</a>
          </div>

          <div style={{ marginLeft:'auto' }}>
            <Link href="/apply" className="rl-nav-cta">Apply Now</Link>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="rl-mobile-menu">
          <a href="/" className="rl-mobile-a" onClick={() => setOpen(false)}>Roles</a>
          <a href="/apply" className="rl-mobile-a" onClick={() => setOpen(false)}>Apply</a>
          <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-mobile-a">rayland.com</a>
          <Link href="/apply" className="rl-mobile-cta" onClick={() => setOpen(false)}>Apply Now</Link>
        </div>
      )}
    </>
  )
}
