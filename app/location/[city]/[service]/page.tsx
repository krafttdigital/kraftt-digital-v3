import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeoServicePage } from '../../../components/geo/GeoServicePage';
import { enabledLocationServices, isLocationServiceEnabled, locationBySlug, locations } from '../../../data/geo';
import { createPageMetadata } from '../../../data/seo';
import { serviceBySlug } from '../../../data/services';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return locations.flatMap((location) => enabledLocationServices[location.slug].map((service) => ({ city: location.slug, service })));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; service: string }> }): Promise<Metadata> {
  const { city, service: serviceSlug } = await params;
  const location = locationBySlug(city);
  if (!location || !isLocationServiceEnabled(location.slug, serviceSlug)) return {};
  const service = serviceBySlug(serviceSlug);
  if (!service) return {};

  return createPageMetadata({
    title: `${service.name} in ${location.name} | Kraftt Digital`,
    description: `Kraftt provides ${service.name.toLowerCase()} for ${location.name} businesses through clear scope, existing package options and a research-led delivery process.`,
    path: `/location/${location.slug}/${service.slug}`,
    label: `${service.name.replace(' & Development', '')} · ${location.name}`,
  });
}

export default async function LocationServicePage({ params }: { params: Promise<{ city: string; service: string }> }) {
  const { city, service: serviceSlug } = await params;
  const location = locationBySlug(city);
  if (!location || !isLocationServiceEnabled(location.slug, serviceSlug)) notFound();
  const service = serviceBySlug(serviceSlug);
  if (!service) notFound();
  const siblingServices = enabledLocationServices[location.slug]
    .map((slug) => serviceBySlug(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return <GeoServicePage kind="location" market={location} service={service} siblingServices={siblingServices} />;
}
