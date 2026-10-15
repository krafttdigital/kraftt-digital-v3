import type { Metadata } from 'next';
import { ArrowDown, ArrowRight, BadgePercent, BarChart3, Clock3, FileText, Globe, MessageCircle, Palette, Search, Sparkles, Wrench } from 'lucide-react';
import { PageFaq } from '../../../components/ui/faq-6';
import { Footer } from '../../components/Footer';
import { JsonLd } from '../../components/JsonLd';
import { SiteHeader } from '../../components/SiteHeader';
import { diwaliGrowthBenefits, diwaliGrowthBenefitTotal, diwaliGrowthDelivery, diwaliGrowthOffer } from '../../data/diwaliGrowthOffer';
import { formatInr, isOfferClaimable } from '../../data/offers';
import { absoluteUrl, createPageMetadata, createPageSchema, faqSchema, organizationId } from '../../data/seo';
import { DiwaliGrowthEnquiryForm } from './DiwaliGrowthEnquiryForm';
import { ProofCarousel } from './ProofCarousel';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const offer = diwaliGrowthOffer;
const pageUrl = absoluteUrl(offer.pagePath);
const scopeIcons = [Palette, Globe, Search, Sparkles, BarChart3, MessageCircle, FileText];
const scopeDescriptions = [
  'A consistent visual starting point that makes your business look like one clear brand.',
  'A responsive experience that helps visitors find the right information on every screen.',
  'Give search engines clear page structure and context from launch.',
  'Help AI-powered discovery systems understand what your business does.',
  'Set up your site for search visibility monitoring and indexing checks.',
  'Make it simple for interested visitors to start a conversation.',
  'A place to publish useful answers, updates and expertise.',
];
const benefitIcons = [BadgePercent, BarChart3, Wrench, Globe, Palette];
const faqs = [
  { question: 'What does the Growth Website include?', answer: 'Basic branding, an 8–10 page responsive website, agreed launch SEO and JSON-LD schema markup, GEO and AEO implementation, Google Search Console setup, WhatsApp and email enquiry routes, and a blog section. The final page list is agreed in your proposal.' },
  { question: 'When can the website be delivered?', answer: `The estimate is ${diwaliGrowthDelivery}. The timeline begins after the agreed content, access and approvals are complete.` },
  { question: 'How long is the offer available?', answer: `Limited project slots are available until ${offer.expiryLabel}, or until they are taken. A slot is held only after the proposal is accepted and the advance is paid.` },
  { question: 'Are hosting and domain renewal included?', answer: 'The .in domain is included for its first year. The client pays for renewal, hosting and other third-party costs.' },
  { question: 'Are ad spend and ad management included?', answer: 'No. The offer includes five static AI ad creatives for your own campaigns. Ad spend and campaign management are separate.' },
  { question: 'What is included in maintenance?', answer: 'Three months of maintenance and support are included, with one monthly analytics report during each of those months. The reports have no separate value in the ₹16,000 benefit total.' },
  { question: 'What happens after I apply?', answer: 'Kraftt checks fit and sends a proposal with the final scope and timing. There is no payment through this form. A project slot is held only when the proposal is accepted and the advance is paid.' },
  { question: 'Are rankings or leads guaranteed?', answer: 'No. Launch SEO, schema, GEO and AEO form the website’s search foundation, but search rankings, AI-search citations and lead volumes are not guaranteed.' },
] as const;

export function generateMetadata(): Metadata {
  const active = isOfferClaimable(offer);
  return createPageMetadata({
    title: `${offer.name} | Growth Website ${formatInr(offer.offerPrice)} | Kraftt Digital`,
    description: active
      ? `Limited Diwali Growth Website slots at ${formatInr(offer.offerPrice)} with ${formatInr(diwaliGrowthBenefitTotal)} in itemised benefits. Valid through ${offer.expiryLabel}.`
      : 'Explore Kraftt Digital’s Website Growth – Full Build and enquire about a website project.',
    path: offer.pagePath,
    label: offer.name,
  });
}

