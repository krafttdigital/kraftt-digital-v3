'use client';

import { useEffect, useState } from 'react';

export function useOfferExpired(expiresAt: string, initialExpired: boolean, forcedExpired = false) {
  const [expired, setExpired] = useState(initialExpired);

  useEffect(() => {
    if (forcedExpired) return;

    const expiry = new Date(expiresAt).getTime();
    const remaining = new Date(expiresAt).getTime() - Date.now();
    const timer = window.setTimeout(
      () => setExpired(Date.now() > expiry),
      Math.max(0, Math.min(remaining + 1000, 2_147_000_000)),
    );
    return () => window.clearTimeout(timer);
  }, [expiresAt, forcedExpired]);

  return expired;
}

export function OfferValidity({
  expiresAt,
  expiryLabel,
  initialExpired,
}: {
  expiresAt: string;
  expiryLabel: string;
  initialExpired: boolean;
}) {
  const expired = useOfferExpired(expiresAt, initialExpired);

  return (
    <div className={`offer-validity${expired ? ' is-expired' : ''}`}>
      <span>{expired ? 'Offer status' : 'Offer valid through'}</span>
      <strong>{expired ? 'Offer closed' : expiryLabel}</strong>
    </div>
  );
}

export function OfferClaimCta({
  expiresAt,
  initialExpired,
  className = '',
  sticky = false,
}: {
  expiresAt: string;
  initialExpired: boolean;
  className?: string;
  sticky?: boolean;
}) {
  const expired = useOfferExpired(expiresAt, initialExpired);

  return (
    <a className={`${className}${sticky ? ' offer-mobile-sticky-cta' : ''}`} href="#offer-enquiry">
      {expired ? 'Send a general enquiry' : 'Enquire about this offer'}
      <span aria-hidden="true">↓</span>
    </a>
  );
}
