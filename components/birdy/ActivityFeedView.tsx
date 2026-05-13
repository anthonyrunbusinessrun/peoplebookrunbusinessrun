'use client'
import { useEffect, useState } from 'react'

interface ActivityEntry {
  id:         string
  provider:   string
  model:      string
  intent:     string | null
  tokensIn:   number
  tokensOut:  number
  latencyMs:  number | null
  status:     string
  pageModule: string | null
  actionKey:  string | null
  createdAt:  string
}

interface Stats {
  totalRequests:  number
  totalTokensIn:  number
  totalTokensOut: number
  avgLatencyMs:   number
}

const MODEL_SHORT: Record<string, string> = {
  'claude-sonnet-4-20250514': 'Claude Sonnet',
  'phi4':                     'Phi-4',
  'deepseek-coder-v2:16b':    'DeepSeek',
  'qwen3:32b':                'Qwen3',
}

const STATUS_COLOR: Record<string, string> = {
  success:  '#4caf78',
  error:    '#e55',
  fallback: '#e8c96b',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60_000)  return `${Math.round(diff / 1000)}s ago`
  if (diff < 3600_000) return `${Math.round(diff / 60_000)}m ago`
  return `${Math.round(diff / 3600_000)}h ago`
}

interface Props { sessionId: string }

export default function ActivityFeedView({ sessionId }: Props) {
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [stats,    setStats]    = useState<Stats | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    fetch(`/api/birdy/activity?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => { setActivity(d.activity ?? []); setStats(d.stats) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sessionId])

  return (
    <>
      <style>{`
        .af-wrap { flex: 1; overflow-y: auto; padding: 16px 14px 20px; }
        .af-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .af-stat { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 8px; padding: 10px 12px; }
        .af-stat-val { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #e8c96b; letter-spacing: .04em; }
        .af-stat-label { font-family: 'Lato', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); margin-top: 2px; }
        .af-section-title { font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); margin-bottom: 10px; }
        .af-list { display: flex; flex-direction: column; gap: 6px; }
        .af-item { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; }
        .af-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .af-model { font-family: 'Lato', sans-serif; font-size: 12px; font-weight: 700; color: rgba(255,255,255,.75); flex: 1; }
        .af-meta { font-family: 'Lato', sans-serif; font-size: 11px; color: rgba(255,255,255,.3); }
        .af-tokens { font-family: 'Courier New', monospace; font-size: 10px; color: rgba(232,201,107,.5); }
        .af-empty { text-align: center; padding: 40px 16px; color: rgba(255,255,255,.2); font-family: 'Lato', sans-serif; font-size: 13px; line-height: 1.6; }
        .af-loading { text-align: center; padding: 32px; color: rgba(255,255,255,.2); font-family: 'Lato', sans-serif; font-size: 12px; }
      `}</style>
      <div className="af-wrap">
        {loading ? (
          <div className="af-loading">Loading activity…</div>
        ) : (
          <>
            {stats && (
              <div className="af-stats">
                <div className="af-stat">
                  <div className="af-stat-val">{stats.totalRequests}</div>
                  <div className="af-stat-label">Requests</div>
                </div>
                <div className="af-stat">
                  <div className="af-stat-val">{(stats.totalTokensOut / 1000).toFixed(1)}k</div>
                  <div className="af-stat-label">Tokens out</div>
                </div>
                <div className="af-stat">
                  <div className="af-stat-val">{stats.avgLatencyMs > 0 ? `${(stats.avgLatencyMs / 1000).toFixed(1)}s` : '—'}</div>
                  <div className="af-stat-label">Avg latency</div>
                </div>
                <div className="af-stat">
                  <div className="af-stat-val">{(stats.totalTokensIn / 1000).toFixed(1)}k</div>
                  <div className="af-stat-label">Tokens in</div>
                </div>
              </div>
            )}

            <div className="af-section-title">Recent AI Requests</div>

            {activity.length ? (
              <div className="af-list">
                {activity.map(item => (
                  <div key={item.id} className="af-item">
                    <div className="af-dot" style={{ background: STATUS_COLOR[item.status] ?? '#888' }} />
                    <div style={{ flex: 1 }}>
                      <div className="af-model">{MODEL_SHORT[item.model] ?? item.model}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        <span className="af-meta">{item.intent ?? item.provider}</span>
                        {item.pageModule && <span className="af-meta">· {item.pageModule}</span>}
                        {item.actionKey  && <span className="af-meta">· {item.actionKey}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="af-tokens">{item.tokensOut}t</div>
                      <div className="af-meta">{item.latencyMs ? `${(item.latencyMs/1000).toFixed(1)}s` : '—'}</div>
                      <div className="af-meta">{timeAgo(item.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="af-empty">
                No AI activity yet.<br />
                Start a conversation to see requests here.
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
