'use client';

import { formContext, trackEvent, trackFormSuccess } from '../../lib/analytics/core';

import { Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { services } from '../data/services';
import { whatsappUrl } from '../data/site';
import { parseLeadHandoff } from '../data/handoff';
import { usePricingCurrency } from '../components/PricingCurrencyProvider';
import { isPricingCurrency, pricingEnquiry, pricingMarket, type PricingCurrency } from '../data/pricing';

const formspreeEndpoint = 'https://formspree.io/f/mgawjopk';
const fields = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['business', 'Business'],
  ['service', 'Service'],
  ['message', 'Project details'],
] as const;

type ContactSelection = {
  query: string | null;
  serviceSlug: string;
  place: string;
  source: string;
  band: string;
  region: PricingCurrency | null;
  estimateCurrency: PricingCurrency | null;
};

function ContactQuery({ sync, region }: { sync: (query: string, region: PricingCurrency) => void; region: PricingCurrency }) {
  const query = useSearchParams().toString();
  useEffect(() => sync(query, region), [query, region, sync]);
  return null;
}

export function ContactForm() {
  const currency = usePricingCurrency();
  const formRef = useRef<HTMLFormElement>(null);
  const inFlightRef = useRef(false);
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const [selection, setSelection] = useState<ContactSelection>({
    query: null, serviceSlug: '', place: '', source: '', band: '', region: null, estimateCurrency: null,
  });

  const sync = useCallback((query: string, region: PricingCurrency) => {
    setSelection(current => {
      if (current.query === query) {
        if (current.region === region) return current;
        return { ...current, region, estimateCurrency: current.estimateCurrency && region };
      }
      const params = new URLSearchParams(query);
      const { service, place, source, band } = parseLeadHandoff(params);
      const estimate = pricingEnquiry(params, region, service?.slug);
      const compatible = estimate.package_id || (service && !params.get('package') && params.get('custom_scope') === 'yes');
      return {
        query, region, serviceSlug: service?.slug ?? '', place, source, band,
        estimateCurrency: compatible && isPricingCurrency(estimate.estimate_currency) ? estimate.estimate_currency : null,
      };
    });
  }, []);

  const service = services.find(item => item.slug === selection.serviceSlug);
  const quoteParams = new URLSearchParams(selection.estimateCurrency ? selection.query ?? '' : '');
  if (selection.estimateCurrency) {
    quoteParams.set('quote_currency', selection.region === currency ? selection.estimateCurrency : currency);
  }
  const pricing = pricingEnquiry(quoteParams, currency, service?.slug);

  function validForm() {
    const form = formRef.current;
    return form?.reportValidity() ? form : null;
  }

  function submission(form: HTMLFormElement) {
    const data = new FormData(form);
    data.set('service', service?.name ?? '');
    data.set('service_slug', service?.slug ?? '');
    for (const [name, value] of Object.entries(pricing)) data.set(name, value);
    return data;
  }

  function sendWhatsApp() {
    const form = validForm();
    if (!form) return;
    const data = submission(form);
    const details = fields
      .map(([key, label]) => [label, String(data.get(key) ?? '').trim()] as const)
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    trackEvent('whatsapp_click', { ...formContext(form), form_id: 'contact_enquiry', cta_location: 'form', cta_label: 'whatsapp', destination_type: 'whatsapp' });
    const service = String(data.get('service') || 'a project');
    const source = String(data.get('source') || 'page');
    const pageName = source === 'score' ? 'Digital Presence Score' : source === 'calculator' ? 'calculator' : source === 'offer' ? 'offer' : service === 'a project' ? 'website' : 'Services';
    const estimate = data.get('estimate_summary');
    const region = `Pricing region: ${currency === 'INR' ? 'India · INR' : 'International · USD'}.`;
    const extra = estimate ? `\nCalculator estimate (${data.get('estimate_currency')}):\n${estimate}` : '';
    window.open(whatsappUrl(`Hi Kraftt, I'd like a free call about ${service} (from the ${pageName} page).\n\n${details}\n${region}${extra}`), '_blank', 'noopener,noreferrer');
  }

  async function sendForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = validForm();
    if (!form || inFlightRef.current) return;
    inFlightRef.current = true;
    setState('sending');
    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: submission(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Could not send enquiry');
      trackFormSuccess('contact_enquiry', form);
      form.reset();
      setSelection(current => ({ ...current, serviceSlug: '', estimateCurrency: null }));
      setState('success');
    } catch {
      setState('error');
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <form ref={formRef} id="enquiry" className="audit-form contact-form" action={formspreeEndpoint} method="POST" onSubmit={sendForm}>
      <Suspense fallback={null}><ContactQuery sync={sync} region={currency} /></Suspense>
      <input type="hidden" name="_subject" value="New Kraftt website enquiry" />
      <input type="hidden" name="service_slug" value={service?.slug ?? ''} />
      <input type="hidden" name="place" value={selection.place} />
      <input type="hidden" name="source" value={selection.source} />
      <input type="hidden" name="band" value={selection.band} />
      <input type="hidden" name="pricing_market" value={pricingMarket(currency)} />
      <input type="hidden" name="pricing_currency" value={currency} />
      <div className="audit-field-grid">
        <label><span>Your name *</span><input name="name" autoComplete="name" placeholder="Your name" required /></label>
        <label><span>Email *</span><input name="email" type="email" autoComplete="email" placeholder="you@business.com" required /></label>
        <label><span>Business or brand</span><input name="business" autoComplete="organization" placeholder="Business name" /></label>
        <label><span>What do you need?</span><select name="service" value={service?.name ?? ''} disabled={state === 'sending'} onChange={event => {
          const serviceSlug = services.find(item => item.name === event.target.value)?.slug ?? '';
          setSelection(current => current.serviceSlug === serviceSlug ? current : { ...current, serviceSlug, estimateCurrency: null });
        }}><option value="">Not sure yet</option>{services.map(item => <option key={item.slug} value={item.name}>{item.name}</option>)}</select></label>
        <label className="audit-field-span"><span>A few words about your project *</span><textarea name="message" rows={3} maxLength={1000} placeholder="What are you trying to improve or launch?" required /></label>
      </div>
      <label className="audit-consent"><input type="checkbox" name="consent" value="Yes" required /><span>I agree to Kraftt using these details to reply to my enquiry. See the <Link href="/legal/privacy-policy">privacy policy</Link>.</span></label>
      <p className="contact-form-note">Pricing region: {currency === 'INR' ? 'India · INR' : 'International · USD'}</p>
      <div aria-live="polite">
        {pricing.estimate_summary && <div className="contact-form-note">
          <strong>Calculator estimate ({pricing.estimate_currency})</strong>
          <ul>{pricing.estimate_summary.split('\n').map(line => <li key={line}>{line}</li>)}</ul>
        </div>}
      </div>
      <div className="contact-form-actions">
        <button className="button button-accent" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send enquiry'} <span aria-hidden="true">→</span></button>
        <button className="button button-outline-dark" type="button" onClick={sendWhatsApp}>Send on WhatsApp <span aria-hidden="true">↗</span></button>
      </div>
      <p className="contact-form-note">Choose one option. Form entries are processed by Formspree. WhatsApp opens a prepared message for you to review and send.</p>
      {state === 'success' && <p className="audit-form-status success" role="status"><strong>Enquiry sent.</strong> We will review it and get back to you.</p>}
      {state === 'error' && <p className="audit-form-status error" role="alert"><strong>The form could not be sent.</strong> Please try again or use WhatsApp.</p>}
    </form>
  );
}
