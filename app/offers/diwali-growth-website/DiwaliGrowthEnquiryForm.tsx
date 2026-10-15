'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { trackFormSuccess } from '../../../lib/analytics/core';
import type { Offer } from '../../data/offers';
import { useOfferExpired } from '../OfferAvailability';
import { submitOfferEnquiry } from '../offerSubmission';
import styles from './page.module.css';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

export function DiwaliGrowthEnquiryForm({ offer, pageUrl, initialExpired }: { offer: Offer; pageUrl: string; initialExpired: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inFlightRef = useRef(false);
  const expired = useOfferExpired(offer.expiresAt, initialExpired, offer.status !== 'active');
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form || inFlightRef.current || !form.reportValidity()) return;

    inFlightRef.current = true;
    setErrorMessage('');
    setState('sending');
    const data = new FormData(form);
    data.set('page_url', window.location.href);
    data.set('submitted_at', new Date().toISOString());
    data.set('offer_status_at_submission', expired ? 'expired-general-enquiry' : 'active-offer-enquiry');

    try {
      await submitOfferEnquiry({ endpoint: offer.formEndpoint, data });
      trackFormSuccess('offer_enquiry', form);
      form.reset();
      setState('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Please try again or email Kraftt Digital directly.');
      setState('error');
    } finally {
      inFlightRef.current = false;
    }
  }

  return <form ref={formRef} className={styles.form} data-analytics-form="offer_enquiry" action={offer.formEndpoint} method="POST" onSubmit={handleSubmit}>
    <input type="hidden" name="offer_id" value={offer.id} />
    <input type="hidden" name="offer_name" value={offer.name} />
    <input type="hidden" name="offer_price_inr" value={offer.offerPrice} />
    <input type="hidden" name="page_url" value={pageUrl} />
    <input type="hidden" name="_subject" value={`New enquiry · ${offer.name}`} />
    <input className={styles.honeypot} type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />

    <div className={styles.formHeading}><p>Tell us enough to start.</p><span>Share the essentials. We check fit, then send a proposal.</span></div>
    <div className={styles.formGrid}>
      <label><span>Your name *</span><input name="name" autoComplete="name" required placeholder="Your name" /></label>
      <label><span>Work email *</span><input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="you@business.com" /></label>
      <label><span>Business name *</span><input name="business_name" autoComplete="organization" required placeholder="Business or brand" /></label>
      <label><span>Phone / WhatsApp *</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={8} maxLength={18} required placeholder="With country code" /></label>
      <label><span>Website or Instagram <small>Optional</small></span><input name="website_or_instagram" placeholder="https://… or @handle" /></label>
      <label><span>Budget *</span><select name="budget" defaultValue="" required><option value="" disabled>Choose one</option><option value="35000-50000">₹35–50K</option><option value="50000-plus">₹50K+</option><option value="not-sure">Not sure yet</option></select></label>
    </div>

    <label className={styles.consent}><input type="checkbox" name="contact_consent" value="Yes" required /><span>I agree that Kraftt Digital may use these details to reply to my enquiry. Read the <Link href="/legal/privacy-policy">privacy policy</Link>.</span></label>
    <button className={styles.submit} type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : expired ? 'Send general website enquiry' : 'Enquire about this offer'} <span aria-hidden="true">→</span></button>
    <p className={styles.formNote}>We check fit, then send a proposal. No payment now.</p>
    {state === 'success' && <p className={styles.success} role="status"><strong>Enquiry received.</strong> Kraftt will review it and reply directly.</p>}
    {state === 'error' && <p className={styles.error} role="alert"><strong>Your enquiry was not sent.</strong> {errorMessage}</p>}
  </form>;
}
