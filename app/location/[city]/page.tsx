import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeoLandingPage } from '../../components/geo/GeoLandingPage';
import { locationBySlug, locations } from '../../data/geo';
import { createPageMetadata } from '../../data/seo';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return locations.map((location) => ({ city: location.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const location = locationBySlug(city);
  if (!location) return {};

  return createPageMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: `/location/${location.slug}`,
    label: location.ogLabel,
  });
}

export default async function LocationPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const location = locationBySlug(city);
  if (!location) notFound();

  return <GeoLandingPage kind="location" market={location} />;
}
