'use client'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { BirdyErrorBoundary } from './BirdyErrorBoundary'

const BirdyPanel = dynamic(() => import('./BirdyPanel'), { ssr: false, loading: () => null })

export default function BirdyButton() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); setOpen(prev => !prev) }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <style>{`
        @keyframes b-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(183,0,0,.4)} 50%{box-shadow:0 0 0 8px rgba(183,0,0,0)} }
        @keyframes b-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        .b-fab {
          position:fixed; bottom:28px; right:28px; z-index:9997;
          width:52px; height:52px; border-radius:14px;
          background:linear-gradient(135deg,#b70000,#7e0606); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 20px rgba(183,0,0,.45),0 2px 8px rgba(5,9,49,.5);
          transition:transform .18s,box-shadow .18s;
          animation:b-pulse 3s ease-in-out infinite;
        }
        .b-fab:hover { transform:scale(1.07) translateY(-2px); box-shadow:0 8px 28px rgba(183,0,0,.55),0 4px 12px rgba(5,9,49,.5); animation:none; }
        .b-fab:active { transform:scale(0.95); }
        .b-fab.open { animation:none; }
        .b-tooltip {
          position:fixed; bottom:36px; right:90px;
          background:#0a1628; color:rgba(255,255,255,.8);
          font-family:'Lato',sans-serif; font-size:12px; font-weight:700;
          letter-spacing:.08em; text-transform:uppercase;
          padding:6px 12px; border-radius:6px; border:1px solid rgba(183,0,0,.3);
          white-space:nowrap; pointer-events:none; opacity:0; transition:opacity .15s; z-index:9997;
        }
        .b-tooltip::after { content:''; position:absolute; right:-5px; top:50%; transform:translateY(-50%); border:5px solid transparent; border-left-color:rgba(183,0,0,.3); border-right-width:0; }
        .b-fab:hover + .b-tooltip { opacity:1; }
        @media (max-width:540px) { .b-fab { bottom:20px; right:20px; } .b-tooltip { display:none; } }
      `}</style>

      <button
        className={`b-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Close Birdy' : 'Open Birdy AI'}
        title="Birdy AI (⌘/)"
      >
        {open ? (
          <svg width="19" height="19" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 3l13 13M16 3L3 16" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.75">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      <div className="b-tooltip">Birdy AI · ⌘/</div>

      <BirdyErrorBoundary>
        <BirdyPanel open={open} onClose={close} />
      </BirdyErrorBoundary>
    </>
  )
}
