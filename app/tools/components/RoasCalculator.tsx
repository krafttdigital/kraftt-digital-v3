'use client';

import { trackEvent } from '../../../lib/analytics/core';

import { useMemo, useRef, useState, type FormEvent } from 'react';
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
  const valid = Number(spend) > 0 && Number(revenue) >= 0 && revenue !== '' && (margin === '' || (Number(margin) > 0 && Number(margin) <= 100));
  const answered = [spend, revenue].filter((value) => value.trim() !== '').length;
  const result = useMemo(() => {
    const roas = Number(revenue) / Number(spend);
    const hasMargin = margin !== '' && Number(margin) > 0;
    const breakEven = hasMargin ? 100 / Number(margin) : null;
    const profit = hasMargin ? Number(revenue) * Number(margin) / 100 - Number(spend) : null;
    return { roas, breakEven, profit, clears: breakEven === null ? null : roas >= breakEven };
  }, [margin, revenue, spend]);
  function calculate(event: FormEvent) { event.preventDefault(); if (!valid) return; setShowResult(true); trackEvent('tool_complete', { cta_location: 'tool' }); revealResult(resultRef); }
  return <>
    <form className="tool-calculator tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
      <div className="tool-form-heading"><p className="tool-eyebrow">Advertising return</p><h2>Measure return against real margin.</h2></div>
      <InputCurrencySelect currency={currency} change={next => { setCurrency(next); setSpend(''); setRevenue(''); setShowResult(false); }} />
      <div className="tool-field-grid"><Field label={`Ad spend (${currency})`}><input type="number" min="0.01" step="0.01" value={spend} onChange={(event) => { setSpend(event.target.value); setShowResult(false); }} placeholder="Enter spend" required /></Field><Field label={`Revenue from those ads (${currency})`}><input type="number" min="0" step="0.01" value={revenue} onChange={(event) => { setRevenue(event.target.value); setShowResult(false); }} placeholder="Enter revenue" required /></Field><Field label="Profit margin (%) — optional" hint="Add this to see break-even ROAS and profit after ads."><input type="number" min="0.01" max="100" step="0.1" value={margin} onChange={(event) => { setMargin(event.target.value); setShowResult(false); }} placeholder="40" /></Field></div>
      <Button type="submit" disabled={!valid}>{valid ? 'Calculate ROAS' : `Calculate ROAS (${answered}/2 answered)`}</Button>
    </form>
    {showResult && <section className="tool-results" ref={resultRef} aria-live="polite"><div className="tool-wrap"><ResultPanel eyebrow="Return on ad spend" title={`${result.roas.toFixed(2)}x`}>
      <dl className="tool-result-list"><div><dt>Entered ROAS</dt><dd>{result.roas.toFixed(2)}x</dd></div><div><dt>Break-even ROAS</dt><dd>{result.breakEven === null ? 'Add profit margin to calculate' : `${result.breakEven.toFixed(2)}x`}</dd></div><div><dt>Profit after ads</dt><dd>{result.profit === null ? 'Add profit margin to calculate' : formatRegionalAmount(result.profit, currency, 2)}</dd></div></dl>
      <p className={`tool-status-note${result.clears === true ? ' positive' : result.clears === false ? ' negative' : ''}`}>{result.clears === null ? 'Add your profit margin to test whether this ROAS clears break-even.' : result.clears ? 'This ROAS clears the margin-based break-even point.' : 'This ROAS does not clear the margin-based break-even point.'} This planning tool does not mean Kraftt manages paid advertising campaigns.</p>
      <ResultActions serviceHref="/work" serviceLabel="View documented digital work" auditHref={`/audit?tool=roas-calculator&roas=${result.roas.toFixed(2)}&breakEven=${result.breakEven?.toFixed(2) ?? ''}`} />
    </ResultPanel></div></section>}
  </>;
}
