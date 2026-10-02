import Link from 'next/link';
import { bundles } from '../data/bundles';
import { contactEmail, contactPhone, contactPhoneHref, whatsappUrl } from '../data/site';
import { BrandWordmark } from './BrandWordmark';

const serviceLinks = [
  { href: '/services/web-design-development', label: 'Web Design & Development' },
  { href: '/services/brand-identity', label: 'Brand Identity & System' },
  { href: '/services/ecommerce-store-development', label: 'E-commerce Store Development' },
  { href: '/services/marketplace-catalogue-building', label: 'Marketplace Catalogue Building' },
  { href: '/services/ecommerce-seo', label: 'SEO Services' },
  { href: '/services/social-media-management', label: 'Social Media Strategy & Management' },
];

export function Footer() {
  return (
    <footer className="footer section-dark">
      <div className="footer-brand">
        <Link className="footer-logo" href="/" aria-label="Kraftt Digital home">
          <BrandWordmark inverse />
        </Link>
        <p>Branding, websites, e-commerce, marketplace setup, SEO and social media shaped around your business.</p>
        <Link className="button button-accent footer-cta" href="/contact#intro-call">Request a Free Introductory Call</Link>
        <div className="footer-contact-links" aria-label="Contact Kraftt Digital">
          <a href={`mailto:${contactEmail}`}><span>Email</span><strong>{contactEmail}</strong></a>
          <a href={contactPhoneHref}><span>Call</span><strong>{contactPhone}</strong></a>
          <a href={whatsappUrl('Hi Kraftt, I would like to request a free introductory call about my business.')} target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>{contactPhone}</strong></a>
        </div>
        <div className="footer-socials" aria-label="Kraftt Digital social profiles">
          <a href="https://www.instagram.com/krafttdigital" target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a>
          <a href="https://www.linkedin.com/company/krafttdigital" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="footer-desktop-column">
        <p className="footer-label">Services</p>
        {serviceLinks.map((service) => <Link key={service.href} href={service.href}>{service.label}</Link>)}
        <Link href="/services/landing-pages">Landing Pages</Link>
        <Link href="/services/app-development">App Development</Link>
        <Link href="/services/dashboards-internal-tools">Custom Software & Internal Tools</Link>
      </div>
      <div className="footer-desktop-column">
        <p className="footer-label">Bundles</p>
        {bundles.map((bundle) => <Link key={bundle.slug} href={`/services/bundles/${bundle.slug}`}>{bundle.name}</Link>)}
      </div>
      <div className="footer-desktop-column">
        <p className="footer-label">Kraftt</p>
        <Link href="/work">Work</Link>
        <Link href="/process">How We Work</Link>
        <Link href="/about">About</Link>
        <Link href="/partner-program">Partner Program</Link>
        <Link href="/tools">Tools</Link>
        <Link href="/audit">Paid Digital Presence Audit</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/legal/privacy-policy">Privacy policy</Link>
        <Link href="/legal/terms">Terms</Link>
      </div>
      <div className="footer-mobile-groups" aria-label="Footer navigation">
        <details>
          <summary>Services <span aria-hidden="true">+</span></summary>
          <div>
            {serviceLinks.map((service) => <Link key={service.href} href={service.href}>{service.label}</Link>)}
            <Link href="/services/landing-pages">Landing Pages</Link>
            <Link href="/services/app-development">App Development</Link>
            <Link href="/services/dashboards-internal-tools">Custom Software & Internal Tools</Link>
          </div>
        </details>
        <details>
          <summary>Bundles <span aria-hidden="true">+</span></summary>
          <div>{bundles.map((bundle) => <Link key={bundle.slug} href={`/services/bundles/${bundle.slug}`}>{bundle.name}</Link>)}</div>
        </details>
        <details>
          <summary>Kraftt <span aria-hidden="true">+</span></summary>
          <div>
            <Link href="/work">Work</Link>
            <Link href="/process">How We Work</Link>
            <Link href="/about">About</Link>
            <Link href="/partner-program">Partner Program</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/audit">Paid Digital Presence Audit</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/legal/privacy-policy">Privacy policy</Link>
            <Link href="/legal/terms">Terms</Link>
          </div>
        </details>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Kraftt Digital</span>
        <span>India · Working with clients worldwide</span>
      </div>
    </footer>
  );
}
