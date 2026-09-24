import type { Metadata } from 'next'
import { Gift, HandHeart, Sparkles } from 'lucide-react'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'
import { VolunteerForm } from '@/components/ccb/Forms'

export const metadata: Metadata = { title: 'How to Help' }

const ways = [
  { number: '01', icon: Gift, label: 'Donate your treasure', title: 'Donating is a selfless act.', text: 'Giving back to children in need makes an impact on their lives and future. Every contribution turns into reliable food security.', action: 'Donate now', href: 'https://secure.qgiv.com/for/citruscountyblessings/' },
  { number: '02', icon: HandHeart, label: 'Donate your time', title: 'Volunteering creates change.', text: 'Pack food bags, help at events, transport supplies, or lend a hand in the office. One hour can change a whole weekend.', action: 'Volunteer', href: '#volunteer' },
  { number: '03', icon: Sparkles, label: 'Donate your talent', title: 'Your skills can feed a future.', text: 'From organization and repairs to creative fundraising and communications, your expertise can multiply our reach.', action: 'Contact us', href: '/contact-us' },
]

export default function HelpPage() {
  return <main><SiteHeader />
    <PageHero eyebrow="How to help" title={<>Donating is a selfless act.<br />It shapes a child&apos;s future.</>} text="Your support helps us fight hunger and provide nutritious meals to 2,600+ children every weekend—giving them the nourishment they need to grow and thrive." />
    <section className="section steps-section"><div className="container">{ways.map(({ number, icon: Icon, label, title, text, action, href }) => <article key={number} className="help-step"><span className="step-number">{number}</span><div><p className="eyebrow"><Icon size={16} /> {label}</p><h2>{title}</h2><p>{text}</p><a className="button" href={href}>{action}</a></div></article>)}</div></section>
    <section id="volunteer" className="section soft-bg"><div className="container form-section-grid"><div><p className="eyebrow">Give your time</p><h2>A small task can make a lasting difference.</h2><p>Volunteer opportunities include food packing, deliveries, event support, administrative help, and seasonal projects. Tell us when and how you&apos;d like to help.</p></div><VolunteerForm /></div></section>
    <SiteFooter /></main>
}

