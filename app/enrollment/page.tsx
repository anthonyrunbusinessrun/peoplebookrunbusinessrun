import type { Metadata } from 'next'
import { LockKeyhole } from 'lucide-react'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'
import { EnrollmentForm } from '@/components/ccb/Forms'

export const metadata: Metadata = { title: 'Enrollment' }

export default function EnrollmentPage() {
  return <main><SiteHeader />
    <PageHero eyebrow="Enrollment" title="Enrollment" text="A little help can make weekends and school breaks feel more secure." />
    <section className="section enrollment-intro"><div className="container narrow"><LockKeyhole /><h2>It&apos;s more than a packed food bag.</h2><p>It is the freedom to learn, play, and grow without wondering where the next meal will come from. Program enrollment is confidential. Submit the request below or call us at (352) 341-7707.</p></div></section>
    <section className="section soft-bg"><div className="container narrow"><EnrollmentForm /></div></section>
    <SiteFooter /></main>
}

