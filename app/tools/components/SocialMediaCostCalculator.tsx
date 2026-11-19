'use client';

import { trackEvent } from '../../../lib/analytics/core';

import { useRef, useState, type FormEvent } from 'react';
import { OptionQuestion, ResultPanel, revealResult } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';
import { PricingControls, usePricingCurrency } from '../../components/PricingCurrencyProvider';
import { formatPrice, quoteLabel } from '../../data/pricing';
import { serviceBySlug } from '../../data/services';
import { socialEstimate } from '../packageEstimates';

type SocialBrief = { platforms: string; posts: string; stories: string; community: string };

export function SocialMediaCostCalculator() {
  const currency = usePricingCurrency();
  const [platforms, setPlatforms] = useState<string | null>(null);
  const [posts, setPosts] = useState<string | null>(null);
  const [stories, setStories] = useState<string | null>(null);
  const [community, setCommunity] = useState<string | null>(null);
  const [brief, setBrief] = useState<SocialBrief | null>(null);
  const result = brief && socialEstimate(brief.platforms, brief.posts, brief.community === 'yes', currency);
  const tier = serviceBySlug('social-media-management')?.tiers.find(item => item.priceId === result?.base?.id);
  const resultRef = useRef<HTMLElement>(null);
  const lastTracked = useRef('');
  const answered = [platforms, posts, stories, community].filter(Boolean).length;

  function calculate(event: FormEvent) {
    event.preventDefault();
    if (!platforms || !posts || !stories || !community) return;
    setBrief({ platforms, posts, stories, community });
    const signature = JSON.stringify([platforms, posts, stories, community]);
    if (lastTracked.current !== signature) {
      trackEvent('tool_complete', { cta_location: 'tool' });
      lastTracked.current = signature;
    }
    revealResult(resultRef);
  }
  const handoff = brief && result ? new URLSearchParams({
    ...brief, socialTier: result.base?.name ?? quoteLabel, package: result.base?.id ?? '',
    quote_currency: currency, custom_scope: result.needsQuote ? 'yes' : '',
  }) : null;

  return <>
    <form className="tool-calculator tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
      <div className="tool-form-heading"><p className="tool-eyebrow">Your monthly content need</p><h2>Match the workload to the right tier.</h2></div>
      <PricingControls />
      <OptionQuestion label="How many platforms need management?" value={platforms} onChange={value => { setPlatforms(value); setBrief(null); }} options={[{ value: '1', label: '1 platform' }, { value: '2', label: '2 platforms' }, { value: '3', label: '3 platforms' }, { value: '4', label: '4+ platforms' }]} />
      <OptionQuestion label="How many posts do you need each month?" value={posts} onChange={value => { setPosts(value); setBrief(null); }} options={[{ value: '15', label: 'Up to 15' }, { value: '21', label: '16–21' }, { value: '30', label: '22–30' }, { value: '31', label: '31+ posts' }]} />
      <OptionQuestion label="Do you need stories?" value={stories} onChange={value => { setStories(value); setBrief(null); }} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
      <OptionQuestion label="Do you need direct-message handling separately scoped?" value={community} onChange={value => { setCommunity(value); setBrief(null); }} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes, discuss it' }]} />
      <Button type="submit" disabled={answered < 4}>{answered < 4 ? `Find My Social Tier (${answered}/4 answered)` : 'Find My Social Tier'}</Button>
    </form>
    {result && <section className="tool-results" ref={resultRef} aria-live="polite"><div className="tool-wrap"><ResultPanel eyebrow="Closest management tier" title={result.base?.name ?? 'Custom scope'}>
      <div className="tool-price-callout">{result.needsQuote ? quoteLabel : formatPrice(result.base?.id ?? null, currency, true)}</div>
      {result.needsQuote && result.base && <p>Base package only: {formatPrice(result.base.id, currency, true)}. Direct-message handling needs a separate quote.</p>}
      {tier && <ul className="tool-check-list">{tier.deliverables.map(item => <li key={item}>{item}</li>)}</ul>}
      <p className="tool-required-note">Posts are one shared content set across selected platforms. Direct messages, conventional video production and paid campaigns are outside these packages. Final scope is confirmed in a written proposal.</p>
      <ResultActions serviceHref="/services/social-media-management" serviceLabel="View Social Media Management" auditHref={`/audit?${handoff}`} />
    </ResultPanel></div></section>}
  </>;
}
