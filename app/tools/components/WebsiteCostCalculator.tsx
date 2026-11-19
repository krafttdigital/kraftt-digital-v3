'use client';

import { useRef, useState, type FormEvent } from 'react';
import { trackEvent } from '../../../lib/analytics/core';
import { PricingControls, usePricingCurrency } from '../../components/PricingCurrencyProvider';
import { formatPrice, formatRegionalAmount, quoteLabel } from '../../data/pricing';
import { websiteEstimate, websiteOptions, type WebsiteScope } from '../packageEstimates';
import { OptionQuestion, ResultPanel, revealResult } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';

type Brief = NonNullable<Parameters<typeof websiteEstimate>[0]>;

export function WebsiteCostCalculator() {
  const currency = usePricingCurrency();
  const [siteType, setSiteType] = useState<WebsiteScope | null>(null);
  const [scope, setScope] = useState<string | null>(null);
  const [seo, setSeo] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const result = brief && websiteEstimate(brief, currency);
  const resultRef = useRef<HTMLElement>(null);
  const lastTracked = useRef('');
  const answered = [siteType, scope, seo, brand, urgency].filter(Boolean).length;

  function calculate(event: FormEvent) {
    event.preventDefault();
    if (!siteType || !scope || !seo || !brand || !urgency) return;
    const next = { siteType, scope, seo: seo === 'yes', brand: brand === 'needed', urgency };
    setBrief(next);
    const signature = JSON.stringify(next);
    if (lastTracked.current !== signature) {
      trackEvent('tool_complete', { cta_location: 'tool' });
      lastTracked.current = signature;
    }
    revealResult(resultRef);
  }

  const options = siteType && websiteOptions[siteType];
  const handoff = brief && result ? new URLSearchParams({
    siteType: brief.siteType, pages: brief.scope, urgency: brief.urgency,
    tier: result.base?.name ?? quoteLabel,
    package: result.base?.id ?? '',
    addons: [brief.brand ? 'brand' : '', brief.seo ? 'seo' : ''].filter(Boolean).join(','),
    quote_currency: currency,
    custom_scope: result.needsQuote ? 'yes' : '',
  }) : null;

  return <>
    <form className="tool-calculator tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
      <div className="tool-form-heading"><p className="tool-eyebrow">Your website brief</p><h2>Find a starting package.</h2></div>
      <PricingControls />
      <OptionQuestion label="What are you building?" value={siteType} onChange={value => {
        setSiteType(value as WebsiteScope);
        setScope(null);
        setBrief(null);
      }} options={[
        { value: 'informational', label: 'Informational website' },
        { value: 'ecommerce', label: 'E-commerce store' },
        { value: 'marketplace', label: 'Marketplace catalogue' },
      ]} />
      {options && <OptionQuestion label={options.label} value={scope} onChange={value => { setScope(value); setBrief(null); }} options={[...options.options]} />}
      <OptionQuestion label={siteType === 'marketplace' ? 'Do you need ongoing listing SEO?' : 'Do you need ongoing SEO?'} value={seo} onChange={value => { setSeo(value); setBrief(null); }} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
      <OptionQuestion label="Do you already have a usable brand identity?" value={brand} onChange={value => { setBrand(value); setBrief(null); }} options={[{ value: 'ready', label: 'Yes, ready to use' }, { value: 'needed', label: 'No, identity needed' }]} />
      <OptionQuestion label="When would you like to begin?" value={urgency} onChange={value => { setUrgency(value); setBrief(null); }} options={[{ value: '30-days', label: 'Within 30 days' }, { value: '1-3-months', label: '1–3 months' }, { value: 'exploring', label: 'Still exploring' }]} />
      <Button type="submit" disabled={answered < 5}>{answered < 5 ? `Calculate Website Cost (${answered}/5 answered)` : 'Calculate Website Cost'}</Button>
    </form>
    {result && <section className="tool-results" ref={resultRef} aria-live="polite"><div className="tool-wrap"><ResultPanel eyebrow="Starting estimate" title={result.base?.name ?? 'Custom scope'}>
      <dl className="tool-result-list">
        <div><dt>Base package</dt><dd>{formatPrice(result.base?.id ?? null, currency, true)}</dd></div>
        {result.brand && <div><dt>Brand Starter</dt><dd>{formatPrice(result.brand.id, currency, true)}</dd></div>}
        <div className="tool-result-total"><dt>One-time starting estimate</dt><dd>{result.oneTimeTotal === null ? quoteLabel : `${formatRegionalAmount(result.oneTimeTotal, currency)} · one-time`}</dd></div>
        {(result.seo || result.customSeo) && <div><dt>{result.customSeo ? 'Ongoing listing SEO' : 'Ongoing SEO'}</dt><dd>{formatPrice(result.seo?.id ?? null, currency, true)}</dd></div>}
      </dl>
      <p className="tool-required-note">{result.needsQuote ? 'Part of this brief needs a separately scoped quote. Published amounts above apply only to the listed work.' : 'This estimate uses published starting prices. Your proposal confirms scope, provider costs and final pricing.'}</p>
      <ResultActions serviceHref={`/services/${result.service}`} serviceLabel="View the related service" auditHref={`/audit?${handoff}`} />
    </ResultPanel></div></section>}
  </>;
}
