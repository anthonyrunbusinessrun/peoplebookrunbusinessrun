'use client'
import { useEffect, useState } from 'react'

interface ModelStatus { model: string; available: boolean }
interface InfraStatus {
  database:  { connected: boolean }
  claude:    { configured: boolean; model: string }
  ollama:    { connected: boolean; baseUrl: string | null; models: ModelStatus[] }
  pgvector:  { configured: boolean }
}
interface RoutingRow { intent: string; provider: string; model: string; trigger: string }
interface PlatformInfo { workflows: Array<{id:string;name:string;category:string;steps:number}>; tools: Array<{name:string;description:string}>; docsIndexed: number }
interface Perf { last24h: { requests:number;tokensOut:number;ragChunksUsed:number;avgLatencyMs:number;avgRagLatencyMs:number;p50LatencyMs:number;p95LatencyMs:number } }

interface AdminData {
  infrastructure: InfraStatus
  routing:        RoutingRow[]
  platform:       PlatformInfo
  performance:    Perf
}

const CHECK = (ok: boolean) => ok
  ? <span style={{color:'#4caf78',fontSize:12}}>✓</span>
  : <span style={{color:'#f87171',fontSize:12}}>✗</span>

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginBottom:8 }}>{title}</div>
      {children}
    </div>
  )
}

function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? 'rgba(183,0,0,.08)' : 'rgba(255,255,255,.03)',
      border: `1px solid ${accent ? 'rgba(183,0,0,.25)' : 'rgba(255,255,255,.07)'}`,
      borderRadius:8, padding:'10px 12px', marginBottom:6,
    }}>{children}</div>
  )
}

function StatPill({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:7, padding:'8px 11px', textAlign:'center' }}>
      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:18, fontWeight:700, color:'#e8c96b', letterSpacing:'.03em' }}>{value}</div>
      <div style={{ fontFamily:'Lato,sans-serif', fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.28)', marginTop:1 }}>{label}</div>
      {sub && <div style={{ fontFamily:'Lato,sans-serif', fontSize:9, color:'rgba(255,255,255,.2)', marginTop:2 }}>{sub}</div>}
    </div>
  )
}

