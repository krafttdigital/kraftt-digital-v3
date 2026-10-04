import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin } from 'lucide-react';
import { PageFaq } from '@/components/ui/faq-6';
import { Footer } from '../../components/Footer';
import { JsonLd } from '../../components/JsonLd';
import { Reveal } from '../../components/Reveal';
import { SiteHeader } from '../../components/SiteHeader';
import type { LocationMarket } from '../../data/geo';
import { createPageSchema, faqSchema } from '../../data/seo';
import { LocationBreadcrumbs } from './LocationBreadcrumbs';
import { featuredLocationServices, locationDelivery } from './locationExperience';
import styles from './location.module.css';

const questions = [
  { question: 'Does Kraftt work with businesses across India?', answer: 'Yes. Kraftt is based in Bathinda and works with businesses across India. Remote delivery is available nationwide, with in-person meetings also available by arrangement in Bathinda, Barnala, Mansa and nearby areas.' },
  { question: 'Where is Kraftt based, and can we meet in person?', answer: 'Kraftt is based in Bathinda, Punjab. In-person meetings are available by arrangement in Bathinda, Barnala, Mansa and nearby areas. Other cities listed here are service areas, with communication through calls, email and WhatsApp.' },
  { question: 'What if my city is not listed?', answer: 'You can still contact Kraftt. The listed locations are starting points for exploring our work; they do not limit where we can deliver a project.' },
  { question: 'How do I choose a service?', answer: 'Open your city, compare the available services and review the packages. If you are unsure where to begin, request a free introductory call for direction.' },
];

export function LocationDirectoryPage({ markets, title, description }: {
  markets: readonly LocationMarket[];
  title: string;
  description: string;
}) {
  return (
    <main className="services-clarity-page">
      <JsonLd data={createPageSchema({ name: title, description, path: '/location', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Locations', path: '/location' }], entities: [faqSchema(questions, '/location')] })} />
      <SiteHeader />
      <section className={`services-flow-hero ${styles.directoryHero}`} aria-labelledby="location-directory-title">
        <Reveal className="services-flow-hero-copy" direction="left">
          <LocationBreadcrumbs />
          <p className="eyebrow eyebrow-dark">Bathinda-based · Working across India</p>
          <h1 id="location-directory-title">Find your city.<br /><em>Choose your next step.</em></h1>
          <p>Explore websites, branding, online stores and growth services for your business. Choose a city to see the relevant services, then compare scope and pricing.</p>
          <div className="services-flow-hero-actions"><Link href="#locations">Explore service areas <span aria-hidden="true">↓</span></Link><Link href="/contact">Book a free introductory call <ArrowUpRight size={15} /></Link></div>
          <ul className="services-flow-hero-signals" aria-label="How we work"><li><Check size={14} /> Published starting prices</li><li><Check size={14} /> Scope agreed in writing</li><li><Check size={14} /> Local meetings available</li></ul>
        </Reveal>
        <Reveal className="services-flow-paths" direction="right">
          <div className="services-flow-paths-heading"><span>Find your starting point</span><strong>One clear route to the right service.</strong></div>
          <a href="#locations"><span>01</span><div><strong>Choose your city</strong><small>Explore {markets.length} service areas across India.</small></div><ArrowRight size={16} /></a>
          <Link href="/services"><span>02</span><div><strong>Already know what you need?</strong><small>Go straight to services and published packages.</small></div><ArrowRight size={16} /></Link>
          <Link href="/contact"><span>03</span><div><strong>Talk through the requirement</strong><small>Get direction in a free introductory call.</small></div><ArrowRight size={16} /></Link>
        </Reveal>
      </section>

      <section className="services-flow-specialists" id="locations" aria-labelledby="location-grid-title">
        <Reveal className="services-flow-showcase-heading" direction="left"><p><span>{String(markets.length).padStart(2, '0')}</span> — Service areas</p><h2 id="location-grid-title">Local business context.<br />One consistent way of working.</h2><div><p>Based in Bathinda, working across India. In-person meetings are also available in Bathinda, Barnala, Mansa and nearby areas, by arrangement.</p><span>{markets.length} cities · India</span></div></Reveal>
        <div className={`services-flow-card-grid ${styles.directoryGrid}`}>
          {markets.map((market, index) => {
            const delivery = locationDelivery(market);
            return <Reveal className="services-flow-card-wrap" delay={(index % 3) * .04} key={market.slug}>
              <Link className={`services-flow-card ${styles.cityCard}`} href={`/location/${market.slug}`}>
                <div className="services-flow-card-heading"><div className="services-flow-card-icon" aria-hidden="true"><MapPin size={24} strokeWidth={1.5} /></div><div><p>{market.stateOrRegion} · India</p><h3>{market.name}</h3></div></div>
                <strong>{market.localContext.title}</strong>
                <div className="services-flow-card-copy"><p>{market.heroIntro}</p></div>
                <dl><div><dt>Explore</dt><dd>{featuredLocationServices.length} services</dd></div><div><dt>Delivery</dt><dd>{delivery.label}<small className={styles.deliveryBase}>Bathinda-based{delivery.inPerson && ' · By arrangement'}</small></dd></div></dl>
                <div className="services-flow-card-action"><span>Explore {market.name}</span><ArrowRight size={17} /></div>
              </Link>
            </Reveal>;
          })}
        </div>
      </section>

      <section className="page-faq-section" aria-labelledby="location-faq-title"><div className="page-faq-inner">
        <Reveal className="page-faq-heading" direction="left"><div><p className="eyebrow eyebrow-dark">Before you choose a city</p><h2 id="location-faq-title">Clear answers.<br /><em>A useful next step.</em></h2></div><div><p>Your city is a starting point. The right scope depends on your business, audience and priorities.</p><span className="page-faq-actions"><Link href="/contact">Book a free call <ArrowRight size={15} /></Link></span></div></Reveal>
        <PageFaq title="Kraftt service areas" items={questions} categoryTitles={['Where we work', 'Choosing your next step']} />
      </div></section>
      <Footer />
    </main>
  );
}
