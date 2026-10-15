'use client';

import Link from 'next/link';
import { ArrowRight, Layers3 } from 'lucide-react';
import { bundles } from '../data/bundles';
import { pricing, formatRegionalAmount, regionalizePriceCopy } from '../data/pricing';
import { serviceBySlug } from '../data/services';
import { usePricingCurrency } from './PricingCurrencyProvider';

export function HomePackages() {
  const currency = usePricingCurrency();
  const selectedSlugs = currency === 'INR'
    ? ['starter-business-launch', 'local-business-dominator', 'd2c-brand-launch-kit', 'full-digital-presence']
    : ['starter-business-launch', 'd2c-brand-launch-kit', 'full-digital-presence'];
  const entries = selectedSlugs.flatMap((slug) => {
    const bundle = bundles.find((item) => item.slug === slug);
    if (!bundle) return [];
    const price = regionalizePriceCopy(bundle.price, currency);
    return [{ name: bundle.name, href: `/services/bundles/${bundle.slug}`, headline: bundle.headline,
      audience: bundle.idealClient, deliverables: bundle.deliverables, timeline: bundle.timeline,
      price, amount: Number(price.replace(/[^\d.]/g, '')) }];
  });

  if (currency === 'USD') {
    const service = serviceBySlug('web-design-development');
    const growth = service?.tiers.find((tier) => tier.name === 'Growth — Full Build');
    if (service && growth) entries.push({ name: 'Web Design & Development — Growth tier',
      href: `/services/${service.slug}`, headline: service.headline, audience: service.idealClient,
      deliverables: growth.deliverables, timeline: growth.timeline,
      price: formatRegionalAmount(pricing.websiteCalculator.growth[currency], currency),
      amount: pricing.websiteCalculator.growth[currency] });
  }
  entries.sort((a, b) => a.amount - b.amount);

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
