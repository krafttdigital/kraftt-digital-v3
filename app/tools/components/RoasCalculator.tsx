'use client';

import { trackEvent } from '../../../lib/analytics/core';

import { useRef, useState, type FormEvent } from 'react';
import { Field, ResultPanel, revealResult } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';
import { formatRegionalAmount, type PricingCurrency } from '../../data/pricing';
import { InputCurrencySelect } from './InputCurrencySelect';

export function RoasCalculator() {
  const [currency, setCurrency] = useState<PricingCurrency>('INR');
  const [spend, setSpend] = useState('');
  const [revenue, setRevenue] = useState('');
  const [margin, setMargin] = useState('');
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const adSpend = Number(spend);
  const adRevenue = Number(revenue);
  const marginPercent = margin === '' ? null : Number(margin);
  const roas = adRevenue / adSpend;
  const valid = adSpend >= 0.01 && revenue !== '' && adRevenue >= 0 &&
    Number.isFinite(adSpend) && Number.isFinite(roas) &&
    (marginPercent === null || (marginPercent >= 0 && marginPercent <= 100));
  const answered = [spend, revenue].filter((value) => value.trim() !== '').length;
  const requiredRoas = marginPercent && 100 / marginPercent;
  const breakEven = requiredRoas && Number.isFinite(requiredRoas) ? requiredRoas : null;
  const contribution = marginPercent === null ? null : adRevenue * (marginPercent / 100) - adSpend;
  const clears = breakEven !== null && roas >= breakEven;
  const unavailableBreakEven = marginPercent === null ? 'Add profit margin to calculate'
    : marginPercent === 0 ? 'No break-even at 0% margin' : 'Break-even exceeds the calculator’s range.';
  function calculate(event: FormEvent) { event.preventDefault(); if (!valid) return; setShowResult(true); trackEvent('tool_complete', { cta_location: 'tool' }); revealResult(resultRef); }
  return <>
    <form className="tool-calculator tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
      <div className="tool-form-heading"><p className="tool-eyebrow">Advertising return</p><h2>Measure return against real margin.</h2></div>
      <InputCurrencySelect currency={currency} change={next => { setCurrency(next); setSpend(''); setRevenue(''); setShowResult(false); }} />
      <div className="tool-field-grid">
        <Field label={`Ad spend (${currency})`}><input type="number" min="0.01" step="any" value={spend} onChange={event => { setSpend(event.target.value); setShowResult(false); }} placeholder="Enter spend" required /></Field>
        <Field label={`Revenue from those ads (${currency})`}><input type="number" min="0" step="any" value={revenue} onChange={event => { setRevenue(event.target.value); setShowResult(false); }} placeholder="Enter revenue" required /></Field>
        <Field label="Profit margin (%) — optional" hint="Enter 0 to 100 to calculate contribution after ads and break-even ROAS."><input type="number" min="0" max="100" step="any" value={margin} onChange={event => { setMargin(event.target.value); setShowResult(false); }} placeholder="40" /></Field>
      </div>
      <Button type="submit" disabled={!valid}>{valid ? 'Calculate ROAS' : `Calculate ROAS (${answered}/2 answered)`}</Button>
    </form>
    {showResult && valid && <section className="tool-results" ref={resultRef} aria-live="polite"><div className="tool-wrap"><ResultPanel eyebrow="Return on ad spend" title={`${roas.toFixed(2)}×`}>
      <dl className="tool-result-list">
        <div><dt>Actual ROAS</dt><dd>{roas.toFixed(2)}×</dd></div>
        <div><dt>Break-even ROAS</dt><dd>{breakEven === null ? unavailableBreakEven : `${breakEven.toFixed(2)}×`}</dd></div>
        <div><dt>Contribution after advertising</dt><dd>{contribution === null ? 'Add profit margin to calculate' : formatRegionalAmount(contribution, currency, 2)}</dd></div>
      </dl>
      <p className={`tool-status-note${breakEven === null ? '' : clears ? ' positive' : ' negative'}`}>{marginPercent === 0
        ? 'At 0% margin, revenue contributes nothing toward ad spend.'
        : breakEven === null ? unavailableBreakEven : clears ? 'This ROAS clears the margin-based break-even point.' : 'This ROAS falls short of the margin-based break-even point.'} Use this result for planning.</p>
      <ResultActions serviceHref="/work" serviceLabel="View documented digital work" auditHref={`/audit?tool=roas-calculator&roas=${roas.toFixed(2)}&breakEven=${breakEven?.toFixed(2) ?? ''}`} />
    </ResultPanel></div></section>}
  </>;
}
