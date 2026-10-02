import type { Metadata } from 'next';
import { HomePageExperience, homeDescription, homeTitle } from './components/HomePageExperience';
import { regionHubAlternates } from './data/geo';
import { createPageMetadata } from './data/seo';

export const metadata: Metadata = createPageMetadata({
  title: homeTitle,
  description: homeDescription,
  path: '/',
  label: 'Digital agency · India',
  languages: regionHubAlternates(),
});

export default function Home() {
  return <HomePageExperience />;
}
