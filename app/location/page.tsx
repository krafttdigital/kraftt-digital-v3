import type { Metadata } from 'next';
import { LocationDirectoryPage } from './_components/LocationDirectoryPage';
import { locations } from '../data/geo';
import { createPageMetadata } from '../data/seo';

const title = 'Digital Services Across India | Kraftt Digital';
const description = 'Explore the Indian cities and service areas where Kraftt Digital supports businesses with websites, Shopify, branding, e-commerce SEO and social systems.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/location',
  label: 'Indian service areas',
});

export default function LocationsPage() {
  return <LocationDirectoryPage markets={locations} title={title} description={description} />;
}
