'use client'
import dynamic from 'next/dynamic'
import { QUICK_ACTIONS } from '@/lib/birdy/quick-actions'

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })

export interface MessageData {
  id:         string
  role:       'USER' | 'ASSISTANT' | 'user' | 'assistant'
  content:    string
  modelUsed?: string | null
  actionKey?: string | null
  isStreaming?: boolean
}

const MODEL_LABELS: Record<string, string> = {
  'claude-sonnet-4-20250514': 'Claude Sonnet',
  'phi4':                     'Phi-4',
  'deepseek-coder-v2:16b':    'DeepSeek Coder',
  'qwen3:32b':                'Qwen3',
}

export default function MessageBubble({ message }: { message: MessageData }) {
  const isUser  = message.role === 'USER' || message.role === 'user'
  const label   = message.modelUsed ? MODEL_LABELS[message.modelUsed] ?? message.modelUsed : null
  const action  = message.actionKey ? QUICK_ACTIONS.find(a => a.key === message.actionKey) : null

  return (
    <>
      <style>{`
        .msg-user { background: linear-gradient(135deg,#b70000,#7e0606); color:#fff; border-radius:14px 14px 4px 14px; padding:10px 14px; font-family:'Lato',sans-serif; font-size:14px; line-height:1.6; max-width:88%; word-break:break-word; align-self:flex-end; }
        .msg-asst { color:#e2e8f0; font-family:'Lato',sans-serif; font-size:14px; line-height:1.7; max-width:100%; word-break:break-word; }
        .msg-asst p { margin:0 0 10px; }
        .msg-asst p:last-child { margin-bottom:0; }
        .msg-asst ul,.msg-asst ol { margin:0 0 10px; padding-left:20px; }
        .msg-asst li { margin:3px 0; }
        .msg-asst strong { color:#e8c96b; font-weight:700; }
        .msg-asst em { color:#a0aec0; }
        .msg-asst h1,.msg-asst h2,.msg-asst h3 { color:#e8c96b; font-family:'Rajdhani',sans-serif; font-weight:700; letter-spacing:.05em; margin:14px 0 6px; text-transform:uppercase; }
        .msg-asst h1 { font-size:16px; }
        .msg-asst h2 { font-size:14px; }
        .msg-asst h3 { font-size:13px; }
        .msg-asst code { background:rgba(232,201,107,.12); color:#e8c96b; font-family:'Courier New',monospace; font-size:12px; padding:1px 5px; border-radius:4px; border:1px solid rgba(232,201,107,.2); }
        .msg-asst pre { background:#050931; border:1px solid rgba(232,201,107,.2); border-radius:8px; padding:12px 14px; overflow-x:auto; margin:10px 0; }
        .msg-asst pre code { background:none; border:none; color:#a8d8a8; font-size:12px; padding:0; }
        .msg-asst a { color:#8299c0; text-decoration:underline; }
        .msg-asst blockquote { border-left:3px solid #b70000; padding-left:12px; color:#8299c0; margin:8px 0; }
        .msg-asst table { border-collapse:collapse; width:100%; margin:8px 0; font-size:13px; }
        .msg-asst th { background:rgba(255,255,255,.07); color:#e8c96b; padding:6px 10px; text-align:left; border-bottom:1px solid rgba(255,255,255,.1); }
        .msg-asst td { padding:5px 10px; border-bottom:1px solid rgba(255,255,255,.05); }
        .msg-meta { display:flex; align-items:center; gap:8px; margin-top:6px; flex-wrap:wrap; }
        .msg-model-badge { font-family:'Lato',sans-serif; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.25); }
        .msg-action-badge { font-family:'Lato',sans-serif; font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; background:rgba(183,0,0,.15); color:rgba(232,201,107,.6); border:1px solid rgba(183,0,0,.25); border-radius:4px; padding:1px 6px; }
      `}</style>

      {isUser ? (
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <div>
            {action && (
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
                <span className="msg-action-badge">{action.icon} {action.label}</span>
              </div>
            )}
            <div className="msg-user">{message.content}</div>
          </div>
        </div>
      ) : (
        <div>
          <div className="msg-asst">
            {message.content ? <ReactMarkdown>{message.content}</ReactMarkdown> : null}
          </div>
          {(label || action) && (
            <div className="msg-meta">
              {label    && <span className="msg-model-badge">via {label}</span>}
              {action   && <span className="msg-action-badge">{action.icon} {action.label}</span>}
            </div>
          )}
        </div>
      )}
    </>
  )
}
