import type { ReactNode } from 'react'

export default function PageHero({ eyebrow, title, text, children, variant }: { eyebrow?: string; title: ReactNode; text?: string; children?: ReactNode; variant?: 'about' | 'help' | 'events' | 'news' | 'contact' | 'enrollment' }) {
  return (
    <section className={`page-hero dotted-bg${variant ? ` page-hero-${variant}` : ''}`}>
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p className="lede">{text}</p>}
        {children}
      </div>
    </section>
  )
}
