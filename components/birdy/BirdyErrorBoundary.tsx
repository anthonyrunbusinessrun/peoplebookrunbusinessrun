'use client'
import React from 'react'

interface State { hasError: boolean; error: string }

export class BirdyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }
  componentDidCatch(error: Error) {
    console.error('[BirdyErrorBoundary]', error)
  }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: '#0b1829', borderLeft: '1px solid rgba(183,0,0,.3)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>🐦</div>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 8 }}>
          Birdy encountered an error
        </div>
        <div style={{ fontFamily: 'Lato,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, marginBottom: 20 }}>
          {this.state.error}
        </div>
        <button
          onClick={() => this.setState({ hasError: false, error: '' })}
          style={{ background: 'linear-gradient(135deg,#b70000,#7e0606)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'Lato,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '9px 20px' }}
        >
          Retry
        </button>
      </div>
    )
  }
}
