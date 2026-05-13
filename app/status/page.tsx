/**
 * /status — Birdy operational status page
 * Auto-refreshes every 30s. Shows all subsystem health in real-time.
 * Accessible at: https://your-app.railway.app/status
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Suspense } from 'react'

async function getHealth() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res  = await fetch(`${base}/api/health`, { cache: 'no-store' })
    return res.json()
  } catch { return null }
}

async function getAdmin() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res  = await fetch(`${base}/api/birdy/admin`, { cache: 'no-store' })
    return res.json()
  } catch { return null }
}

function StatusBadge({ ok, label }: { ok: boolean | string; label: string }) {
  const isOk    = ok === true || ok === 'ok'
  const isWarn  = ok === 'degraded' || ok === 'offline' || ok === 'not_configured' || ok === 'pending'
  const color   = isOk ? '#4caf78' : isWarn ? '#e8c96b' : '#f87171'
  const icon    = isOk ? '✓' : isWarn ? '⚠' : '✗'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
      <span style={{ color, fontSize:14, width:16, flexShrink:0 }}>{icon}</span>
      <span style={{ fontFamily:'monospace', fontSize:13, color:'rgba(255,255,255,.75)', flex:1 }}>{label}</span>
      <span style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color, background:`${color}18`, border:`1px solid ${color}40`, borderRadius:4, padding:'2px 8px' }}>
        {typeof ok === 'string' ? ok : isOk ? 'OK' : 'ERROR'}
      </span>
    </div>
  )
}

async function StatusContent() {
  const [health, admin] = await Promise.all([getHealth(), getAdmin()])
  const ts = new Date().toISOString()

  const checks = health?.checks ?? {}
  const infra  = admin?.infrastructure ?? {}
  const perf   = admin?.performance?.last24h ?? {}
  const models = infra?.ollama?.models ?? []

  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'32px 20px', fontFamily:'system-ui,sans-serif', color:'#e2e8f0', background:'#0b1829', minHeight:'100vh' }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <span style={{ fontSize:24 }}>🐦</span>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#fff' }}>Birdy Status</h1>
            <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,.4)' }}>Production Alpha · {ts.slice(0,19).replace('T',' ')} UTC</p>
          </div>
          <div style={{ marginLeft:'auto', fontSize:11, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase',
            color: health?.status === 'ok' ? '#4caf78' : '#e8c96b',
            background: health?.status === 'ok' ? 'rgba(76,175,120,.15)' : 'rgba(232,201,107,.1)',
            border: `1px solid ${health?.status === 'ok' ? 'rgba(76,175,120,.35)' : 'rgba(232,201,107,.3)'}`,
            borderRadius:6, padding:'5px 12px'
          }}>
            {health?.status ?? 'UNKNOWN'}
          </div>
        </div>
      </div>

      <section style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
        <h2 style={{ margin:'0 0 12px', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.35)' }}>Core Infrastructure</h2>
        <StatusBadge ok={checks.database?.status ?? false} label="PostgreSQL database" />
        <StatusBadge ok={checks.pgvector?.status ?? false} label="pgvector (vector search)" />
        <StatusBadge ok={checks.claude?.configured ? 'ok' : 'error'} label="Anthropic Claude API" />
        <StatusBadge ok={infra.ollama?.connected ? 'ok' : 'not_configured'} label={`Ollama inference (${infra.ollama?.baseUrl ?? 'not configured'})`} />
      </section>

      {models.length > 0 && (
        <section style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
          <h2 style={{ margin:'0 0 12px', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.35)' }}>Ollama Models</h2>
          {models.map((m: { model: string; available: boolean }) => (
            <StatusBadge key={m.model} ok={m.available} label={m.model} />
          ))}
        </section>
      )}

      <section style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
        <h2 style={{ margin:'0 0 12px', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.35)' }}>Last 24 Hours</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { label:'Requests',    value: perf.requests ?? 0 },
            { label:'Tokens out',  value: perf.tokensOut ? `${(perf.tokensOut/1000).toFixed(1)}k` : '0' },
            { label:'Avg latency', value: perf.avgLatencyMs ? `${(perf.avgLatencyMs/1000).toFixed(1)}s` : '—' },
            { label:'RAG chunks',  value: perf.ragChunksUsed ?? 0 },
            { label:'P50',         value: perf.p50LatencyMs ? `${(perf.p50LatencyMs/1000).toFixed(1)}s` : '—' },
            { label:'P95',         value: perf.p95LatencyMs ? `${(perf.p95LatencyMs/1000).toFixed(1)}s` : '—' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,.04)', borderRadius:7, padding:'10px 12px', textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color:'#e8c96b', fontFamily:'monospace' }}>{String(s.value)}</div>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
        <h2 style={{ margin:'0 0 12px', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.35)' }}>API Endpoints</h2>
        {[
          { label:'GET /api/health',              desc:'Health check + pgvector init' },
          { label:'POST /api/birdy/chat',          desc:'Streaming SSE chat' },
          { label:'GET /api/birdy/conversations',  desc:'Conversation history' },
          { label:'POST /api/birdy/knowledge/ingest', desc:'Document ingestion' },
          { label:'GET /api/birdy/knowledge/search',  desc:'Semantic search' },
          { label:'POST /api/birdy/agents/run',    desc:'Execute workflow' },
          { label:'GET /api/birdy/admin',          desc:'System status' },
          { label:'GET /api/birdy/activity',       desc:'Usage logs' },
        ].map(e => (
          <div key={e.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
            <code style={{ fontSize:11, color:'#60a5fa', fontFamily:'monospace', minWidth:260 }}>{e.label}</code>
            <span style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>{e.desc}</span>
          </div>
        ))}
      </section>

      <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,.2)', marginTop:24 }}>
        Auto-refreshes every 30s ·{' '}
        <a href="/" style={{ color:'rgba(255,255,255,.35)' }}>← Back to TeamBase</a>
      </p>
    </div>
  )
}

export default function StatusPage() {
  return (
    <html lang="en">
      <head>
        <title>Birdy Status</title>
        <meta httpEquiv="refresh" content="30" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin:0, background:'#0b1829' }}>
        <Suspense fallback={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0b1829', color:'rgba(255,255,255,.4)', fontFamily:'system-ui' }}>
            Loading status...
          </div>
        }>
          <StatusContent />
        </Suspense>
      </body>
    </html>
  )
}
