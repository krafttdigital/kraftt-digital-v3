'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';

const formspreeEndpoint = 'https://formspree.io/f/mvkoqwzb';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

type FormspreeError = {
  code?: string;
  field?: string;
  message?: string;
};

type FormspreeResponse = {
  error?: string;
  errors?: FormspreeError[];
};

function getSubmissionError(payload: FormspreeResponse | null, status: number) {
  const messages = [
    payload?.error,
    ...(payload?.errors?.map((error) => error.message) ?? []),
  ].filter((message): message is string => Boolean(message));
  const responseMessage = messages.join(' ');

  if (status === 429) {
    return 'Too many attempts were made. Please wait a moment and try again.';
  }

  if (responseMessage) return responseMessage;
  return 'Formspree could not accept the application. Please try again or contact Kraftt Digital.';
}

export function PartnerApplicationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [source, setSource] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;

    setSubmitError('');
    setSubmitState('sending');
    const payload = new FormData(form);
    payload.set('accepted_at', new Date().toISOString());
    payload.set('terms_reference', 'Kraftt Partner Program terms displayed at /partner-program');

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
      });

      const result = await response.json().catch(() => null) as FormspreeResponse | null;
      if (!response.ok) {
        throw new Error(getSubmissionError(result, response.status));
      }
      form.reset();
      setSource('');
      setSubmitState('success');
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'The application could not be sent. Please try again or contact Kraftt Digital.',
      );
      setSubmitState('error');
    }
  }

  return (
    <form
      ref={formRef}
      className="partner-application-form"
      action={formspreeEndpoint}
      method="POST"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="_subject" value="New Kraftt Partner Program application" />
      <input type="text" name="_gotcha" className="partner-form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="partner-form-heading">
        <p className="eyebrow eyebrow-dark">Partner application</p>
        <h2 id="partner-application-title">A few details. One clear agreement.</h2>
        <p>Complete the form once. No business referral is required at the application stage.</p>
      </div>

      <fieldset>
        <legend><span>01</span><strong>Your details</strong></legend>
        <div className="partner-form-grid">
          <label>
            <span>Full name *</span>
            <input name="name" autoComplete="name" placeholder="Your full legal name" required />
          </label>
          <label>
            <span>Email address *</span>
            <input name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>Mobile number *</span>
            <input name="mobile" type="tel" autoComplete="tel" inputMode="tel" minLength={8} maxLength={18} placeholder="Number with country code" required />
          </label>
          <label>
            <span>How did you hear about the program? *</span>
            <select name="discovery_source" value={source} onChange={(event) => setSource(event.target.value)} required>
              <option value="" disabled>Select one</option>
              <option value="Recommended by Someone">Recommended by Someone</option>
              <option value="Social media">Social media</option>
              <option value="Recommended by Kraftt">Kraftt recommended it</option>
              <option value="Kraftt website">Kraftt website</option>
              <option value="Other">Other</option>
            </select>
          </label>
          {(source === 'Recommended by Someone' || source === 'Other') && (
            <label className="partner-form-wide">
              <span>{source === 'Recommended by Someone' ? 'Who told you?' : 'Where did you hear about it?'}</span>
              <input name="discovery_details" placeholder="Optional detail" />
            </label>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend><span>02</span><strong>Acceptance &amp; signature</strong></legend>
        <label className="partner-signature-field">
          <span>Full legal name *</span>
          <input
            name="electronic_signature"
            autoComplete="name"
            placeholder="Your full legal name"
            aria-describedby="signature-guidance"
            required
          />
          <small id="signature-guidance">Typing your full legal name records your electronic signature.</small>
        </label>

        <label className="partner-terms-acceptance">
          <input type="checkbox" name="terms_accepted" value="Yes" required />
          <span>
            I confirm that I have read, understood and accept the complete Kraftt Partner Program <a href="#program-terms">terms and conditions</a>. I understand that this is a non-exclusive referral relationship and that commission becomes payable only after delivery and complete client payment.
          </span>
        </label>
      </fieldset>

      <div className="partner-form-submit">
        <p>Submitted securely through Formspree. Read Kraftt&apos;s <Link href="/legal/privacy-policy">privacy policy</Link>.</p>
        <button className="button button-accent" type="submit" disabled={submitState === 'sending'}>
          {submitState === 'sending' ? 'Submitting…' : 'Submit partner application'} <span aria-hidden="true">→</span>
        </button>
      </div>

      {submitState === 'success' && (
        <p className="partner-form-status success" role="status"><strong>Application received.</strong> Kraftt will review your details and contact you with the next step.</p>
      )}
      {submitState === 'error' && (
        <p className="partner-form-status error" role="alert"><strong>The form could not be sent.</strong> {submitError}</p>
      )}
    </form>
  );
}
