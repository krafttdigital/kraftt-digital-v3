import { locations, type LocationSlug } from './locations';
import { regions, type RegionSlug } from './regions';

export const geoServiceSlugs = [
  'web-design-development',
  'ecommerce-store-development',
  'ecommerce-seo',
  'brand-identity',
  'social-media-management',
] as const;

export type GeoServiceSlug = (typeof geoServiceSlugs)[number];

const core = ['web-design-development', 'ecommerce-store-development', 'brand-identity'] as const;
const commerce = [...core, 'ecommerce-seo'] as const;
const full = [...commerce, 'social-media-management'] as const;

export const enabledLocationServices = {
  bathinda: core,
  mohali: [...core, 'social-media-management'],
  ludhiana: full,
  chandigarh: full,
  gurugram: full,
  delhi: full,
  noida: commerce,
  bengaluru: commerce,
  hyderabad: commerce,
  jaipur: [...core, 'social-media-management'],
  mumbai: full,
  barnala: core,
  jalandhar: commerce,
  amritsar: commerce,
  mansa: core,
  chennai: commerce,
} as const satisfies Record<LocationSlug, readonly GeoServiceSlug[]>;

export const enabledRegionServices = {
  usa: commerce,
  uk: commerce,
  uae: commerce,
  canada: commerce,
  australia: commerce,
} as const satisfies Record<RegionSlug, readonly GeoServiceSlug[]>;

export function isLocationServiceEnabled(locationSlug: LocationSlug, serviceSlug: string): serviceSlug is GeoServiceSlug {
  return (enabledLocationServices[locationSlug] as readonly string[]).includes(serviceSlug);
}

export function isRegionServiceEnabled(regionSlug: RegionSlug, serviceSlug: string): serviceSlug is GeoServiceSlug {
  return (enabledRegionServices[regionSlug] as readonly string[]).includes(serviceSlug);
}

export const locationHubPaths = locations.map((location) => `/location/${location.slug}`);
export const regionHubPaths = regions.map((region) => `/region/${region.slug}`);

export const locationServicePaths = locations.flatMap((location) =>
  enabledLocationServices[location.slug].map((serviceSlug) => `/location/${location.slug}/${serviceSlug}`),
);

export const regionServicePaths = regions.flatMap((region) =>
  enabledRegionServices[region.slug].map((serviceSlug) => `/region/${region.slug}/${serviceSlug}`),
);

export function regionHubAlternates(): Record<string, string> {
  return {
    'en-IN': '/',
    'x-default': '/',
    ...Object.fromEntries(regions.map((region) => [region.languageRegion, `/region/${region.slug}`])),
  };
}

export function regionServiceAlternates(serviceSlug: string): Record<string, string> | undefined {
  const enabledRegions = regions.filter((region) => isRegionServiceEnabled(region.slug, serviceSlug));
  if (enabledRegions.length === 0) return undefined;

  return {
    'en-IN': `/services/${serviceSlug}`,
    'x-default': `/services/${serviceSlug}`,
    ...Object.fromEntries(enabledRegions.map((region) => [region.languageRegion, `/region/${region.slug}/${serviceSlug}`])),
  };
}
