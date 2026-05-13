'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import MessageBubble, { type MessageData } from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import QuickActionsView from './QuickActionsView'
import ActivityFeedView from './ActivityFeedView'
import KnowledgeView from './KnowledgeView'
import SlashCommandMenu from './SlashCommandMenu'
import { filterCommands, type SlashCommand } from '@/lib/birdy/slash-commands'
import { detectModule } from '@/lib/birdy/context'

type Tab = 'chat' | 'actions' | 'knowledge' | 'activity'

interface Conversation {
  id: string; title: string | null; module: string | null
  updatedAt: string; _count: { messages: number }
}

interface Props { open: boolean; onClose: () => void }

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const k = 'birdy_session'
  let id = localStorage.getItem(k)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(k, id) }
  return id
}

const TAB_ICONS: Record<Tab, string> = {
  chat:     'M3 3h18v14H3V3zm0 14l3 4 3-4',
  actions:  'M13 2L3 14h9l-1 8 10-12h-9z',
  knowledge:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  activity: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4',
}

export default function BirdyPanel({ open, onClose }: Props) {
  const [sessionId,      setSessionId]      = useState('')
  const [tab,            setTab]            = useState<Tab>('chat')
  const [conversations,  setConversations]  = useState<Conversation[]>([])
  const [activeConvId,   setActiveConvId]   = useState<string | null>(null)
  const [messages,       setMessages]       = useState<MessageData[]>([])
  const [isStreaming,    setIsStreaming]     = useState(false)
  const [showHistory,    setShowHistory]    = useState(false)
  const [error,          setError]          = useState<string | null>(null)
  const [inputValue,     setInputValue]     = useState('')
  const [slashCmds,      setSlashCmds]      = useState<SlashCommand[]>([])
  const [slashActive,    setSlashActive]    = useState(-1)
  const [pageModule,     setPageModule]     = useState('unknown')

  const bottomRef  = useRef<HTMLDivElement>(null)
  const abortRef   = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setSessionId(getOrCreateSessionId()) }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ctx = detectModule(window.location.pathname)
      setPageModule(ctx.module)
    }
  }, [])

  useEffect(() => {
    if (!open || !sessionId) return
    fetch(`/api/birdy/conversations?sessionId=${sessionId}`)
      .then(r => r.json()).then(d => setConversations(d.conversations ?? [])).catch(() => {})
  }, [open, sessionId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadConversation = useCallback(async (convId: string) => {
    setActiveConvId(convId); setMessages([]); setShowHistory(false)
    try {
      const res = await fetch(`/api/birdy/conversations/${convId}/messages?sessionId=${sessionId}`)
      const d   = await res.json()
      if (d.messages) setMessages(d.messages.map((m: MessageData & { role: string }) => ({
        ...m, role: m.role.toUpperCase() as 'USER' | 'ASSISTANT',
      })))
    } catch { setError('Could not load conversation.') }
  }, [sessionId])

  const startNew = () => {
    abortRef.current?.abort(); setActiveConvId(null); setMessages([])
    setIsStreaming(false); setError(null); setInputValue('')
  }

  const sendMessage = useCallback(async (message: string, actionKey?: string) => {
    if (isStreaming || !sessionId || !message.trim()) return
    setError(null); setIsStreaming(true)
    if (tab !== 'chat') setTab('chat')

    const trimmed = message.trim()
    const userMsg: MessageData = { id: crypto.randomUUID(), role: 'USER', content: trimmed, actionKey }
    const assistantId = crypto.randomUUID()
    const assistantMsg: MessageData = { id: assistantId, role: 'ASSISTANT', content: '', isStreaming: true }
    setMessages(prev => [...prev, userMsg, assistantMsg])

    abortRef.current = new AbortController()
    try {
      const res = await fetch('/api/birdy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, conversationId: activeConvId, sessionId, pageModule, actionKey }),
        signal: abortRef.current.signal,
      })
      if (res.status === 429) {
        setError('Rate limit reached. Please wait a moment.')
        setMessages(prev => prev.filter(m => m.id !== assistantId))
        setIsStreaming(false); return
      }
      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = '', model: string | undefined

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.conversationId && !activeConvId) {
              setActiveConvId(d.conversationId)
              setConversations(prev => {
                if (prev.find(c => c.id === d.conversationId)) return prev
                return [{ id: d.conversationId, title: trimmed.slice(0, 55), module: pageModule, updatedAt: new Date().toISOString(), _count: { messages: 1 } }, ...prev]
              })
            }
            if (d.model) model = d.model
            if (d.delta) setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + d.delta } : m))
            if (d.error) setError(d.error)
            if (d.done)  setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false, modelUsed: model } : m))
          } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => prev.map(m => m.id === assistantId
          ? { ...m, content: 'Something went wrong. Please try again.', isStreaming: false } : m))
      }
    } finally { setIsStreaming(false) }
  }, [activeConvId, isStreaming, sessionId, pageModule, tab])

  const handleAction = (prompt: string, actionKey: string) => { sendMessage(prompt, actionKey) }

  const handleInputChange = (v: string) => {
    setInputValue(v)
    if (v.startsWith('/') && !v.includes(' ')) {
      const filtered = filterCommands(v)
      setSlashCmds(filtered); setSlashActive(filtered.length > 0 ? 0 : -1)
    } else { setSlashCmds([]); setSlashActive(-1) }
  }

  const handleSlashSelect = (cmd: SlashCommand) => {
    setInputValue(cmd.template); setSlashCmds([]); setSlashActive(-1)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashCmds.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashActive(i => Math.min(i + 1, slashCmds.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSlashActive(i => Math.max(i - 1, 0)) }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        if (slashActive >= 0) handleSlashSelect(slashCmds[slashActive])
        return
      }
      if (e.key === 'Escape') { setSlashCmds([]); setSlashActive(-1); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isStreaming) { sendMessage(inputValue); setInputValue('') }
    }
  }

  const handleSend = () => {
    if (inputValue.trim() && !isStreaming) { sendMessage(inputValue); setInputValue('') }
  }

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }

  const pageCtx = detectModule(pageModule)

  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes b-slide { from { transform:translateX(100%); opacity:0 } to { transform:translateX(0); opacity:1 } }
        @keyframes b-fade  { from { opacity:0 } to { opacity:1 } }
        .b-overlay { position:fixed; inset:0; z-index:9998; background:rgba(5,9,49,.5); animation:b-fade .2s ease; backdrop-filter:blur(2px); }
        .b-panel { position:fixed; top:0; right:0; bottom:0; width:520px; max-width:100vw; z-index:9999; display:flex; flex-direction:column; background:#0b1829; border-left:1px solid rgba(183,0,0,.3); animation:b-slide .24s cubic-bezier(.25,.46,.45,.94); box-shadow:-12px 0 48px rgba(5,9,49,.7); }
        /* Header */
        .b-header { display:flex; flex-direction:column; background:linear-gradient(135deg,#0a1628,#0f2040); border-bottom:1px solid rgba(183,0,0,.3); flex-shrink:0; }
        .b-header-top { display:flex; align-items:center; justify-content:space-between; padding:12px 16px 0; }
        .b-header-left { display:flex; align-items:center; gap:10px; }
        .b-logo { width:28px; height:28px; border-radius:7px; background:linear-gradient(135deg,#b70000,#7e0606); display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
        .b-brand { display:flex; flex-direction:column; }
        .b-title { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:15px; letter-spacing:.14em; text-transform:uppercase; color:#fff; line-height:1.1; }
        .b-subtitle { font-family:'Lato',sans-serif; font-size:9px; color:rgba(255,255,255,.35); letter-spacing:.1em; text-transform:uppercase; }
        .b-ctx-pill { display:flex; align-items:center; gap:5px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:20px; padding:3px 10px; }
        .b-ctx-dot { width:5px; height:5px; border-radius:50%; background:#4caf78; flex-shrink:0; }
        .b-ctx-label { font-family:'Lato',sans-serif; font-size:10px; color:rgba(255,255,255,.45); letter-spacing:.06em; text-transform:uppercase; }
        .b-header-btns { display:flex; align-items:center; gap:2px; }
        .b-hbtn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.45); padding:6px; border-radius:6px; transition:all .15s; display:flex; align-items:center; justify-content:center; }
        .b-hbtn:hover { color:#fff; background:rgba(255,255,255,.07); }
        /* Tabs */
        .b-tabs { display:flex; align-items:center; gap:0; padding:0 12px; margin-top:10px; border-top:1px solid rgba(255,255,255,.05); }
        .b-tab { display:flex; align-items:center; gap:6px; padding:9px 12px; font-family:'Lato',sans-serif; font-size:11px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:rgba(255,255,255,.35); cursor:pointer; border-bottom:2px solid transparent; transition:all .15s; background:none; border-top:none; border-left:none; border-right:none; }
        .b-tab:hover { color:rgba(255,255,255,.7); }
        .b-tab.active { color:#e8c96b; border-bottom-color:#b70000; }
        /* Body */
        .b-body { flex:1; display:flex; overflow:hidden; }
        /* History sidebar */
        .b-hist { width:165px; flex-shrink:0; background:#071020; border-right:1px solid rgba(255,255,255,.05); overflow-y:auto; display:flex; flex-direction:column; }
        .b-hist-hdr { padding:10px 12px 7px; font-family:'Lato',sans-serif; font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.25); border-bottom:1px solid rgba(255,255,255,.05); }
        .b-new-btn { margin:8px; padding:7px; font-family:'Lato',sans-serif; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.35); background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:6px; cursor:pointer; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:4px; }
        .b-new-btn:hover { color:#fff; background:rgba(183,0,0,.2); border-color:rgba(183,0,0,.4); }
        .b-conv-item { padding:9px 12px; font-family:'Lato',sans-serif; font-size:11px; color:rgba(255,255,255,.45); cursor:pointer; border-bottom:1px solid rgba(255,255,255,.03); transition:all .12s; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.4; }
        .b-conv-item:hover { background:rgba(255,255,255,.04); color:rgba(255,255,255,.8); }
        .b-conv-item.active { background:rgba(183,0,0,.12); color:#e8c96b; border-left:2px solid #b70000; padding-left:10px; }
        /* Chat area */
        .b-chat { flex:1; display:flex; flex-direction:column; overflow:hidden; }
        .b-msgs { flex:1; overflow-y:auto; padding:16px 14px; display:flex; flex-direction:column; gap:14px; scroll-behavior:smooth; }
        .b-msgs::-webkit-scrollbar { width:3px; }
        .b-msgs::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); border-radius:2px; }
        .b-empty { flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; padding:24px; color:rgba(255,255,255,.25); }
        .b-empty-icon { width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg,rgba(183,0,0,.18),rgba(126,6,6,.12)); border:1px solid rgba(183,0,0,.22); display:flex; align-items:center; justify-content:center; font-size:22px; margin:0 auto 14px; }
        .b-empty-title { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:16px; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.6); margin-bottom:7px; }
        .b-empty-sub { font-family:'Lato',sans-serif; font-size:12px; line-height:1.6; color:rgba(255,255,255,.25); margin-bottom:16px; }
        .b-suggestions { display:flex; flex-direction:column; gap:5px; width:100%; max-width:280px; }
        .b-sug-btn { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:7px; padding:7px 12px; font-family:'Lato',sans-serif; font-size:12px; color:rgba(255,255,255,.45); cursor:pointer; transition:all .15s; text-align:left; }
        .b-sug-btn:hover { background:rgba(183,0,0,.12); border-color:rgba(183,0,0,.35); color:rgba(255,255,255,.8); }
        .b-streaming { padding:0 14px 4px; font-family:'Lato',sans-serif; font-size:11px; color:rgba(232,201,107,.4); letter-spacing:.06em; display:flex; align-items:center; gap:6px; }
        .b-error { margin:0 14px 8px; padding:8px 12px; background:rgba(183,0,0,.12); border:1px solid rgba(183,0,0,.28); border-radius:8px; font-family:'Lato',sans-serif; font-size:12px; color:#ff8080; display:flex; align-items:center; justify-content:space-between; gap:8px; }
        /* Input */
        .b-input-wrap { border-top:1px solid rgba(255,255,255,.07); padding:11px 13px 13px; background:#0a1628; position:relative; }
        .b-input-row { display:flex; align-items:flex-end; gap:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:10px; padding:9px 11px; transition:border-color .15s; }
        .b-input-row:focus-within { border-color:rgba(183,0,0,.55); }
        .b-textarea { flex:1; background:none; border:none; outline:none; resize:none; color:#e2e8f0; font-family:'Lato',sans-serif; font-size:13px; line-height:1.5; min-height:20px; max-height:160px; }
        .b-textarea::placeholder { color:rgba(255,255,255,.2); }
        .b-send-btn { width:30px; height:30px; border-radius:7px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; }
        .b-send-btn.ready { background:linear-gradient(135deg,#b70000,#7e0606); }
        .b-send-btn.ready:hover { opacity:.85; }
        .b-send-btn.idle { background:rgba(255,255,255,.06); cursor:not-allowed; }
        .b-input-hint { font-family:'Lato',sans-serif; font-size:9px; color:rgba(255,255,255,.15); text-align:center; margin-top:7px; letter-spacing:.05em; }
        @media (max-width:540px) { .b-panel { width:100vw; } .b-hist { width:140px; } }
      `}</style>

      <div className="b-overlay" onClick={onClose} />
      <div className="b-panel">

        {/* Header */}
        <div className="b-header">
          <div className="b-header-top">
            <div className="b-header-left">
              <button className="b-hbtn" onClick={() => setShowHistory(s => !s)} title="History">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1.5 3.5h12M1.5 7.5h8M1.5 11.5h10" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="b-brand">
                <div className="b-title">Birdy</div>
                <div className="b-subtitle">Rayland AI Operating Layer</div>
              </div>
              <div className="b-ctx-pill">
                <div className="b-ctx-dot" />
                <div className="b-ctx-label">{pageCtx.label}</div>
              </div>
            </div>
            <div className="b-header-btns">
              <button className="b-hbtn" onClick={startNew} title="New conversation">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 1v12M1 7h12" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="b-hbtn" onClick={onClose} title="Close (Esc)">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="b-tabs">
            {(['chat', 'actions', 'knowledge', 'activity'] as Tab[]).map(t => (
              <button key={t} className={`b-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'chat'     && '💬'}
                {t === 'actions'  && '⚡'}
                {t === 'knowledge' && '📚'}
                {t === 'activity' && '📊'}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="b-body">
          {/* History sidebar (chat tab only) */}
          {showHistory && tab === 'chat' && (
            <div className="b-hist">
              <div className="b-hist-hdr">History</div>
              <button className="b-new-btn" onClick={startNew}>+ New</button>
              {conversations.map(conv => (
                <div key={conv.id}
                  className={`b-conv-item ${conv.id === activeConvId ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.id)}
                  title={conv.title ?? 'Conversation'}>
                  {conv.title ?? 'Conversation'}
                </div>
              ))}
              {!conversations.length && (
                <div style={{ padding:'12px', fontSize:10, color:'rgba(255,255,255,.18)', fontFamily:'Lato,sans-serif' }}>No conversations yet</div>
              )}
            </div>
          )}

          {/* Chat view */}
          {tab === 'chat' && (
            <div className="b-chat">
              <div className="b-msgs">
                {!messages.length ? (
                  <div className="b-empty">
                    <div className="b-empty-icon">🐦</div>
                    <div className="b-empty-title">Birdy is ready</div>
                    <div className="b-empty-sub">
                      Enterprise AI for Rayland operations.<br/>Type a message or try a suggestion.
                    </div>
                    <div className="b-suggestions">
                      {pageCtx.suggestions.map(s => (
                        <button key={s} className="b-sug-btn" onClick={() => sendMessage(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id}>
                      {msg.isStreaming && !msg.content
                        ? <TypingIndicator />
                        : <MessageBubble message={msg} />}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {isStreaming && (
                <div className="b-streaming">
                  <TypingIndicator />
                  <span>Birdy is thinking…</span>
                </div>
              )}

              {error && (
                <div className="b-error">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', padding:0, fontSize:15 }}>×</button>
                </div>
              )}

              {/* Input */}
              <div className="b-input-wrap">
                {slashCmds.length > 0 && (
                  <SlashCommandMenu commands={slashCmds} activeIdx={slashActive} onSelect={handleSlashSelect} />
                )}
                <div className="b-input-row">
                  <textarea
                    ref={textareaRef}
                    className="b-textarea"
                    value={inputValue}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleTextareaInput}
                    placeholder={isStreaming ? 'Birdy is responding…' : 'Ask Birdy anything… (/ for commands)'}
                    rows={1}
                    disabled={isStreaming}
                  />
                  <button
                    className={`b-send-btn ${inputValue.trim() && !isStreaming ? 'ready' : 'idle'}`}
                    onClick={handleSend}
                    aria-label="Send"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M1 6.5H12M7.5 2L12 6.5L7.5 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="b-input-hint">Enter to send · Shift+Enter for new line · / for commands</div>
              </div>
            </div>
          )}

          {/* Actions view */}
          {tab === 'actions' && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <QuickActionsView onAction={handleAction} />
            </div>
          )}

          {/* Knowledge view */}
          {tab === 'knowledge' && sessionId && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <KnowledgeView sessionId={sessionId} />
            </div>
          )}

          {/* Activity view */}
          {tab === 'activity' && sessionId && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <ActivityFeedView sessionId={sessionId} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
