'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useUploadThing } from '@/lib/uploadthing'

interface BirdyDoc {
  id: string; name: string; mimeType: string; sizeBytes: number | null
  status: string; chunkCount: number; wordCount: number | null
  errorMsg: string | null; createdAt: string
}

interface SearchResult {
  chunkId: string; documentId: string; documentName: string
  content: string; score: number; preview: string
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:    'rgba(232,201,107,.5)',
  PROCESSING: '#60a5fa',
  READY:      '#4caf78',
  ERROR:      '#f87171',
}
const STATUS_ICON: Record<string, string> = {
  PENDING: '⏳', PROCESSING: '⚙️', READY: '✅', ERROR: '❌',
}

function formatBytes(b: number | null): string {
  if (!b) return '—'
  if (b < 1024)          return `${b} B`
  if (b < 1024 * 1024)   return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

function timeAgo(s: string): string {
  const d = Date.now() - new Date(s).getTime()
  if (d < 60_000)   return `${Math.round(d/1000)}s ago`
  if (d < 3600_000) return `${Math.round(d/60_000)}m ago`
  return `${Math.round(d/3600_000)}h ago`
}

interface Props { sessionId: string }

export default function KnowledgeView({ sessionId }: Props) {
  const [docs,          setDocs]          = useState<BirdyDoc[]>([])
  const [loading,       setLoading]       = useState(true)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [searching,     setSearching]     = useState(false)
  const [uploading,     setUploading]     = useState(false)
  const [uploadMsg,     setUploadMsg]     = useState('')
  const [expandedDoc,   setExpandedDoc]   = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef      = useRef<NodeJS.Timeout | null>(null)
  const searchTimer  = useRef<NodeJS.Timeout | null>(null)

  const { startUpload } = useUploadThing('birdyDocumentUploader', {
    onClientUploadComplete: async (res) => {
      if (!res?.[0]) return
      const file = res[0]
      // Trigger server-side ingestion
      try {
        const r = await fetch('/api/birdy/knowledge/ingest', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            name:       file.name,
            mimeType:   file.type ?? 'application/octet-stream',
            storageUrl: file.url,
            sizeBytes:  file.size,
            namespace:  'default',
          }),
        })
        const d = await r.json()
        if (d.document) {
          setDocs(prev => [d.document, ...prev])
          setUploadMsg('Ingestion started — document will be ready shortly.')
          startPolling()
        }
      } catch {
        setUploadMsg('Upload succeeded but ingestion failed to start.')
      }
      setUploading(false)
    },
    onUploadError: (e) => {
      setUploadMsg(`Upload error: ${e.message}`)
      setUploading(false)
    },
  })

  const fetchDocs = useCallback(async () => {
    if (!sessionId) return
    try {
      const r = await fetch(`/api/birdy/knowledge?sessionId=${sessionId}`)
      const d = await r.json()
      setDocs(d.documents ?? [])
    } catch {} finally { setLoading(false) }
  }, [sessionId])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      await fetchDocs()
      // Stop polling when no documents are PENDING/PROCESSING
      const stillProcessing = docs.some(d => d.status === 'PENDING' || d.status === 'PROCESSING')
      if (!stillProcessing && pollRef.current) {
        clearInterval(pollRef.current); pollRef.current = null
      }
    }, 3000)
  }

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(
          `/api/birdy/knowledge/search?q=${encodeURIComponent(searchQuery)}&sessionId=${sessionId}&namespace=default`
        )
        const d = await r.json()
        setSearchResults(d.results ?? [])
      } catch { setSearchResults([]) }
      finally { setSearching(false) }
    }, 400)
  }, [searchQuery, sessionId])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true); setUploadMsg('Uploading…')
    try { await startUpload(files) }
    catch (err) { setUploading(false); setUploadMsg(`Error: ${(err as Error).message}`) }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document and all its chunks?')) return
    try {
      await fetch('/api/birdy/knowledge', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId, sessionId }),
      })
      setDocs(prev => prev.filter(d => d.id !== docId))
    } catch { alert('Delete failed') }
  }

  const processingCount = docs.filter(d => d.status === 'PENDING' || d.status === 'PROCESSING').length
  const readyCount      = docs.filter(d => d.status === 'READY').length

  return (
    <>
      <style>{`
        .kv{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:14px}
        .kv-search{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:8px 12px;transition:border-color .15s}
        .kv-search:focus-within{border-color:rgba(183,0,0,.55)}
        .kv-search-input{flex:1;background:none;border:none;outline:none;color:#e2e8f0;font-family:'Lato',sans-serif;font-size:13px}
        .kv-search-input::placeholder{color:rgba(255,255,255,.22)}
        .kv-upload-zone{border:1px dashed rgba(255,255,255,.12);border-radius:10px;padding:16px;text-align:center;cursor:pointer;transition:all .15s;background:rgba(255,255,255,.02)}
        .kv-upload-zone:hover{border-color:rgba(183,0,0,.45);background:rgba(183,0,0,.06)}
        .kv-upload-btn{background:linear-gradient(135deg,#b70000,#7e0606);border:none;border-radius:7px;color:#fff;cursor:pointer;font-family:'Lato',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:8px 16px;margin-top:8px;transition:opacity .15s}
        .kv-upload-btn:hover{opacity:.85}
        .kv-upload-btn:disabled{opacity:.4;cursor:not-allowed}
        .kv-stat-row{display:flex;gap:8px}
        .kv-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:7px;padding:8px 11px;flex:1;text-align:center}
        .kv-stat-val{font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#e8c96b}
        .kv-stat-lbl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.28);font-family:'Lato',sans-serif;margin-top:1px}
        .kv-section{font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px}
        .kv-doc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:10px 12px;transition:border-color .12s;cursor:pointer}
        .kv-doc:hover{border-color:rgba(255,255,255,.14)}
        .kv-doc.expanded{border-color:rgba(183,0,0,.3);background:rgba(183,0,0,.05)}
        .kv-doc-hdr{display:flex;align-items:center;gap:9px}
        .kv-doc-icon{font-size:15px;flex-shrink:0}
        .kv-doc-name{font-family:'Lato',sans-serif;font-size:12px;color:rgba(255,255,255,.8);font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .kv-doc-status{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;flex-shrink:0}
        .kv-doc-meta{font-family:'Lato',sans-serif;font-size:10px;color:rgba(255,255,255,.28);margin-top:4px;display:flex;gap:10px}
        .kv-doc-detail{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);font-family:'Lato',sans-serif;font-size:11px;color:rgba(255,255,255,.5);line-height:1.6}
        .kv-doc-del{background:none;border:none;color:rgba(247,113,113,.5);cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px;transition:all .12s;font-family:'Lato',sans-serif}
        .kv-doc-del:hover{color:#f87171;background:rgba(248,113,113,.1)}
        .kv-empty{text-align:center;padding:28px 16px;color:rgba(255,255,255,.2)}
        .kv-search-result{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:10px 12px;margin-bottom:7px}
        .kv-sr-doc{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#e8c96b;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between}
        .kv-sr-score{font-size:9px;color:rgba(255,255,255,.3);font-weight:400;text-transform:none;letter-spacing:0}
        .kv-sr-content{font-family:'Lato',sans-serif;font-size:12px;color:rgba(255,255,255,.6);line-height:1.6}
        .kv-msg{font-family:'Lato',sans-serif;font-size:11px;color:#e8c96b;background:rgba(232,201,107,.1);border:1px solid rgba(232,201,107,.2);border-radius:7px;padding:7px 11px;margin-bottom:4px}
        .kv-spinner{display:inline-block;width:10px;height:10px;border:1.5px solid rgba(255,255,255,.2);border-top-color:#e8c96b;border-radius:50%;animation:kv-spin .7s linear infinite;margin-right:5px}
        @keyframes kv-spin{to{transform:rotate(360deg)}}
        .kv-accepted{font-family:'Lato',sans-serif;font-size:10px;color:rgba(255,255,255,.3);text-align:center;margin-top:4px}
        .kv-prog-bar{height:2px;background:rgba(183,0,0,.15);border-radius:1px;overflow:hidden;margin-top:5px}
        .kv-prog-fill{height:100%;background:#b70000;border-radius:1px;animation:kv-prog 1.5s ease-in-out infinite}
        @keyframes kv-prog{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}
      `}</style>

      <div className="kv">

        {/* Stats */}
        {docs.length > 0 && (
          <div className="kv-stat-row">
            <div className="kv-stat">
              <div className="kv-stat-val">{docs.length}</div>
              <div className="kv-stat-lbl">Documents</div>
            </div>
            <div className="kv-stat">
              <div className="kv-stat-val">{readyCount}</div>
              <div className="kv-stat-lbl">Indexed</div>
            </div>
            <div className="kv-stat">
              <div className="kv-stat-val">
                {docs.reduce((n, d) => n + d.chunkCount, 0)}
              </div>
              <div className="kv-stat-lbl">Chunks</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="kv-search">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.5">
            <circle cx="5.5" cy="5.5" r="4"/><path d="M9 9l2.5 2.5" strokeLinecap="round"/>
          </svg>
          <input
            className="kv-search-input"
            placeholder={readyCount > 0 ? `Search ${readyCount} indexed document${readyCount !== 1 ? 's' : ''}…` : 'Upload documents to search…'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            disabled={readyCount === 0}
          />
          {searching && <div className="kv-spinner" />}
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults(null) }}
              style={{ background:'none', border:'none', color:'rgba(255,255,255,.3)', cursor:'pointer', fontSize:15, lineHeight:1 }}>×</button>
          )}
        </div>

        {/* Search results */}
        {searchResults !== null && (
          <div>
            <div className="kv-section">
              Search results ({searchResults.length})
              {searchResults.length > 0 && <span style={{ marginLeft:6, color:'rgba(255,255,255,.2)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>— semantic similarity</span>}
            </div>
            {searchResults.length ? searchResults.map((r, i) => (
              <div key={r.chunkId} className="kv-search-result">
                <div className="kv-sr-doc">
                  [{i + 1}] {r.documentName}
                  <span className="kv-sr-score">{Math.round(r.score * 100)}% match</span>
                </div>
                <div className="kv-sr-content">{r.content.slice(0, 280)}{r.content.length > 280 ? '…' : ''}</div>
              </div>
            )) : (
              <div className="kv-empty" style={{ padding:'14px' }}>No results found. Try different search terms.</div>
            )}
          </div>
        )}

        {/* Upload zone */}
        {!searchQuery && (
          <div>
            <div className="kv-section">Add document</div>
            {uploadMsg && <div className="kv-msg">{uploadMsg}</div>}
            <div className="kv-upload-zone" onClick={() => !uploading && fileInputRef.current?.click()}>
              <div style={{ fontSize:24, marginBottom:8 }}>📄</div>
              <div style={{ fontFamily:'Lato,sans-serif', fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.5 }}>
                PDF, Word, Markdown, or plain text
              </div>
              <div style={{ fontFamily:'Lato,sans-serif', fontSize:10, color:'rgba(255,255,255,.22)', marginTop:4 }}>
                Up to 32 MB
              </div>
              <button className="kv-upload-btn" disabled={uploading} onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>
                {uploading ? <><span className="kv-spinner" />Uploading…</> : '+ Upload document'}
              </button>
              {uploading && <div className="kv-prog-bar"><div className="kv-prog-fill" /></div>}
            </div>
            <div className="kv-accepted">Accepted: .pdf .docx .doc .md .txt</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.md,.txt,text/plain,text/markdown,application/pdf"
              style={{ display:'none' }}
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Document list */}
        {!searchQuery && (
          <div>
            <div className="kv-section">
              Library ({docs.length})
              {processingCount > 0 && (
                <span style={{ marginLeft:8, fontSize:9, color:'#60a5fa', fontWeight:400, textTransform:'none', letterSpacing:0 }}>
                  <span className="kv-spinner" />{processingCount} processing…
                </span>
              )}
            </div>

            {loading ? (
              <div className="kv-empty"><span className="kv-spinner" /> Loading…</div>
            ) : !docs.length ? (
              <div className="kv-empty">
                <div style={{ fontSize:24, marginBottom:8 }}>📚</div>
                <div style={{ fontFamily:'Lato,sans-serif', fontSize:12, lineHeight:1.6 }}>
                  No documents yet.<br />Upload SOPs, policies, or recruiting guides.
                </div>
              </div>
            ) : (
              docs.map(doc => (
                <div key={doc.id} style={{ marginBottom:6 }}>
                  <div
                    className={`kv-doc ${expandedDoc === doc.id ? 'expanded' : ''}`}
                    onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                  >
                    <div className="kv-doc-hdr">
                      <div className="kv-doc-icon">{STATUS_ICON[doc.status] ?? '📄'}</div>
                      <div className="kv-doc-name" title={doc.name}>{doc.name}</div>
                      <div className="kv-doc-status" style={{ color: STATUS_COLOR[doc.status] }}>
                        {doc.status}
                      </div>
                    </div>
                    <div className="kv-doc-meta">
                      <span>{formatBytes(doc.sizeBytes)}</span>
                      {doc.chunkCount > 0 && <span>{doc.chunkCount} chunks</span>}
                      {doc.wordCount   && <span>~{(doc.wordCount / 1000).toFixed(1)}k words</span>}
                      <span>{timeAgo(doc.createdAt)}</span>
                    </div>

                    {(doc.status === 'PENDING' || doc.status === 'PROCESSING') && (
                      <div className="kv-prog-bar"><div className="kv-prog-fill" /></div>
                    )}

                    {expandedDoc === doc.id && (
                      <div className="kv-doc-detail">
                        {doc.errorMsg && <div style={{ color:'#f87171', marginBottom:6 }}>⚠️ {doc.errorMsg}</div>}
                        <div style={{ marginBottom:6 }}>
                          <strong style={{ color:'rgba(255,255,255,.55)' }}>Type:</strong> {doc.mimeType}
                        </div>
                        {doc.status === 'READY' && (
                          <div style={{ marginBottom:8, color:'#4caf78' }}>
                            ✓ Indexed — searchable via semantic and keyword search
                          </div>
                        )}
                        <button className="kv-doc-del" onClick={e => { e.stopPropagation(); handleDelete(doc.id) }}>
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
