import type { Metadata } from 'next'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'
import { ContactForm } from '@/components/ccb/Forms'

export const metadata: Metadata = { title: 'Contact Us' }

const faqs = [
  ['Who qualifies for weekend food support?', 'Students enrolled in free or reduced-price meal programs may be referred through their school. Contact us or your school counselor for confidential help.'],
  ['How do I donate food?', 'Call our office before drop-off so our team can confirm the items most urgently needed and arrange a convenient time.'],
  ['Can my group volunteer together?', 'Yes. Businesses, clubs, faith communities, and families can volunteer as a group. Tell us your preferred date and group size.'],
]

export default function ContactPage() {
  return <main><SiteHeader />
    <PageHero eyebrow="Contact us" title={<>We&apos;re here — reach out <em>any time.</em></>} text="Whether you need support, want to volunteer, or have a question about giving, our team is ready to help." />
    <section className="section"><div className="container form-section-grid"><div><h2>Frequently Asked Questions</h2><div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div><div className="contact-block"><h3>Visit or call</h3><p>3749 East Parsons Point Rd<br />Hernando, FL 34442</p><p><a href="tel:+13523417707">(352) 341-7707</a><br /><a href="mailto:info@citruscountyblessings.org">info@citruscountyblessings.org</a></p></div></div><ContactForm /></div></section>
    <section className="section soft-bg"><div className="container"><h2>Community Resources</h2><div className="resource-grid"><article><h3>Need food today?</h3><p>Call 2-1-1 for immediate local food and family resources.</p></article><article><h3>School-year support</h3><p>Ask your child&apos;s school counselor about the confidential Blessings program.</p></article><article><h3>Summer support</h3><p>Pre-enrollment is required for Feed the Kids. Our office can guide you.</p></article></div></div></section>
    <SiteFooter /></main>
}

