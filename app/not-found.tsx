import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from './components/Footer';
import { SiteHeader } from './components/SiteHeader';

export const metadata: Metadata = {
  title: 'Page Not Found | Kraftt Digital',
  description: 'The page you requested could not be found. Explore Kraftt Digital services, selected work or request a free introductory call.',
  robots: { index: false, follow: true },
};

const routes = [
  {
    number: '01',
    label: 'Selected work',
    description: 'See documented websites, brands and connected digital systems.',
    href: '/work',
  },
  {
    number: '02',
    label: 'Services',
    description: 'Find the focused service or connected bundle that fits the need.',
    href: '/services',
  },
  {
    number: '03',
    label: 'Free Introductory Call',
    description: 'Tell us what you need and discuss a sensible next step.',
    href: '/contact',
  },
];

export default function NotFound() {
  return (
    <main className="not-found-page">
      <SiteHeader />

      <section className="not-found-shell" aria-labelledby="not-found-title">
        <div className="not-found-meta">
          <p>404 · Route not found</p>
          <span>Kraftt Digital</span>
        </div>

        <div className="not-found-hero">
          <div className="not-found-copy">
            <p className="eyebrow eyebrow-dark">The path ends here</p>
            <h1 id="not-found-title">This page went<br /><em>off route.</em></h1>
            <p>The link may be outdated, the address may be incomplete, or the page may have moved. The useful parts of Kraftt are still close by.</p>
            <div className="not-found-actions">
              <Link className="button button-accent" href="/">Return home <span aria-hidden="true">→</span></Link>
              <Link className="button button-outline-dark" href="/contact">Ask for direction <span aria-hidden="true">↗</span></Link>
            </div>
          </div>

          <div className="not-found-mark" aria-hidden="true">
            <span>04</span>
            <strong>404</strong>
            <i />
            <p>Research · Direction · Delivery</p>
          </div>
        </div>

        <div className="not-found-routes" aria-label="Useful destinations">
          <div className="not-found-routes-intro">
            <p className="eyebrow eyebrow-dark">Continue somewhere useful</p>
            <span>Three clear next steps.</span>
          </div>
          {routes.map((route) => (
            <Link href={route.href} key={route.href}>
              <span>{route.number}</span>
              <h2>{route.label}</h2>
              <p>{route.description}</p>
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
