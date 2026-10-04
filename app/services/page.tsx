import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Building2, Check, Layers3, MapPin, ShoppingBag } from 'lucide-react';
import { AnimatedServiceIcon } from '../components/AnimatedServiceIcon';
import { Footer } from '../components/Footer';
import { JsonLd } from '../components/JsonLd';
import { RegionalPriceCopy } from '../components/PricingCurrencyProvider';
import { Reveal } from '../components/Reveal';
import { SiteHeader } from '../components/SiteHeader';
import { bundles } from '../data/bundles';
import { createPageMetadata, createPageSchema, faqSchema } from '../data/seo';
import { coreServices, services } from '../data/services';
import { PageFaq } from '@/components/ui/faq-6';

const pageTitle = 'Branding, Website & Digital Services | Kraftt Digital';
const pageDescription = 'Explore branding, websites, online stores, marketplace setup, SEO and social media services. Compare clear scopes and request a free introductory call.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/services', label: 'Kraftt services' });

const toServiceCard = (service: (typeof services)[number]) => ({
  ...service,
  href: `/services/${service.slug}`,
  price: service.tiers[0].price,
  timeline: service.tiers[0].timeline,
  summary: service.problemSolved,
});

const serviceCards = coreServices.map(toServiceCard);

const otherProfessionalServices = ['landing-pages', 'app-development', 'dashboards-internal-tools']
  .map((slug) => services.find((service) => service.slug === slug)!)
  .map(toServiceCard);

const serviceShowcases = [
  {
    number: '01',
    eyebrow: 'Brand & presence systems',
    title: 'Build a presence people can understand and trust.',
    copy: 'Bring your identity, website and ongoing communication into one clear system that makes the business easier to recognise and assess.',
    slugs: ['brand-identity', 'web-design-development', 'social-media-management'],
  },
  {
    number: '02',
    eyebrow: 'Commerce & discovery systems',
    title: 'Make it easier to find, evaluate and buy from you.',
    copy: 'Create a usable buying journey across your store, marketplaces and search presence, with every scope tied to a practical business need.',
    slugs: ['ecommerce-store-development', 'marketplace-catalogue-building', 'ecommerce-seo'],
  },
];

const bundleIcons = [Layers3, ShoppingBag, Building2, MapPin];

const visitorPaths = [
  { number: '01', title: 'Clarify the brand', copy: 'Identity, positioning and a consistent visual system.', href: '#service-brand-identity' },
  { number: '02', title: 'Build a website or store', copy: 'A clearer enquiry path or a usable buying journey.', href: '#service-web-design-development' },
  { number: '03', title: 'Improve discovery', copy: 'SEO and social communication that build visibility over time.', href: '#service-ecommerce-seo' },
  { number: '04', title: 'Solve a specific need', copy: 'Marketplace setup, landing pages, apps or internal tools.', href: '#specialist-scopes' },
];

