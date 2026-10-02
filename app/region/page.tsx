import type { Metadata } from 'next';
import { GeoDirectoryPage } from '../components/geo/GeoDirectoryPage';
import { regions } from '../data/geo';
import { createPageMetadata } from '../data/seo';

const title = 'International Digital Agency Partner | Kraftt Digital';
const description = 'Explore how Kraftt Digital works from India with businesses in the USA, UK, UAE, Canada and Australia through a documented remote process.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/region',
  label: 'International markets',
});

export default function RegionsPage() {
  return <GeoDirectoryPage kind="region" markets={regions} title={title} description={description} />;
}
