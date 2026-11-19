import { packageAddOnIds, priceCatalogue, type PriceId } from './pricing-catalogue';

export type { PriceId } from './pricing-catalogue';
export type PricingCurrency = 'INR' | 'USD';
export type PricingMarket = 'india' | 'international';
export type PriceCadence = 'one-time' | 'monthly' | 'yearly';

export type RegionalPrice = {
  id: PriceId;
  service: string;
  packageId: string;
  name: string;
  market: PricingMarket;
  currency: PricingCurrency;
  amount: number | null;
  cadence: PriceCadence;
};

export const quoteLabel = 'Request a quote';
export const pricingExplanation = 'India packages are priced in INR. International packages are priced separately in USD. Your proposal confirms the applicable scope and price.';

export function isPricingCurrency(value: unknown): value is PricingCurrency {
  return value === 'INR' || value === 'USD';
}

export function pricingMarket(currency: PricingCurrency): PricingMarket {
  return currency === 'INR' ? 'india' : 'international';
}

export function priceFor(id: PriceId, currency: PricingCurrency): RegionalPrice {
  const { service, packageId, name, cadence } = priceCatalogue[id];
  return { id, service, packageId, name, cadence, market: pricingMarket(currency), currency, amount: priceCatalogue[id][currency] };
}

export function priceIdFrom(value: string | null): PriceId | null {
  return value && Object.hasOwn(priceCatalogue, value) ? value as PriceId : null;
}

export function addOnIds(id: PriceId | null): readonly PriceId[] {
  return id ? packageAddOnIds[id] ?? [] : [];
}

function currencyAmount(value: number, currency: PricingCurrency, maximumFractionDigits: number, compact: boolean) {
  const absolute = Math.abs(value).toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits });
  const symbol = currency === 'INR' ? '₹' : compact ? '$' : 'US$';
  return `${value < 0 ? '−' : ''}${symbol}${absolute}${compact ? '' : ` ${currency}`}`;
}

export function formatRegionalAmount(value: number, currency: PricingCurrency, maximumFractionDigits = 0) {
  return currencyAmount(value, currency, maximumFractionDigits, false);
}

function cataloguePrice(id: PriceId | null, currency: PricingCurrency, from: boolean, compact: boolean) {
  const price = id && priceFor(id, currency);
  if (!price || price.amount === null) return quoteLabel;
  const cadence = { 'one-time': ' · one-time', monthly: '/month', yearly: '/year' }[price.cadence];
  return `${from ? 'From ' : ''}${currencyAmount(price.amount, currency, 0, compact)}${cadence}`;
}

export function formatPrice(id: PriceId | null, currency: PricingCurrency, from = false) {
  return cataloguePrice(id, currency, from, false);
}

export function formatServicePrice(id: PriceId | null, currency: PricingCurrency, from = false) {
  // The standalone audit retains its explicit currency label.
  return cataloguePrice(id, currency, from, id !== 'audit');
}

// Editorial copy references an ID, never a currency symbol or a paired amount.
export function regionalizePriceCopy(copy: string, currency: PricingCurrency, format = formatPrice) {
  return copy.replace(/\{\{([a-z0-9-]+)\}\}/g, (_, id: string) => format(priceIdFrom(id), currency));
}

export function geographicCurrency(pathname: string): PricingCurrency | null {
  if (/^\/region(?:\/|$)/.test(pathname)) return 'USD';
  if (/^\/location(?:\/|$)/.test(pathname)) return 'INR';
  return null;
}

export function pricingDestination(pathname: string, currency: PricingCurrency, rememberedHub: string | null, regionalPaths: readonly string[]) {
  const geo = geographicCurrency(pathname);
  const service = /^\/(?:services\/|(?:region|location)\/[^/]+\/)([^/]+)\/?$/.exec(pathname)?.[1];
  const directory = currency === 'INR' ? '/location' : '/region';
  const hub = rememberedHub?.startsWith(`${directory}/`) && regionalPaths.includes(rememberedHub) ? rememberedHub : null;
  if (service) {
    const equivalent = hub && `${hub}/${service}`;
    if (equivalent && regionalPaths.includes(equivalent)) return equivalent;
    return geo ? `/services/${service}` : null;
  }
  return geo ? hub ?? directory : null;
}

export function pricingEnquiry(params: URLSearchParams, selected: PricingCurrency, serviceSlug?: string) {
  const fields: Record<string, string> = { pricing_market: pricingMarket(selected), pricing_currency: selected };
  const currency = params.get('quote_currency');
  if (!isPricingCurrency(currency) || params.get('source') !== 'calculator') return fields;

  const id = priceIdFrom(params.get('package'));
  const base = id ? priceFor(id, currency) : null;
  const validBase = base && base.id === base.packageId && base.service === serviceSlug ? base : null;
  const selections = (params.get('addons') ?? '').split(',');
  const website = ['web-design-development', 'ecommerce-store-development', 'marketplace-catalogue-building'].includes(serviceSlug ?? '');
  const brand = website && selections.includes('brand') ? priceFor('brand-1', currency) : null;
  const seo = website && selections.includes('seo') && serviceSlug !== 'marketplace-catalogue-building' ? priceFor('ecomseo-1', currency) : null;
  const needsQuote = params.get('custom_scope') === 'yes' || validBase?.amount == null || (brand && brand.amount === null);
  const oneTime = validBase?.cadence === 'one-time' && validBase.amount !== null && (brand === null || brand.amount !== null)
    ? `${formatRegionalAmount(validBase.amount + (brand?.amount ?? 0), currency)} · one-time`
    : null;
  const lines = [
    validBase ? `${validBase.name}: ${formatPrice(validBase.id, currency, true)}` : quoteLabel,
    brand && `Brand Starter: ${formatPrice(brand.id, currency, true)}`,
    oneTime && `One-time starting estimate: ${oneTime}`,
    seo && `Ongoing SEO: ${formatPrice(seo.id, currency, true)}`,
    needsQuote && 'Custom scope: Request a quote',
  ];
  return { ...fields, estimate_currency: currency, package_id: validBase?.id ?? '', estimate_summary: lines.filter(Boolean).join('\n') };
}
