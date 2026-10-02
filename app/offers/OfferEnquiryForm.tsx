'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import type { Offer } from '../data/offers';
import { useOfferExpired } from './OfferAvailability';
import { submitOfferEnquiry } from './offerSubmission';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

export function OfferEnquiryForm({
  offer,
  pageUrl,
  initialExpired,
  compact = false,
}: {
  offer: Offer;
  pageUrl: string;
  initialExpired: boolean;
  compact?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inFlightRef = useRef(false);
  const expired = useOfferExpired(offer.expiresAt, initialExpired, offer.status !== 'active');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form || inFlightRef.current || !form.reportValidity()) return;

    inFlightRef.current = true;
    setSubmitError('');
    setSubmitState('sending');
    const data = new FormData(form);
    data.set('page_url', window.location.href);
    data.set('submitted_at', new Date().toISOString());
    data.set('offer_status_at_submission', expired ? 'expired-general-enquiry' : 'active-offer-enquiry');

    try {
      await submitOfferEnquiry({ endpoint: offer.formEndpoint, data });
      form.reset();
      setSubmitState('success');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your enquiry could not be sent. Please try again.');
      setSubmitState('error');
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <form
      ref={formRef}
      className={`offer-enquiry-form${compact ? ' is-compact' : ''}`}
      action={offer.formEndpoint}
      method="POST"
      onSubmit={handleSubmit}
      aria-describedby="offer-form-privacy"
    >
      <input type="hidden" name="offer_id" value={offer.id} />
      <input type="hidden" name="offer_name" value={offer.name} />
      <input type="hidden" name="page_url" value={pageUrl} />
      <input type="hidden" name="_subject" value={`New enquiry · ${offer.name}`} />
      <input className="offer-form-honeypot" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="offer-form-heading">
        <p className="eyebrow eyebrow-dark">{expired ? 'General project enquiry' : 'Offer enquiry'}</p>
        <h2 id="offer-enquiry-title">{compact ? 'Interested? Start here.' : 'Tell us what you are launching.'}</h2>
        <p>{compact ? 'Share a few details. We will confirm fit and reply directly.' : 'Share the essentials. Kraftt will confirm fit, scope and the next step directly.'}</p>
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
        <label>
          <span>Email *</span>
          <input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="you@example.com" />
        </label>
        <label>
          <span>Phone / WhatsApp *</span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={8} maxLength={18} required placeholder="Number with country code" />
        </label>
        <label className="offer-form-wide">
          <span>Website or Instagram <small>Optional</small></span>
          <input name="website_or_instagram" inputMode="url" placeholder="https://… or @handle" />
        </label>
        <label className="offer-form-wide">
          <span>Brief requirements *</span>
          <textarea name="requirements" rows={compact ? 3 : 4} required placeholder="What are you launching, and what do you need help with?" />
        </label>
      </div>

      <label className="offer-form-consent">
        <input type="checkbox" name="contact_consent" value="Yes" required />
        <span>I agree that Kraftt Digital may contact me about this enquiry.</span>
      </label>

      <div className="offer-form-submit">
        <p id="offer-form-privacy">Submitted through Formspree. Read Kraftt&apos;s <Link href="/legal/privacy-policy">privacy policy</Link>.</p>
        <button className="button button-accent" type="submit" disabled={submitState === 'sending'}>
          {submitState === 'sending' ? 'Sending enquiry…' : expired ? 'Send general enquiry' : 'Enquire about this offer'}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="offer-form-feedback" aria-live="polite">
        {submitState === 'success' && (
          <p className="success" role="status"><strong>Enquiry received.</strong> Kraftt will review the details and contact you directly.</p>
        )}
        {submitState === 'error' && (
          <p className="error" role="alert"><strong>The enquiry was not sent.</strong> {submitError}</p>
        )}
      </div>
    </form>
  );
}
