import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Check, Clock3, X } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { JsonLd } from '../../components/JsonLd';
import { Reveal } from '../../components/Reveal';
import { SiteHeader } from '../../components/SiteHeader';
import { formatInr, getFeaturedOffer, isOfferClaimable } from '../../data/offers';
import { projectBySlug } from '../../data/projects';
import { absoluteUrl, createPageMetadata, createPageSchema, faqSchema, serviceSchema } from '../../data/seo';
import { OfferClaimCta, OfferValidity } from '../OfferAvailability';
import { OfferEnquiryForm } from '../OfferEnquiryForm';
import { OfferProofCarousel } from '../OfferProofCarousel';
import { PageFaq } from '@/components/ui/faq-6';

export const dynamic = 'force-dynamic';

const offer = getFeaturedOffer();
const offerFaqs = [
  { question: 'What is included in the ₹30,000 offer?', answer: 'A five-page responsive website, the listed brand identity deliverables and the first month of social media for one platform.' },
  { question: 'Are third-party costs included?', answer: 'No. Hosting, domains, subscriptions, advertising spend and other external costs are excluded.' },
  { question: 'How long is the offer available?', answer: 'The offer is available through Diwali, 8 November 2026, India time.' },
  { question: 'What happens after I enquire?', answer: 'Kraftt checks fit, confirms the final scope and timeline, and shares the proposal directly. No payment is taken through this form.' },
];

export function generateMetadata(): Metadata {
  const active = isOfferClaimable(offer);
  const description = active
    ? `Get a five-page website, brand identity and first month of social media for ${formatInr(offer.offerPrice)}. Festive offer available through Diwali 2026.`
    : 'Enquire about a coordinated Kraftt Digital website, brand identity and social launch.';

  return createPageMetadata({
    title: `Festive Season Offer | Website, Brand & Social for ${formatInr(offer.offerPrice)} | Kraftt Digital`,
    description,
    path: offer.pagePath,
    label: active ? 'Festive season offer' : 'Kraftt Digital offer',
  });
}

