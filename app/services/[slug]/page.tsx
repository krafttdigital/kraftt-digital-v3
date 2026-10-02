import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock3 } from 'lucide-react';
import { AnimatedServiceIcon } from '../../components/AnimatedServiceIcon';
import { Footer } from '../../components/Footer';
import { JsonLd } from '../../components/JsonLd';
import { RegionalPriceCopy } from '../../components/PricingCurrencyProvider';
import { Reveal } from '../../components/Reveal';
import { SiteHeader } from '../../components/SiteHeader';
import { regionServiceAlternates } from '../../data/geo';
import { createPageMetadata, createPageSchema, faqSchema, serviceSchema } from '../../data/seo';
import { serviceBySlug, services } from '../../data/services';
import { whatsappUrl } from '../../data/site';
import { PageFaq } from '@/components/ui/faq-6';

const discussionLabels: Record<string, string> = {
  'web-design-development': 'Discuss your website',
  'brand-identity': 'Discuss your brand',
  'ecommerce-store-development': 'Plan your online store',
  'marketplace-catalogue-building': 'Plan your marketplace catalogue',
  'ecommerce-seo': 'Discuss your SEO priorities',
  'social-media-management': 'Discuss your social media',
  'landing-pages': 'Discuss your landing page',
  'app-development': 'Discuss your application',
  'dashboards-internal-tools': 'Discuss your software requirements',
};

const serviceSearchMetadata: Record<string, { title: string; description: string }> = {
  'web-design-development': { title: 'Web Design & Development | Kraftt Digital', description: 'Explore responsive business website packages, launch SEO and clear enquiry paths. Discuss the right scope with Kraftt Digital.' },
  'ecommerce-seo': { title: 'SEO Services for Websites & Stores | Kraftt Digital', description: 'Compare ongoing SEO plans for business websites and online stores, including page improvements, content and monthly reporting.' },
  'brand-identity': { title: 'Brand Identity & System | Kraftt Digital', description: 'Explore practical brand identity packages from a starter system to a complete visual and verbal foundation.' },
  'marketplace-catalogue-building': { title: 'Marketplace Catalogue Building | Kraftt Digital', description: 'Compare catalogue-building packages for Amazon, Flipkart, Myntra and Meesho, including listing setup, research, pricing support and training.' },
  'landing-pages': { title: 'Landing Page Design & Development | Kraftt Digital', description: 'Plan and build a focused landing page for one offer, audience and conversion action on the platform that fits your campaign.' },
  'app-development': { title: 'App Development Services | Kraftt Digital', description: 'Scope Android, iOS or cross-platform applications around defined users, features, integrations and release requirements.' },
};

const marketplaceLogos = [
  { name: 'Amazon', src: '/assets/marketplaces/amazon.png' },
  { name: 'Flipkart', src: '/assets/marketplaces/flipkart.png' },
  { name: 'Myntra', src: '/assets/marketplaces/myntra.png' },
  { name: 'Meesho', src: '/assets/marketplaces/meesho.png' },
];

