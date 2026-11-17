'use client';

import { trackEvent, trackFormSuccess } from '../../lib/analytics/core';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { isOfferClaimable, type Offer } from '../data/offers';
import { ClosedOffer } from './ClosedOffer';
import { useOfferExpired } from './OfferAvailability';
import { submitOfferEnquiry } from './offerSubmission';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

export function OfferEnquiryForm({
  offer,
  pageUrl,
  initialExpired,
  compact = false,
  campaign = false,
  campaignPlacement = 'final',
}: {
  offer: Offer;
  pageUrl: string;
  initialExpired: boolean;
  compact?: boolean;
  campaign?: boolean;
  campaignPlacement?: 'hero' | 'final';
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inFlightRef = useRef(false);
  const expired = useOfferExpired(offer.expiresAt, initialExpired, offer.status !== 'active');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form || inFlightRef.current || !isOfferClaimable(offer) || !form.reportValidity()) return;

    inFlightRef.current = true;
    setSubmitError('');
    setSubmitState('sending');
    const data = new FormData(form);
    data.set('page_url', window.location.href);
    data.set('submitted_at', new Date().toISOString());
    data.set('offer_status_at_submission', expired ? 'expired-general-enquiry' : 'active-offer-enquiry');
    if (campaign) {
      const search = new URLSearchParams(window.location.search);
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid']) {
        const value = search.get(key);
        if (value && /^[a-zA-Z0-9_.-]{1,256}$/.test(value)) data.set(key, value);
      }
    }

    try {
      await submitOfferEnquiry({ endpoint: offer.formEndpoint, data });
      trackFormSuccess('offer_enquiry', form);
      if (campaign) trackEvent(campaignPlacement === 'hero' ? 'hero_form_submit' : 'final_form_submit', { form_id: 'offer_enquiry', cta_location: campaignPlacement });
      form.reset();
      setSubmitState('success');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your enquiry could not be sent. Please try again.');
      setSubmitState('error');
      if (campaign) trackEvent('form_error', { form_id: 'offer_enquiry', cta_location: campaignPlacement });
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <ClosedOffer offer={offer} initialExpired={expired}><form
      ref={formRef}
      className={`offer-enquiry-form${compact ? ' is-compact' : ''}${campaign ? ' is-campaign' : ''}`}
      data-analytics-form="offer_enquiry"
      data-campaign-form={campaign ? campaignPlacement : undefined}
      action={offer.formEndpoint}
      method="POST"
      onSubmit={handleSubmit}
      aria-describedby={`offer-form-privacy-${campaign ? campaignPlacement : 'standard'}`}
    >
      <input type="hidden" name="offer_id" value={offer.id} />
      <input type="hidden" name="offer_name" value={offer.name} />
      <input type="hidden" name="page_url" value={pageUrl} />
      <input type="hidden" name="_subject" value={`New enquiry · ${offer.name}`} />
      <input className="offer-form-honeypot" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="offer-form-heading">
        <p className="eyebrow eyebrow-dark">{expired ? 'General project enquiry' : 'Offer enquiry'}</p>
        <h2>{campaign ? campaignPlacement === 'hero' ? <>Interested?<br />Start here.</> : 'Ready to launch?' : compact ? 'Interested? Start here.' : 'Tell us what you are launching.'}</h2>
        <p>{campaign ? campaignPlacement === 'hero' ? 'Tell us a little about your business.' : 'Apply in under 2 minutes.' : compact ? 'Share a few details. We will confirm fit and reply directly.' : 'Share the essentials. Kraftt will confirm fit, scope and the next step directly.'}</p>
      </div>

      <div className="offer-form-grid">
        <label>
          <span>Name *</span>
          <input name="name" autoComplete="name" required placeholder="Your name" />
        </label>
        <label>
          <span>Business name *</span>
          <input name="business_name" autoComplete="organization" required placeholder="Business or brand" />
        </label>
        {(!campaign || campaignPlacement === 'final') && <label>
          <span>Email {campaign ? <small>Optional</small> : '*'}</span>
          <input name="email" type="email" inputMode="email" autoComplete="email" required={!campaign} placeholder="you@example.com" />
        </label>}
        <label>
          <span>Phone / WhatsApp *</span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={8} maxLength={18} required placeholder="Number with country code" />
        </label>
        {(!campaign || campaignPlacement === 'final') && <label className="offer-form-wide">
          <span>Website or Instagram <small>Optional</small></span>
          <input name="website_or_instagram" inputMode="url" placeholder="https://… or @handle" />
        </label>}
        <label className="offer-form-wide">
          <span>{campaign ? 'What are you launching?' : 'Brief requirements'} *</span>
          <textarea name="requirements" rows={campaign ? 2 : compact ? 3 : 4} required placeholder={campaign ? 'Tell us briefly about your business.' : 'What are you launching, and what do you need help with?'} />
        </label>
      </div>

      <label className="offer-form-consent">
        <input type="checkbox" name="contact_consent" value="Yes" required />
        <span>I agree that Kraftt Digital may contact me about this enquiry.</span>
      </label>

      <div className="offer-form-submit">
        <p id={`offer-form-privacy-${campaign ? campaignPlacement : 'standard'}`}>Submitted through Formspree. Read Kraftt&apos;s <Link href="/legal/privacy-policy">privacy policy</Link>.</p>
        <button className="button button-accent" type="submit" disabled={submitState === 'sending'}>
          {submitState === 'sending' ? 'Sending enquiry…' : expired ? 'Send general enquiry' : campaign ? campaignPlacement === 'hero' ? 'APPLY FOR ₹30K OFFER' : 'APPLY NOW' : 'Enquire about this offer'}
          <span aria-hidden="true">→</span>
        </button>
      </div>
      {campaign && <p className="campaign-form-reassurance">No payment now · We review your enquiry first</p>}

      <div className="offer-form-feedback" aria-live="polite">
        {submitState === 'success' && (
          <p className="success" role="status"><strong>Enquiry received.</strong> Kraftt will review the details and contact you directly.</p>
        )}
        {submitState === 'error' && (
          <p className="error" role="alert"><strong>The enquiry was not sent.</strong> {submitError}</p>
        )}
      </div>
    </form></ClosedOffer>
  );
}
