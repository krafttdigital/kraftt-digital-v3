'use client';

import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '../../../lib/analytics/core';
import { formatRegionalAmount, type PricingCurrency } from '../../data/pricing';
import { businessTools, defaults, evaluate, type InputField, type ResultRow, type Values } from '../businessModels';
import { Field, ResultPanel } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';
import { InputCurrencySelect } from './InputCurrencySelect';

function formatResult(row: ResultRow, currency: PricingCurrency, unknown: string) {
  if (row.value === null) return unknown;
  if (row.unit === 'money') return formatRegionalAmount(row.value, currency, 2);
  const number = row.value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return row.unit === 'percent' ? `${number}%` : number;
}

export function BusinessCalculator({ slug }: { slug: string }) {
  const tool = businessTools.find(item => item.slug === slug)!;
  const [currency, setCurrency] = useState<PricingCurrency>('INR');
  const [values, setValues] = useState<Values>(() => defaults(tool));
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState(false);
  const completionSent = useRef(false);
  const { result, errors } = evaluate(tool, values);
  const comparison = slug === 'website-quote-comparison';
  const hasMoney = tool.fields.some(field => field.money);
  const complete = started && result?.complete === true;
  useEffect(() => {
    if (!complete || completionSent.current) return;
    completionSent.current = true;
    trackEvent('tool_complete', { cta_location: 'tool' });
  }, [complete]);

  function update(key: string, value: string) {
    setStarted(true);
    setValues(current => {
      // Reach and followers describe different audiences. Ask for the new count.
      if (key === 'basis') return { ...current, basis: value, denominator: '' };
      return { ...current, [key]: value };
    });
    setTouched(current => {
      const next = new Set(current);
      next.add(key);
      if (key === 'basis') next.delete('denominator');
      return next;
    });
  }

  function loadScenario(example: boolean) {
    if (example && hasMoney) setCurrency('INR');
    setStarted(example);
    setValues(example ? { ...tool.example } : defaults(tool));
    setTouched(new Set());
  }

  function changeCurrency(next: PricingCurrency) {
    setCurrency(next);
    setValues(previous => {
      const updated = { ...previous };
      for (const field of tool.fields) if (field.money) updated[field.key] = '';
      return updated;
    });
    setTouched(new Set());
  }

  function renderField(field: InputField) {
    if (field.visibleWhen && !field.visibleWhen(values)) return null;
    const { key, options } = field;
    const id = `${slug}-${key}`;
    const error = touched.has(key) ? errors[key] : undefined;
    let label = field.label;
    if (comparison) label = label.replace(/^Proposal [AB] · /, '');
    if (key === 'denominator') label = values.basis === 'Reach' ? 'Unique accounts reached' : 'Followers at the time of measurement';
    if (field.money) label += ` (${currency})`;
    const props = { id, value: values[key], 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined };
    return (
      <Field key={key} label={label} hint={field.hint} wide={field.text}>
        {options ? (
          <select {...props} onChange={event => update(key, event.target.value)}>
            {options.map(option => <option key={option}>{option}</option>)}
          </select>
        ) : field.text ? (
          <textarea {...props} maxLength={600} onChange={event => update(key, event.target.value)} />
        ) : (
          <input {...props} type="number" min="0" max={field.max ?? field.exclusiveMax ?? 1e12}
            step={field.integer ? 1 : 'any'} inputMode={field.integer ? 'numeric' : 'decimal'}
            placeholder={field.optional ? 'Unknown' : 'Enter value'}
            onChange={event => update(key, event.target.value)} />
        )}
        {error && <small id={`${id}-error`} className="business-tool-error">{error}</small>}
      </Field>
    );
  }

  return (
    <>
      <form id="tool-workspace" className="tool-calculator tool-wrap-wide business-tool" onSubmit={event => event.preventDefault()} noValidate>
        <div className="tool-form-heading">
          <p className="tool-eyebrow">{hasMoney ? `Your assumptions · ${currency}` : 'Your Instagram insights'}</p>
          <h2>{comparison ? 'Compare your proposals.' : 'Enter your figures.'}</h2>
          <p>{comparison ? 'Leave an unquoted charge blank. Enter 0 when the provider confirms it is free.'
            : hasMoney ? `Use ${currency} and the same tax basis for all amounts.`
            : 'Use likes, comments, saves and shares from the same post or reporting period.'} Results update as you type.</p>
        </div>
        <div className="business-tool-controls">
          <Button type="button" variant="secondary" onClick={() => loadScenario(true)}>{hasMoney ? 'Try worked example (INR)' : 'Try worked example'}</Button>
          <Button type="button" variant="secondary" disabled={!started} onClick={() => loadScenario(false)}>Reset</Button>
        </div>
        {hasMoney && <InputCurrencySelect currency={currency} change={changeCurrency} />}
        {comparison ? (
          <>
            {renderField(tool.fields[0])}
            {['a', 'b'].map(prefix => (
              <fieldset className="business-proposal" key={prefix}>
                <legend>Proposal {prefix.toUpperCase()}</legend>
                <div className="tool-field-grid">{tool.fields.filter(field => field.key.startsWith(prefix)).map(renderField)}</div>
              </fieldset>
            ))}
          </>
        ) : <div className="tool-field-grid">{tool.fields.map(renderField)}</div>}
        {started && !result && <p role="status" className="tool-status-note">{errors.calculation || 'Complete the required fields to see your result.'}</p>}
      </form>

      <section className="tool-results business-tool-results" aria-label="Calculated result">
        <div className="tool-wrap">
          <ResultPanel eyebrow="Your result" title={comparison ? 'Proposal comparison' : 'Calculation breakdown'}>
            <div aria-live="polite">
              {result && started ? (
                <>
                  <dl className="tool-result-list">
                    {result.rows.map(row => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{formatResult(row, currency, comparison ? 'Unknown' : 'Not defined')}</dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="business-tool-notes">
                    {result.notes.map((note, index) => <li key={index}>{note}</li>)}
                  </ul>
                </>
              ) : <p>Enter your figures or try the worked example to see the calculation.</p>}
            </div>
            {started && result && <ResultActions serviceHref={`/services/${tool.service}`} serviceLabel="Explore the related service" auditHref={`/audit?tool=${slug}`} />}
          </ResultPanel>
        </div>
      </section>
    </>
  );
}
