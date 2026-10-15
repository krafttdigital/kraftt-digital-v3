import type { MetadataRoute } from 'next';
import { bundles } from './data/bundles';
import { diwaliGrowthOffer } from './data/diwaliGrowthOffer';
import { offers } from './data/offers';
import { projects } from './data/projects';
import { services } from './data/services';
import { absoluteUrl } from './data/seo';
import { locationHubPaths, locationServicePaths, regionHubPaths, regionServicePaths } from './data/geo';
import { tools } from './tools/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '', '/services', '/work', '/process', '/about', '/audit',
    '/contact', '/partner-program', '/offers', '/tools', '/location', '/region', '/legal/privacy-policy', '/legal/terms',
  ];
  const routes = new Set([
    ...staticRoutes,
    diwaliGrowthOffer.pagePath,
    ...offers.map((offer) => offer.pagePath),
    ...services.map((service) => `/services/${service.slug}`),
    ...bundles.map((bundle) => `/services/bundles/${bundle.slug}`),
    ...projects.map((project) => `/work/${project.slug}`),
    ...tools.map((tool) => `/tools/${tool.slug}`),
    ...locationHubPaths,
    ...locationServicePaths,
    ...regionHubPaths,
    ...regionServicePaths,
  ]);

  // Only publish lastmod where a meaningful page update has a known date.
  const recentlyUpdated = new Map<string, string>([
    ['/offers', '2026-10-16'],
    [diwaliGrowthOffer.pagePath, '2026-10-15'],
    ['/tools', '2026-10-16'],
    ...tools.map((tool): [string, string] => [`/tools/${tool.slug}`, '2026-10-16']),
  ]);

  return [...routes].map((route) => ({
    url: route === '' ? `${absoluteUrl('/')}/` : absoluteUrl(route),
    ...(recentlyUpdated.has(route) ? { lastModified: recentlyUpdated.get(route) } : {}),
  }));
}