export default function AdminView({ sessionId }: { sessionId: string }) {
  const [data,    setData]    = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'infra'|'routing'|'platform'|'perf'>('infra')

  useEffect(() => {
    fetch(`/api/birdy/admin?sessionId=${sessionId}`)
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [sessionId])

  return (
    <>
      <style>{`
        .av{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:0}
        .av-tabs{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:14px}
        .av-tab{padding:7px 12px;font-family:'Lato',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.3);cursor:pointer;border-bottom:2px solid transparent;background:none;border-top:none;border-left:none;border-right:none;transition:all .15s}
        .av-tab:hover{color:rgba(255,255,255,.6)}
        .av-tab.active{color:#e8c96b;border-bottom-color:#b70000}
        .av-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;font-family:'Lato',sans-serif;font-size:12px;color:rgba(255,255,255,.65)}
        .av-label{color:rgba(255,255,255,.35);min-width:80px;font-size:11px}
        .av-badge{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border-radius:4px}
        .av-badge-ok{background:rgba(76,175,120,.15);color:#4caf78;border:1px solid rgba(76,175,120,.3)}
        .av-badge-err{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.25)}
        .av-badge-warn{background:rgba(232,201,107,.1);color:#e8c96b;border:1px solid rgba(232,201,107,.25)}
        .av-model-row{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-family:'Lato',sans-serif;font-size:11px}
        .av-model-row:last-child{border-bottom:none}
        .av-route-row{display:grid;grid-template-columns:1fr 120px;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);font-family:'Lato',sans-serif;font-size:11px}
        .av-route-row:last-child{border-bottom:none}
        .av-perf-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:12px}
        .av-loading{text-align:center;padding:32px;color:rgba(255,255,255,.2);font-family:'Lato',sans-serif;font-size:12px}
        .av-workflow{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);font-family:'Lato',sans-serif;font-size:11px}
        .av-workflow:last-child{border-bottom:none}
      `}</style>

      <div className="av">
        <div className="av-tabs">
          {(['infra','routing','platform','perf'] as const).map(t => (
            <button key={t} className={`av-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t==='infra'?'Infrastructure':t==='routing'?'Routing':t==='platform'?'Platform':'Performance'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="av-loading">Loading system status…</div>
        ) : !data ? (
          <div className="av-loading">Failed to load admin data.</div>
        ) : (
          <>
            {/* Infrastructure */}
            {tab === 'infra' && (
              <>
                <Section title="Core services">
                  <Card>
                    <div className="av-row">{CHECK(data.infrastructure.database.connected)} <span className="av-label">Database</span> <span className="av-badge av-badge-ok">PostgreSQL</span></div>
                    <div className="av-row">{CHECK(data.infrastructure.pgvector.configured)} <span className="av-label">pgvector</span> <span className={`av-badge ${data.infrastructure.pgvector.configured ? 'av-badge-ok':'av-badge-warn'}`}>vector(768)</span></div>
                    <div className="av-row">
                      {CHECK(data.infrastructure.claude.configured)}
                      <span className="av-label">Claude API</span>
                      <span className={`av-badge ${data.infrastructure.claude.configured ? 'av-badge-ok':'av-badge-err'}`}>{data.infrastructure.claude.configured ? 'Key set' : 'ANTHROPIC_API_KEY missing'}</span>
                    </div>
                  </Card>
                </Section>

                <Section title="Ollama inference">
                  <Card accent={!data.infrastructure.ollama.connected}>
                    <div className="av-row">
                      {CHECK(data.infrastructure.ollama.connected)}
                      <span className="av-label">Connection</span>
                      <span className={`av-badge ${data.infrastructure.ollama.connected ? 'av-badge-ok':'av-badge-err'}`}>
                        {data.infrastructure.ollama.connected ? 'Online' : 'Offline — Claude fallback active'}
                      </span>
                    </div>
                    {data.infrastructure.ollama.baseUrl && (
                      <div style={{ fontFamily:'Courier New,monospace', fontSize:10, color:'rgba(255,255,255,.25)', marginTop:6 }}>
                        {data.infrastructure.ollama.baseUrl}
                      </div>
                    )}
                  </Card>
                  <Card>
                    <div style={{ fontFamily:'Lato,sans-serif', fontSize:10, fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase', color:'rgba(255,255,255,.25)', marginBottom:8 }}>Model provisioning</div>
                    {data.infrastructure.ollama.models.map(m => (
                      <div key={m.model} className="av-model-row">
                        <span style={{ color: m.available ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.3)' }}>{m.model}</span>
                        <span className={`av-badge ${m.available ? 'av-badge-ok':'av-badge-warn'}`}>{m.available ? 'Ready' : 'Pulling…'}</span>
                      </div>
                    ))}
                    {!data.infrastructure.ollama.connected && (
                      <div style={{ marginTop:8, fontFamily:'Lato,sans-serif', fontSize:10, color:'rgba(232,201,107,.5)', lineHeight:1.6 }}>
                        Ollama service starting. Models auto-provision on first boot.<br/>See services/ollama/README.md for Railway setup.
                      </div>
                    )}
                  </Card>
                </Section>
              </>
            )}

            {/* Routing */}
            {tab === 'routing' && (
              <Section title="Model routing table">
                <Card>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, marginBottom:8, fontFamily:'Lato,sans-serif', fontSize:9, fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase', color:'rgba(255,255,255,.25)' }}>
                    <span>Intent / trigger</span>
                    <span>Provider → model</span>
                  </div>
                  {data.routing.map((r, i) => (
                    <div key={i} className="av-route-row">
                      <div>
                        <div style={{ color:'rgba(255,255,255,.75)', fontWeight:700, marginBottom:2 }}>{r.intent}</div>
                        <div style={{ color:'rgba(255,255,255,.28)', fontSize:10 }}>{r.trigger}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ color: r.provider === 'Claude' ? '#e8c96b' : '#60a5fa', fontWeight:700 }}>{r.provider}</div>
                        <div style={{ fontFamily:'Courier New,monospace', fontSize:9, color:'rgba(255,255,255,.25)' }}>{r.model.split('-')[0]}…</div>
                      </div>
                    </div>
                  ))}
                </Card>
              </Section>
            )}

            {/* Platform */}
            {tab === 'platform' && (
              <>
                <Section title="Workflows">
                  <Card>
                    {data.platform.workflows.map(w => (
                      <div key={w.id} className="av-workflow">
                        <div>
                          <div style={{ color:'rgba(255,255,255,.75)', fontWeight:700, fontFamily:'Lato,sans-serif', fontSize:12 }}>{w.name}</div>
                          <div style={{ color:'rgba(255,255,255,.28)', fontSize:10, fontFamily:'Lato,sans-serif', marginTop:1 }}>{w.category} · {w.steps} steps</div>
                        </div>
                        <span style={{ fontFamily:'Courier New,monospace', fontSize:9, color:'rgba(255,255,255,.2)' }}>{w.id}</span>
                      </div>
                    ))}
                  </Card>
                </Section>
                <Section title="Tools">
                  <Card>
                    {data.platform.tools.map(t => (
                      <div key={t.name} className="av-workflow">
                        <div style={{ fontFamily:'Lato,sans-serif', fontSize:11 }}>
                          <div style={{ color:'rgba(255,255,255,.75)', fontWeight:700, fontFamily:'Courier New,monospace', fontSize:11 }}>{t.name}</div>
                          <div style={{ color:'rgba(255,255,255,.28)', fontSize:10, marginTop:1 }}>{t.description}</div>
                        </div>
                      </div>
                    ))}
                  </Card>
                </Section>
                <Section title="Knowledge base">
                  <Card><div style={{ fontFamily:'Lato,sans-serif', fontSize:13, color:'rgba(255,255,255,.7)' }}>{data.platform.docsIndexed} documents indexed</div></Card>
                </Section>
              </>
            )}

            {/* Performance */}
            {tab === 'perf' && (
              <>
                <Section title="Last 24 hours">
                  <div className="av-perf-grid">
                    <StatPill label="Requests"    value={data.performance.last24h.requests} />
                    <StatPill label="Tokens out"  value={`${(data.performance.last24h.tokensOut/1000).toFixed(1)}k`} />
                    <StatPill label="P50 latency" value={`${(data.performance.last24h.p50LatencyMs/1000).toFixed(1)}s`} />
                    <StatPill label="P95 latency" value={`${(data.performance.last24h.p95LatencyMs/1000).toFixed(1)}s`} />
                    <StatPill label="RAG chunks"  value={data.performance.last24h.ragChunksUsed} sub="retrieved" />
                    <StatPill label="Avg RAG ms"  value={`${data.performance.last24h.avgRagLatencyMs}ms`} sub="retrieval" />
                  </div>
                </Section>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
