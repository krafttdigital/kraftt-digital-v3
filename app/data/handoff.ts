import { locations, regions } from './geo';
import { services } from './services';

export const leadSources = ['page', 'score', 'calculator', 'offer'] as const;
export const scoreBands = ['0-40', '41-70', '71-90', '91-100'] as const;

export function parseLeadHandoff(params: URLSearchParams) {
  const service = services.find((item) => item.slug === params.get('service'));
  const place = [...locations, ...regions].find((item) => item.slug === params.get('place'));
  const source = leadSources.find((item) => item === params.get('source'));
  const band = scoreBands.find((item) => item === params.get('band'));
  return { service, place: place?.slug ?? '', source: source ?? '', band: band ?? '' };
}

export function contactHandoff(serviceSlug: string, source: (typeof leadSources)[number], place = '', band = '') {
  const params = new URLSearchParams({ service: serviceSlug, source });
  if (place) params.set('place', place);
  if (band) params.set('band', band);
  return `/contact?${params.toString()}`;
}
