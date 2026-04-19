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
          background: radial-gradient(circle at 0% 0%, #ffffff 9%, #d9d9d9 32%, #d9d9d9 68%, #aeaeae 100%);
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        .rl-nav-logo {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 28px;
        }
        .rl-nav-end {
          position: relative;
          flex-shrink: 0;
          width: 240px;
          height: 72px;
        }
        .rl-hamburger-btn {
          position: absolute;
          top: 0; right: 0;
          width: 58px; height: 72px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          padding: 0;
          z-index: 2;
        }
        .rl-ham-line { display:block; width:22px; height:2.5px; background:#fff; transition:all 0.2s; border-radius:1px; }
        .rl-dropdown {
          background: #1a2540;
          border-top: 3px solid #b70000;
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px rgba(5,9,49,0.35);
        }
        .rl-dropdown-link {
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          padding: 16px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: block;
          transition: color 0.15s;
        }
        .rl-dropdown-link:last-child { border-bottom: none; }
        .rl-dropdown-link:hover { color: #e8c96b; }
      `}</style>

      <div className="rl-nav-wrap">
        <div className="rl-nav-bar">

          {/* Ray Land script logo — small, on grey gradient */}
          <div className="rl-nav-logo">
            <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center' }}>
              <Image
                src="/rayland-logo.png"
                alt="Ray Land Inc."
                width={100}
                height={36}
                style={{ objectFit:'contain', objectPosition:'left center' }}
              />
            </Link>
          </div>

          {/* Stripe + hamburger */}
          <div className="rl-nav-end">
            <Image
              src="/nav-stripes.png"
              alt=""
              fill
              style={{ objectFit:'cover', objectPosition:'left center' }}
            />
            <button className="rl-hamburger-btn" onClick={() => setOpen(!open)} aria-label="Menu">
              <span className="rl-ham-line" style={{ transform: open ? 'rotate(45deg) translate(0,8px)' : 'none' }} />
              <span className="rl-ham-line" style={{ opacity: open ? 0 : 1 }} />
              <span className="rl-ham-line" style={{ transform: open ? 'rotate(-45deg) translate(0,-8px)' : 'none' }} />
            </button>
          </div>
        </div>

        {open && (
          <div className="rl-dropdown">
            <a href="/" className="rl-dropdown-link" onClick={() => setOpen(false)}>Roles</a>
            <a href="/apply" className="rl-dropdown-link" onClick={() => setOpen(false)}>Apply</a>
            <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-dropdown-link">rayland.com</a>
          </div>
        )}
      </div>
    </>
  )
}
