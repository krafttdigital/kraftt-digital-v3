'use client';

import { formContext, trackEvent, trackFormSuccess } from '../../lib/analytics/core';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { services } from '../data/services';
import { whatsappUrl } from '../data/site';
import { parseLeadHandoff } from '../data/handoff';

const formspreeEndpoint = 'https://formspree.io/f/mgawjopk';
const fields = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['business', 'Business'],
  ['service', 'Service'],
  ['message', 'Project details'],
] as const;

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const inFlightRef = useRef(false);
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handoff = parseLeadHandoff(new URLSearchParams(window.location.search));
    const setValue = (name: string, value: string) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) field.value = value;
    };
    setValue('service', handoff.service?.name ?? '');
    setValue('service_slug', handoff.service?.slug ?? '');
    setValue('place', handoff.place);
    setValue('source', handoff.source);
    setValue('band', handoff.band);
  }, []);

  function validForm() {
    const form = formRef.current;
    return form?.reportValidity() ? form : null;
  }

  function sendWhatsApp() {
    const form = validForm();
    if (!form) return;
    const data = new FormData(form);
    const details = fields
      .map(([key, label]) => [label, String(data.get(key) ?? '').trim()] as const)
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    trackEvent('whatsapp_click', { ...formContext(form), form_id: 'contact_enquiry', cta_location: 'form', cta_label: 'whatsapp', destination_type: 'whatsapp' });
    const service = String(data.get('service') || 'a project');
    const source = String(data.get('source') || 'page');
    const pageName = source === 'score' ? 'Digital Presence Score' : source === 'calculator' ? 'calculator' : source === 'offer' ? 'offer' : service === 'a project' ? 'website' : 'Services';
    window.open(whatsappUrl(`Hi Kraftt, I'd like a free call about ${service} (from the ${pageName} page).\n\n${details}`), '_blank', 'noopener,noreferrer');
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
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Could not send enquiry');
      trackFormSuccess('contact_enquiry', form);
      form.reset();
      setState('success');
    } catch {
      setState('error');
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <form ref={formRef} id="enquiry" className="audit-form contact-form" action={formspreeEndpoint} method="POST" onSubmit={sendForm}>
      <input type="hidden" name="_subject" value="New Kraftt website enquiry" />
      <input type="hidden" name="service_slug" defaultValue="" />
      <input type="hidden" name="place" defaultValue="" />
      <input type="hidden" name="source" defaultValue="" />
      <input type="hidden" name="band" defaultValue="" />
      <div className="audit-field-grid">
        <label><span>Your name *</span><input name="name" autoComplete="name" placeholder="Your name" required /></label>
        <label><span>Email *</span><input name="email" type="email" autoComplete="email" placeholder="you@business.com" required /></label>
        <label><span>Business or brand</span><input name="business" autoComplete="organization" placeholder="Business name" /></label>
        <label><span>What do you need?</span><select name="service" defaultValue=""><option value="">Not sure yet</option>{services.map((service) => <option key={service.slug} value={service.name}>{service.name}</option>)}</select></label>
        <label className="audit-field-span"><span>A few words about your project *</span><textarea name="message" rows={3} maxLength={1000} placeholder="What are you trying to improve or launch?" required /></label>
      </div>
      <label className="audit-consent"><input type="checkbox" name="consent" value="Yes" required /><span>I agree to Kraftt using these details to reply to my enquiry. See the <Link href="/legal/privacy-policy">privacy policy</Link>.</span></label>
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
