'use client';

import { trackEvent } from '../../../lib/analytics/core';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Field, ResultPanel, revealResult } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';
import { formatPrice, formatRegionalAmount, priceFor, type PricingCurrency } from '../../data/pricing';
import { InputCurrencySelect } from './InputCurrencySelect';

const scenarios = [{ name: 'Conservative', growth: .2 }, { name: 'Moderate', growth: .5 }, { name: 'Strong', growth: 1 }];

export function SeoRoiCalculator() {
  const [currency, setCurrency] = useState<PricingCurrency>('INR');
  const [visitors, setVisitors] = useState('');
  const [conversionRate, setConversionRate] = useState('2');
  const [customerValue, setCustomerValue] = useState('');
  const [seoCost, setSeoCost] = useState(() => String(priceFor('ecomseo-1', 'INR').amount ?? ''));
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const valid = Number(visitors) >= 0 && visitors !== '' && Number(conversionRate) >= 0 && conversionRate !== '' && Number(customerValue) >= 0 && customerValue !== '' && Number(seoCost) > 0;
  const answered = [visitors, conversionRate, customerValue, seoCost].filter((value) => value.trim() !== '').length;
  const results = useMemo(() => scenarios.map((scenario) => {
    const additionalVisitors = Number(visitors) * scenario.growth;
    const additionalConversions = additionalVisitors * Number(conversionRate) / 100;
    const additionalRevenue = additionalConversions * Number(customerValue);
    const roi = (additionalRevenue - Number(seoCost)) / Number(seoCost) * 100;
    return { ...scenario, additionalVisitors, additionalConversions, additionalRevenue, roi };
  }), [conversionRate, customerValue, seoCost, visitors]);

  function calculate(event: FormEvent) { event.preventDefault(); if (!valid) return; setShowResult(true); trackEvent('tool_complete', { cta_location: 'tool' }); revealResult(resultRef); }
  return <>
    <form className="tool-calculator tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
      <div className="tool-form-heading"><p className="tool-eyebrow">Illustrative planning model</p><h2>Compare three organic-growth scenarios.</h2></div>
      <InputCurrencySelect currency={currency} change={next => { setCurrency(next); setCustomerValue(''); setSeoCost(''); setShowResult(false); }} />
      <div className="tool-field-grid">
        <Field label="Current monthly organic visitors"><input type="number" min="0" step="1" value={visitors} onChange={(event) => { setVisitors(event.target.value); setShowResult(false); }} placeholder="1000" required /></Field>
        <Field label="Current conversion rate (%)" hint="2% is a suggested starting input—not a claim."><input type="number" min="0" step="0.1" value={conversionRate} onChange={(event) => { setConversionRate(event.target.value); setShowResult(false); }} required /></Field>
        <Field label={`Average converted customer/order value (${currency})`}><input type="number" min="0" step="0.01" value={customerValue} onChange={(event) => { setCustomerValue(event.target.value); setShowResult(false); }} placeholder="Enter order value" required /></Field>
        <Field label={`Monthly SEO retainer cost (${currency})`} hint={`Kraftt SEO Starter: ${formatPrice('ecomseo-1', currency, true)}.`}><input type="number" min="0.01" step="0.01" value={seoCost} onChange={(event) => { setSeoCost(event.target.value); setShowResult(false); }} required /></Field>
      </div>
      <Button type="submit" disabled={!valid}>{valid ? 'Compare SEO Scenarios' : `Compare SEO Scenarios (${answered}/4 answered)`}</Button>
    </form>
    {showResult && <section className="tool-results" ref={resultRef} aria-live="polite"><div className="tool-wrap tool-wrap-wide"><p className="tool-disclaimer">These are illustrative projections based on your inputs and fixed comparison scenarios — not a guarantee of results. Actual outcomes depend on your industry, competition, and starting point.</p><ResultPanel eyebrow="Three scenarios · never one promise" title="What traffic growth could mean">
      <div className="tool-scenario-grid">{results.map((result) => <article key={result.name}><p className="tool-eyebrow">{result.name} · +{result.growth * 100}% traffic</p><strong>{Number.isFinite(result.roi) ? `${result.roi.toFixed(1)}%` : '0%'}</strong><span>Illustrative monthly ROI</span><dl><div><dt>Additional visitors</dt><dd>{Math.round(result.additionalVisitors).toLocaleString('en-IN')}</dd></div><div><dt>Additional conversions</dt><dd>{result.additionalConversions.toFixed(1)}</dd></div><div><dt>Additional revenue</dt><dd>{formatRegionalAmount(result.additionalRevenue, currency, 2)}</dd></div></dl></article>)}</div>
      <ResultActions serviceHref="/services/ecommerce-seo" serviceLabel="View E-commerce SEO" auditHref={`/audit?tool=seo-roi&scenario=moderate&roi=${results[1].roi.toFixed(1)}`} />
    </ResultPanel></div></section>}
  </>;
}
