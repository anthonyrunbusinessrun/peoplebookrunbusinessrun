import Image from 'next/image'
import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-brand-row">
          <div className="footer-intro">
            <Image src="/ccb/logo.webp" width={170} height={65} alt="Citrus County Blessings" className="footer-logo" />
            <p>Providing nutritious food to schoolchildren on the weekends to eliminate childhood hunger in Citrus County.</p>
          </div>
          <div className="socials">
            <a href="https://facebook.com/citrusblessings/" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://x.com/citrusblessing" target="_blank" rel="noreferrer" aria-label="X">𝕏</a>
            <a href="https://instagram.com/citrusblessings/" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
          </div>
        </div>
        <div className="footer-grid">
          <div><h3>Our Efforts</h3><Link href="/about-us">About Us</Link><Link href="/about-us#weekend-hunger">Weekend hunger</Link><Link href="/about-us#summer-feeding">Summer Feeding Program</Link><Link href="/about-us">Food Recovery</Link></div>
          <div><h3>Contribute</h3><Link href="/how-to-help">How to Help</Link><a href="https://secure.qgiv.com/for/citruscountyblessings/">Donate</a><Link href="/how-to-help">Volunteer</Link><Link href="/events">Events</Link></div>
          <div><h3>Connect</h3><Link href="/news">News</Link><Link href="/contact-us">Contact Us</Link><Link href="/enrollment">Enrollment</Link></div>
          <div className="office-hours"><h3>Office Hours</h3><p><b>Monday - Friday</b><br />8:30 AM - 4:30 PM<br />3749 East Parsons Point Rd,<br />Hernando FL 34442</p><p><b>Mailing Address</b><br />P.O. Box 82, Lecanto FL 34460</p><div className="footer-contact"><p><b>Call Us</b><a href="tel:+13523417707">(352) 341-7707</a></p><p><b>Email</b><a href="mailto:info@citruscountyblessings.org">info@citruscountyblessings.org</a></p></div></div>
          <Image src="/ccb/candid-2026.jpg" width={108} height={108} alt="Candid Platinum Transparency 2026" className="candid-badge" />
        </div>
        <div className="legal">A copy of the official registration and financial information may be obtained from the Division of Consumer Services by calling toll-free 1-800-HELP-FLA or online at<br />www.FloridaConsumerHelp.com. Registration does not imply endorsement, approval, or recommendation by the state. Registration #: CH31055<br />Copyright 2026 © Citrus County Harvest</div>
      </div>
    </footer>
  )
}
