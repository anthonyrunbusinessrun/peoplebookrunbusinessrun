import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, UserRound } from 'lucide-react'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="home-hero dotted-bg">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Citrus County Harvest&nbsp;&nbsp;•&nbsp;&nbsp;Est. 2004</p>
            <h1>When kids go hungry,<br /><em>everything else stops.</em></h1>
            <p>Help us close the <strong>$13.8 million hunger gap</strong> in Citrus County — one weekend bag, one summer of fresh produce, one kid at a time.</p>
            <div className="button-row"><a className="button" href="https://secure.qgiv.com/for/citruscountyblessings/">Donate now</a><Link className="button button-outline" href="/how-to-help#volunteer">Volunteer</Link></div>
          </div>
          <div className="hero-figma-art">
            <Image src="/ccb/hero-figma.jpg" width={620} height={520} sizes="(max-width: 800px) 90vw, 620px" alt="A smiling child enjoying a meal, with 2,600 students supported weekly across Citrus County" priority />
          </div>
        </div>
      </section>

      <section className="section mission-section">
        <div className="container split-grid">
          <div>
            <span className="quote-mark">“</span>
            <h2 className="quote-heading">Rescuing surplus food and redirecting it to neighbors in need — <em>that legacy remains</em> at the heart of our mission.</h2>
            <p>We started out rescuing surplus food for neighbors in need — and that spirit still drives everything we do. As our community changed, so did we: that first program grew into a trusted partner&apos;s hands, freeing us to focus where we could help most.</p>
          </div>
          <div className="timeline-card">
            <div><b>1999</b><span>Founded as a 501(c)(3) battling food insecurity in Citrus County.</span></div>
            <div><b>Then</b><span>Began as a food recovery program, rescuing surplus food for neighbors in need.</span></div>
            <div><b>Now</b><span>Focused on local children and families, through weekend and summer feeding programs.</span></div>
          </div>
        </div>
      </section>

      <section className="section statistic-section soft-bg">
        <div className="container split-grid stat-grid">
          <div>
            <h2>Nearly <em>80% of kids</em> in Citrus County&apos;s public schools depend on free or reduced-price meals just to eat.</h2>
            <p>Our priority remains focusing efforts where standard school safety nets dissolve. By coordinating weekend meal boxes directly with counselors, we ensure children have continuous stability outside the classroom.</p>
            <div className="pill-row"><span>3 core programs</span><span>Established 1999</span><span>31 local schools</span></div>
          </div>
          <div className="photo-stack"><Image src="/ccb/kids-1.webp" width={340} height={420} alt="A child supported by Blessings" /><Image src="/ccb/kids-2.webp" width={340} height={420} alt="Children receiving food bags" /></div>
        </div>
      </section>

      <section className="section programs-section dotted-bg">
        <div className="container">
          <h2>Two programs. One goal: no child hungry.</h2>
          <div className="program-grid">
            <article className="program-card">
              <div className="program-image"><Image src="/ccb/program-weekend.webp" fill sizes="50vw" alt="Silencing Weekend Hunger program" /></div>
              <div className="program-body"><span className="tag coral">Providing food for over 2,600 local students.</span><h3>Silencing Weekend Hunger</h3><p>Sending students home with food on weekends and breaks to silence weekend hunger and help food-insecure children across Citrus County.</p><Link href="/about-us#weekend-hunger">Learn more →</Link></div>
            </article>
            <article className="program-card">
              <div className="program-image"><Image src="/ccb/program-summer.webp" fill sizes="50vw" alt="Summer Feeding Program" /></div>
              <div className="program-body"><span className="tag green">Fresh produce every week over the summer.</span><h3>Summer Feeding Program</h3><p>Hunger doesn&apos;t take vacation. Feed the Kids provides fresh produce during the summer months to children in need.</p><Link href="/about-us#summer-feeding">Learn more →</Link></div>
            </article>
          </div>
        </div>
      </section>

      <section className="section giving-section">
        <div className="container">
          <p className="spark">✣</p>
          <h2>Donating is a selfless act. It shapes a child&apos;s future.</h2>
          <p className="section-lede">Choose how you would like to make an impact. We rescue raw inventory, run volunteer packaging pipelines, and transform public monetary gifts directly into food security.</p>
          <div className="giving-grid">
            <article><Heart /><h3>Donate Your Treasure</h3><p>Every gift funds weekend food bags and summer produce for a child who needs it.</p><a href="https://secure.qgiv.com/for/citruscountyblessings/">Donate</a></article>
            <article><UserRound /><h3>Donate Your Time</h3><p>Volunteers are the glue that holds our organization together. Every small task changes lives.</p><Link href="/how-to-help#volunteer">Volunteer</Link></article>
            <article><Star /><h3>Donate Your Talent</h3><p>Organizing, data entry, creative fundraising, repair work — your talents are limitless.</p><Link href="/contact-us">Get involved</Link></article>
          </div>
        </div>
      </section>

      <section className="section sponsors soft-bg">
        <div className="container"><h2>Our Sponsors</h2><p>These programs are made possible by the generosity of these organizations.</p><div className="sponsor-grid">{Array.from({ length: 6 }, (_, i) => <div key={i}><Image src={`/ccb/sponsor-${i + 1}.png`} width={150} height={150} alt={`Community sponsor ${i + 1}`} /></div>)}</div></div>
      </section>

      <section className="section final-cta dotted-bg"><div className="container"><h2>Children need help.<br /><em>Harvest helps.</em> You can too.</h2><div className="button-row center"><a className="button" href="https://secure.qgiv.com/for/citruscountyblessings/">Donate now</a><Link className="button button-outline" href="/how-to-help">How to help</Link></div></div></section>
      <SiteFooter />
    </main>
  )
}
