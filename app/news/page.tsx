import type { Metadata } from 'next'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'
import { NewsletterForm } from '@/components/ccb/Forms'
import { news } from '@/lib/site-data'

export const metadata: Metadata = { title: 'News' }

export default function NewsPage() {
  return <main><SiteHeader />
    <PageHero eyebrow="News" title={<>Stories from Citrus<br />County <em>Harvest.</em></>} text="Newsletters, grant announcements, and updates from the schools and neighbors working together to feed local children." />
    <section className="section"><div className="container news-layout"><div><article className="featured-news"><p className="eyebrow">Newsletter</p><h2>Summer Newsletter 2026</h2><p>Posted September 18, 2026</p><a href="#news-list">Read the latest →</a></article><div id="news-list" className="news-list">{news.map((item) => <article key={item.title}><div><span>{item.category}</span><h3>{item.title}</h3></div><time>{item.date}</time></article>)}</div></div><aside className="newsletter-card"><p className="eyebrow">Stay connected</p><h2>Good news, delivered.</h2><p>Get program updates and stories of community impact in your inbox.</p><NewsletterForm /></aside></div></section>
    <SiteFooter /></main>
}

