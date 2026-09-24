import type { Metadata } from 'next'
import Image from 'next/image'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'
import { board, staff } from '@/lib/site-data'

export const metadata: Metadata = { title: 'About Us' }

export default function AboutPage() {
  return <main><SiteHeader />
    <PageHero eyebrow="Our story" title={<>We&apos;re Citrus County Harvest, known through our two <em>food security programs.</em></>} text="A 501(c)(3) organization battling food insecurity in Citrus County since 1999 — rescuing surplus food, then focusing our energy on the children who need it most." />
    <section className="section"><div className="container"><h2>Two programs. One name families know: Blessings.</h2>
      <div className="program-list">
        <article id="weekend-hunger"><Image src="/ccb/program-weekend.webp" width={600} height={420} alt="Weekend Hunger program" /><div><span className="tag coral">Silencing weekend hunger</span><h3>Silencing Weekend Hunger</h3><p>Our Blessings program is dedicated to silencing the weekend hunger of local children in need. Each week during the school year, participants receive a bag of food to take home for the weekend. Students enrolled in the federally funded free or reduced breakfast and lunch program are eligible to participate.</p><a className="button button-outline" href="https://secure.qgiv.com/for/citruscountyblessings/">Support this program</a></div></article>
        <article id="summer-feeding"><Image src="/ccb/program-summer.webp" width={600} height={420} alt="Summer Feeding program" /><div><span className="tag green">Feed the kids</span><h3>Summer Feeding Program</h3><p>Hunger doesn&apos;t take vacation. Feed the Kids provides fresh produce to children during summer break. Families receive produce once a week for five weeks from convenient locations across the county.</p><a className="button button-outline" href="https://secure.qgiv.com/for/citruscountyblessings/">Support this program</a></div></article>
      </div>
    </div></section>
    <section className="section soft-bg"><div className="container"><h2>Our Staff</h2><div className="people-grid">{staff.map(([initials, name, role]) => <article key={name}><span>{initials}</span><h3>{name}</h3><p>{role}</p></article>)}</div></div></section>
    <section className="section"><div className="container"><h2>Our Board of Directors</h2><div className="board-grid">{board.map(([name, role]) => <div key={name}><b>{name}</b><span>{role}</span></div>)}</div></div></section>
    <SiteFooter /></main>
}