const servicesPageFaqs = [
  {
    question: 'What services does Kraftt Digital offer?',
    answer: 'Kraftt Digital provides brand identity, web design and development, e-commerce development, marketplace catalogue support, SEO, social media management, landing pages, app development and custom business software. Services can be booked individually or combined around one business requirement.',
    links: [
      { label: 'Brand identity', href: '/services/brand-identity' },
      { label: 'Web development', href: '/services/web-design-development' },
      { label: 'E-commerce', href: '/services/ecommerce-store-development' },
      { label: 'SEO', href: '/services/ecommerce-seo' },
    ],
  },
  {
    question: 'Which digital service does my business need?',
    answer: 'Choose brand identity when the business lacks a consistent identity, web design when visitors cannot understand or enquire easily, e-commerce when you need to sell online, marketplace support for Amazon, Flipkart, Myntra or Meesho, SEO for organic visibility, social media for consistent communication, and custom software when an internal workflow needs its own system.',
    links: [
      { label: 'Browse core services', href: '#service-menu' },
      { label: 'Explore specialist services', href: '#specialist-scopes' },
    ],
  },
  {
    question: 'How much do digital agency services cost in India?',
    answer: 'Kraftt offers published starting packages and custom-scoped work. Website and brand identity projects currently start from ₹12,000, e-commerce development from ₹22,000, and ongoing SEO and social media management from ₹12,000 per month. Apps, software and more complex requirements are quoted after discovery.',
    links: [{ label: 'Compare services and prices', href: '#service-menu' }],
  },
  {
    question: 'Can Kraftt handle branding, website design and digital marketing together?',
    answer: 'Yes. Kraftt can connect positioning and identity, website or store development, SEO and ongoing social communication under one direction. A bundle is recommended when the work depends on shared decisions, while each service can also be booked separately.',
    links: [{ label: 'Compare connected bundles', href: '#compare-bundles' }],
  },
  {
    question: 'Can you improve my existing website or brand instead of rebuilding everything?',
    answer: 'Yes. Kraftt first reviews what is already useful, what is creating friction and what can be retained. The recommendation may be a focused refresh, a redesign or a complete rebuild, with the scope and responsibilities agreed before production begins.',
    links: [
      { label: 'Website service', href: '/services/web-design-development' },
      { label: 'Brand identity service', href: '/services/brand-identity' },
    ],
  },
  {
    question: 'Do you build e-commerce stores and marketplace listings?',
    answer: 'Yes. Kraftt builds e-commerce stores and also supports catalogue setup for Amazon, Flipkart, Myntra and Meesho. Store development and marketplace catalogue work are separate scopes, so you can choose one or coordinate both around the same product information.',
    links: [
      { label: 'E-commerce development', href: '/services/ecommerce-store-development' },
      { label: 'Marketplace catalogue support', href: '/services/marketplace-catalogue-building' },
    ],
  },
  {
    question: 'Does Kraftt provide SEO for Google and AI search engines?',
    answer: 'Yes. Kraftt covers search foundations, technical and on-page improvements, content structure and relevant AEO or GEO practices that make business information clearer for search and generative systems. No agency can guarantee rankings, citations or AI recommendations.',
    links: [{ label: 'Explore SEO services', href: '/services/ecommerce-seo' }],
  },
  {
    question: 'How do I start a project with Kraftt Digital?',
    answer: 'Start with a free introductory call to explain the requirement. Kraftt then reviews the need, recommends the appropriate service, confirms scope, timing, fees and responsibilities, and begins only after the written proposal and agreement are approved. Choose the ₹999 audit when the decision needs deeper business, competitor and digital-presence research.',
    links: [
      { label: 'Book a free call', href: '/contact' },
      { label: 'Request the ₹999 audit', href: '/audit' },
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="services-clarity-page">
      <JsonLd data={createPageSchema({
        name: pageTitle,
        description: pageDescription,
        path: '/services',
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }],
        entities: [faqSchema(servicesPageFaqs.map(({ question, answer }) => ({ question, answer })), '/services')],
      })} />
      <SiteHeader />
      <section className="services-flow-hero" aria-labelledby="services-page-title">
        <Reveal className="services-flow-hero-copy" direction="left">
          <p className="eyebrow eyebrow-dark">Six focused services · four connected bundles</p>
          <h1 id="services-page-title">Choose the outcome.<br /><em>See the path.</em></h1>
          <p>Start with the business need. Kraftt helps you choose a focused service or a connected bundle, then confirms the scope, price and responsibilities before work begins.</p>
          <div className="services-flow-hero-actions">
            <Link href="/contact">Book a free introductory call <ArrowUpRight size={15} /></Link>
            <Link href="#service-menu">Browse all services <span aria-hidden="true">↓</span></Link>
          </div>
          <ul className="services-flow-hero-signals" aria-label="What to expect before work begins">
            <li><Check size={14} strokeWidth={2} aria-hidden="true" /> Starting prices shown</li>
            <li><Check size={14} strokeWidth={2} aria-hidden="true" /> Scope agreed in writing</li>
            <li><Check size={14} strokeWidth={2} aria-hidden="true" /> Review before finalisation</li>
          </ul>
        </Reveal>

        <Reveal className="services-flow-paths" direction="right">
          <div className="services-flow-paths-heading">
            <span>Find your starting point</span>
            <strong>What needs to improve first?</strong>
          </div>
          {visitorPaths.map((path) => (
            <a href={path.href} key={path.number}>
              <span>{path.number}</span>
              <div><strong>{path.title}</strong><small>{path.copy}</small></div>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          ))}
        </Reveal>
      </section>

      {/* <section className="services-flow-promises" aria-label="What visitors can expect">
        <div><strong>06</strong><span>Focused services</span><small>Choose one clear need</small></div>
        <div><strong>04</strong><span>Connected bundles</span><small>Combine related scopes</small></div>
        <div><strong>Free</strong><span>First conversation</span><small>Discuss fit without obligation</small></div>
        <div><strong>Written</strong><span>Scope before work</span><small>Know the price and responsibilities</small></div>
      </section> */}

      <section className="services-flow-catalogue" id="service-menu" aria-label="Services catalogue">
        {/* <Reveal className="services-flow-catalogue-intro" direction="left">
          <div>
            <p className="eyebrow eyebrow-dark">Core service catalogue · six focused scopes</p>
            <h2 id="services-catalogue-title">Start with the system<br /><em>your business needs next.</em></h2>
          </div>
          <div>
            <p>Each service is presented with its purpose, starting price and first delivery window. Open a service to review tiers, exact deliverables, exclusions and related work.</p>
            <Link href="#compare-bundles">Need several services? Compare bundles <ArrowRight size={15} /></Link>
          </div>
        </Reveal> */}

        <div className="services-flow-showcase-list">
          {serviceShowcases.map((showcase, groupIndex) => {
            const groupedServices = showcase.slugs.map((slug) => serviceCards.find((service) => service.slug === slug)!);
            return (
              <section className={`services-flow-showcase-group services-flow-showcase-group-${groupIndex + 1}`} key={showcase.number} aria-labelledby={`service-group-${showcase.number}`}>
                <Reveal className="services-flow-showcase-heading" direction="left">
                  <p><span>{showcase.number}</span> — {showcase.eyebrow}</p>
                  <h2 id={`service-group-${showcase.number}`}>{showcase.title}</h2>
                  <div><p>{showcase.copy}</p><span>{groupedServices.length} focused services</span></div>
                </Reveal>

                <div className="services-flow-card-grid">
                  {groupedServices.map((service, index) => {
                    return (
                      <Reveal className="services-flow-card-wrap" delay={index * 0.04} key={service.slug}>
                        <Link className="services-flow-card" href={service.href} id={`service-${service.slug}`}>
                          <div className="services-flow-card-heading">
                            <div className="services-flow-card-icon" aria-hidden="true"><AnimatedServiceIcon slug={service.slug} size={42} /></div>
                            <div><p>{service.category}</p><h3>{service.name}</h3></div>
                          </div>
                          <strong>{service.headline}</strong>
                          <div className="services-flow-card-copy">
                            <p>{service.summary}</p>
                            {service.productProof && <small>{service.productProof.name} · Kraftt product proof</small>}
                          </div>
                          <dl>
                            <div><dt>Starts at</dt><dd><RegionalPriceCopy>{service.price}</RegionalPriceCopy></dd></div>
                            <div><dt>First delivery</dt><dd>{service.timeline}</dd></div>
                          </dl>
                          <div className="services-flow-card-action"><span>See what&apos;s included</span><ArrowRight size={17} /></div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="services-flow-specialists" id="specialist-scopes" aria-labelledby="specialist-scopes-title">
        <Reveal className="services-flow-showcase-heading services-flow-specialists-heading" direction="left">
          <p><span>03</span> — Other professional services</p>
          <h2 id="specialist-scopes-title">Focused digital builds for a defined requirement.</h2>
          <div>
            <p>Choose a focused landing page, a customer-facing application or a custom internal system. Every service now has its own scope and detail page.</p>
            <span>3 individual services</span>
          </div>
        </Reveal>

        <div className="services-flow-card-grid services-flow-other-card-grid" id="other-professional-services">
          {otherProfessionalServices.map((service, index) => {
            return (
              <Reveal className="services-flow-card-wrap" delay={index * 0.04} key={service.slug}>
                <Link className="services-flow-card" href={service.href} id={`service-${service.slug}`}>
                  <div className="services-flow-card-heading">
                    <div className="services-flow-card-icon" aria-hidden="true"><AnimatedServiceIcon slug={service.slug} size={42} /></div>
                    <div><p>{service.category}</p><h3>{service.name}</h3></div>
                  </div>
                  <strong>{service.headline}</strong>
                  <div className="services-flow-card-copy"><p>{service.summary}</p></div>
                  <dl>
                    <div><dt>Pricing</dt><dd><RegionalPriceCopy>{service.price}</RegionalPriceCopy></dd></div>
                    <div><dt>Delivery</dt><dd>{service.timeline}</dd></div>
                  </dl>
                  <div className="services-flow-card-action"><span>See service scope</span><ArrowRight size={17} /></div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="services-flow-bundles" id="compare-bundles" aria-labelledby="services-bundles-title">
        <Reveal className="services-flow-showcase-heading services-flow-bundles-heading" direction="left">
          <p><span>04</span> — Connected service bundles</p>
          <h2 id="services-bundles-title">One direction for work that needs to move together.</h2>
          <div>
            <p>Bundles connect related services under one scope. Use them when the brand, platform and ongoing visibility need coordinated decisions and delivery.</p>
            <span>4 complete bundles</span>
          </div>
        </Reveal>

        <div className="services-flow-bundle-grid">
          {bundles.map((bundle, index) => {
            const BundleIcon = bundleIcons[index] ?? Layers3;
            return (
              <Reveal className="services-flow-bundle-wrap" delay={index * 0.04} key={bundle.slug}>
                <Link className="services-flow-bundle-card" href={`/services/bundles/${bundle.slug}`}>
                  <div className="services-flow-bundle-card-heading">
                    <div className="services-flow-card-icon" aria-hidden="true"><BundleIcon size={22} strokeWidth={1.55} /></div>
                    <div><p>Bundle {String(index + 1).padStart(2, '0')}</p><h3>{bundle.name}</h3></div>
                  </div>
                  <p className="services-flow-bundle-audience">{bundle.idealClient}</p>
                  <strong>{bundle.headline}</strong>
                  <p className="services-flow-bundle-problem">{bundle.problemSolved}</p>
                  <ul aria-label={`Included services in ${bundle.name}`}>
                    {bundle.deliverables.slice(0, 4).map((deliverable) => <li key={deliverable}>{deliverable}</li>)}
                  </ul>
                  <dl>
                    <div><dt>Bundle price</dt><dd><RegionalPriceCopy>{bundle.price}</RegionalPriceCopy></dd></div>
                    <div><dt>Delivery</dt><dd>{bundle.timeline}</dd></div>
                  </dl>
                  <div className="services-flow-card-action"><span>View the full bundle</span><ArrowRight size={17} /></div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="page-faq-section" id="services-faq" aria-labelledby="services-faq-title">
        <div className="page-faq-inner">
          <Reveal className="page-faq-heading" direction="left">
            <div><p className="eyebrow eyebrow-dark">Services FAQ · quick decisions</p><h2 id="services-faq-title">Clear answers<br /><em>before you choose.</em></h2></div>
            <div><p>Compare service fit, likely investment and the right starting point. Get quick direction on a call or use the audit for deeper research.</p><span className="page-faq-actions"><Link href="/contact">Book a free call <ArrowRight size={14} /></Link><Link href="/audit"><RegionalPriceCopy>Request the ₹999 audit</RegionalPriceCopy> <ArrowUpRight size={14} /></Link></span></div>
          </Reveal>
          <PageFaq title="Kraftt Digital services questions" items={servicesPageFaqs} categoryTitles={['Choosing a service', 'Scope, pricing and next steps']} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
