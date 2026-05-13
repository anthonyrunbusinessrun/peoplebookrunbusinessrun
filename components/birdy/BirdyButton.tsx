'use client'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Lazy-load the panel — only loads JS when user opens it
const BirdyPanel = dynamic(() => import('./BirdyPanel'), {
  ssr: false,
  loading: () => null,
})

export default function BirdyButton() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  // Keyboard shortcut: ⌘/ or Ctrl+/
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Lock body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <style>{`
        @keyframes birdy-btn-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(183,0,0,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(183,0,0,0); }
        }
        .birdy-fab {
          position: fixed;
          bottom: 28px; right: 28px;
          z-index: 9997;
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #b70000, #7e0606);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(183,0,0,0.45), 0 2px 8px rgba(5,9,49,0.5);
          transition: transform 0.18s, box-shadow 0.18s;
          animation: birdy-btn-pulse 3s ease-in-out infinite;
        }
        .birdy-fab:hover {
          transform: scale(1.06) translateY(-1px);
          box-shadow: 0 8px 28px rgba(183,0,0,0.55), 0 4px 12px rgba(5,9,49,0.5);
          animation: none;
        }
        .birdy-fab:active { transform: scale(0.96); }
        .birdy-fab-tooltip {
          position: fixed;
          bottom: 36px; right: 90px;
          background: #0a1628;
          color: rgba(255,255,255,0.8);
          font-family: 'Lato', sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid rgba(183,0,0,0.3);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0; transition: opacity 0.15s;
          z-index: 9997;
        }
        .birdy-fab-tooltip::after {
          content: '';
          position: absolute; right: -5px; top: 50%; transform: translateY(-50%);
          border: 5px solid transparent;
          border-left-color: rgba(183,0,0,0.3);
          border-right-width: 0;
        }
        .birdy-fab:hover + .birdy-fab-tooltip { opacity: 1; }
        @media (max-width: 480px) {
          .birdy-fab { bottom: 20px; right: 20px; }
          .birdy-fab-tooltip { display: none; }
        }
      `}</style>

      <button
        className="birdy-fab"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Open Birdy AI Assistant"
        title="Birdy AI (⌘/)"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 3l14 14M17 3L3 17" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      <div className="birdy-fab-tooltip">Birdy AI · ⌘/</div>

      <BirdyPanel open={open} onClose={close} />
    </>
  )
}
