'use client';

import { useRef, useState, type FormEvent } from 'react';
import { OptionQuestion, ResultPanel, revealResult } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';
import { usePricingCurrency } from '../../components/PricingCurrencyProvider';
import { formatRegionalAmount, pricing } from '../../data/pricing';

type Estimate = {
  packageName: string;
  basePrice: number;
  oneTimeTotal: number;
  serviceHref: string;
  addons: { label: string; value: string }[];
  auditHref: string;
};

const informationalPackages = {
  one: { name: 'Starter', priceKey: 'starter' },
  business: { name: 'Business', priceKey: 'business' },
  growth: { name: 'Growth', priceKey: 'growth' },
} as const;

const storePackages = {
  one: { name: 'Launch Store', priceKey: 'launchStore' },
  business: { name: 'Growth Store', priceKey: 'growthStore' },
  growth: { name: 'Complete Store', priceKey: 'completeStore' },
} as const;

export function WebsiteCostCalculator() {
  const currency = usePricingCurrency();
  const [siteType, setSiteType] = useState<string | null>(null);
  const [pages, setPages] = useState<string | null>(null);
  const [seo, setSeo] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null);
  const [result, setResult] = useState<Estimate | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const values = [siteType, pages, seo, brand, urgency];
  const answered = values.filter(Boolean).length;

  function calculate(event: FormEvent) {
    event.preventDefault();
    if (!siteType || !pages || !seo || !brand || !urgency) return;
    const isInformational = siteType === 'informational';
    const published = isInformational
      ? informationalPackages[pages as keyof typeof informationalPackages]
      : storePackages[pages as keyof typeof storePackages];
    const packageName = published.name;
    const publishedPrice = pricing.websiteCalculator[published.priceKey][currency];
    const brandPrice = brand === 'needed' ? pricing.websiteCalculator.brandIdentity[currency] : 0;
    const addons = [
      ...(brand === 'needed' ? [{ label: 'Brand Identity', value: `from ${formatRegionalAmount(pricing.websiteCalculator.brandIdentity[currency], currency)} one-time` }] : []),
      ...(seo === 'yes' ? [{ label: 'Ongoing SEO', value: `from ${formatRegionalAmount(pricing.websiteCalculator.seoMonthly[currency], currency)}/month` }] : []),
    ];
    const queryAddons = [brand === 'needed' ? 'brand' : '', seo === 'yes' ? 'seo' : ''].filter(Boolean).join(',');
    setResult({
      packageName,
      basePrice: publishedPrice,
      oneTimeTotal: publishedPrice + brandPrice,
      serviceHref: isInformational ? '/services/web-design-development' : '/services/ecommerce-store-development',
      addons,
      auditHref: `/audit?tier=${encodeURIComponent(packageName.toLowerCase().replaceAll(' ', '-'))}&addons=${queryAddons}&siteType=${siteType}&pages=${pages}&urgency=${urgency}`,
    });
    revealResult(resultRef);
  }

  return (
    <>
      <form className="tool-calculator tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
        <div className="tool-form-heading"><p className="tool-eyebrow">Your website brief</p><h2>Five choices. One clear starting point.</h2></div>
        <OptionQuestion label="What kind of site do you need?" value={siteType} onChange={setSiteType} options={[{ value: 'informational', label: 'Informational website' }, { value: 'ecommerce', label: 'E-commerce store' }]} />
        <OptionQuestion label="How many pages or core sections?" value={pages} onChange={setPages} options={[{ value: 'one', label: '1 page' }, { value: 'business', label: '2–5 pages' }, { value: 'growth', label: '6–10+ pages' }]} />
        <OptionQuestion label="Do you need ongoing SEO?" value={seo} onChange={setSeo} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
        <OptionQuestion label="Do you already have a usable brand identity?" value={brand} onChange={setBrand} options={[{ value: 'ready', label: 'Yes, ready to use' }, { value: 'needed', label: 'No, identity needed' }]} />
        <OptionQuestion label="When would you like to begin?" value={urgency} onChange={setUrgency} options={[{ value: '30-days', label: 'Within 30 days' }, { value: '1-3-months', label: '1–3 months' }, { value: 'exploring', label: 'Still exploring' }]} />
        <Button type="submit" disabled={answered < 5}>{answered < 5 ? `Calculate Website Cost (${answered}/5 answered)` : 'Calculate Website Cost'}</Button>
      </form>
      {result && <section className="tool-results" ref={resultRef} aria-live="polite"><div className="tool-wrap"><ResultPanel eyebrow="Recommended starting point" title={result.packageName}>
        <dl className="tool-result-list">
          <div><dt>Base package</dt><dd>from {formatRegionalAmount(result.basePrice, currency)}</dd></div>
          {result.addons.map((addon) => <div key={addon.label}><dt>{addon.label}</dt><dd>{addon.value}</dd></div>)}
          <div className="tool-result-total"><dt>Total starting estimate</dt><dd>{formatRegionalAmount(result.oneTimeTotal, currency)}{result.addons.some((item) => item.label === 'Ongoing SEO') ? ` + ${formatRegionalAmount(pricing.websiteCalculator.seoMonthly[currency], currency)}/month` : ''}</dd></div>
        </dl>
        <p className="tool-required-note">This is a starting estimate based on published pricing — your exact quote comes free, with no obligation, at the Proposal stage.</p>
        <ResultActions serviceHref={result.serviceHref} serviceLabel="View the matching website service" auditHref={result.auditHref} />
      </ResultPanel></div></section>}
    </>
  );
}
