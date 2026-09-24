import type { Metadata } from 'next'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'

export const metadata: Metadata = { title: 'Contact Us' }

const faqs = [
  ['Is your organization a food pantry?', <>No, we are not a public food pantry, but you can find resources and a list of food pantries in our county by visiting <a href="https://www.feed352.org/" target="_blank" rel="noreferrer">www.feed352.org</a>.</>],
  ['How can I sign up for the Blessings Program?', <>You can reach out to our office directly by calling <a href="tel:+13523417707">352-341-7707</a> or emailing <a href="mailto:pa@citruscountyblessings.org">pa@citruscountyblessings.org</a>. You can also contact the guidance department at your child&apos;s school.</>],
]

const contactDetails = [
  ['Office', <>3749 East Parsons Point Rd,<br />Hernando FL 34442</>],
  ['Mailing', <>P.O. Box 82,<br />Lecanto FL 34460</>],
  ['Phone', <a href="tel:+13523417707"><b>(352) 341-7707</b></a>],
  ['Email', <a href="mailto:info@citruscountyblessings.org">info@citruscountyblessings.org</a>],
  ['Hours', <>Mon–Fri, 8:30 AM–4:30 PM</>],
]

const resources = [
  { title: 'Dial 211 for Community Services', text: 'Dialing 211 connects you with expert, compassionate assistance, and every call is completely confidential.', href: 'https://211.org/' },
  { title: 'USDA National Hunger Hotline', text: 'Managed by Hunger Free America, the hotline connects callers with emergency food providers, government assistance programs, and social services. Call 1-866-3-HUNGRY or 1-877-8-HAMBRE (Spanish), Mon–Fri, 7am–10pm ET.', href: 'https://www.fns.usda.gov/national-hunger-hotline' },
  { title: 'National Assistance Information', text: 'The Community Alliance of Citrus County provides a detailed resource directory featuring local agencies and organizations that offer assistance and information.', href: 'https://communityalliancecitrus.org/' },
]

export default function ContactPage() {
  return <main><SiteHeader />
    <PageHero variant="contact" title={<>We&apos;re here — reach out<br />any time.</>} text="Questions about the Blessings program, volunteering, or giving? Our office and the resources below are ready to help." />
    <section className="section contact-section"><div className="container contact-grid"><div><h2>Frequently Asked Questions</h2><div className="faq-list">{faqs.map(([q, a]) => <article key={q as string}><h3><span>Q.</span> {q}</h3><p>{a}</p></article>)}</div></div><div><div className="contact-card">{contactDetails.map(([label, value]) => <div key={label as string}><b>{label}</b><span>{value}</span></div>)}</div><a className="button give-button" href="https://secure.qgiv.com/for/citruscountyblessings/">Ways to Give</a></div></div></section>
    <section className="section resources-section"><div className="container"><p className="eyebrow">More Information</p><h2>Community Resources</h2><div className="resource-grid">{resources.map((resource) => <article key={resource.title}><h3>{resource.title}</h3><p>{resource.text}</p><a className="button button-outline" href={resource.href} target="_blank" rel="noreferrer">More Information</a></article>)}</div></div></section>
    <SiteFooter /></main>
}
