import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, MapPin, Users, Video } from 'lucide-react';
import { PageFaq } from '@/components/ui/faq-6';
import { AnimatedServiceIcon } from '../../components/AnimatedServiceIcon';
import { Footer } from '../../components/Footer';
import { HomeShowcase } from '../../components/HomeShowcase';
import { JsonLd } from '../../components/JsonLd';
import { RegionalPriceCopy } from '../../components/PricingCurrencyProvider';
import { Reveal } from '../../components/Reveal';
import { ReviewsSection } from '../../components/ReviewsSection';
import { SiteHeader } from '../../components/SiteHeader';
import { projects } from '../../data/projects';
import { featuredReviews } from '../../data/reviews';
import { createPageSchema, faqSchema, reviewSchemas } from '../../data/seo';
import type { LocationMarket } from '../../data/geo';
import { serviceBySlug } from '../../data/services';
import { LocationBreadcrumbs } from './LocationBreadcrumbs';
import { featuredLocationServices, locationDelivery } from './locationExperience';
import styles from './location.module.css';

const marketplacePlatforms = [
  { name: 'Amazon', src: '/assets/marketplaces/amazon.png' },
  { name: 'Flipkart', src: '/assets/marketplaces/flipkart.png' },
  { name: 'Myntra', src: '/assets/marketplaces/myntra.png' },
  { name: 'Meesho', src: '/assets/marketplaces/meesho.png' },
];

const processJourney = [
  { number: '01', phase: 'Introduce', status: 'Free first call', title: 'Introductory call', copy: 'Share what you want to improve. We listen, ask the useful questions and confirm the best next step.' },
  { number: '02', phase: 'Discover', status: 'Audit optional', title: 'Discovery meeting', copy: 'We clarify your audience, goals and priorities. If deeper research would help, we recommend the optional paid audit.' },
  { number: '03', phase: 'Quote', status: 'Everything in writing', title: 'Quote and terms', copy: 'You receive the deliverables, timeline, fees, required inputs and exclusions in writing.' },
  { number: '04', phase: 'Agree', status: 'Your approval', title: 'Proposal and agreement', copy: 'We answer your questions and finalise the scope, payment stages and review points together.' },
  { number: '05', phase: 'Start', status: 'Visible milestones', title: 'Project starts', copy: 'Once you approve and share the required access, work begins with clear milestones and regular updates.' },
];

const caseStudyBanners: Record<string, { src: string; alt: string }> = {
  'shree-hari-spintex': { src: '/shsl-banner.png', alt: 'Shree Hari Spintex website, search and local discovery project collage' },
  'mittal-architect': { src: '/mittal-banner.png', alt: 'Mittal Architect website, project portfolio and search visibility collage' },
  'kiraq-jewellery': { src: '/kiraq-banner.png', alt: 'Kiraq Jewellery identity, storefront and administration system collage' },
  'elixir-beverages': { src: '/elixir-banner.png', alt: 'Elixir Beverages brand identity and pre-launch website collage' },
  'aegis-squad': { src: '/aegis-banner.png', alt: 'Aegis Squad services website and search presence collage' },
  'ketan-goyal': { src: '/ketan-banner.png', alt: 'Ketan Goyal personal portfolio, writing and builds collage' },
};

const featuredProjectSlugs = ['shree-hari-spintex', 'mittal-architect', 'elixir-beverages', 'kiraq-jewellery'];

const selectedProjects = featuredProjectSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is NonNullable<typeof project> => Boolean(project));

