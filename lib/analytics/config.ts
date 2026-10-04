// Public identifiers, not credentials. Explicitly empty or invalid values disable integration.
function id(value: string | undefined, fallback: string, pattern: RegExp) {
  const candidate = (value ?? fallback).trim();
  return pattern.test(candidate) ? candidate : '';
}

export const analyticsConfig = {
  gtmId: id(process.env.NEXT_PUBLIC_GTM_ID, 'GTM-NTF8M2Q9', /^GTM-[A-Z0-9]+$/),
  gaId: id(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, 'G-CHE056H2KV', /^G-[A-Z0-9]+$/),
  adsId: id(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID, 'AW-18424492469', /^AW-\d+$/),
  clarityId: id(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID, '', /^[a-z0-9]+$/i),
};
