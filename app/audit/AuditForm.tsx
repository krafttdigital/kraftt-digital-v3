'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { services } from '../data/services';
import { whatsappUrl } from '../data/site';
import { usePricingCurrency } from '../components/PricingCurrencyProvider';
import { regionalizePriceCopy } from '../data/pricing';

const formspreeEndpoint = 'https://formspree.io/f/mgawjopk';

const messageFields = [
  ['name', 'Name'],
  ['business', 'Business'],
  ['email', 'Email'],
  ['whatsapp', 'WhatsApp number'],
  ['primaryGap', 'Main gap'],
  ['links', 'Website / social link'],
  ['service', 'Service of interest'],
  ['context', 'Anything we should know'],
] as const;

export function AuditForm() {
  const currency = usePricingCurrency();
  const auditPrice = regionalizePriceCopy('₹999', currency);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.size) return;

    const setValue = (name: string, value: string) => {
      const control = form.elements.namedItem(name);
      if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) control.value = value;
    };
    const context: string[] = [];
    const score = params.get('score');
    const focus = params.get('focus');
    if (score || focus) {
      context.push(`Digital Presence Score: ${score ?? 'not recorded'}/100${focus ? `; weakest area: ${focus}` : ''}.`);
      if (focus?.toLowerCase().includes('brand')) setValue('primaryGap', 'Brand and content feel inconsistent');
      else if (focus?.toLowerCase().includes('enquiry')) setValue('primaryGap', 'Website is not generating enquiries');
      else if (focus) setValue('primaryGap', 'People cannot find us online');
    }

    const tier = params.get('tier');
    const siteType = params.get('siteType');
    if (tier || siteType) {
      setValue('service', siteType === 'ecommerce' ? 'E-commerce Store Development' : 'Web Design & Development');
      context.push(`Website calculator: ${tier ?? 'tier pending'}; ${params.get('pages') ?? 'page count not recorded'}; add-ons: ${params.get('addons') || 'none selected'}.`);
      const urgency = params.get('urgency');
      if (urgency) context.push(`Preferred timing: ${urgency}.`);
    }

    const socialTier = params.get('socialTier');
    if (socialTier) {
      setValue('service', 'Social Media Strategy & Management');
      context.push(`Social calculator: ${socialTier}; ${params.get('platforms') ?? '—'} platform(s), ${params.get('posts') ?? '—'} posts, stories ${params.get('stories') ?? '—'}, community management ${params.get('community') ?? '—'}.`);
    }

    const tool = params.get('tool');
    if (tool === 'seo-roi') {
      setValue('service', 'E-commerce SEO');
      setValue('primaryGap', 'People cannot find us online');
      context.push(`SEO ROI calculator: moderate illustrative ROI ${params.get('roi') ?? 'not recorded'}%.`);
    } else if (tool === 'roas-calculator') {
      context.push(`ROAS calculator: ${params.get('roas') ?? '—'}x; break-even ${params.get('breakEven') || 'not calculated'}.`);
    } else if (tool === 'gst-calculator') {
      setValue('service', 'Dashboards & Internal Tools');
      context.push(`GST calculator used: ${params.get('gstRate') ?? '—'}% in ${params.get('gstMode') ?? '—'} mode.`);
    } else if (tool === 'gst-invoice-generator') {
      setValue('service', 'Dashboards & Internal Tools');
      context.push(`GST invoice generator used; current invoice total ${params.get('invoiceTotal') ?? '—'}.`);
    }

    if (context.length) setValue('context', context.join('\n'));
  }, []);

  function getValidForm() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return null;
    return form;
  }

  function handleWhatsApp() {
    const form = getValidForm();
    if (!form) return;

    const data = new FormData(form);
    const details = messageFields
      .map(([name, label]) => [label, String(data.get(name) ?? '').trim()] as const)
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');

    const message = `Hi Kraftt, I would like to request the ${auditPrice} Digital Presence Audit.\n\n${details}\n\nI consent to Kraftt using these details to review my business and contact me about the audit.`;
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  }

  async function handleFormspree(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = getValidForm();
    if (!form) return;

    setSubmitState('sending');
    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Form submission failed');
      form.reset();
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  }

  return (
    <form ref={formRef} className="audit-form" action={formspreeEndpoint} method="POST" onSubmit={handleFormspree}>
      <input type="hidden" name="_subject" value={`New ${auditPrice} Digital Presence Audit request`} />

      <div className="audit-field-grid audit-field-grid-compact">
        <label><span>Your name *</span><input name="name" autoComplete="name" placeholder="Your full name" required /></label>
        <label><span>Email *</span><input name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@business.com" required /></label>
        <label><span>Business name *</span><input name="business" autoComplete="organization" placeholder="Business or brand name" required /></label>
        <label><span>WhatsApp number *</span><input name="whatsapp" type="tel" autoComplete="tel" inputMode="tel" minLength={8} maxLength={18} placeholder="Number with country code" required /></label>
        <label><span>Main gap *</span><select name="primaryGap" defaultValue="" required><option value="" disabled>What needs attention first?</option><option>People cannot find us online</option><option>Our presence does not build trust</option><option>Website is not generating enquiries</option><option>Brand and content feel inconsistent</option><option>We need better internal systems</option><option>Starting from scratch</option><option>Not sure yet</option></select></label>
        <label><span>Website or social link</span><input name="links" placeholder="Website URL, Instagram handle or LinkedIn page" /></label>
        <label className="audit-field-span"><span>Service of interest</span><select name="service" defaultValue=""><option value="">Not sure yet</option>{services.map((service) => <option key={service.slug} value={service.name}>{service.name}</option>)}</select></label>
        <label className="audit-field-span"><span>Anything we should know?</span><textarea name="context" rows={2} maxLength={500} placeholder="Two or three lines are enough. Optional." /></label>
      </div>

      <label className="audit-consent"><input type="checkbox" name="consent" value="Yes" required /><span>I consent to Kraftt using these details to review my business and contact me about the audit.</span></label>

      <div className="audit-submit-options">
        <div><span>Choose how to send</span><p>Both options include every detail entered above.</p></div>
        <button className="button button-accent" type="button" onClick={handleWhatsApp}>Send on WhatsApp <span aria-hidden="true">↗</span></button>
        <button className="button button-outline-dark" type="submit" disabled={submitState === 'sending'}>{submitState === 'sending' ? 'Sending…' : 'Request My Paid Audit'} <span aria-hidden="true">→</span></button>
      </div>

      {submitState === 'success' && <p className="audit-form-status success" role="status"><strong>Request received.</strong> Kraftt will review the details and contact you with the next step.</p>}
      {submitState === 'error' && <p className="audit-form-status error" role="alert"><strong>The secure form could not be sent.</strong> Please try again or use the WhatsApp option.</p>}
    </form>
  );
}
