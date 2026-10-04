import type { LocationMarket } from '../../data/geo';

// Match the four featured services on the main homepage. Other existing
// location-service URLs remain available for visitors and search engines.
export const featuredLocationServices = [
  'web-design-development',
  'brand-identity',
  'ecommerce-seo',
  'ecommerce-store-development',
] as const;

export function locationDelivery(market: LocationMarket) {
  const inPerson = ['bathinda', 'barnala', 'mansa'].includes(market.slug);
  return {
    inPerson,
    label: inPerson ? 'Remote + in-person' : 'Remote delivery',
    description: inPerson
      ? `Kraftt is based in Bathinda. Alongside remote delivery, in-person meetings are available by arrangement in ${market.name} and nearby areas.`
      : `Kraftt is based in Bathinda and works with ${market.name} businesses remotely through calls, WhatsApp and shared project reviews.`,
  };
}