export default function FestiveSeasonOfferPage() {
  const initialExpired = !isOfferClaimable(offer);
  const pageUrl = absoluteUrl(offer.pagePath);
  const totalBenefit = offer.individualServiceValue - offer.offerPrice;
  const proofProjects = offer.proofProjectSlugs.flatMap((slug) => {
    const project = projectBySlug(slug);
    if (!project?.hero) return [];

    return [{
      slug: project.slug,
      name: project.name,
      projectType: project.projectType,
      industry: project.industry,
      hero: project.hero,
    }];
  });
  const description = `${offer.name}: a five-page website, brand identity and first month of social media for ${formatInr(offer.offerPrice)}.`;
  const marqueeMessage = initialExpired
    ? `${offer.name} · Campaign closed · General project enquiries are open`
    : `${offer.name} · Website + Brand + Social · ${formatInr(offer.offerPrice)} · Total benefit ${formatInr(totalBenefit)} · Valid through ${offer.expiryLabel}`;

  return (
    <main className="campaign-offer-page">
      <JsonLd data={createPageSchema({
        name: `${offer.name} Festive Season Offer`,
        description,
        path: offer.pagePath,
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Festive season offer', path: offer.pagePath }],
        entities: [serviceSchema({ name: offer.name, description, path: offer.pagePath }), faqSchema(offerFaqs, offer.pagePath)],
      })} />
      <SiteHeader />

      <aside className="campaign-offer-marquee" aria-label={marqueeMessage}>
        <div className="campaign-offer-marquee-track" aria-hidden="true">
          {[0, 1].map((group) => (
            <div className="campaign-offer-marquee-group" key={group}>
              {[0, 1, 2].map((item) => <span key={item}>{marqueeMessage}<i>◆</i></span>)}
            </div>
          ))}
        </div>
      </aside>

      <section className="campaign-conversion-hero" aria-labelledby="campaign-offer-title">
        <div className="campaign-offer-summary">
          <div className="campaign-offer-kicker">
            <span>Festive season offer</span>
            <OfferValidity expiresAt={offer.expiresAt} expiryLabel={offer.expiryLabel} initialExpired={initialExpired} />
          </div>
          <p className="eyebrow eyebrow-dark">{offer.name}</p>
          <h1 id="campaign-offer-title">Website. Brand. Social.<br /><em>One clear launch.</em></h1>
          <p className="campaign-offer-lede">A complete digital launch for businesses ready to look credible, get discovered and start receiving enquiries.</p>

          <div className="campaign-offer-price-row">
            <div className="campaign-offer-price"><span>Festive offer</span><strong>{formatInr(offer.offerPrice)}</strong></div>
            <div className="campaign-offer-saving">
              <span>Your total benefit {formatInr(totalBenefit)}</span>
              <p><s>{formatInr(offer.regularBundlePrice)}</s> regular bundle</p>
              <p><s>{formatInr(offer.individualServiceValue)}</s> individual value</p>
            </div>
          </div>

          <ul className="campaign-quick-value" aria-label="Offer highlights">
            <li><Check size={15} aria-hidden="true" /> Five-page website</li>
            <li><Check size={15} aria-hidden="true" /> Complete brand identity</li>
            <li><Check size={15} aria-hidden="true" /> First month of social</li>
          </ul>

          <div className="campaign-motion-card">
            <video autoPlay loop muted playsInline preload="auto" aria-hidden="true">
              <source src="/assets/offers/shopping-options.mp4" type="video/mp4" />
            </video>
            <div><span>One coordinated offer</span><strong>Website + brand + social</strong></div>
          </div>
          <a className="campaign-detail-link" href="#what-you-get">See everything included <span aria-hidden="true">↓</span></a>
        </div>

        <div className="campaign-form-column" id="offer-enquiry">
          <div className="campaign-form-assurance">
            <span>Website + Brand + First month Social</span>
            <strong>{formatInr(offer.offerPrice)} · Enquire in under two minutes.</strong>
            <small>No payment now · No long brief · Direct reply</small>
          </div>
          <OfferEnquiryForm offer={offer} pageUrl={pageUrl} initialExpired={initialExpired} compact />
          <ol className="campaign-next-steps" aria-label="What happens next">
            <li><span>01</span> Send interest</li><li><span>02</span> We check fit</li><li><span>03</span> Receive proposal</li>
          </ol>
        </div>
      </section>

      <section className="campaign-inclusions" id="what-you-get" aria-labelledby="campaign-inclusions-title">
        <Reveal className="campaign-section-heading">
          <div><p className="eyebrow eyebrow-dark">Everything included · 01—03</p><h2 id="campaign-inclusions-title">Three launch essentials.<br /><em>One clear investment.</em></h2></div>
          <p>One team coordinates the customer-facing pieces your business needs to launch with clarity.</p>
        </Reveal>
        <div className="campaign-inclusions-grid">
          {offer.inclusions.map((inclusion, index) => (
            <Reveal className="campaign-inclusion-card" key={inclusion.id} delay={index * 0.07}>
              <div><span>{String(index + 1).padStart(2, '0')}</span><small>{inclusion.items.length} inclusions</small></div>
              <h3>{inclusion.title}</h3><p>{inclusion.summary}</p>
              <ul>{inclusion.items.map((item) => <li key={item}><Check size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul>
            </Reveal>
          ))}
        </div>
        <Reveal className="campaign-value-bar">
          <div><span>You receive</span><strong>Website + Branding + Social</strong></div>
          <div><span>Festive investment</span><strong>{formatInr(offer.offerPrice)}</strong></div>
          <OfferClaimCta expiresAt={offer.expiresAt} initialExpired={initialExpired} />
        </Reveal>
      </section>

      <section className="campaign-fit" aria-labelledby="campaign-fit-title">
        <Reveal className="campaign-fit-intro" direction="left">
          <p className="eyebrow">Who this is for</p><h2 id="campaign-fit-title">Best for a business ready to launch—not keep planning.</h2>
          <p>Choose this offer when you need a credible first presence across website, identity and social together.</p>
          <OfferClaimCta expiresAt={offer.expiresAt} initialExpired={initialExpired} />
        </Reveal>
        <div className="campaign-fit-cards">
          <Reveal className="campaign-fit-card is-positive"><strong><Check size={18} aria-hidden="true" /> Strong fit</strong><ul>{offer.bestFor.map((item) => <li key={item}><Check size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul></Reveal>
          <Reveal className="campaign-fit-card" delay={0.07}><strong><X size={18} aria-hidden="true" /> Better with another scope</strong><ul>{offer.notFor.map((item) => <li key={item}><X size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul><Link href="/services">See other services <ArrowUpRight size={14} aria-hidden="true" /></Link></Reveal>
        </div>
      </section>

      <section className="campaign-proof" aria-labelledby="campaign-proof-title">
        <Reveal className="campaign-section-heading">
          <div><p className="eyebrow eyebrow-dark">Genuine project proof</p><h2 id="campaign-proof-title">See the kind of work<br /><em>your launch can build on.</em></h2></div>
          <p>Real Kraftt projects combining websites, identity, content and enquiry journeys.</p>
        </Reveal>
        <Reveal>
          <OfferProofCarousel projects={proofProjects} />
        </Reveal>
      </section>

      <section className="campaign-terms" aria-labelledby="campaign-terms-title">
        <Reveal className="campaign-terms-card" direction="left">
          <Clock3 size={22} aria-hidden="true" /><div><p className="eyebrow">Offer terms</p><h2 id="campaign-terms-title">Clear before you enquire.</h2><ul>{offer.terms.map((term) => <li key={term}><Check size={14} aria-hidden="true" /><span>{term}</span></li>)}</ul></div>
        </Reveal>
      </section>

      <section className="page-faq-section campaign-page-faq" aria-labelledby="campaign-faq-title"><div className="page-faq-inner">
        <Reveal className="page-faq-heading" direction="left"><div><p className="eyebrow eyebrow-dark">Quick answers · offer FAQ</p><h2 id="campaign-faq-title">Know the details<br /><em>before you enquire.</em></h2></div><div><p>What is included, what remains separate and what happens after you submit an enquiry.</p><span className="page-faq-actions"><OfferClaimCta expiresAt={offer.expiresAt} initialExpired={initialExpired} /></span></div></Reveal>
        <PageFaq title={`${offer.name} questions`} items={offerFaqs} categoryTitles={['Offer essentials', 'Delivery and conditions']} />
      </div></section>

      <OfferClaimCta className="button button-accent" expiresAt={offer.expiresAt} initialExpired={initialExpired} sticky />
      <Footer />
    </main>
  );
}
