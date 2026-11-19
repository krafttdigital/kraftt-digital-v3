import { priceFor, type PriceId, type PricingCurrency } from '../data/pricing';

export const websiteOptions = {
  informational: {
    service: 'web-design-development',
    label: 'How many website pages?',
    options: [
      { value: 'one', label: '1 page', priceId: 'web-1' },
      { value: 'business', label: '2–5 pages', priceId: 'web-2' },
      { value: 'growth', label: '6–10 pages', priceId: 'web-3' },
      { value: 'custom', label: '11+ pages or custom functionality', priceId: null },
    ],
  },
  ecommerce: {
    service: 'ecommerce-store-development',
    label: 'How many products are in your store?',
    options: [
      { value: 'launch', label: 'Up to 30 products', priceId: 'shopify-1' },
      { value: 'growth', label: '31–50 products', priceId: 'shopify-2' },
      { value: 'complete', label: '51–100 products', priceId: 'shopify-3' },
      { value: 'custom', label: '101+ products or custom functionality', priceId: null },
    ],
  },
  marketplace: {
    service: 'marketplace-catalogue-building',
    label: 'How many products need marketplace listings?',
    options: [
      { value: 'starter', label: 'Up to 30 products', priceId: 'marketplace-1' },
      { value: 'intermediate', label: '31–50 products', priceId: 'marketplace-2' },
      { value: 'growth', label: '51–100 products', priceId: 'marketplace-3' },
      { value: 'custom', label: '101+ products or custom functionality', priceId: null },
    ],
  },
} as const satisfies Record<string, { service: string; label: string; options: { value: string; label: string; priceId: PriceId | null }[] }>;

export type WebsiteScope = keyof typeof websiteOptions;
type WebsiteBrief = { siteType: WebsiteScope; scope: string; brand: boolean; seo: boolean; urgency: string };

export function websiteEstimate(brief: WebsiteBrief, currency: PricingCurrency) {
  const catalogue = websiteOptions[brief.siteType];
  const option = catalogue.options.find(item => item.value === brief.scope);
  if (!option) return null;
  const base = option.priceId ? priceFor(option.priceId, currency) : null;
  const brand = brief.brand ? priceFor('brand-1', currency) : null;
  const seo = brief.seo && brief.siteType !== 'marketplace' ? priceFor('ecomseo-1', currency) : null;
  const customSeo = brief.seo && brief.siteType === 'marketplace';
  const oneTimeTotal = base?.amount == null || (brand && brand.amount === null)
    ? null
    : base.amount + (brand?.amount ?? 0);
  return { service: catalogue.service, base, brand, seo, oneTimeTotal, customSeo, needsQuote: oneTimeTotal === null || customSeo || (seo !== null && seo.amount === null) };
}

export function socialEstimate(platforms: string, posts: string, directMessages: boolean, currency: PricingCurrency) {
  const platformCount = Number(platforms);
  const postCount = Number(posts);
  const known = [1, 2, 3, 4].includes(platformCount) && [15, 21, 30, 31].includes(postCount);
  const id = platformCount === 3 || postCount === 30 ? 'social-3' : platformCount === 2 || postCount === 21 ? 'social-2' : 'social-1';
  const base = known && platformCount <= 3 && postCount <= 30 ? priceFor(id, currency) : null;
  return { base, needsQuote: base?.amount == null || directMessages };
}