export function LocationLandingPage({ market }: { market: LocationMarket }) {
  const homeReviews = featuredReviews();
  const pagePath = `/location/${market.slug}`;
  const contactHref = `/contact?market=${encodeURIComponent(market.name)}`;
  const delivery = locationDelivery(market);
  const featuredServices = featuredLocationServices.map((slug, index) => {
    const service = serviceBySlug(slug)!;
    return { ...service, number: String(index + 1).padStart(2, '0'), eyebrow: service.category, copy: service.headline, price: service.tiers[0].price, href: `${pagePath}/${slug}` };
  });
  const answers = [
    { question: `Does Kraftt work with businesses in ${market.name}?`, answer: `Yes. ${delivery.description}` },
    { question: 'Can you redesign our website?', answer: `Yes. We review your website, brand, content and enquiry flow, then recommend the right scope for your ${market.name} business.` },
    { question: 'Do you build Shopify stores?', answer: 'Yes. Kraftt builds Shopify stores with product setup, checkout, mobile usability and search foundations according to the selected package.' },
    { question: 'How does a project begin?', answer: 'Request a free introductory call to discuss the requirement. A paid Digital Presence Audit is available separately when deeper research would help.' },
  ];
  return (
    <main>
      <JsonLd data={createPageSchema({ name: market.metaTitle, description: market.metaDescription, path: pagePath,
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Locations', path: '/location' }, { name: market.name, path: pagePath }],
        entities: [...reviewSchemas(homeReviews), faqSchema(answers, pagePath)],
      })} />
      <SiteHeader overlay />
      <HomeShowcase eyebrow={market.eyebrow} intro={`${market.heroIntro}${delivery.inPerson ? ' In-person meetings are also available by arrangement.' : ''}`} />

      <section className={styles.context} aria-labelledby="location-context-title">
        <div className={styles.contextInner}>
          <LocationBreadcrumbs market={market} />
          <div className={styles.contextGrid}>
            <Reveal className={styles.contextCopy} direction="left">
              <div className={styles.contextEyebrow}><span><MapPin size={14} aria-hidden="true" />{market.name}, {market.name === market.stateOrRegion ? 'India' : market.stateOrRegion}</span><span>Built around your business</span></div>
              <h2 id="location-context-title">{market.localContext.title}</h2>
              <p>{market.localContext.body}</p>
              <Link className={styles.contextLink} href="#what-we-build">Explore our 4 services <span><ArrowDown size={18} aria-hidden="true" /></span></Link>
            </Reveal>
            <Reveal className={styles.deliveryCard} direction="right">
              <div className={styles.deliveryTop}><span className={styles.deliveryIcon}>{delivery.inPerson ? <Users size={24} aria-hidden="true" /> : <Video size={24} aria-hidden="true" />}</span><span>Bathinda-based<br /><strong>{delivery.inPerson ? 'Closer to your business' : 'Connected wherever you are'}</strong></span></div>
              <h3>{delivery.inPerson ? <>A real conversation.<br /><em>In person, too.</em></> : <>A local understanding.<br /><em>Without the distance.</em></>}</h3>
              <p>{delivery.description}</p>
              <div className={styles.deliveryModes}><span><Video size={14} aria-hidden="true" /> Remote collaboration</span>{delivery.inPerson && <span><Users size={14} aria-hidden="true" /> In-person meetings</span>}</div>
              <Link href={contactHref}>{delivery.inPerson ? 'Arrange a conversation' : 'Book a free introductory call'}<ArrowUpRight size={18} aria-hidden="true" /></Link>
            </Reveal>
          </div>
          {market.nearbyAreas.length > 0 && <div className={styles.nearbyAreas}><span><MapPin size={15} aria-hidden="true" /> Also serving nearby</span><ul>{market.nearbyAreas.map((area) => <li key={area}>{area}</li>)}</ul></div>}
        </div>
      </section>

      <section className={`home-services-play section-light ${styles.servicesSection}`} data-service-count={String(featuredServices.length).padStart(2, '0')} id="what-we-build">
        <div className="home-services-play-inner">
          <Reveal className="home-services-play-heading" direction="scale">
            <div className="home-services-play-count" aria-label={`${featuredServices.length} services in ${market.name}`}>
              <strong>{String(featuredServices.length).padStart(2, '0')}</strong>
              <span>Local<br />services</span>
            </div>
            <div className="home-services-play-title">
              <p className="eyebrow eyebrow-dark">What we build</p>
              <h2>Build the essentials.<br /><em>Add what the business needs.</em></h2>
            </div>
            <div className="home-services-play-intro">
              <p>Start with the service that solves the immediate gap, then connect the wider brand, content or system when the business needs it.</p>
              <div><span>Direct service pages</span><span>Published starting prices</span><span>Defined scope</span></div>
            </div>
          </Reveal>

          <div className={`home-services-featured-grid home-services-featured-row ${styles.serviceGrid}`}>
            {featuredServices.map((service, index) => {
              const href = service.href;
              return (
                <Reveal className={`home-service-featured home-service-featured-${index + 1}`} key={service.slug} delay={index * .04}>
                  <div className="home-service-featured-top"><span>{service.number}</span><i aria-hidden="true"><AnimatedServiceIcon slug={service.slug} size={38} /></i></div>
                  <div className="home-service-featured-copy"><small>{service.eyebrow}</small><h3>{service.name}</h3><p>{service.copy}</p></div>
                  <div className="home-service-featured-bottom"><span>From <RegionalPriceCopy>{service.price}</RegionalPriceCopy></span><Link href={href}>View service <i aria-hidden="true">↗</i></Link></div>
                </Reveal>
              );
            })}
          </div>

          <div id="marketplace-highlight" className="home-marketplace-row">
            <Reveal className="home-marketplace-feature">
              <div className="home-marketplace-feature-copy">
                <div className="home-marketplace-feature-icon"><AnimatedServiceIcon slug="marketplace-catalogue-building" /></div>
                <div><p>Marketplace catalogue service</p><h3>Register your products directly on e-commerce giants.</h3><span>You handle the orders. We handle the listings, product setup, marketplace SEO and catalogue structure.</span></div>
              </div>
              <Link className="home-marketplace-feature-cta" href="/services/marketplace-catalogue-building">View marketplace service <i aria-hidden="true">↗</i></Link>
              <div className="home-marketplace-platforms" aria-label="Marketplace platforms">
                {marketplacePlatforms.map((marketplace) => <div key={marketplace.name}><div><Image src={marketplace.src} alt={`${marketplace.name} marketplace logo`} fill sizes="(max-width: 700px) 40vw, 13vw" /></div></div>)}
              </div>

            </Reveal>

            <Reveal className="home-marketplace-all">
              <Link href="/services">View all services <i aria-hidden="true">→</i></Link>
            </Reveal>
          </div>

        </div>
      </section>

      <section className="home-case-playground section-light">
        <Reveal className="home-case-playground-heading">
          <div className="home-case-playground-count" aria-label="Four featured projects"><strong>04</strong><span>Featured work</span></div>
          <div className="home-case-playground-title">
            <p className="eyebrow eyebrow-dark">Featured work</p>
            <h2><span>Proof takes</span><span>different shapes.</span></h2>
          </div>
          <div className="home-case-playground-intro">
            <p>Selected Kraftt work shows our process and delivery. These projects are not presented as clients from {market.name} unless their project pages say so.</p>
            <Link className="home-case-playground-all" href="/work">Explore all projects <span aria-hidden="true">↗</span></Link>
          </div>
        </Reveal>

        <div className="home-case-playground-grid">
          {selectedProjects.map((project, index) => {
            const banner = caseStudyBanners[project.slug];
            return (
              <Reveal className={`home-case-play-card home-case-play-card-${index + 1}`} direction={index % 2 ? 'left' : 'right'} delay={index * 0.06} key={project.slug}>
                <Link href={`/work/${project.slug}`} aria-label={`Explore ${project.name} ${project.projectType.toLowerCase()}`}>
                  <div className="home-case-play-media">
                    <Image src={banner.src} alt={banner.alt} fill sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 58vw" />
                    <strong className="home-case-play-number">0{index + 1}</strong>
                    <span className="home-case-play-arrow" aria-hidden="true">↗</span>
                  </div>
                  <div className="home-case-play-copy">
                    <div><span>{project.projectType}</span><span>{project.industry}</span></div>
                    <h3>{project.name}</h3>
                    <p>{project.context}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

      </section>

      <section className="home-process-journey" aria-labelledby="home-process-title">
        <div className="home-process-journey-inner">
          <div className="home-process-journey-heading">
            <div className="home-process-journey-label">
              <p className="eyebrow">How engagement begins</p>
              <span className="home-process-journey-index">01—05</span>
            </div>
            <div className="home-process-journey-summary">
              <div>
                <h2 id="home-process-title">Know what happens<br /><em>before work begins.</em></h2>
                <p>Five straightforward steps. You see the scope, cost and responsibilities before you commit, and nothing moves forward without your approval.</p>
              </div>
              <Link href="/process" className="home-process-journey-link">Explore the full process <span aria-hidden="true">↗</span></Link>
            </div>
          </div>

          <ol className="home-process-simple-flow" aria-label="Kraftt client engagement journey">
            {processJourney.map((step) => (
              <li className="home-process-simple-step" key={step.number}>
                <div className="home-process-simple-meta">
                  <span>{step.number}</span>
                  <small>{step.phase}</small>
                </div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                <strong>{step.status}</strong>
              </li>
            ))}
          </ol>

          <div className="home-process-assurance" aria-label="What stays clear throughout the engagement">
            <span>You stay in control</span>
            <p><i aria-hidden="true">✓</i> Clear scope before commitment</p>
            <p><i aria-hidden="true">✓</i> Costs and terms made visible</p>
            <p><i aria-hidden="true">✓</i> Your approval before finalisation</p>
          </div>
        </div>
      </section>

      <ReviewsSection reviews={homeReviews} variant="home" />

      <section className="home-trust">
        <div className="home-trust-inner">
          <Reveal className="home-trust-heading" direction="scale">
            <div>
              <p className="eyebrow">Frequently asked questions</p>
              <span>Working with Kraftt · {market.name}</span>
            </div>
            <h2>Questions, answered.<br /><em>Before you enquire.</em></h2>
            <div className="home-trust-heading-intro">
              <p>Clear answers about working with Kraftt for your business in {market.name}.</p>
              <Link href={contactHref}>Ask another question <span aria-hidden="true">↗</span></Link>
            </div>
          </Reveal>

          <div className="home-trust-story">

            <PageFaq title={`Working with Kraftt in ${market.name}`} items={answers} categoryTitles={['Local fit', 'Services and next steps']} />
          </div>

        </div>
      </section>

      <section className="home-trust" id="start-here">
        <div className="home-trust-inner">
      <Reveal className="home-trust-decision" direction="scale">

              <Link className="home-trust-decision-choice" href={contactHref}>
                <div className="home-trust-decision-choice-meta"><span>01</span><small>Free</small></div>
                <p>Best for a defined need</p>
                <strong>Talk it through in a free introductory call.</strong>
                <small>Explain the situation, ask questions and check whether Kraftt is the right fit for the work.</small>
                <span className="home-trust-decision-result">Outcome · a useful next step</span>
                <div className="home-trust-decision-choice-action"><span>Book the call</span><i aria-hidden="true">→</i></div>
              </Link>
              <Link className="home-trust-decision-choice" href="/audit">
                <div className="home-trust-decision-choice-meta"><span>02</span><small><RegionalPriceCopy>₹999</RegionalPriceCopy></small></div>
                <p>Best for an unclear direction</p>
                <strong>Start with a researched Digital Presence Audit.</strong>
                <small>Get a structured review of the business, competitors and current online presence before deciding what to improve.</small>
                <span className="home-trust-decision-result">Outcome · findings and priorities</span><br /><br />
                <div className="home-trust-decision-choice-action"><span>Request the audit</span><i aria-hidden="true">↗</i></div>
              </Link>

          </Reveal></div>
          </section>
      <Footer />
    </main>
  );
}
