import { readFile } from 'node:fs/promises';
import { loadProjectModule } from './quotation-test-modules.mjs';
const metadataMaster = JSON.parse(await readFile(new URL('../app/data/metadata-master.json', import.meta.url), 'utf8'));
const { formatServicePrice, geographicCurrency } = loadProjectModule('app/data/pricing.ts');
const { serviceBySlug } = loadProjectModule('app/data/services.ts');
const { siteUrl } = loadProjectModule('app/data/site.ts');
const baseUrl = (process.env.SEO_VALIDATE_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const decode = (value = '') => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#x27;', "'")
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');

function attribute(html, element, attributeName, attributeValue, contentName = 'content') {
  const tags = html.match(new RegExp(`<${element}\\b[^>]*>`, 'gi')) ?? [];
  const target = tags.find((tag) => new RegExp(`${attributeName}=["']${attributeValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(tag));
  if (!target) return '';
  const match = target.match(new RegExp(`${contentName}=["']([^"']*)["']`, 'i'));
  return decode(match?.[1] ?? '');
}

function title(html) {
  return decode(html.match(/<title>(.*?)<\/title>/is)?.[1]?.replace(/<[^>]+>/g, '') ?? '').trim();
}

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
if (!sitemapResponse.ok) throw new Error(`Sitemap returned ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const productionUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1]));
if (productionUrls.length === 0) throw new Error('Sitemap contains no URLs.');

const failures = [];
const origin = new URL(siteUrl).origin;
const paths = new Map();
for (const value of productionUrls) {
  let url;
  try { url = new URL(value); } catch {
    failures.push(`Invalid sitemap URL: ${value}`);
    continue;
  }
  if (url.origin !== origin || url.search || url.hash || url.username || url.password || value !== url.href) {
    failures.push(`Sitemap URL must be a canonical site path: ${value}`);
    continue;
  }
  const key = url.pathname.replace(/\/$/, '') || '/';
  if (paths.has(key)) failures.push(`Duplicate sitemap path: ${value}`);
  else paths.set(key, value);
}
for (const path of Object.keys(metadataMaster)) {
  if (!paths.has(path)) failures.push(`${path}: metadata master route absent from sitemap`);
}
const titles = new Map();
const descriptions = new Map();
const ogImages = new Set();

for (const canonicalUrl of paths.values()) {
  const path = new URL(canonicalUrl).pathname;
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
  const html = await response.text();
  const pageTitle = title(html);
  const description = attribute(html, 'meta', 'name', 'description');
  const canonical = attribute(html, 'link', 'rel', 'canonical', 'href');
  const robots = attribute(html, 'meta', 'name', 'robots');
  const googlebot = attribute(html, 'meta', 'name', 'googlebot');
  const robotsHeader = response.headers.get('x-robots-tag') ?? '';
  const ogTitle = attribute(html, 'meta', 'property', 'og:title');
  const ogDescription = attribute(html, 'meta', 'property', 'og:description');
  const ogUrl = attribute(html, 'meta', 'property', 'og:url');
  const ogImage = attribute(html, 'meta', 'property', 'og:image');
  const twitterCard = attribute(html, 'meta', 'name', 'twitter:card');
  const twitterTitle = attribute(html, 'meta', 'name', 'twitter:title');
  const twitterDescription = attribute(html, 'meta', 'name', 'twitter:description');
  const jsonLdScripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)].map((match) => decode(match[1]));

  if (response.status !== 200) failures.push(`${path}: HTTP ${response.status}`);
  if (!pageTitle) failures.push(`${path}: missing title`);
  if (!description) failures.push(`${path}: missing description`);
  const expected = metadataMaster[path];
  const geoService = /^\/(?:location|region)\/[^/]+\/([^/]+)$/.exec(path)?.[1];
  const service = geoService ? serviceBySlug(geoService) : undefined;
  const pricingSuffix = service ? ` ${formatServicePrice(service.tiers[0].priceId, geographicCurrency(path), true)}.` : '';
  if (expected && (pageTitle !== expected.title || description !== expected.description + pricingSuffix || ogTitle !== expected.ogTitle || ogDescription !== expected.ogDescription + pricingSuffix)) {
    failures.push(`${path}: metadata differs from approved copy or regional pricing`);
  }
  if (canonical !== canonicalUrl) failures.push(`${path}: canonical ${canonical || '(missing)'} does not match ${canonicalUrl}`);
  if (/\b(?:noindex|none)\b/i.test([robots, googlebot, robotsHeader].join(','))) failures.push(`${path}: noindex directive in page metadata or response headers`);
  const directives = robots.toLowerCase().split(',').map(value => value.trim());
  if (!directives.includes('index') || !directives.includes('follow') || directives.includes('nofollow')) failures.push(`${path}: index/follow robots missing`);
  if (!ogTitle || !ogDescription || ogUrl !== canonicalUrl || !ogImage) failures.push(`${path}: incomplete Open Graph metadata`);
  if (twitterCard !== 'summary_large_image' || !twitterTitle || !twitterDescription) failures.push(`${path}: incomplete Twitter metadata`);
  if (jsonLdScripts.length < 2) failures.push(`${path}: expected global and page JSON-LD`);
  for (const script of jsonLdScripts) {
    try { JSON.parse(script); } catch { failures.push(`${path}: invalid JSON-LD`); }
  }

  if (titles.has(pageTitle)) failures.push(`${path}: duplicate title with ${titles.get(pageTitle)}`);
  else titles.set(pageTitle, path);
  if (descriptions.has(description)) failures.push(`${path}: duplicate description with ${descriptions.get(description)}`);
  else descriptions.set(description, path);
  if (ogImages.has(ogImage)) failures.push(`${path}: duplicate OG image URL`);
  ogImages.add(ogImage);
}

for (const endpoint of ['/robots.txt', '/llms.txt']) {
  const response = await fetch(`${baseUrl}${endpoint}`);
  if (response.status !== 200) failures.push(`${endpoint}: HTTP ${response.status}`);
}

const thankYouResponse = await fetch(`${baseUrl}/thank-you`);
const thankYouHtml = await thankYouResponse.text();
for (const path of ['/admin', '/admin/legacy', '/thank-you']) {
  if (paths.has(path)) failures.push(`${path} must not be in the sitemap`);
}
if (!attribute(thankYouHtml, 'meta', 'name', 'robots').toLowerCase().includes('noindex')) failures.push('/thank-you: noindex missing');

if (failures.length) {
  console.error(`SEO validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEO validation passed for ${productionUrls.length} sitemap URLs.`);
console.log('Verified unique sitemap paths, direct HTTP 200, exact canonicals, indexing directives, social metadata and valid rendered JSON-LD.');
