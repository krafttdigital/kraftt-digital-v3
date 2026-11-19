'use client';

import Link from 'next/link';
import { ArrowRight, Layers3 } from 'lucide-react';
import { bundles } from '../data/bundles';
import { formatPrice } from '../data/pricing';
import { usePricingCurrency } from './PricingCurrencyProvider';

export function HomePackages() {
  const currency = usePricingCurrency();
  const entries = bundles.map(bundle => ({ name: bundle.name, href: `/services/bundles/${bundle.slug}`,
    headline: bundle.headline, audience: bundle.idealClient, deliverables: bundle.deliverables,
    timeline: bundle.timeline, price: formatPrice(null, currency) }));

  return <section className="services-flow-bundles" aria-labelledby="home-packages-title">
    <div className="services-flow-showcase-heading services-flow-bundles-heading"><p>Connected packages</p><h2 id="home-packages-title">Choose where to start.</h2></div>
    <div className="services-flow-bundle-grid">{entries.map((entry, index) =>
      <div className="services-flow-bundle-wrap" key={entry.href}>
        <Link className="services-flow-bundle-card" href={entry.href}>
          <div className="services-flow-bundle-card-heading"><div className="services-flow-card-icon" aria-hidden="true"><Layers3 size={22} strokeWidth={1.55} /></div><div><p>Package {String(index + 1).padStart(2, '0')}</p><h3>{entry.name}</h3></div></div>
          <p className="services-flow-bundle-audience">{entry.audience}</p>
          <strong>{entry.headline}</strong>
          <ul aria-label={`Included services in ${entry.name}`}>{entry.deliverables.slice(0, 4).map(item => <li key={item}>{item}</li>)}</ul>
          <dl><div><dt>Price</dt><dd>{entry.price}</dd></div><div><dt>Delivery</dt><dd>{entry.timeline}</dd></div></dl>
          <div className="services-flow-card-action"><span>View scope</span><ArrowRight size={17} /></div>
        </Link>
      </div>)}</div>
  </section>;
}
