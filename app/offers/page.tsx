import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, BadgePercent, Globe2, Palette, Search, Share2 } from 'lucide-react';
import { Footer } from '../components/Footer';
import { JsonLd } from '../components/JsonLd';
import { Reveal } from '../components/Reveal';
import { SiteHeader } from '../components/SiteHeader';
import { diwaliGrowthBenefitTotal, diwaliGrowthOffer } from '../data/diwaliGrowthOffer';
import { formatInr, getFeaturedOffer, isOfferClaimable } from '../data/offers';
import { createPageMetadata, createPageSchema } from '../data/seo';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const starterOffer = getFeaturedOffer();
const offers = [
  {
    offer: diwaliGrowthOffer,
    number: '01',
    label: 'For a stronger website presence',
    description: 'A fuller website with search foundations, clear enquiry routes and launch support.',
    highlights: [
      { icon: Globe2, text: '8–10 responsive pages' },
      { icon: Search, text: 'SEO, schema, GEO + AEO' },
      { icon: BadgePercent, text: `${formatInr(diwaliGrowthBenefitTotal)} in itemised benefits` },
    ],
    theme: 'growth',
  },
  {
    offer: starterOffer,
    number: '02',
    label: 'For a coordinated first launch',
    description: 'Bring your website, visual identity and first month of social content together.',
    highlights: [
      { icon: Globe2, text: 'Five-page website' },
      { icon: Palette, text: 'Complete brand identity' },
      { icon: Share2, text: 'First month of social' },
    ],
    theme: 'starter',
  },
] as const;

const pageTitle = 'Digital Growth Offers | Kraftt Digital';
const pageDescription = 'Explore Kraftt Digital’s Diwali Growth Website and Starter Business Launch offers. Compare what each includes, then view the full scope and enquire.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/offers', label: 'Kraftt offers' });

export default function OffersPage() {
  return <main className={styles.page}>
    <JsonLd data={createPageSchema({ name: pageTitle, description: pageDescription, path: '/offers', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Offers', path: '/offers' }] })} />
    <SiteHeader />

    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Kraftt Digital · 02 selected offers</p>
        <h1 id="offers-title">A clearer start.<br /><em>A stronger next step.</em></h1>
      </div>
      <div className={styles.heroDetail}>
        <p>Choose a coordinated launch or a fuller growth website. Compare the scope, investment and terms, then open the offer that fits your business.</p>
        <div className={styles.heroActions}>
          <a href="#choose-offer">Explore offers <ArrowDown size={17} aria-hidden="true" /></a>
          <Link href="/contact">Discuss your project <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </header>

    <div className={styles.offerRail} aria-hidden="true">
      <div className={styles.railLabel}><span>Offer desk</span><strong>Two ways forward</strong></div>
      <div className={styles.railWindow}><div className={styles.railTrack}>
        {[0, 1].map((copy) => <div className={styles.railGroup} key={copy}>
          {offers.map(({ offer, number }) => <span className={styles.railItem} key={`${copy}-${offer.id}`}><small>{number}</small>{offer.name}<b>{formatInr(offer.offerPrice)}</b><i>✳</i></span>)}
        </div>)}
      </div></div>
    </div>

    <section className={styles.offerSection} id="choose-offer" aria-labelledby="offer-list-title">
      <div className={styles.sectionHeading}><span>01</span><div><p className={styles.eyebrow}>Compare before you enquire</p><h2 id="offer-list-title">Choose your<br /><em>next step.</em></h2><p>Each offer has its own page with the complete scope, terms and enquiry form. No payment is taken to enquire.</p></div></div>
      <div className={styles.cards}>
        {offers.map(({ offer, number, label, description, highlights, theme }, index) => {
          const active = isOfferClaimable(offer);
          const OfferIcon = theme === 'growth' ? Globe2 : Palette;
          return <Reveal className={styles.cardWrap} delay={index * 0.1} key={offer.id}>
            <article className={`${styles.card} ${theme === 'growth' ? styles.featured : ''}`}>
              <Link className={styles.cardLink} href={offer.pagePath} aria-label={`View ${offer.name} details`}>
                <div className={styles.cardTop}><span>{number}</span><i><OfferIcon size={20} strokeWidth={1.5} aria-hidden="true" /></i><strong>{active ? 'Open for enquiries' : 'Offer closed'}</strong></div>
                <div className={styles.cardBody}><p className={styles.cardLabel}>{label}</p><h3>{offer.name}</h3><p className={styles.cardDescription}>{description}</p></div>
                <div className={styles.cardPrice}><strong>{formatInr(offer.offerPrice)}</strong><span>{active ? 'Offer investment' : 'Listed offer price'}</span></div>
                <ul className={styles.highlights}>{highlights.map(({ icon: Icon, text }) => <li key={text}><Icon size={16} strokeWidth={1.6} aria-hidden="true" /><span>{text}</span></li>)}</ul>
                <div className={styles.cardAction}><span>{active ? `Valid through ${offer.expiryLabel}` : 'View the offer details'}</span><strong>Explore offer <ArrowRight size={17} aria-hidden="true" /></strong></div>
              </Link>
            </article>
          </Reveal>;
        })}
      </div>
    </section>
    <Footer />
  </main>;
}
