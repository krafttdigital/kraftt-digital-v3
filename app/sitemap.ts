import type { MetadataRoute } from 'next';
import { bundles } from './data/bundles';
import { diwaliGrowthOffer } from './data/diwaliGrowthOffer';
import { offers } from './data/offers';
import { projects } from './data/projects';
import { services } from './data/services';
import { absoluteUrl } from './data/seo';
import { locationHubPaths, locationServicePaths, regionHubPaths, regionServicePaths } from './data/geo';
import { tools } from './tools/data';
import { businessTools } from './tools/businessModels';
import { publishedPosts } from './blog/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = publishedPosts();
  const latestArticleUpdate = articles.map((post) => post.updatedAt).sort().at(-1) ?? '2026-11-18';
  const staticRoutes = [
    '', '/services', '/work', '/process', '/about', '/audit',
    '/contact', '/partner-program', '/offers', '/tools', '/blog', '/location', '/region', '/legal/privacy-policy', '/legal/terms',
  ];
  const routes = new Set([
    ...staticRoutes,
    diwaliGrowthOffer.pagePath,
    ...offers.map((offer) => offer.pagePath),
    ...services.map((service) => `/services/${service.slug}`),
    ...bundles.map((bundle) => `/services/bundles/${bundle.slug}`),
    ...projects.map((project) => `/work/${project.slug}`),
    ...tools.map((tool) => `/tools/${tool.slug}`),
    ...articles.map((post) => `/blog/${post.slug}`),
    ...locationHubPaths,
    ...locationServicePaths,
    ...regionHubPaths,
    ...regionServicePaths,
  ]);

  // Only publish lastmod where a meaningful page update has a known date.
  const recentlyUpdated = new Map<string, string>([
    ['/offers', '2026-11-13'],
    ['/offers/campaign-festive-season-offer', '2026-11-13'],
    ['/services/web-design-development', '2026-11-13'],
    ...['bathinda', 'barnala', 'delhi', 'gurugram'].map((city): [string, string] => [`/location/${city}`, '2026-11-13']),
    [diwaliGrowthOffer.pagePath, '2026-11-13'],
    ['/tools', '2026-11-15'],
    ['/blog', latestArticleUpdate],
    ...articles.map((post): [string, string] => [`/blog/${post.slug}`, post.updatedAt]),
    ...tools.map((tool): [string, string] => [`/tools/${tool.slug}`, '2026-10-16']),
    ...businessTools.map((tool): [string, string] => [`/tools/${tool.slug}`, '2026-11-15']),
  ]);

  return [...routes].map((route) => ({
    url: route === '' ? `${absoluteUrl('/')}/` : absoluteUrl(route),
    ...(recentlyUpdated.has(route) ? { lastModified: recentlyUpdated.get(route) } : {}),
  }));
}
