'use client';

import { useRef, useState, type FormEvent } from 'react';
import { OptionQuestion, ResultPanel, revealResult } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';
import { usePricingCurrency } from '../../components/PricingCurrencyProvider';
import { formatRegionalAmount, pricing } from '../../data/pricing';

type SocialResult = { name: string; price: string; includes: string[]; auditHref: string };

export function SocialMediaCostCalculator() {
  const currency = usePricingCurrency();
  const [platforms, setPlatforms] = useState<string | null>(null);
  const [posts, setPosts] = useState<string | null>(null);
  const [stories, setStories] = useState<string | null>(null);
  const [community, setCommunity] = useState<string | null>(null);
  const [result, setResult] = useState<SocialResult | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const answered = [platforms, posts, stories, community].filter(Boolean).length;

  function calculate(event: FormEvent) {
    event.preventDefault();
    if (!platforms || !posts || !stories || !community) return;
    const domination = platforms === '3' || posts === '30';
    const growth = !domination && (platforms === '2' || posts === '21');
    const next = domination
      ? { name: 'Social Presence Management', price: `${formatRegionalAmount(pricing.socialMediaCalculator.domination[currency], currency)}/month`, includes: ['One shared set of 30 posts across 3 platforms', '20 stories each month', '5 specified AI-generated reels', 'Engagement and comment replies', 'Monthly performance report'] }
      : growth
        ? { name: 'Social Growth', price: `${formatRegionalAmount(pricing.socialMediaCalculator.growth[currency], currency)}/month`, includes: ['One shared set of 21 posts across 2 platforms', '15 stories each month', 'Monthly content calendar', 'Engagement and comment replies', 'Monthly performance report'] }
        : { name: 'Social Starter', price: `${formatRegionalAmount(pricing.socialMediaCalculator.starter[currency], currency)}/month`, includes: ['15 posts on 1 platform', '10 stories each month', 'Profile setup and captions', 'Engagement and comment replies', 'Monthly performance report'] };
    setResult({ ...next, auditHref: `/audit?socialTier=${encodeURIComponent(next.name)}&platforms=${platforms}&posts=${posts}&stories=${stories}&community=${community}` });
    revealResult(resultRef);
  }

  return <>
    <form className="tool-calculator tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
      <div className="tool-form-heading"><p className="tool-eyebrow">Your monthly content need</p><h2>Match the workload to the right tier.</h2></div>
      <OptionQuestion label="How many platforms need management?" value={platforms} onChange={setPlatforms} options={[{ value: '1', label: '1 platform' }, { value: '2', label: '2 platforms' }, { value: '3', label: '3+ platforms' }]} />
      <OptionQuestion label="How many posts do you need each month?" value={posts} onChange={setPosts} options={[{ value: '15', label: '~15 posts' }, { value: '21', label: '~21 posts' }, { value: '30', label: '30+ posts' }]} />
      <OptionQuestion label="Do you need stories?" value={stories} onChange={setStories} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
      <OptionQuestion label="Do you need direct-message handling separately scoped?" value={community} onChange={setCommunity} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes, discuss it' }]} />
      <Button type="submit" disabled={answered < 4}>{answered < 4 ? `Find My Social Tier (${answered}/4 answered)` : 'Find My Social Tier'}</Button>
    </form>
    {result && <section className="tool-results" ref={resultRef} aria-live="polite"><div className="tool-wrap"><ResultPanel eyebrow="Closest management tier" title={result.name}>
      <div className="tool-price-callout">{result.price}</div>
      <ul className="tool-check-list">{result.includes.map((item) => <li key={item}>{item}</li>)}</ul>
      <p className="tool-required-note">Posts are one shared content set across selected platforms. Direct messages, conventional video production and paid campaigns are outside these packages. Final scope is confirmed in a written proposal.</p>
      <ResultActions serviceHref="/services/social-media-management" serviceLabel="View Social Media Management" auditHref={result.auditHref} />
    </ResultPanel></div></section>}
  </>;
}
