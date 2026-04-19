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

        .rl-nav-wrap {
          position: sticky;
          top: 0;
          z-index: 50;
        }

        /* ── The navbar bar itself ── */
        .rl-nav-bar {
          height: 72px;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }

        /* ── LEFT: silver radial section ── */
        .rl-nav-silver {
          flex: 1;
          background: radial-gradient(circle at 0% 0%, #ffffff 9%, #d9d9d9 32%, #d9d9d9 68%, #aeaeae 100%);
          display: flex;
          align-items: center;
          padding: 0 28px;
        }

        /* ── RIGHT: the 3 diagonal red trapezoids + hamburger ── */
        .rl-nav-stripes {
          display: flex;
          align-items: stretch;
          flex-shrink: 0;
        }

        /*
          Each trapezoid is a div with a skewed background.
          We use 3 parallelogram shapes: red, white-gap, red, white-gap, red
          achieved with a single repeating stripe block clipped to a parallelogram via skewX.
        */
        .rl-trapezoid {
          width: 72px;
          position: relative;
          overflow: hidden;
          /* skew makes it a parallelogram/trapezoid */
          transform: skewX(-18deg);
          margin-left: -12px; /* overlap slightly so no gap */
        }
        .rl-trapezoid:first-child { margin-left: 0; }

        .rl-trap-1 { background: #b70000; }
        .rl-trap-2 { background: #fff; width: 28px; }
        .rl-trap-3 { background: #b70000; }
        .rl-trap-4 { background: #fff; width: 28px; }
        .rl-trap-5 { background: #b70000; }

        /* ── Hamburger button — sits after the stripes, dark bg ── */
        .rl-hamburger-btn {
          width: 64px;
          background: #1a1a1a;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          padding: 0;
          flex-shrink: 0;
        }
        .rl-ham-line {
          display: block;
          width: 22px;
          height: 2px;
          background: #fff;
          transition: all 0.2s;
          border-radius: 1px;
        }

        /* Logo */
        .rl-logo { display:flex; align-items:center; gap:12px; text-decoration:none; }
        .rl-logo-name { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:20px; color:#1a2540; letter-spacing:0.05em; text-transform:uppercase; line-height:1.1; }
        .rl-logo-name span { color:#b70000; }
        .rl-logo-sub { font-family:'Rajdhani',sans-serif; font-size:8px; font-weight:600; color:#8299c0; letter-spacing:0.26em; text-transform:uppercase; }

        /* ── Dropdown menu ── */
        .rl-dropdown {
          background: #1a2540;
          border-top: 3px solid #b70000;
          padding: 20px 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 0;
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
        .rl-dropdown-link:hover { color: #e8c96b; }
        .rl-dropdown-link:last-child { border-bottom: none; }
        .rl-dropdown-cta {
          margin-top: 16px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #fff;
          background: #b70000;
          padding: 12px 24px;
          text-decoration: none;
          text-align: center;
          transition: background 0.2s;
        }
        .rl-dropdown-cta:hover { background: #991020; }
      `}</style>

      <div className="rl-nav-wrap">
        {/* NAV BAR */}
        <div className="rl-nav-bar">

          {/* Silver left — logo only */}
          <div className="rl-nav-silver">
            <Link href="/" className="rl-logo">
              <Image
                src="/raylandlogo.png"
                alt="Ray Land Inc."
                width={40}
                height={40}
                style={{ objectFit: 'contain', borderRadius: '50%' }}
              />
              <div>
                <div className="rl-logo-name">People<span>Book</span></div>
                <div className="rl-logo-sub">Ray Land Inc.</div>
              </div>
            </Link>
          </div>

          {/* 3 red trapezoids + hamburger */}
          <div className="rl-nav-stripes">
            <div className="rl-trapezoid rl-trap-1" />
            <div className="rl-trapezoid rl-trap-2" />
            <div className="rl-trapezoid rl-trap-3" />
            <div className="rl-trapezoid rl-trap-4" />
            <div className="rl-trapezoid rl-trap-5" />
          </div>

          <button
            className="rl-hamburger-btn"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span className="rl-ham-line" style={{ transform: open ? 'rotate(45deg) translate(0,7px)' : 'none' }} />
            <span className="rl-ham-line" style={{ opacity: open ? 0 : 1 }} />
            <span className="rl-ham-line" style={{ transform: open ? 'rotate(-45deg) translate(0,-7px)' : 'none' }} />
          </button>
        </div>

        {/* Dropdown */}
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
