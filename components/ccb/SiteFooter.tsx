import Image from 'next/image'
import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-intro">
          <Image src="/ccb/logo.webp" width={170} height={65} alt="Citrus County Blessings" className="footer-logo" />
          <p>Providing nutritious food to schoolchildren on the weekends to eliminate childhood hunger in Citrus County.</p>
          <div className="socials">
            <a href="https://facebook.com/citrusblessings/" aria-label="Facebook">f</a>
            <a href="https://instagram.com/citrusblessings/" aria-label="Instagram">◎</a>
          </div>
        </div>
        <div className="footer-grid">
          <div><h3>Our Efforts</h3><Link href="/about-us">About Us</Link><Link href="/about-us#weekend-hunger">Weekend Hunger</Link><Link href="/about-us#summer-feeding">Summer Feeding Program</Link></div>
          <div><h3>Contribute</h3><Link href="/how-to-help">How to Help</Link><a href="https://secure.qgiv.com/for/citruscountyblessings/">Donate</a><Link href="/how-to-help#volunteer">Volunteer</Link><Link href="/events">Events</Link></div>
          <div><h3>Connect</h3><Link href="/news">News</Link><Link href="/contact-us">Contact Us</Link><Link href="/enrollment">Enrollment</Link></div>
          <div><h3>Office Hours</h3><p>Monday – Friday<br />8:30 AM – 4:30 PM<br />3749 East Parsons Point Rd,<br />Hernando, FL 34442</p><p className="footer-contact"><a href="tel:+13523417707">(352) 341-7707</a><br /><a href="mailto:info@citruscountyblessings.org">info@citruscountyblessings.org</a></p></div>
        </div>
      </div>
      <div className="container legal">A COPY OF THE OFFICIAL REGISTRATION AND FINANCIAL INFORMATION MAY BE OBTAINED FROM THE DIVISION OF CONSUMER SERVICES BY CALLING TOLL-FREE 1-800-HELP-FLA OR ONLINE AT FLORIDACONSUMERHELP.COM. REGISTRATION DOES NOT IMPLY ENDORSEMENT, APPROVAL, OR RECOMMENDATION BY THE STATE. REGISTRATION #: CH31055<br />Copyright 2026 © Citrus County Harvest</div>
    </footer>
  )
}
