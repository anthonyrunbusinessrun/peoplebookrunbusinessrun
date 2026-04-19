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
          height: 72px;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(5,9,49,0.18);
        }

        /* LEFT SILVER SECTION — logo + links */
        .rl-nav-left {
          flex: 1;
          background: radial-gradient(circle at 0% 50%, #ffffff 0%, #e0e0e0 40%, #c8c8c8 100%);
          display: flex;
          align-items: center;
          padding: 0 28px;
          gap: 32px;
          position: relative;
          z-index: 2;
        }

        /* Angled right edge of silver section */
        .rl-nav-left::after {
          content: '';
          position: absolute;
          right: -30px;
          top: 0;
          width: 60px;
          height: 100%;
          background: radial-gradient(circle at 0% 50%, #ffffff 0%, #e0e0e0 40%, #c8c8c8 100%);
          clip-path: polygon(0 0, 40% 0, 100% 100%, 0 100%);
          z-index: 3;
        }

        /* RIGHT STRIPE SECTION */
        .rl-nav-right {
          width: 340px;
          flex-shrink: 0;
          background: repeating-linear-gradient(
            -52deg,
            #b70000 0px,
            #b70000 32px,
            #ffffff 32px,
            #ffffff 50px,
            #b70000 50px
          );
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 20px;
          position: relative;
        }

        /* Logo */
        .rl-logo-wrap { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
        .rl-logo-name { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:19px; color:#1a2540; letter-spacing:0.05em; text-transform:uppercase; line-height:1.1; }
        .rl-logo-name span { color:#b70000; }
        .rl-logo-sub  { font-family:'Rajdhani',sans-serif; font-size:8px; font-weight:600; color:#7a8fb0; letter-spacing:0.28em; text-transform:uppercase; }

        /* Nav links */
        .rl-nav-a { font-family:'Rajdhani',sans-serif; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#505e78; text-decoration:none; white-space:nowrap; transition:color 0.15s; }
        .rl-nav-a:hover { color:#b70000; }

        /* CTA in stripe section */
        .rl-nav-cta {
          font-family:'Rajdhani',sans-serif; font-size:11px; font-weight:700;
          text-transform:uppercase; letter-spacing:0.16em;
          color:#fff; border:2px solid rgba(255,255,255,0.9);
          padding:7px 18px; text-decoration:none; background:rgba(0,0,0,0.25);
          transition:all 0.2s; white-space:nowrap; position:relative; z-index:2;
        }
        .rl-nav-cta:hover { background:rgba(255,255,255,0.2); border-color:#fff; }

        /* Hamburger (mobile) */
        .rl-hamburger {
          display: none; background:none; border:none; cursor:pointer;
          padding:4px; position:relative; z-index:2;
        }
        .rl-hamburger span {
          display:block; width:22px; height:2px; background:#fff;
          margin-bottom:5px; transition:transform 0.2s, opacity 0.2s;
        }

        /* Mobile menu */
        .rl-mobile-menu {
          background: #1a2540;
          border-top: 3px solid #b70000;
          padding: 16px 24px 20px;
          display: flex; flex-direction:column; gap:14px;
        }
        .rl-mobile-a { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:0.14em; color:rgba(255,255,255,0.8); text-decoration:none; }
        .rl-mobile-cta { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.18em; color:#fff; background:#b70000; padding:10px 20px; text-decoration:none; text-align:center; }

        @media (max-width: 768px) {
          .rl-nav-links-desktop { display: none !important; }
          .rl-nav-right { width: 80px; }
          .rl-nav-cta-desktop { display: none; }
          .rl-hamburger { display: block; }
        }
      `}</style>

      {/* NAVBAR */}
      <div className="rl-navbar">

        {/* LEFT: Silver section with logo + links */}
        <div className="rl-nav-left">
          <Link href="/" className="rl-logo-wrap">
            <Image
              src="/raylandlogo.png"
              alt="Ray Land Inc."
              width={40}
              height={40}
              style={{ objectFit: 'contain', borderRadius: '50%', flexShrink: 0 }}
            />
            <div>
              <div className="rl-logo-name">People<span>Book</span></div>
              <div className="rl-logo-sub">Ray Land Inc.</div>
            </div>
          </Link>

          <div className="rl-nav-links-desktop" style={{ display:'flex', alignItems:'center', gap:28 }}>
            <a href="/" className="rl-nav-a">Roles</a>
            <a href="/apply" className="rl-nav-a">Apply</a>
            <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-nav-a">rayland.com</a>
          </div>
        </div>

        {/* RIGHT: Diagonal stripe section with CTA + hamburger */}
        <div className="rl-nav-right">
          <Link href="/apply" className="rl-nav-cta rl-nav-cta-desktop">Apply Now</Link>
          <button
            className="rl-hamburger"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span style={{ transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ opacity: open ? 0 : 1 }} />
            <span style={{ transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="rl-mobile-menu" style={{ position:'sticky', top:72, zIndex:49 }}>
          <a href="/" className="rl-mobile-a" onClick={() => setOpen(false)}>Roles</a>
          <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-mobile-a">rayland.com</a>
          <Link href="/apply" className="rl-mobile-cta" onClick={() => setOpen(false)}>Apply Now</Link>
        </div>
      )}
    </>
  )
}
