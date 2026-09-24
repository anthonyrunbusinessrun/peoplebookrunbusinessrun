import type { ReactNode } from 'react'

export default function PageHero({ eyebrow, title, text, children }: { eyebrow?: string; title: ReactNode; text?: string; children?: ReactNode }) {
  return (
    <section className="page-hero dotted-bg">
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p className="lede">{text}</p>}
        {children}
      </div>
    </section>
  )
}

