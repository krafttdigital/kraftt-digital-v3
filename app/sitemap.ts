import type { MetadataRoute } from 'next';
import { bundles } from './data/bundles';
import { projects } from './data/projects';
import { services } from './data/services';
import { absoluteUrl } from './data/seo';
import { locationHubPaths, locationServicePaths, regionHubPaths, regionServicePaths } from './data/geo';
import { tools } from './tools/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const newLocationSlugs = ['barnala', 'jalandhar', 'amritsar', 'mansa', 'chennai'];
  const staticRoutes = [
    '', '/services', '/work', '/process', '/about', '/audit',
    '/contact', '/partner-program', '/offers/campaign-festive-season-offer', '/tools', '/location', '/region', '/legal/privacy-policy', '/legal/terms',
  ];
  const routes = [
    ...staticRoutes,
    ...services.map((service) => `/services/${service.slug}`),
    ...bundles.map((bundle) => `/services/bundles/${bundle.slug}`),
    ...projects.map((project) => `/work/${project.slug}`),
    ...tools.map((tool) => `/tools/${tool.slug}`),
    ...locationHubPaths,
    ...locationServicePaths,
    ...regionHubPaths,
    ...regionServicePaths,
  ];

  return routes.map((route) => ({
    url: absoluteUrl(route || '/'),
    lastModified: new Date(newLocationSlugs.some((slug) => route === `/location/${slug}` || route.startsWith(`/location/${slug}/`)) || route === '/contact' ? '2026-09-28' : route.startsWith('/location') || route.startsWith('/region') ? '2026-09-15' : route === '/offers/campaign-festive-season-offer' ? '2026-09-11' : route === '/partner-program' ? '2026-09-05' : '2026-08-25'),
    changeFrequency: route === '' ? 'weekly' : route.startsWith('/work/') ? 'monthly' : 'monthly',
    priority: route === '' ? 1 : ['/audit', '/offers/campaign-festive-season-offer'].includes(route) ? 0.9 : ['/services', '/work'].includes(route) ? 0.85 : ['/location', '/region'].includes(route) ? 0.75 : 0.7,
  }));
}
