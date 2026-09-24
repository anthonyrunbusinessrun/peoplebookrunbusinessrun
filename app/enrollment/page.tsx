import type { Metadata } from 'next'
import { LockKeyhole } from 'lucide-react'
import SiteHeader from '@/components/ccb/SiteHeader'
import SiteFooter from '@/components/ccb/SiteFooter'
import PageHero from '@/components/ccb/PageHero'

export const metadata: Metadata = { title: 'Enrollment' }

export default function EnrollmentPage() {
  return <main><SiteHeader />
    <PageHero variant="enrollment" title="Enrollment" text="This area of the site is reserved for participating schools and program staff." />
    <section className="section enrollment-section"><div className="container"><article className="protected-card"><span className="lock-icon"><LockKeyhole /></span><h2>This content is password-protected</h2><p>Enrollment forms are shared directly with participating schools and families already in the program. If you&apos;re a school partner, please use the password provided by our office.</p><hr /><p>Want to enroll a child in the Blessings Program? Call <a href="tel:+13523417707"><b>(352) 341-7707</b></a>, email <a href="mailto:pa@citruscountyblessings.org"><b>pa@citruscountyblessings.org</b></a>, or contact the guidance department at your child&apos;s school.</p><a className="button" href="/contact-us">Contact Our Office</a></article></div></section>
    <SiteFooter /></main>
}
