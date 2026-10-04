import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LocationMarket, RegionMarket } from '../../data/geo';
import { createPageSchema } from '../../data/seo';
import { Footer } from '../Footer';
import { JsonLd } from '../JsonLd';
import { Reveal } from '../Reveal';
import { SiteHeader } from '../SiteHeader';
import styles from './geo.module.css';

type GeoDirectoryPageProps = {
  kind: 'location' | 'region';
  markets: readonly (LocationMarket | RegionMarket)[];
  title: string;
  description: string;
};

export function GeoDirectoryPage({ kind, markets, title, description }: GeoDirectoryPageProps) {
  const path = kind === 'location' ? '/location' : '/region';
  return (
    <main className={styles.page}>
      <JsonLd data={createPageSchema({ name: title, description, path, breadcrumbs: [{ name: 'Home', path: '/' }, { name: kind === 'location' ? 'Locations' : 'Regions', path }] })} />
      <SiteHeader />
      <section className={styles.directoryHero} aria-labelledby="geo-directory-title">
        <Reveal direction="left"><p className="eyebrow eyebrow-dark">Markets served · Kraftt Digital</p><h1 id="geo-directory-title">Work without<br /><em>unclear distance.</em></h1></Reveal>
        <Reveal direction="right"><p>{description}</p><Link href="/contact">Request a free introductory call <ArrowRight size={15} /></Link></Reveal>
      </section>
      <section className={styles.directoryGrid} aria-label={kind === 'location' ? 'Indian service areas' : 'International markets served'}>
        {markets.map((market, index) => (
          <Reveal className={styles.directoryCard} delay={index * 0.035} key={market.slug}>
            <Link href={`${path}/${market.slug}`}>
              <div><span>{String(index + 1).padStart(2, '0')}</span><small>{kind === 'location' ? `${(market as LocationMarket).stateOrRegion} · India` : 'Remote delivery from India'}</small></div>
              <h2>{market.name}</h2><p>{market.localContext.title}</p><footer>Explore this market <ArrowRight size={15} /></footer>
            </Link>
          </Reveal>
        ))}
      </section>
      <Footer />
    </main>
  );
}
