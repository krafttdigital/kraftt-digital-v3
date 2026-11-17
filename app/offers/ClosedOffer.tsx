'use client';

import Link from 'next/link';
import type { Offer } from '../data/offers';
import { useOfferExpired } from './OfferAvailability';

/** Rechecks at expiry, including when a visitor keeps the page open. */
export function ClosedOffer({ offer, initialExpired, children }: { offer: Offer; initialExpired: boolean; children: React.ReactNode }) {
  const expired = useOfferExpired(offer.expiresAt, initialExpired, offer.status !== 'active');
  if (!expired) return children;
  return <aside className="offer-enquiry-form" role="status">
    <p className="eyebrow eyebrow-dark">Offer closed · 8 November 2026</p>
    <h2>This campaign has ended.</h2>
    <p>The scope and prices below are historical campaign terms. Ask us about a current project scope and quotation.</p>
    <Link className="button button-accent" href="/contact">Enquire about a new project →</Link>
  </aside>;
}
