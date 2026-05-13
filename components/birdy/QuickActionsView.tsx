'use client'
import { QUICK_ACTIONS, ACTION_CATEGORIES, type ActionCategory } from '@/lib/birdy/quick-actions'
import { useState } from 'react'

interface Props {
  onAction:       (prompt: string, actionKey: string) => void
  onRunWorkflow?: (workflowId: string, input: Record<string, unknown>) => void
  sessionId?:     string
}

const CATEGORY_ORDER: ActionCategory[] = ['recruiting', 'content', 'analysis', 'operations']

export default function QuickActionsView({ onAction }: Props) {
  const [activeCategory, setActiveCategory] = useState<ActionCategory | 'all'>('all')

  const filtered = activeCategory === 'all'
    ? QUICK_ACTIONS
    : QUICK_ACTIONS.filter(a => a.category === activeCategory)

  return (
    <>
      <style>{`
        .qa-wrap { flex: 1; overflow-y: auto; padding: 16px 14px 20px; }
        .qa-header { margin-bottom: 14px; }
        .qa-title { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.4); margin-bottom: 10px; }
        .qa-cats { display: flex; gap: 6px; flex-wrap: wrap; }
        .qa-cat-btn { font-family: 'Lato', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,.1); background: transparent; color: rgba(255,255,255,.4); cursor: pointer; transition: all .15s; }
        .qa-cat-btn:hover { border-color: rgba(183,0,0,.4); color: rgba(255,255,255,.75); }
        .qa-cat-btn.active { border-color: rgba(183,0,0,.6); background: rgba(183,0,0,.15); color: #e8c96b; }
        .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .qa-card { border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 13px; cursor: pointer; transition: all .15s; display: flex; flex-direction: column; gap: 6px; }
        .qa-card:hover { border-color: rgba(183,0,0,.5); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(5,9,49,.5); }
        .qa-icon { font-size: 20px; line-height: 1; }
        .qa-label { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.85); }
        .qa-desc { font-family: 'Lato', sans-serif; font-size: 11px; color: rgba(255,255,255,.35); line-height: 1.4; }
        .qa-arrow { font-size: 13px; color: rgba(183,0,0,.5); align-self: flex-end; margin-top: auto; }
        .qa-empty { text-align: center; padding: 32px 16px; color: rgba(255,255,255,.25); font-family: 'Lato', sans-serif; font-size: 13px; }
      `}</style>
      <div className="qa-wrap">
        <div className="qa-header">
          <div className="qa-title">Quick Actions</div>
          <div className="qa-cats">
            <button className={`qa-cat-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
            {CATEGORY_ORDER.map(cat => (
              <button key={cat} className={`qa-cat-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                {ACTION_CATEGORIES[cat]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length ? (
          <div className="qa-grid">
            {filtered.map(action => (
              <div key={action.key} className="qa-card" style={{ background: action.color + '30' }} onClick={() => onAction(action.prompt, action.key)}>
                <div className="qa-icon">{action.icon}</div>
                <div className="qa-label">{action.label}</div>
                <div className="qa-desc">{action.description}</div>
                <div className="qa-arrow">→</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="qa-empty">No actions in this category.</div>
        )}
      </div>
    </>
  )
}
