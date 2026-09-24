import type { Metadata } from 'next'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'

export const metadata: Metadata = { title: 'How to Help' }

const ways = [
  { number: '01', label: 'Donate Your Treasure', title: 'Donating is a selfless act.', text: 'Giving back to our children in need makes an impact on their lives and their future. Will you join us in this essential fight against food insecurity, so every child comes to school ready to learn and excel?', action: 'Donate Now', href: 'https://secure.qgiv.com/for/citruscountyblessings/' },
  { number: '02', label: 'Donate Your Time', title: 'Volunteering is awesome — it changes lives, including yours.', text: 'Volunteers are the glue that holds our organization together, connecting you to community and giving you a sense of purpose. Even helping with the smallest tasks can make a real difference to the children we serve.', action: 'Volunteer With Us', href: '/contact-us' },
  { number: '03', label: 'Donate Your Talent', title: 'How do you best offer your talents?', text: 'Talents we overlook in ourselves are often needed and appreciated by others — organizing skills, data entry, creative fundraising, board service, raising awareness through social media, gathering supplies. The list is limitless.', action: 'Offer Your Talent', href: '/contact-us' },
]

export default function HelpPage() {
  return <main><SiteHeader />
    <PageHero variant="help" title={<>Donating is a selfless act.<br />It shapes a child&apos;s future.</>} text="Your support helps us fight hunger and provide nutritious meals to 2,600+ children every weekend—giving them the nourishment they need to grow and thrive." />
    <section className="section steps-section"><div className="container help-steps">{ways.map(({ number, label, title, text, action, href }, index) => <article key={number} className={`help-step help-step-${index + 1}`}><span className="step-number">{number}</span><div><p className="eyebrow">{label}</p><h2>{title}</h2><p>{text}</p><a className={`button${index ? ' button-outline' : ''}`} href={href}>{action}</a></div></article>)}</div></section>
    <SiteFooter /></main>
}
