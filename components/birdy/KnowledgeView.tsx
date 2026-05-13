'use client'
import { useEffect, useState } from 'react'

interface BirdyDoc {
  id:         string
  name:       string
  mimeType:   string
  sizeBytes:  number | null
  status:     string
  chunkCount: number
  createdAt:  string
}

const STATUS_ICON: Record<string, string> = {
  PENDING:    '⏳',
  PROCESSING: '⚙️',
  READY:      '✅',
  ERROR:      '❌',
}

function formatBytes(b: number | null): string {
  if (!b) return '—'
  if (b < 1024)         return `${b} B`
  if (b < 1024 * 1024)  return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

interface Props { sessionId: string }

export default function KnowledgeView({ sessionId }: Props) {
  const [docs,    setDocs]    = useState<BirdyDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/birdy/knowledge?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => setDocs(d.documents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sessionId])

  const filtered = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <style>{`
        .kb-wrap { flex: 1; overflow-y: auto; padding: 16px 14px 20px; display: flex; flex-direction: column; gap: 14px; }
        .kb-search-row { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 8px 12px; }
        .kb-search { background: none; border: none; outline: none; flex: 1; color: #e2e8f0; font-family: 'Lato', sans-serif; font-size: 13px; }
        .kb-search::placeholder { color: rgba(255,255,255,.25); }
        .kb-section-title { font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); }
        .kb-empty { background: rgba(255,255,255,.03); border: 1px dashed rgba(255,255,255,.1); border-radius: 10px; padding: 32px 16px; text-align: center; }
        .kb-empty-icon { font-size: 28px; margin-bottom: 10px; }
        .kb-empty-title { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.45); margin-bottom: 6px; }
        .kb-empty-sub { font-family: 'Lato', sans-serif; font-size: 12px; color: rgba(255,255,255,.25); line-height: 1.6; }
        .kb-rag-note { background: rgba(183,0,0,.1); border: 1px solid rgba(183,0,0,.25); border-radius: 8px; padding: 10px 12px; }
        .kb-rag-title { font-family: 'Lato', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(232,201,107,.7); margin-bottom: 4px; }
        .kb-rag-text { font-family: 'Lato', sans-serif; font-size: 11px; color: rgba(255,255,255,.35); line-height: 1.5; }
        .kb-list { display: flex; flex-direction: column; gap: 6px; }
        .kb-item { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; }
        .kb-icon { font-size: 16px; flex-shrink: 0; }
        .kb-name { font-family: 'Lato', sans-serif; font-size: 13px; color: rgba(255,255,255,.8); flex: 1; word-break: break-all; }
        .kb-meta { font-family: 'Lato', sans-serif; font-size: 10px; color: rgba(255,255,255,.25); margin-top: 2px; }
        .kb-loading { text-align: center; padding: 32px; color: rgba(255,255,255,.2); font-family: 'Lato', sans-serif; font-size: 12px; }
      `}</style>
      <div className="kb-wrap">
        <div className="kb-search-row">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.5">
            <circle cx="6" cy="6" r="4.5"/><path d="M10 10l2.5 2.5" strokeLinecap="round"/>
          </svg>
          <input className="kb-search" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="kb-rag-note">
          <div className="kb-rag-title">⚡ RAG Coming Soon</div>
          <div className="kb-rag-text">Upload company docs, SOPs, and handbooks here. Birdy will automatically search them when answering questions. Powered by pgvector semantic search.</div>
        </div>

        <div className="kb-section-title">Documents ({filtered.length})</div>

        {loading ? (
          <div className="kb-loading">Loading documents…</div>
        ) : filtered.length ? (
          <div className="kb-list">
            {filtered.map(doc => (
              <div key={doc.id} className="kb-item">
                <div className="kb-icon">{STATUS_ICON[doc.status] ?? '📄'}</div>
                <div style={{ flex: 1 }}>
                  <div className="kb-name">{doc.name}</div>
                  <div className="kb-meta">{formatBytes(doc.sizeBytes)} · {doc.status}{doc.chunkCount > 0 ? ` · ${doc.chunkCount} chunks` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="kb-empty">
            <div className="kb-empty-icon">📚</div>
            <div className="kb-empty-title">No documents yet</div>
            <div className="kb-empty-sub">Upload PDFs, docs, or text files<br />and Birdy will learn from them.</div>
          </div>
        )}
      </div>
    </>
  )
}
