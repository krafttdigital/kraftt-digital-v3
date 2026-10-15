import type { MetadataRoute } from 'next';
import { absoluteUrl } from './data/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    // Noindex pages remain crawlable so search engines can read their meta tags.
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
