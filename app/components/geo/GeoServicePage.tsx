import Link from 'next/link';
import { ArrowRight, Check, Minus } from 'lucide-react';
import type { LocationMarket, RegionMarket } from '../../data/geo';
import { projectBySlug } from '../../data/projects';
import { createPageSchema, faqSchema, serviceSchema } from '../../data/seo';
import type { Service } from '../../data/services';
import { whatsappUrl } from '../../data/site';
import { Footer } from '../Footer';
import { HomeShowcase } from '../HomeShowcase';
import { JsonLd } from '../JsonLd';
import { RegionalPriceCopy } from '../PricingCurrencyProvider';
import { ProjectCard } from '../ProjectCard';
import { Reveal } from '../Reveal';
import { SiteHeader } from '../SiteHeader';
import styles from './geo.module.css';
import { PageFaq } from '@/components/ui/faq-6';

type GeoServicePageProps = {
  kind: 'location' | 'region';
  market: LocationMarket | RegionMarket;
  service: Service;
  siblingServices: Service[];
};

function isRegionMarket(market: LocationMarket | RegionMarket): market is RegionMarket {
  return 'languageRegion' in market;
}

function serviceIntro(service: Service, market: LocationMarket | RegionMarket, kind: 'location' | 'region') {
  if (kind === 'region' && isRegionMarket(market)) {
    return `Kraftt provides ${service.name.toLowerCase()} for ${market.shortName} businesses through a clear, remotely delivered engagement from India.`;
  }
  return `Kraftt provides ${service.name.toLowerCase()} for ${market.name} businesses that need a clearer, more credible and commercially useful digital presence.`;
}

function geoFaqs(service: Service, market: LocationMarket | RegionMarket, kind: 'location' | 'region') {
  const marketName = kind === 'region' && isRegionMarket(market) ? market.shortName : market.name;
  const first = {
    question: `Does Kraftt provide ${service.name} for businesses in ${marketName}?`,
    answer: `Yes. ${serviceIntro(service, market, kind)} The exact deliverables, timing and investment are confirmed in the proposal.`,
  };
  const second = kind === 'region'
    ? {
        question: `How is ${service.name} managed between India and ${marketName}?`,
        answer: `Communication uses email, WhatsApp and scheduled video calls, with feedback and approvals recorded through clear digital stages.`,
      }
    : {
        question: `Does Kraftt have an office in ${marketName}?`,
        answer: `This page describes ${marketName} as a service area. Kraftt is India-based and does not claim a physical office in ${marketName}.`,
      };

  return [first, second, ...service.faqs.slice(0, 3)];
}

