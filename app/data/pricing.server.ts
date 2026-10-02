import 'server-only';

import { getContext } from '@netlify/functions';
import { headers } from 'next/headers';
import { currencyForCountry, type PricingCurrency } from './pricing';

const COUNTRY_HEADERS = [
  'x-netlify-country',
  'x-country-code',
  'x-vercel-ip-country',
  'cf-ipcountry',
] as const;

export async function detectPricingCurrency(): Promise<PricingCurrency> {
  // Reading request headers keeps the render request-bound, so one visitor's
  // location cannot be baked into static HTML or reused for another visitor.
  const requestHeaders = await headers();

  try {
    const countryCode = getContext().geo?.country?.code;
    if (countryCode) return currencyForCountry(countryCode);
  } catch {
    // Local development and non-Netlify builds do not have an active context.
  }

  for (const headerName of COUNTRY_HEADERS) {
    const countryCode = requestHeaders.get(headerName);
    if (countryCode) return currencyForCountry(countryCode);
  }

  return 'INR';
}
