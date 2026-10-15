'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Layers3, MapPin, ShoppingBag } from 'lucide-react';
import { RegionalPriceCopy, usePricingCurrency } from '../components/PricingCurrencyProvider';
import { Reveal } from '../components/Reveal';
import { bundles } from '../data/bundles';

const bundleIcons = [Layers3, ShoppingBag, Building2, MapPin];

function visibleBundles(currency: 'INR' | 'USD') {
  return bundles.filter((bundle) => currency === 'INR' || bundle.slug !== 'local-business-dominator');
}

export function RegionalBundleCount() {
  return <>{visibleBundles(usePricingCurrency()).length}</>;
}

export function RegionalBundleList() {
  const displayedBundles = visibleBundles(usePricingCurrency());
  return <div className="services-flow-bundle-grid">
    {displayedBundles.map((bundle, index) => {
      const BundleIcon = bundleIcons[bundles.indexOf(bundle)] ?? Layers3;
      return <Reveal className="services-flow-bundle-wrap" delay={index * 0.04} key={bundle.slug}>
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
      </Reveal>;
    })}
  </div>;
}
