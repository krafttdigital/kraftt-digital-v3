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
const titles = new Map();
const descriptions = new Map();
const ogImages = new Set();

for (const canonicalUrl of productionUrls) {
  const path = new URL(canonicalUrl).pathname;
  const response = await fetch(`${baseUrl}${path}`);
  const html = await response.text();
  const pageTitle = title(html);
  const description = attribute(html, 'meta', 'name', 'description');
  const canonical = attribute(html, 'link', 'rel', 'canonical', 'href');
  const robots = attribute(html, 'meta', 'name', 'robots');
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
  if (canonical !== canonicalUrl) failures.push(`${path}: canonical ${canonical || '(missing)'} does not match ${canonicalUrl}`);
  if (!robots.toLowerCase().includes('index') || !robots.toLowerCase().includes('follow')) failures.push(`${path}: index/follow robots missing`);
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
if (productionUrls.some((url) => new URL(url).pathname === '/thank-you')) failures.push('/thank-you must not be in the sitemap');
if (!attribute(thankYouHtml, 'meta', 'name', 'robots').toLowerCase().includes('noindex')) failures.push('/thank-you: noindex missing');

if (failures.length) {
  console.error(`SEO validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEO validation passed for ${productionUrls.length} sitemap URLs.`);
console.log(`Verified HTTP 200, unique metadata, exact canonicals, social metadata and valid rendered JSON-LD.`);
