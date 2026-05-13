'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import MessageBubble, { type MessageData } from './MessageBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'

interface Conversation {
  id: string
  title: string | null
  updatedAt: string
  _count: { messages: number }
}

interface Props {
  open: boolean
  onClose: () => void
}

// Persist sessionId in localStorage — scopes conversations to this browser
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'birdy_session'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function BirdyPanel({ open, onClose }: Props) {
  const [sessionId, setSessionId] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setSessionId(getOrCreateSessionId())
  }, [])

  // Load conversation history when panel opens
  useEffect(() => {
    if (!open || !sessionId) return
    fetch(`/api/birdy/conversations?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => setConversations(d.conversations ?? []))
      .catch(() => {})
  }, [open, sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversation = useCallback(async (convId: string) => {
    setActiveConvId(convId)
    setMessages([])
    setShowHistory(false)
    try {
      const res = await fetch(`/api/birdy/conversations/${convId}/messages?sessionId=${sessionId}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages.map((m: MessageData & { role: string }) => ({
          ...m,
          role: m.role.toUpperCase() as 'USER' | 'ASSISTANT',
        })))
      }
    } catch {
      setError('Could not load conversation.')
    }
  }, [sessionId])

  const startNewConversation = () => {
    abortRef.current?.abort()
    setActiveConvId(null)
    setMessages([])
    setIsStreaming(false)
    setError(null)
  }

  const sendMessage = useCallback(async (message: string) => {
    if (isStreaming || !sessionId) return
    setError(null)
    setIsStreaming(true)

    const userMsg: MessageData = {
      id: crypto.randomUUID(),
      role: 'USER',
      content: message,
    }

    const assistantId = crypto.randomUUID()
    const assistantMsg: MessageData = {
      id: assistantId,
      role: 'ASSISTANT',
      content: '',
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/birdy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId: activeConvId,
          sessionId,
        }),
        signal: abortRef.current.signal,
      })

      if (res.status === 429) {
        setError('Rate limit reached. Please wait a moment and try again.')
        setMessages(prev => prev.filter(m => m.id !== assistantId))
        setIsStreaming(false)
        return
      }

      if (!res.ok || !res.body) {
        throw new Error('Stream failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let model: string | undefined

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))

            if (data.conversationId && !activeConvId) {
              setActiveConvId(data.conversationId)
              // Add to conversations list
              setConversations(prev => {
                const exists = prev.find(c => c.id === data.conversationId)
                if (exists) return prev
                return [{
                  id: data.conversationId,
                  title: message.slice(0, 60),
                  updatedAt: new Date().toISOString(),
                  _count: { messages: 1 },
                }, ...prev]
              })
            }

            if (data.model) model = data.model

            if (data.delta) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: m.content + data.delta }
                  : m
              ))
            }

            if (data.error) {
              setError(data.error)
            }

            if (data.done) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, isStreaming: false, modelUsed: model }
                  : m
              ))
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.', isStreaming: false }
            : m
        ))
      }
    } finally {
      setIsStreaming(false)
    }
  }, [activeConvId, isStreaming, sessionId])

  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes birdy-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes birdy-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .birdy-overlay {
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(5,9,49,0.5);
          animation: birdy-fade-in 0.2s ease;
          backdrop-filter: blur(2px);
        }
        .birdy-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 420px; max-width: 100vw;
          z-index: 9999;
          display: flex; flex-direction: column;
          background: #0d1f3c;
          border-left: 1px solid rgba(183,0,0,0.35);
          animation: birdy-slide-in 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
          box-shadow: -8px 0 40px rgba(5,9,49,0.6);
        }
        .birdy-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px;
          height: 56px;
          background: linear-gradient(135deg, #0a1628, #182f64);
          border-bottom: 1px solid rgba(183,0,0,0.4);
          flex-shrink: 0;
        }
        .birdy-header-left { display: flex; align-items: center; gap: 10px; }
        .birdy-logo {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg, #b70000, #7e0606);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .birdy-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700; font-size: 16px;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #fff;
        }
        .birdy-subtitle {
          font-family: 'Lato', sans-serif;
          font-size: 10px; color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .birdy-header-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5); padding: 6px;
          border-radius: 6px; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .birdy-header-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }
        .birdy-history-sidebar {
          width: 160px; flex-shrink: 0;
          background: #071020;
          border-right: 1px solid rgba(255,255,255,0.06);
          overflow-y: auto;
          display: flex; flex-direction: column;
        }
        .birdy-history-header {
          padding: 12px 12px 8px;
          font-family: 'Lato', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .birdy-conv-item {
          padding: 10px 12px;
          font-family: 'Lato', sans-serif; font-size: 12px;
          color: rgba(255,255,255,0.55);
          cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: all 0.12s;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.4;
        }
        .birdy-conv-item:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.85); }
        .birdy-conv-item.active { background: rgba(183,0,0,0.15); color: #e8c96b; border-left: 2px solid #b70000; }
        .birdy-new-conv-btn {
          margin: 10px;
          padding: 8px 0;
          font-family: 'Lato', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px; cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .birdy-new-conv-btn:hover { color: #fff; background: rgba(183,0,0,0.2); border-color: rgba(183,0,0,0.4); }
        .birdy-body {
          flex: 1; display: flex; overflow: hidden;
        }
        .birdy-chat-area {
          flex: 1; display: flex; flex-direction: column; overflow: hidden;
        }
        .birdy-messages {
          flex: 1; overflow-y: auto;
          padding: 16px 14px;
          display: flex; flex-direction: column; gap: 14px;
          scroll-behavior: smooth;
        }
        .birdy-messages::-webkit-scrollbar { width: 4px; }
        .birdy-messages::-webkit-scrollbar-track { background: transparent; }
        .birdy-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .birdy-empty {
          flex: 1; display: flex; align-items: center; justify-content: center;
          flex-direction: column; text-align: center; padding: 32px;
          color: rgba(255,255,255,0.3);
        }
        .birdy-empty-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, rgba(183,0,0,0.2), rgba(126,6,6,0.15));
          border: 1px solid rgba(183,0,0,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin: 0 auto 16px;
        }
        .birdy-empty-title {
          font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 17px;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.7); margin-bottom: 8px;
        }
        .birdy-empty-sub {
          font-family: 'Lato', sans-serif; font-size: 13px; line-height: 1.6;
          color: rgba(255,255,255,0.3);
        }
        .birdy-error {
          margin: 0 14px 10px;
          padding: 8px 12px;
          background: rgba(183,0,0,0.15);
          border: 1px solid rgba(183,0,0,0.3);
          border-radius: 8px;
          font-family: 'Lato', sans-serif; font-size: 12px;
          color: #ff8080;
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .birdy-streaming-indicator {
          padding: 0 14px 4px;
          font-family: 'Lato', sans-serif; font-size: 11px;
          color: rgba(232,201,107,0.5);
          letter-spacing: 0.06em;
          display: flex; align-items: center; gap: 6px;
        }
        @media (max-width: 480px) {
          .birdy-panel { width: 100vw; }
          .birdy-history-sidebar { width: 140px; }
        }
      `}</style>

      {/* Backdrop */}
      <div className="birdy-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="birdy-panel">

        {/* Header */}
        <div className="birdy-header">
          <div className="birdy-header-left">
            <button
              className="birdy-header-btn"
              onClick={() => setShowHistory(!showHistory)}
              title="Conversation history"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h12M2 8h8M2 12h10" strokeLinecap="round"/>
              </svg>
            </button>
            <div>
              <div className="birdy-title">Birdy</div>
              <div className="birdy-subtitle">Rayland AI Assistant</div>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <button
              className="birdy-header-btn"
              onClick={startNewConversation}
              title="New conversation"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7.5 2v11M2 7.5h11" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="birdy-header-btn" onClick={onClose} title="Close (Esc)">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l11 11M13 2L2 13" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="birdy-body">

          {/* Conversation history sidebar */}
          {showHistory && (
            <div className="birdy-history-sidebar">
              <div className="birdy-history-header">History</div>
              <button className="birdy-new-conv-btn" onClick={startNewConversation}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5.5 1v9M1 5.5h9" strokeLinecap="round"/>
                </svg>
                New chat
              </button>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`birdy-conv-item ${conv.id === activeConvId ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.id)}
                  title={conv.title ?? 'Conversation'}
                >
                  {conv.title ?? 'Conversation'}
                </div>
              ))}
              {!conversations.length && (
                <div style={{ padding:'12px', fontSize:11, color:'rgba(255,255,255,0.2)', fontFamily:'Lato,sans-serif' }}>
                  No conversations yet
                </div>
              )}
            </div>
          )}

          {/* Main chat area */}
          <div className="birdy-chat-area">
            <div className="birdy-messages">
              {!messages.length ? (
                <div className="birdy-empty">
                  <div className="birdy-empty-icon">🐦</div>
                  <div className="birdy-empty-title">Birdy is ready</div>
                  <div className="birdy-empty-sub">
                    Ask about open roles, recruiting tasks,<br />
                    or anything Rayland-related.
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id}>
                    {msg.isStreaming && !msg.content ? (
                      <TypingIndicator />
                    ) : (
                      <MessageBubble message={msg} />
                    )}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {isStreaming && (
              <div className="birdy-streaming-indicator">
                <TypingIndicator />
                <span>Birdy is responding…</span>
              </div>
            )}

            {error && (
              <div className="birdy-error">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', padding:0, fontSize:14 }}
                >×</button>
              </div>
            )}

            <ChatInput
              onSend={sendMessage}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>
    </>
  )
}