export default function DiwaliGrowthWebsitePage() {
  const expired = !isOfferClaimable(offer);
  const serviceDescription = `${offer.campaignLine}: ${offer.supportingLine}`;
  const marqueeMessage = expired
    ? 'The Diwali Growth Website offer closed · Enquire about a new website project'
    : `Limited slots left · Apply for your digital presence · Growth Website ${formatInr(offer.offerPrice)} · ${formatInr(diwaliGrowthBenefitTotal)} in benefits · Through 8 November 2026 IST`;

  return <main className={styles.page}>
    <JsonLd data={createPageSchema({
      name: offer.name,
      description: serviceDescription,
      path: offer.pagePath,
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Offers', path: '/offers' }, { name: offer.name, path: offer.pagePath }],
      entities: [faqSchema(faqs, offer.pagePath), {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: offer.campaignLine,
        description: serviceDescription,
        url: pageUrl,
        provider: { '@id': organizationId },
        offers: {
          '@type': 'Offer',
          price: offer.offerPrice,
          priceCurrency: offer.currency,
          validThrough: offer.expiresAt,
          ...(expired ? { availability: 'https://schema.org/SoldOut' } : {}),
          url: pageUrl,
        },
      }],
    })} />
    <SiteHeader />

    <aside className="campaign-offer-marquee" aria-label={marqueeMessage}>
      <div className="campaign-offer-marquee-track" aria-hidden="true">
        {[0, 1].map((group) => <div className="campaign-offer-marquee-group" key={group}>
          {[0, 1, 2].map((item) => <span key={item}>{marqueeMessage}<i>◆</i></span>)}
        </div>)}
      </div>
    </aside>

    <section className={styles.hero} aria-labelledby="diwali-growth-title">
      <div className={styles.heroCopy}>
        <div className={styles.heroKicker}>
          <p className={styles.overline}>{offer.name}</p>
        </div>
        <h1 id="diwali-growth-title">Limited Slot&apos;s. <em>Apply for your digital presence.</em></h1>
        <p className={styles.heroTagline}>Get your business a new digital look this Diwali.</p>
        <p className={styles.heroDescription}>Bring a high-end website, search foundations and clear enquiry paths together in one digital presence.</p>
        {/* <div className={styles.heroFacts}><span><strong>{formatInr(offer.offerPrice)}</strong> Growth Website</span><span><strong>{formatInr(diwaliGrowthBenefitTotal)}</strong> in added benefits</span></div> */}
        <p className={styles.delivery}><Clock3 size={16} aria-hidden="true" /> Estimated delivery: <strong>{diwaliGrowthDelivery}.</strong></p>
        <div className={styles.heroActions}>
          <a className="button button-accent" href="#offer-enquiry">{expired ? 'Ask about a website' : 'Apply for your digital presence'} <ArrowRight size={16} aria-hidden="true" /></a>
          <a href="#diwali-growth-details">See what is included <ArrowDown size={15} aria-hidden="true" /></a>
        </div>
      </div>

      <div className={styles.formPanel} id="offer-enquiry">
        <div className={styles.formIntro}><span>{expired ? 'General website enquiry' : 'Request the Diwali offer'}</span><strong>{expired ? 'The Diwali offer has closed.' : `${formatInr(offer.offerPrice)} · Enquire for FREE`}</strong></div>
        <DiwaliGrowthEnquiryForm offer={offer} pageUrl={pageUrl} initialExpired={expired} />
        <p className={styles.formSteps}>Send your details <span>→</span> We check fit <span>→</span> You receive a proposal · No payment now</p>
      </div>
    </section>

    <section className={styles.details} id="diwali-growth-details" aria-labelledby="diwali-growth-details-title">
      <div className={styles.sectionHead}><p className={styles.overline}>The complete offer</p><h2 id="diwali-growth-details-title">What your {formatInr(offer.offerPrice)} website includes.</h2><p>Give your business a polished digital look, help search and AI systems understand it, and make the next enquiry easy.</p></div>
      <div className={styles.scopeGrid} role="region" aria-label="Website inclusions" tabIndex={0}>{offer.inclusions[0].items.map((item, index) => {
        const Icon = scopeIcons[index];
        return <div className={styles.scopeCard} key={item}><div className={styles.scopeIcon}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></div><span>{String(index + 1).padStart(2, '0')}</span><h3>{item}</h3><p>{scopeDescriptions[index]}</p></div>;
      })}</div>
      <p className={styles.mobileSwipeCue}>Swipe to explore all website inclusions <ArrowRight size={15} aria-hidden="true" /></p>
      <div className={styles.benefitArea}>
        <div className={styles.benefitHead}><div><p className={styles.overline}>More with your website</p><h3>Added value, <em>built in.</em></h3><p>Everything below is included in the {formatInr(offer.offerPrice)} Diwali offer. The website reduction is already reflected in that price.</p></div><div className={styles.benefitValue}><span>Total included benefit</span><strong>{formatInr(diwaliGrowthBenefitTotal)}</strong><small>Five itemised benefits</small></div></div>
        <div className={styles.benefitList} role="region" aria-label="Included offer benefits" tabIndex={0}>
          {diwaliGrowthBenefits.map((benefit, index) => {
            const Icon = benefitIcons[index];
            return <div className={styles.benefitRow} key={benefit.label}><div className={styles.benefitRowTop}><span><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></span><b>{formatInr(benefit.value)}</b></div><strong>{benefit.label}</strong><p>{benefit.detail}</p></div>;
          })}
        </div>
        <p className={styles.mobileSwipeCue}>Swipe to see every included benefit <ArrowRight size={15} aria-hidden="true" /></p>
      </div>
    </section>

    <section className={styles.results} aria-labelledby="diwali-growth-results">
      <div className={styles.sectionHead}><p className={styles.overline}>Proof in practice</p><h2 id="diwali-growth-results">Search. AI discovery. Design.</h2><p>Captured examples from past projects. Search and AI results can change.</p></div>
      <ProofCarousel />
    </section>

    <div className="page-faq-section"><div className="page-faq-inner">
      <header className="page-faq-heading"><div><p className={styles.overline}>Good to know</p><h2>Questions before <em>you apply.</em></h2></div><div><p>Clear answers about the offer, timing and what happens after you enquire.</p></div></header>
      <PageFaq id="diwali-growth-faq" title="Diwali Growth Website questions" items={faqs} categoryTitles={['The website & offer', 'Working together']} />
    </div></div>
    <Footer />
  </main>;
}
