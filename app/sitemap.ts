import type { MetadataRoute } from 'next';
import { publishedPosts } from './blog/posts';
import { bundles } from './data/bundles';
import { diwaliGrowthOffer } from './data/diwaliGrowthOffer';
import { locationHubPaths, locationServicePaths, regionHubPaths, regionServicePaths } from './data/geo';
import { offers } from './data/offers';
import { projects } from './data/projects';
import { absoluteUrl } from './data/seo';
import { services } from './data/services';
import { tools } from './tools/data';

const publicPages = [
  '/', '/services', '/work', '/process', '/about', '/audit', '/contact', '/partner-program',
  '/offers', '/tools', '/blog', '/location', '/region', '/legal/privacy-policy', '/legal/terms',
] as const;

// Offer expiry closes the campaign. The detail pages remain public archives pending
// the owner's retirement decision in docs/seo-implementation-review.md.
const offerPaths = [diwaliGrowthOffer, ...offers].map(offer => offer.pagePath);

// Dates for the documented November SEO review and the subsequent pricing release.
const documentedUpdates: Readonly<Record<string, string>> = {
  '/offers': '2026-11-13',
  '/offers/campaign-festive-season-offer': '2026-11-13',
  [diwaliGrowthOffer.pagePath]: '2026-11-13',
  '/location/bathinda': '2026-11-13',
  '/location/barnala': '2026-11-13',
  '/location/delhi': '2026-11-13',
  '/location/gurugram': '2026-11-13',
  '/services/web-design-development': '2026-11-19', // Substantive pricing update in c109f9f.
};

const editorialCalendar = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'short',
  timeZone: 'Asia/Kolkata',
});

export default function sitemap(): MetadataRoute.Sitemap {
  const today = editorialCalendar.format(new Date());
  const articles = publishedPosts().filter(post => post.publishedAt <= today);
  const articleUpdates = new Map(articles
    .filter(post => post.updatedAt >= post.publishedAt)
    .map(post => [`/blog/${post.slug}`, post.updatedAt]));
  // A new article changes the index. Edits inside an article use its own lastmod.
  const latestPublication = articles.map(post => post.publishedAt).sort().at(-1);
  const routes = new Set([
    ...publicPages,
    ...offerPaths,
    ...services.map(service => `/services/${service.slug}`),
    ...bundles.map(bundle => `/services/bundles/${bundle.slug}`),
    ...locationHubPaths,
    ...locationServicePaths,
    ...regionHubPaths,
    ...regionServicePaths,
    ...projects.map(project => `/work/${project.slug}`),
    ...tools.map(tool => `/tools/${tool.slug}`),
    ...articles.map(post => `/blog/${post.slug}`),
  ]);

  return [...routes].map(path => {
    const lastModified = path === '/blog' ? latestPublication : articleUpdates.get(path) ?? documentedUpdates[path];
    return {
      url: path === '/' ? `${absoluteUrl(path)}/` : absoluteUrl(path),
      ...(lastModified && lastModified <= today ? { lastModified } : {}),
    };
  });
}
