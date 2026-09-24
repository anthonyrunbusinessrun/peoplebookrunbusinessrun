import type { Metadata } from 'next'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'
import { news } from '@/lib/site-data'

export const metadata: Metadata = { title: 'News' }

const archive = ['Sep 2026', 'Jul 2026', 'Jun 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026', 'Dec 2025', 'Nov 2025', 'Sep 2025', 'Aug 2025', 'Aug 2024', 'Jun 2024', 'Jan 2024', 'Sep 2023', 'Aug 2023', 'Jul 2023', 'Jun 2023', 'May 2023', 'Apr 2023', 'Mar 2023', 'Feb 2023', 'Jan 2023', '2022']

export default function NewsPage() {
  return <main><SiteHeader />
    <PageHero variant="news" title={<>Stories from Citrus<br />County Harvest.</>} text="Newsletters, grant announcements, and updates from the schools and community we serve." />
    <section className="section news-section"><div className="container news-layout"><div><article className="featured-news"><p className="eyebrow">Newsletter</p><h2>Summer Newsletter 2026</h2><p>Posted September 18, 2026</p></article><div className="news-list">{news.map((item) => <article key={item.title}><h3>{item.title}</h3><time>{item.date}</time></article>)}</div></div><aside className="news-sidebar"><section><h2>Categories</h2><div className="filter-pills"><span>In the News</span><span>Newsletters</span><span>Updates</span></div></section><section className="archive-card"><h2>Archive</h2><div>{archive.map((date) => <span key={date}>{date}</span>)}</div></section></aside></div></section>
    <SiteFooter /></main>
}
