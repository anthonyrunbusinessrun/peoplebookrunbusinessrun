import type { Metadata } from 'next'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'
import { events } from '@/lib/site-data'

export const metadata: Metadata = { title: 'Events' }

export default function EventsPage() {
  return <main><SiteHeader />
    <PageHero eyebrow="Events" title={<>Where the community comes <em>together.</em></>} text="Every event on this list helped fill the hunger gap a little more — thank you to everyone who showed up, played, danced, and gave." />
    <section className="section"><div className="container narrow"><h2>Community fundraisers</h2><div className="event-list">{events.map((event) => <article key={event.title}><div><span>{event.kind}</span><h3>{event.title}</h3><p>{event.date}</p></div>{event.raised && <div className="raised"><small>Raised</small><strong>{event.raised}</strong></div>}</article>)}</div></div></section>
    <section className="section coral-banner"><div className="container"><h2>Have an event idea?</h2><p>We love partnering with local businesses, clubs, and neighbors.</p><a className="button button-light" href="/contact-us">Plan with us</a></div></section>
    <SiteFooter /></main>
}

