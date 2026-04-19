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
          /* The stripe image sits at the far right — the rest is silver */
          background: radial-gradient(circle at 0% 0%, #ffffff 9%, #d9d9d9 32%, #d9d9d9 68%, #aeaeae 100%);
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          overflow: hidden;
          position: relative;
        }

        /* Logo area */
        .rl-nav-logo {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 28px;
        }

        /* Stripe image — NO separate container, just the image stretched to full height */
        /* The hamburger is absolutely positioned over the stripe */
        .rl-nav-end {
          position: relative;
          flex-shrink: 0;
          width: 258px; /* stripe width + hamburger zone */
          height: 72px;
        }

        .rl-stripe-img {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: left center;
          display: block;
        }

        /* Hamburger — floats over the stripe, no background at all */
        .rl-hamburger-btn {
          position: absolute;
          top: 0; right: 0;
          width: 60px; height: 72px;
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
        .rl-ham-line {
          display: block; width: 22px; height: 2.5px;
          background: #fff;
          transition: all 0.2s;
          border-radius: 1px;
        }

        /* Dropdown */
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

          {/* Ray Land script logo */}
          <div className="rl-nav-logo">
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image
                src="/rayland-logo.png"
                alt="Ray Land Inc."
                width={140}
                height={48}
                style={{ objectFit: 'contain', objectPosition: 'left center' }}
              />
            </Link>
          </div>

          {/* Stripe image + hamburger overlaid — no black anywhere */}
          <div className="rl-nav-end">
            <Image
              src="/nav-stripes.png"
              alt=""
              fill
              style={{ objectFit: 'cover', objectPosition: 'left center' }}
            />
            <button
              className="rl-hamburger-btn"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <span className="rl-ham-line" style={{ transform: open ? 'rotate(45deg) translate(0,8px)' : 'none' }} />
              <span className="rl-ham-line" style={{ opacity: open ? 0 : 1 }} />
              <span className="rl-ham-line" style={{ transform: open ? 'rotate(-45deg) translate(0,-8px)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Dropdown */}
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
