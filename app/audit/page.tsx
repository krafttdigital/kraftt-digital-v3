import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '../components/Footer';
import { JsonLd } from '../components/JsonLd';
import { RegionalPriceCopy } from '../components/PricingCurrencyProvider';
import { SiteHeader } from '../components/SiteHeader';
import { createPageMetadata, createPageSchema, serviceSchema } from '../data/seo';
import { AuditForm } from './AuditForm';

const pageTitle = 'Paid Digital Presence Audit | Kraftt Digital';
const pageDescription = 'Request a paid review of your brand, website, search presence and enquiry paths. The free introductory call is available separately.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/audit', label: 'Digital Presence Audit' });

const reviewed = [
  'Your business, category and current digital presence',
  'Website, brand, content and enquiry paths',
  'Relevant competitors and visible market gaps',
  'The clearest solution direction and next priority',
];

const deliverables = [
  { number: '01', title: 'Business findings', copy: 'A concise view of what is helping, what is unclear and what is missing.' },
  { number: '02', title: 'Competitor snapshot', copy: 'Relevant references that show where your digital presence is falling behind.' },
  { number: '03', title: 'Priority plan', copy: 'The most useful actions arranged by importance—not a generic list of services.' },
  { number: '04', title: 'Recommended scope', copy: 'A practical direction for what to fix, build or improve next.' },
];

export default function AuditPage() {
  return (
    <main className="audit-page">
      <JsonLd data={createPageSchema({
        name: pageTitle,
        description: pageDescription,
        path: '/audit',
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Digital Presence Audit', path: '/audit' }],
        entities: [serviceSchema({ name: 'Digital Presence Audit', description: pageDescription, path: '/audit' })],
      })} />
      <SiteHeader />

      <aside className="audit-attention-marquee" aria-label="Digital Presence Audit highlights">
        <div className="audit-attention-marquee-track" aria-hidden="true">
          {[0, 1].map((group) => (
            <div className="audit-attention-marquee-group" key={group}>
              {[0, 1].map((item) => (
                <span key={item}>
                  Digital Presence Audit <i>◆</i> Find the real gap first <i>◆</i> Research-led review <i>◆</i> Clear priorities <i>◆</i> No long brief <i>◆</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <section className="audit-hero audit-hero-form-first">
        <div className="audit-hero-copy">
          <p className="eyebrow eyebrow-dark">Digital Presence Audit</p>
          <h1>Know what deserves attention in your digital presence.</h1>
          <p>This paid review examines your business, competitors and current online presence, then explains the gaps and priorities. A free introductory call is available if you prefer to talk first.</p>
          <div className="audit-hero-price">
            <div><span>Fixed audit</span><strong><RegionalPriceCopy>₹999</RegionalPriceCopy></strong></div>
            <p>A separate paid service. You do not need an audit to discuss a project.</p>
          </div>
          <ul className="audit-hero-review-list">{reviewed.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="audit-hero-form-column" id="audit-form">
          <div className="audit-form-assurance">
            <span>Start here · 5 minutes</span>
            <strong>Share the essentials. We investigate the rest.</strong>
            <small>Secure form or WhatsApp · Payment instructions follow after scope confirmation</small>
          </div>
          <div className="audit-form-panel">
            <div className="audit-form-heading"><span><RegionalPriceCopy>₹999</RegionalPriceCopy></span><div><p className="eyebrow eyebrow-dark">Short guided form</p><h2>Tell us what feels unclear.</h2></div></div>
            <AuditForm />
          </div>
          <ol className="audit-hero-next-steps" aria-label="What happens next">
            <li><span>01</span> Send details</li><li><span>02</span> We research</li><li><span>03</span> Receive direction</li>
          </ol>
        </div>
      </section>

      <section className="audit-reassurance" aria-label="How the audit works">
        <div><span>01</span><strong>You share the essentials</strong><p>Short answers and one useful link are enough.</p></div>
        <div><span>02</span><strong>We do the research</strong><p>Business, competitors, trust and enquiry paths are reviewed.</p></div>
        <div><span>03</span><strong>You receive direction</strong><p>Clear findings, priorities and the right next scope.</p></div>
      </section>

      <section className="audit-deliverables">
        <div className="audit-section-heading"><p className="eyebrow eyebrow-dark">What you receive</p><h2>A decision-ready view—not another long report.</h2></div>
        <div className="audit-deliverable-grid">
          {deliverables.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}
        </div>
      </section>

      <section className="audit-explainer">
        <div><p className="eyebrow eyebrow-dark">Why the audit is paid</p><h2>Research deserves protected time.</h2><p><RegionalPriceCopy>The ₹999 fee lets Kraftt study the business properly instead of turning the exercise into a free speculative pitch.</RegionalPriceCopy></p></div>
        <div className="audit-next-steps"><p className="eyebrow eyebrow-dark">What happens next</p><ol><li><span>01</span><p><strong>Request reviewed</strong>Your details are checked for fit and completeness.</p></li><li><span>02</span><p><strong>Payment confirmed</strong>Payment instructions and any missing inputs are shared.</p></li><li><span>03</span><p><strong>Research begins</strong>Delivery format and timing are confirmed before work starts.</p></li></ol></div>
      </section>

      <p className="privacy-note audit-privacy">Requesting the audit does not take payment. We confirm scope, timing and payment instructions before research begins. Prefer to talk first? <Link href="/contact#intro-call">Request a Free Introductory Call</Link>. Form submissions are processed by Formspree; WhatsApp opens a message for your review. See the <Link href="/legal/privacy-policy">privacy policy</Link>.</p>
      <Footer />
    </main>
  );
}
