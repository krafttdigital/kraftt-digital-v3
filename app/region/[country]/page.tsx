import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeoLandingPage } from '../../components/geo/GeoLandingPage';
import { regionBySlug, regionHubAlternates, regions } from '../../data/geo';
import { createPageMetadata } from '../../data/seo';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return regions.map((region) => ({ country: region.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const region = regionBySlug(country);
  if (!region) return {};

  return createPageMetadata({
    title: region.metaTitle,
    description: region.metaDescription,
    path: `/region/${region.slug}`,
    label: region.ogLabel,
    locale: region.ogLocale,
    languages: regionHubAlternates(),
  });
}

export default async function RegionPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const region = regionBySlug(country);
  if (!region) notFound();

  return <GeoLandingPage kind="region" market={region} />;
}
