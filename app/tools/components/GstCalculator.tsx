'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Field, OptionQuestion, ResultPanel, formatINR, revealResult } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';

export function GstCalculator() {
  const [mode, setMode] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('18');
  const [customRate, setCustomRate] = useState('');
  const [sameState, setSameState] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const effectiveRate = rate === 'custom' ? Number(customRate) : Number(rate);
  const amountNumber = Number(amount);
  const isValid = Boolean(mode && sameState && amountNumber >= 0 && amount !== '' && effectiveRate >= 0);
  const progressValues = [mode, amount, rate, sameState, ...(rate === 'custom' ? [customRate] : [])];
  const answered = progressValues.filter((value) => value !== null && String(value).trim() !== '').length;

  const calculation = useMemo(() => {
    if (!isValid) return { base: 0, gst: 0, total: 0 };
    if (mode === 'exclusive') {
      const gst = amountNumber * effectiveRate / 100;
      return { base: amountNumber, gst, total: amountNumber + gst };
    }
    const base = amountNumber / (1 + effectiveRate / 100);
    return { base, gst: amountNumber - base, total: amountNumber };
  }, [amountNumber, effectiveRate, isValid, mode]);

  function calculate(event: FormEvent) {
    event.preventDefault();
    if (!isValid) return;
    setShowResult(true);
    revealResult(resultRef);
  }

  return <>
    <form className="tool-calculator tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
      <div className="tool-form-heading"><p className="tool-eyebrow">GST amount and split</p><h2>Add tax or reverse an inclusive total.</h2></div>
      <OptionQuestion label="What do you want to calculate?" value={mode} onChange={(value) => { setMode(value); setShowResult(false); }} options={[{ value: 'exclusive', label: 'Exclusive → Inclusive' }, { value: 'inclusive', label: 'Inclusive → Breakdown' }]} />
      <div className="tool-field-grid">
        <Field label={mode === 'inclusive' ? 'Total inclusive amount (₹)' : 'Base amount (₹)'}><input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setShowResult(false); }} placeholder="25000" required /></Field>
        <Field label="GST rate"><select value={rate} onChange={(event) => { setRate(event.target.value); setShowResult(false); }}><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option><option value="custom">Custom</option></select></Field>
        {rate === 'custom' && <Field label="Custom GST rate (%)"><input type="number" min="0" step="0.01" inputMode="decimal" value={customRate} onChange={(event) => { setCustomRate(event.target.value); setShowResult(false); }} placeholder="Enter rate" required /></Field>}
      </div>
      <OptionQuestion label="Is the customer in the same state as your business?" value={sameState} onChange={(value) => { setSameState(value); setShowResult(false); }} options={[{ value: 'yes', label: 'Yes — CGST + SGST' }, { value: 'no', label: 'No — IGST' }]} />
      <Button type="submit" disabled={!isValid}>{isValid ? 'Calculate GST' : `Calculate GST (${answered}/${progressValues.length} answered)`}</Button>
    </form>
    {showResult && <section className="tool-results" ref={resultRef} aria-live="polite"><div className="tool-wrap"><ResultPanel eyebrow={`${effectiveRate}% GST · ${sameState === 'yes' ? 'intra-state' : 'inter-state'}`} title={formatINR(calculation.total)}>
      <dl className="tool-result-list"><div><dt>Taxable base</dt><dd>{formatINR(calculation.base)}</dd></div><div><dt>Total GST</dt><dd>{formatINR(calculation.gst)}</dd></div>{sameState === 'yes' ? <><div><dt>CGST ({effectiveRate / 2}%)</dt><dd>{formatINR(calculation.gst / 2)}</dd></div><div><dt>SGST ({effectiveRate / 2}%)</dt><dd>{formatINR(calculation.gst / 2)}</dd></div></> : <div><dt>IGST ({effectiveRate}%)</dt><dd>{formatINR(calculation.gst)}</dd></div>}</dl>
      <ResultActions serviceHref="/services/dashboards-internal-tools" serviceLabel="Explore Business Tools & Dashboards" auditHref={`/audit?tool=gst-calculator&gstRate=${effectiveRate}&gstMode=${mode}`} />
    </ResultPanel></div></section>}
  </>;
}
