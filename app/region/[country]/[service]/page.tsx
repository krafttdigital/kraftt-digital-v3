import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeoServicePage } from '../../../components/geo/GeoServicePage';
import { enabledRegionServices, isRegionServiceEnabled, regionBySlug, regionServiceAlternates, regions } from '../../../data/geo';
import { createPageMetadata } from '../../../data/seo';
import { serviceBySlug } from '../../../data/services';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return regions.flatMap((region) => enabledRegionServices[region.slug].map((service) => ({ country: region.slug, service })));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; service: string }> }): Promise<Metadata> {
  const { country, service: serviceSlug } = await params;
  const region = regionBySlug(country);
  if (!region || !isRegionServiceEnabled(region.slug, serviceSlug)) return {};
  const service = serviceBySlug(serviceSlug);
  if (!service) return {};

  return createPageMetadata({
    title: `${service.name} in India for ${region.shortName} Businesses | Kraftt Digital`,
    description: `Kraftt provides ${service.name.toLowerCase()} from India for ${region.shortName} businesses through documented scope, remote collaboration and existing regional package pricing.`,
    path: `/region/${region.slug}/${service.slug}`,
    label: `${service.name.replace(' & Development', '')} · ${region.shortName}`,
    locale: region.ogLocale,
    languages: regionServiceAlternates(service.slug),
  });
}

export default async function RegionServicePage({ params }: { params: Promise<{ country: string; service: string }> }) {
  const { country, service: serviceSlug } = await params;
  const region = regionBySlug(country);
  if (!region || !isRegionServiceEnabled(region.slug, serviceSlug)) notFound();
  const service = serviceBySlug(serviceSlug);
  if (!service) notFound();
  const siblingServices = enabledRegionServices[region.slug]
    .map((slug) => serviceBySlug(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return <GeoServicePage kind="region" market={region} service={service} siblingServices={siblingServices} />;
}
