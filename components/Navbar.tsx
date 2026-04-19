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
          height: 68px;
          /* Full background is the red/white diagonal stripes */
          background: repeating-linear-gradient(
            -52deg,
            #b70000 0px,
            #b70000 30px,
            #ffffff 30px,
            #ffffff 46px,
            #b70000 46px
          );
          box-shadow: 0 3px 16px rgba(5,9,49,0.25);
          position: sticky;
          top: 0;
          z-index: 50;
          overflow: hidden;
        }

        /*
          The silver TRAPEZOID sits on top of the stripes.
          It covers ~75% of the width, with a sharp diagonal cut
          on the right edge — exactly like the rayland.com navbar.
          clip-path: trapezoid starting full-height on left,
          cutting diagonally to leave ~280px of stripes visible on right.
        */
        .rl-nav-silver {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          /* Wide enough to cover left portion */
          width: 100%;
          /* The diagonal right edge — polygon trapezoid */
          clip-path: polygon(0 0, calc(100% - 320px) 0, calc(100% - 200px) 100%, 0 100%);
          background: radial-gradient(circle at 0% 50%, #ffffff 0%, #dddddd 45%, #c0c0c0 100%);
          /* Subtle silver sheen overlay */
          background-image:
            radial-gradient(circle at 0% 50%, #ffffff 0%, #dddddd 45%, #c0c0c0 100%),
            url("https://cdn.prod.website-files.com/5faaa9649df67117865fd537/5fbeb64ffcfa11432f0d2bd1_Trial4.svg");
          background-blend-mode: normal;
        }

        .rl-nav-inner {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 28px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .rl-logo-wrap { display:flex; align-items:center; gap:11px; text-decoration:none; flex-shrink:0; }
        .rl-logo-name { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:19px; color:#1a2540; letter-spacing:0.05em; text-transform:uppercase; line-height:1.1; }
        .rl-logo-name span { color:#b70000; }
        .rl-logo-sub  { font-family:'Rajdhani',sans-serif; font-size:8px; font-weight:600; color:#8299c0; letter-spacing:0.26em; text-transform:uppercase; }

        /* Desktop links */
        .rl-nav-links { display:flex; align-items:center; gap:30px; }
        .rl-nav-a { font-family:'Rajdhani',sans-serif; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#3d4f6e; text-decoration:none; white-space:nowrap; transition:color 0.15s; }
        .rl-nav-a:hover { color:#b70000; }

        /* Right side — hamburger sits on the stripe */
        .rl-nav-right { display:flex; align-items:center; gap:16px; }
        .rl-hamburger { background:none; border:none; cursor:pointer; padding:6px; display:none; flex-direction:column; gap:5px; }
        .rl-hamburger span { display:block; width:22px; height:2.5px; background:#fff; border-radius:1px; transition:transform 0.2s, opacity 0.2s; }

        /* Mobile menu */
        .rl-mobile-menu {
          position: sticky; top: 68px; z-index: 49;
          background: #1a2540;
          border-top: 3px solid #b70000;
          padding: 16px 24px 20px;
          display: flex; flex-direction:column; gap:14px;
          box-shadow: 0 4px 16px rgba(5,9,49,0.3);
        }
        .rl-mobile-a { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:0.14em; color:rgba(255,255,255,0.8); text-decoration:none; }
        .rl-mobile-cta { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.18em; color:#fff; background:#b70000; padding:10px 20px; text-decoration:none; text-align:center; }

        @media (max-width: 768px) {
          .rl-nav-links { display: none; }
          .rl-hamburger { display: flex; }
          .rl-nav-silver {
            clip-path: polygon(0 0, calc(100% - 80px) 0, calc(100% - 40px) 100%, 0 100%);
          }
        }
      `}</style>

      <nav className="rl-navbar">
        {/* Silver trapezoid overlay */}
        <div className="rl-nav-silver" />

        {/* Content layer */}
        <div className="rl-nav-inner">
          {/* Logo */}
          <Link href="/" className="rl-logo-wrap">
            <Image
              src="/raylandlogo.png"
              alt="Ray Land Inc."
              width={38}
              height={38}
              style={{ objectFit:'contain', borderRadius:'50%' }}
            />
            <div>
              <div className="rl-logo-name">People<span>Book</span></div>
              <div className="rl-logo-sub">Ray Land Inc.</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="rl-nav-links">
            <a href="/" className="rl-nav-a">Roles</a>
            <a href="/apply" className="rl-nav-a">Apply</a>
            <a href="https://rayland.com" target="_blank" rel="noopener noreferrer" className="rl-nav-a">rayland.com</a>
          </div>

          {/* Right side — hamburger on stripe */}
          <div className="rl-nav-right">
            <button
              className="rl-hamburger"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <span style={{ transform: open ? 'rotate(45deg) translate(0px, 7px)' : 'none' }} />
              <span style={{ opacity: open ? 0 : 1 }} />
              <span style={{ transform: open ? 'rotate(-45deg) translate(0px, -7px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

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