export const dynamic = 'force-dynamic';
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return {};
  const searchMetadata = serviceSearchMetadata[service.slug];
  return createPageMetadata({ title: searchMetadata?.title ?? `${service.name} | Kraftt Digital`, description: searchMetadata?.description ?? service.headline, path: `/services/${service.slug}`, label: service.category, languages: regionServiceAlternates(service.slug) });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const serviceMessage = whatsappUrl(`Hi Kraftt, I would like to request a free introductory call about ${service.name}.`);
  const discussionLabel = discussionLabels[service.slug] ?? 'Discuss your requirements';
  const isCustomScope = service.tiers.length === 1 || service.tiers[0].price.toLowerCase().includes('custom');
  const isMarketplaceService = service.slug === 'marketplace-catalogue-building';
  const featuredFaqs = service.faqs.slice(0, 5);
  const processLabels = ['Introduce', 'Define', 'Create', 'Review', 'Deliver'];
  const processBadges = ['Free first call', 'Scope confirmed', 'Work in progress', 'Your approval', 'Visible milestones'];
  const relatedServices = [
    ...services.filter((item) => item.slug !== service.slug && item.category === service.category),
    ...services.filter((item) => item.slug !== service.slug && item.category !== service.category),
  ].slice(0, 3);

  return (
    <main className="service-simple-page">
      <JsonLd data={createPageSchema({
        name: `${service.name} Service | Kraftt Digital`, description: service.headline, path: `/services/${service.slug}`,
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: service.name, path: `/services/${service.slug}` }],
        entities: [serviceSchema({ name: service.name, description: service.problemSolved, path: `/services/${service.slug}` }), faqSchema(featuredFaqs, `/services/${service.slug}`)],
      })} />
      <SiteHeader />

      <section className="service-simple-hero" aria-labelledby="service-title">
        <div className="service-simple-shell">
          <Reveal className="service-simple-back" direction="left"><Link href="/services"><ArrowLeft size={15} /> All services</Link><span>{service.category}</span></Reveal>
          <div className="service-simple-hero-grid">
            <Reveal className="service-simple-hero-copy" direction="left"><p className="eyebrow eyebrow-dark">Focused service · clear scope</p><h1 id="service-title">{service.name}</h1><strong>{service.headline}</strong><p>{service.problemSolved}</p></Reveal>
            <Reveal className="service-simple-hero-panel" direction="right">
              <div className="service-simple-hero-panel-head"><span>Start with clarity</span><strong>At a glance</strong></div>
              <div className="service-simple-hero-facts">
                <div><span>Starting at</span><strong><RegionalPriceCopy>{service.tiers[0].price}</RegionalPriceCopy></strong></div>
                <div><span>First delivery</span><strong>{service.tiers[0].timeline}</strong></div>
                <div><span>Scope options</span><strong>{service.tiers.length === 1 ? 'Custom' : `${service.tiers.length} packages`}</strong></div>
              </div>
              <div className="service-simple-hero-actions"><Link href="#packages">View scope &amp; pricing <span aria-hidden="true">↓</span></Link><Link href="/contact#intro-call">Book a free call <ArrowUpRight size={14} /></Link></div>
            </Reveal>
          </div>
        </div>
      </section>

      <nav className="service-simple-journey" aria-label="Service page sections">
        <div className="service-simple-shell"><span>Explore this service</span><a href="#overview">01 · Overview</a><a href="#packages">02 · Packages</a><a href="#process">03 · Process</a><a href="#service-faq">04 · FAQs</a></div>
      </nav>

      {isMarketplaceService && <section className="service-marketplace-platforms" aria-labelledby="marketplace-platforms-title">
        <div className="service-simple-shell service-marketplace-platforms-inner">
          <Reveal className="service-marketplace-platforms-copy" direction="left"><p className="eyebrow eyebrow-dark">Marketplace coverage</p><h2 id="marketplace-platforms-title">Build one organised catalogue.<br /><em>Prepare it for the right platforms.</em></h2><p>Catalogue allocation, product limits, required documents and platform responsibilities are confirmed in your written scope.</p></Reveal>
          <div className="service-marketplace-logo-grid" aria-label="Supported marketplace platforms">
            {marketplaceLogos.map((marketplace, index) => <Reveal key={marketplace.name} className="service-marketplace-logo" delay={index * .04}><div><Image src={marketplace.src} alt={`${marketplace.name} marketplace logo`} fill sizes="(max-width: 760px) 42vw, 18vw" /></div><span>{marketplace.name}</span></Reveal>)}
          </div>
        </div>
      </section>}

      <section className="service-simple-overview" id="overview" aria-labelledby="service-included-title">
        <div className="service-simple-shell">
          <div className="service-simple-overview-grid">
            <Reveal className="service-simple-included" direction="left"><p className="eyebrow eyebrow-dark">The working scope</p><h2 id="service-included-title">What&apos;s included</h2><div>{service.mainDeliverables.map((item) => <p key={item}><Check size={18} /><span>{item}</span></p>)}</div></Reveal>
            <Reveal className="service-simple-quote-card" direction="right">
              <span>{isCustomScope ? 'Built around your requirement' : 'Published packages. Written scope.'}</span>
              <h3>{isCustomScope ? 'Custom-scoped. Custom-priced.' : `Choose from ${service.tiers.length} clear scope levels.`}</h3>
              <p>{isCustomScope ? 'Tell us what the business needs and receive a tailored recommendation after discovery.' : 'Start with the depth that fits now. Deliverables, timing and responsibilities are confirmed before work begins.'}</p>
              <ul><li><Check size={15} /> Free introductory call</li><li><Check size={15} /> Clear scope and quotation</li><li><Check size={15} /> Review before finalisation</li></ul>
              <Link href="#packages">{isCustomScope ? 'Review the service scope' : 'Compare packages'} <ArrowRight size={15} /></Link>
              <a href={serviceMessage}>{discussionLabel} <ArrowUpRight size={15} /></a>
            </Reveal>
          </div>
          {/* <Reveal className="service-simple-outcomes"><p className="eyebrow eyebrow-dark">A practical fit check</p><h2>When this service is useful</h2><div>{service.goodFitWhen.map((item) => <p key={item}><Check size={15} /><span>{item}</span></p>)}</div></Reveal> */}
        </div>
      </section>

      <section className="service-simple-packages" id="packages" aria-labelledby="service-packages-title">
        <div className="service-simple-shell">
          <Reveal className="service-simple-section-head"><div><p className="eyebrow eyebrow-dark">Investment and delivery</p><h2 id="service-packages-title">Packages &amp; scope</h2></div><p>Compare the included work and delivery window. Provider charges and anything outside the written scope remain separate.</p></Reveal>
          <div className={`service-simple-package-grid service-simple-package-grid-${service.tiers.length}`}>
            {service.tiers.map((tier, index) => <Reveal className="service-simple-package" delay={index * .04} key={tier.name}>
              <div className="service-simple-package-top"><span>0{index + 1}</span>{index === 1 ? <span className="service-simple-package-popular">Popular</span> : <Clock3 size={16} />}</div><h3>{tier.name}</h3><strong><RegionalPriceCopy>{tier.price}</RegionalPriceCopy></strong><small>{tier.timeline}</small>
              <ul>{tier.deliverables.slice(0, 6).map((item) => <li key={item}><Check size={14} /><span>{item}</span></li>)}</ul>
              {tier.deliverables.length > 6 && <details><summary>View {tier.deliverables.length - 6} more inclusions <span>+</span></summary><ul>{tier.deliverables.slice(6).map((item) => <li key={item}><Check size={14} /><span>{item}</span></li>)}</ul></details>}
              {tier.addOns && tier.addOns.length > 0 && <details><summary>Optional add-ons <span>+</span></summary><ul>{tier.addOns.map((item) => <li key={item}><ArrowRight size={13} /><RegionalPriceCopy>{item}</RegionalPriceCopy></li>)}</ul></details>}
              <a href={whatsappUrl(`Hi Kraftt, I would like to discuss the ${tier.name} option for ${service.name}.`)}>Discuss this option <ArrowRight size={15} /></a>
            </Reveal>)}
          </div>
          {/* <Reveal className="service-simple-scope-note"><strong>Not included by default</strong><div>{service.notIncluded.map((item) => <p key={item}>{item}</p>)}</div></Reveal> */}
        </div>
      </section>

      <section className="service-simple-process" id="process" aria-labelledby="service-process-title">
        <div className="service-simple-shell">
          <Reveal className="service-simple-section-head service-simple-process-head"><div><p className="eyebrow eyebrow-dark">A visible delivery path</p><h2 id="service-process-title">Clear steps.<br />Visible decisions.</h2></div><div className="service-simple-process-intro"><span>{String(service.workflow.length).padStart(2, '0')} clear stages</span><p>You see the scope, progress and review points throughout the engagement, with approval before anything is finalised.</p></div></Reveal>
          <div className={`service-simple-process-flow service-simple-process-flow-${service.workflow.length}`}>{service.workflow.map((step, index) => <Reveal className={`service-simple-process-step ${index === 0 ? 'is-first' : ''} ${index === service.workflow.length - 1 ? 'is-last' : ''}`} key={step.title} delay={index * .035}>
            <div><span>{String(index + 1).padStart(2, '0')}</span><small>{processLabels[index] ?? 'Deliver'}</small><i>{index === service.workflow.length - 1 ? '✓' : '→'}</i></div>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
            <strong>{processBadges[index] ?? 'Clear progress'}</strong>
          </Reveal>)}</div>
          <Reveal className="service-simple-process-assurances"><h3>You stay in control.</h3><div><p><Check size={14} /> Clear scope before commitment</p><p><Check size={14} /> Costs and terms made visible</p><p><Check size={14} /> Your approval before finalisation</p></div></Reveal>
        </div>
      </section>

      {service.productProof && <section className="service-simple-proof"><div className="service-simple-shell service-simple-proof-grid">
        <Reveal direction="left"><p className="eyebrow">{service.productProof.eyebrow}</p><h2>A working product.<br /><em>Not a concept screen.</em></h2><p>{service.productProof.description}</p><a href={service.productProof.href} target="_blank" rel="noopener noreferrer">{service.productProof.linkLabel} <ArrowUpRight size={15} /></a></Reveal>
        <Reveal direction="right"><Image src={service.productProof.image.src} alt={service.productProof.image.alt} width={service.productProof.image.width} height={service.productProof.image.height} /></Reveal>
      </div></section>}

      <section className="page-faq-section" id="service-faq" aria-labelledby="service-faq-title"><div className="page-faq-inner">
        <Reveal className="page-faq-heading" direction="left">
          <div><p className="eyebrow eyebrow-dark">Before you decide · 05 focused answers</p><h2 id="service-faq-title">Questions before<br /><em>you begin.</em></h2></div>
          <div><p>Five clear answers about scope, investment, timing and ownership for {service.name.toLowerCase()}.</p><span className="page-faq-actions"><Link href="/contact#intro-call">Book a free call <ArrowRight size={15} /></Link><Link href="/audit">Request the ₹999 audit <ArrowUpRight size={15} /></Link></span></div>
        </Reveal>
        <PageFaq title={`${service.name} questions`} items={featuredFaqs} categoryTitles={['Scope and investment', 'Delivery and ownership']} />
      </div></section>

      <section className="service-simple-related" aria-labelledby="related-services-title"><div className="service-simple-shell">
        <Reveal className="service-simple-section-head"><div><p className="eyebrow eyebrow-dark">Build the wider system</p><h2 id="related-services-title">Related services</h2></div><Link href="/services">Browse all services <ArrowRight size={15} /></Link></Reveal>
        <div className="service-simple-related-grid">{relatedServices.map((related) => <Reveal key={related.slug}><Link href={`/services/${related.slug}`}><span><AnimatedServiceIcon slug={related.slug} size={38} /></span><h3>{related.name}</h3><p>{related.headline}</p><i>View service <ArrowUpRight size={14} /></i></Link></Reveal>)}</div>
      </div></section>

      <section className="service-simple-final"><Reveal direction="left"><p className="eyebrow">Choose the right first step</p><h2>Discuss the requirement.<br /><em>Decide with clarity.</em></h2></Reveal><Reveal direction="right"><p>Use the free call for quick direction. Choose the ₹999 audit when the decision needs deeper business, competitor and digital-presence research.</p><div><Link href="/contact#intro-call">Book a free call <ArrowRight size={15} /></Link><Link href="/audit"><RegionalPriceCopy>Request the ₹999 audit</RegionalPriceCopy> <ArrowUpRight size={15} /></Link></div></Reveal></section>
      <Footer />
    </main>
  );
}
