import assert from 'node:assert/strict';
import { getFeaturedOffer, isOfferClaimable } from '../app/data/offers.ts';
import { submitOfferEnquiry } from '../app/offers/offerSubmission.ts';

const formData = new FormData();
formData.set('name', 'Test visitor');

const success = await submitOfferEnquiry({
  endpoint: 'https://formspree.invalid/mock',
  data: formData,
  fetcher: async () => new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }),
});
assert.deepEqual(success, { ok: true });

await assert.rejects(
  submitOfferEnquiry({
    endpoint: 'https://formspree.invalid/mock',
    data: formData,
    fetcher: async () => new Response(JSON.stringify({ errors: [{ message: 'Please enter a valid email.' }] }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    }),
  }),
  /Please enter a valid email/,
);

await assert.rejects(
  submitOfferEnquiry({
    endpoint: 'https://formspree.invalid/mock',
    data: formData,
    fetcher: async () => new Response(null, { status: 429 }),
  }),
  /Too many attempts/,
);

const offer = getFeaturedOffer();
assert.equal(isOfferClaimable(offer, new Date('2026-11-08T23:59:59+05:30')), true);
assert.equal(isOfferClaimable(offer, new Date('2026-11-09T00:00:00+05:30')), false);

console.log('Offer form mock-response and expiry tests passed.');