export function GeoServicePage({ kind, market, service, siblingServices }: GeoServicePageProps) {
  const basePath = kind === 'location' ? `/location/${market.slug}` : `/region/${market.slug}`;
  const path = `${basePath}/${service.slug}`;
  const marketName = kind === 'region' && isRegionMarket(market) ? market.shortName : market.name;
  const intro = serviceIntro(service, market, kind);
  const faqs = geoFaqs(service, market, kind);
  const relatedProject = projectBySlug(service.relatedProjectSlug);
  const message = whatsappUrl(`Hi Kraftt, I would like to discuss ${service.name} for a business in ${marketName}.`);

  return (
    <main className={styles.page}>
      <JsonLd data={createPageSchema({
        name: `${service.name} in ${marketName} | Kraftt Digital`,
        description: intro,
        path,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: kind === 'location' ? 'Locations' : 'Regions', path: kind === 'location' ? '/location' : '/region' },
          { name: marketName, path: basePath },
          { name: service.name, path },
        ],
        entities: [
          serviceSchema({
            name: `${service.name} in ${marketName}`,
            description: intro,
            path,
            areaServed: isRegionMarket(market) ? market.schemaCountry : market.schemaPlace,
            serviceType: service.name,
          }),
          faqSchema(faqs, path),
        ],
      })} />
      <SiteHeader overlay />
      <HomeShowcase eyebrow={`${service.name} · ${marketName}`} intro={intro} />

      <section className={styles.serviceOverview} aria-labelledby="geo-service-overview-title">
        <Reveal className={styles.serviceOverviewHeading} direction="left">
          <p className="eyebrow eyebrow-dark">{service.category} · {marketName}</p>
          <h2 id="geo-service-overview-title">{service.name}<br /><em>with a clear role.</em></h2>
          <p>{service.headline}</p>
        </Reveal>
        <Reveal className={styles.serviceOverviewCards} direction="right">
          <article><span>Built for</span><p>{service.idealClient}</p></article>
          <article><span>Problem solved</span><p>{service.problemSolved}</p></article>
          <article><span>Area served</span><p>{market.name}{!isRegionMarket(market) ? `, ${market.stateOrRegion}, India` : ' · Remote delivery from India'}</p></article>
        </Reveal>
      </section>

      <section className={styles.packages} aria-labelledby="geo-packages-title">
        <Reveal className={styles.sectionHeading}>
          <div><p className="eyebrow">Existing packages · published pricing</p><h2 id="geo-packages-title">Choose the depth.<br /><em>Keep scope visible.</em></h2></div>
          <p>Packages, deliverables and independently configured regional prices come directly from the main {service.name} service data.</p>
        </Reveal>
        <div className={styles.packageGrid}>
          {service.tiers.map((tier, index) => (
            <Reveal className={styles.packageCard} delay={index * 0.05} key={tier.name}>
              <div><span>{String(index + 1).padStart(2, '0')}</span><small>{tier.timeline}</small></div>
              <h3>{tier.name}</h3>
              <strong><RegionalPriceCopy>{tier.price}</RegionalPriceCopy></strong>
              <p>What you receive</p>
              <ul>{tier.deliverables.map((item) => <li key={item}><Check size={14} aria-hidden="true" /><span>{item}</span></li>)}</ul>
              <a href={message}>Discuss this package <ArrowRight size={15} aria-hidden="true" /></a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.scope} aria-labelledby="geo-scope-title">
        <Reveal className={styles.scopeHeading} direction="left"><p className="eyebrow eyebrow-dark">Scope without fog</p><h2 id="geo-scope-title">What stays clear<br /><em>before work begins.</em></h2></Reveal>
        <div className={styles.scopeGrid}>
          <Reveal className={styles.scopeCard}><h3><Check size={18} /> Core deliverables</h3><ul>{service.mainDeliverables.map((item) => <li key={item}>{item}</li>)}</ul></Reveal>
          <Reveal className={`${styles.scopeCard} ${styles.scopeCardMuted}`}><h3><Minus size={18} /> Not included by default</h3><ul>{service.notIncluded.map((item) => <li key={item}>{item}</li>)}</ul></Reveal>
        </div>
      </section>

      <section className={styles.serviceProcess} aria-labelledby="geo-service-process-title">
        <Reveal className={styles.sectionHeadingLight}>
          <div><p className="eyebrow eyebrow-dark">How delivery runs</p><h2 id="geo-service-process-title">A visible path from<br /><em>brief to handover.</em></h2></div>
          <p>Each stage has a job, an output and a next decision.</p>
        </Reveal>
        <div className={styles.serviceProcessGrid}>{service.workflow.map((step, index) => <Reveal className={styles.serviceProcessStep} key={step.title} delay={index * 0.04}><span>{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.detail}</p></Reveal>)}</div>
      </section>

      {relatedProject && (
        <section className={styles.serviceProof} aria-labelledby="geo-service-proof-title">
          <Reveal className={styles.serviceProofIntro} direction="left"><p className="eyebrow">Related work · {relatedProject.projectType.toLowerCase()}</p><h2 id="geo-service-proof-title">See the service<br /><em>inside real work.</em></h2><p>This project demonstrates Kraftt’s process and delivery. It is not presented as a {marketName} client unless the project page itself says so.</p></Reveal>
          <Reveal direction="right"><ProjectCard project={relatedProject} /></Reveal>
        </section>
      )}

      <section className="page-faq-section" aria-labelledby="geo-service-faq-title"><div className="page-faq-inner">
        <Reveal className="page-faq-heading" direction="left"><div><p className="eyebrow eyebrow-dark">Direct answers · 05 focused answers</p><h2 id="geo-service-faq-title">Before choosing<br /><em>the service.</em></h2></div><div><p>Clear answers about local fit, remote delivery, scope and the next step.</p></div></Reveal>
        <PageFaq title={`${service.name} in ${marketName} questions`} items={faqs.map((faq) => ({ ...faq, answer: <RegionalPriceCopy>{faq.answer}</RegionalPriceCopy> }))} categoryTitles={['Local service fit', 'Scope and delivery']} />
      </div></section>

      <section className={styles.relatedMarkets} aria-labelledby="geo-related-services-title">
        <Reveal><p className="eyebrow">Related services · {marketName}</p><h2 id="geo-related-services-title">Build only what<br /><em>the gap requires.</em></h2></Reveal>
        <nav aria-label={`Related Kraftt services for ${marketName}`}>{siblingServices.filter((item) => item.slug !== service.slug).map((item) => <Link href={`${basePath}/${item.slug}`} key={item.slug}>{item.name}<ArrowRight size={15} /></Link>)}</nav>
      </section>

      <section className={styles.cta} aria-labelledby="geo-service-cta-title">
        <Reveal direction="left"><p className="eyebrow">Choose the next clear step</p><h2 id="geo-service-cta-title">Discuss {service.name.toLowerCase()}.<br /><em>Start with clarity.</em></h2></Reveal>
        <Reveal className={styles.ctaActions} direction="right"><p>Request a free introductory call to discuss your requirement. A paid audit is available separately if deeper research would help.</p><div><Link href={`/contact?service=${encodeURIComponent(service.name)}&market=${encodeURIComponent(marketName)}`}>Request a free call <ArrowRight size={15} /></Link><a href={message}>Message about this service <ArrowRight size={15} /></a></div></Reveal>
      </section>

      <Footer />
    </main>
  );
}
