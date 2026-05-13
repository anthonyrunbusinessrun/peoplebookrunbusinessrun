'use client'
import { useEffect, useState, useCallback, useRef } from 'react'

interface ActivityEntry {
  id: string; provider: string; model: string; intent: string | null
  tokensIn: number; tokensOut: number; latencyMs: number | null
  ragChunksUsed: number | null; ragLatencyMs: number | null
  status: string; pageModule: string | null; actionKey: string | null
  createdAt: string
}
interface Stats {
  totalRequests: number; totalTokensIn: number; totalTokensOut: number
  totalRagChunks: number; avgLatencyMs: number; avgRagLatencyMs: number
}

const MODEL_SHORT: Record<string, string> = {
  'claude-sonnet-4-20250514': 'Claude Sonnet',
  'phi4': 'Phi-4', 'deepseek-coder-v2:16b': 'DeepSeek', 'qwen3:32b': 'Qwen3',
}
const STATUS_COLOR: Record<string, string> = { success: '#4caf78', error: '#f87171', fallback: '#e8c96b' }

function timeAgo(s: string): string {
  const d = Date.now() - new Date(s).getTime()
  if (d < 60_000) return `${Math.round(d / 1000)}s ago`
  if (d < 3_600_000) return `${Math.round(d / 60_000)}m ago`
  return `${Math.round(d / 3_600_000)}h ago`
}

export default function ActivityFeedView({ sessionId }: { sessionId: string }) {
  const [activity,   setActivity]   = useState<ActivityEntry[]>([])
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [lastUpdate, setLastUpdate] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchActivity = useCallback(async () => {
    if (!sessionId) return
    try {
      const r = await fetch(`/api/birdy/activity?sessionId=${sessionId}`)
      const d = await r.json()
      setActivity(d.activity ?? [])
      setStats(d.stats)
      setLastUpdate(Date.now())
    } catch {}
    finally { setLoading(false) }
  }, [sessionId])

  useEffect(() => {
    fetchActivity()
    // Auto-refresh every 30 seconds
    pollRef.current = setInterval(fetchActivity, 30_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchActivity])

  return (
    <>
      <style>{`
        .af{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px}
        .af-hdr{display:flex;align-items:center;justify-content:space-between}
        .af-title{font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.3)}
        .af-refresh{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.25);font-size:11px;font-family:'Lato',sans-serif;padding:2px 6px;border-radius:4px;transition:all .12s}
        .af-refresh:hover{color:rgba(255,255,255,.6);background:rgba(255,255,255,.05)}
        .af-stats{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        .af-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:7px;padding:9px 11px}
        .af-val{font-family:'Rajdhani',sans-serif;font-size:19px;font-weight:700;color:#e8c96b;letter-spacing:.03em}
        .af-lbl{font-family:'Lato',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.28);margin-top:1px}
        .af-list{display:flex;flex-direction:column;gap:5px}
        .af-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:7px;padding:9px 11px;display:flex;align-items:flex-start;gap:9px}
        .af-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:3px}
        .af-model{font-family:'Lato',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,.75)}
        .af-meta{font-family:'Lato',sans-serif;font-size:10px;color:rgba(255,255,255,.3);margin-top:2px;display:flex;flex-wrap:wrap;gap:6px}
        .af-rag-badge{font-size:9px;background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.3);border-radius:4px;padding:1px 5px;font-weight:700;letter-spacing:.06em}
        .af-time{font-family:'Lato',sans-serif;font-size:10px;color:rgba(255,255,255,.22);white-space:nowrap}
        .af-empty{text-align:center;padding:40px 16px;color:rgba(255,255,255,.2);font-family:'Lato',sans-serif;font-size:13px;line-height:1.6}
        .af-loading{text-align:center;padding:32px;color:rgba(255,255,255,.2);font-family:'Lato',sans-serif;font-size:12px}
      `}</style>
      <div className="af">
        {loading ? (
          <div className="af-loading">Loading activity…</div>
        ) : (
          <>
            {stats && (
              <div className="af-stats">
                <div className="af-stat"><div className="af-val">{stats.totalRequests}</div><div className="af-lbl">Requests</div></div>
                <div className="af-stat"><div className="af-val">{(stats.totalTokensOut / 1000).toFixed(1)}k</div><div className="af-lbl">Tokens out</div></div>
                <div className="af-stat"><div className="af-val">{stats.avgLatencyMs > 0 ? `${(stats.avgLatencyMs / 1000).toFixed(1)}s` : '—'}</div><div className="af-lbl">Avg latency</div></div>
                <div className="af-stat"><div className="af-val">{stats.totalRagChunks}</div><div className="af-lbl">RAG chunks</div></div>
              </div>
            )}

            <div className="af-hdr">
              <div className="af-title">Recent requests</div>
              <button className="af-refresh" onClick={fetchActivity}>↻ Refresh</button>
            </div>

            {activity.length ? (
              <div className="af-list">
                {activity.map(item => (
                  <div key={item.id} className="af-item">
                    <div className="af-dot" style={{ background: STATUS_COLOR[item.status] ?? '#888' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="af-model">{MODEL_SHORT[item.model] ?? item.model}</div>
                      <div className="af-meta">
                        {item.intent     && <span>{item.intent}</span>}
                        {item.pageModule && <span>· {item.pageModule}</span>}
                        {item.actionKey  && <span>· {item.actionKey}</span>}
                        {(item.ragChunksUsed ?? 0) > 0 && (
                          <span className="af-rag-badge">RAG ×{item.ragChunksUsed}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Courier New,monospace', fontSize: 10, color: 'rgba(232,201,107,.5)' }}>{item.tokensOut}t</div>
                      <div className="af-time">{item.latencyMs ? `${(item.latencyMs / 1000).toFixed(1)}s` : '—'}</div>
                      <div className="af-time">{timeAgo(item.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="af-empty">No AI activity yet.<br />Start a conversation to see requests here.</div>
            )}

            {lastUpdate > 0 && (
              <div style={{ fontFamily: 'Lato,sans-serif', fontSize: 9, color: 'rgba(255,255,255,.15)', textAlign: 'center', letterSpacing: '.06em' }}>
                Updated {timeAgo(new Date(lastUpdate).toISOString())} · auto-refreshes every 30s
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
