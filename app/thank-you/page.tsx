import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../components/SiteHeader';
import { RegionalPriceCopy } from '../components/PricingCurrencyProvider';
import { createPageMetadata } from '../data/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Audit Request Received | Kraftt Digital',
  description: 'Your Digital Presence Audit request has been received by Kraftt Digital.',
  path: '/thank-you',
  label: 'Request received',
  noIndex: true,
});

export default function ThankYouPage() {
  return (
    <main>
      <SiteHeader />
      <section className="thank-you-page section-dark">
        <p className="eyebrow">Request received</p>
        <h1>Thank you. The next step is a focused review, not a sales chase.</h1>
        <div className="thank-you-grid">
          <div><span>01</span><h2>Details checked</h2><p>Kraftt reviews the information you provided and confirms whether the audit is a fit.</p></div>
          <div><span>02</span><h2>Payment instructions shared</h2><p><RegionalPriceCopy>If the request is a fit, Kraftt confirms the required inputs and shares the ₹999 audit payment step.</RegionalPriceCopy></p></div>
          <div><span>03</span><h2>Research begins</h2><p>The delivery format and timing are confirmed after payment and complete business inputs are received.</p></div>
        </div>
        <Link className="button button-light" href="/">Return to Kraftt Digital</Link>
      </section>
    </main>
  );
}
