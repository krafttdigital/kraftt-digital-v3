const baseUrl = (process.env.SEO_VALIDATE_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const productionOrigin = 'https://krafttdigital.in';

const decode = (value = '') => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#x27;', "'")
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');

function tags(html, element) {
  return html.match(new RegExp(`<${element}\\b[^>]*>`, 'gi')) ?? [];
}

function tagAttribute(tag, name) {
  return decode(tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'))?.[1] ?? '');
}

function meta(html, key, value) {
  const tag = tags(html, 'meta').find((candidate) =>
    tagAttribute(candidate, key).toLowerCase() === value.toLowerCase());
  return tag ? tagAttribute(tag, 'content') : '';
}

function link(html, rel, attribute = 'href') {
  const tag = tags(html, 'link').find((candidate) =>
    tagAttribute(candidate, 'rel').toLowerCase() === rel.toLowerCase());
  return tag ? tagAttribute(tag, attribute) : '';
}

function languageAlternates(html) {
  return Object.fromEntries(tags(html, 'link')
    .filter((tag) => tagAttribute(tag, 'rel').toLowerCase() === 'alternate' && tagAttribute(tag, 'hreflang'))
    .map((tag) => [tagAttribute(tag, 'hreflang'), tagAttribute(tag, 'href')]));
}

function schemas(html) {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)]
    .flatMap((match) => {
      const parsed = JSON.parse(decode(match[1]));
      return Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [parsed];
    });
}

function schemaByType(items, type) {
  return items.find((item) => item?.['@type'] === type);
}

function visibleText(html) {
  const body = html.match(/<body\b[^>]*>(.*?)<\/body>/is)?.[1] ?? html;
  return decode(body
    .replace(/<script\b[^>]*>.*?<\/script>/gis, ' ')
    .replace(/<style\b[^>]*>.*?<\/style>/gis, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function validateVisibleFaq(path, page) {
  const faq = schemaByType(page.structuredData, 'FAQPage');
  const pageText = visibleText(page.html);
  expect(Boolean(faq), `${path}: missing FAQPage schema`);
  expect(pageText.includes('Frequently asked questions'), `${path}: FAQ section is not clearly labelled`);
  expect(Array.isArray(faq?.mainEntity) && faq.mainEntity.length === 4, `${path}: expected four FAQ questions`);
  for (const item of faq?.mainEntity ?? []) {
    const question = item?.name ?? '';
    const answer = item?.acceptedAnswer?.text ?? '';
    expect(item?.['@type'] === 'Question', `${path}: FAQ entry is not a Question`);
    expect(item?.acceptedAnswer?.['@type'] === 'Answer', `${path}: FAQ entry is missing an Answer`);
    expect(Boolean(question) && pageText.includes(question), `${path}: structured FAQ question is not visibly rendered: ${question}`);
    expect(Boolean(answer) && pageText.includes(answer), `${path}: structured FAQ answer is not visibly rendered: ${question}`);
  }
}

function bodyStructure(html) {
  const body = html.match(/<body\b[^>]*>(.*?)<\/body>/is)?.[1] ?? '';
  const pageMain = body.match(/<main\b[^>]*>.*?<\/main>/is)?.[0] ?? body;
  const withoutScripts = pageMain.replace(/<script\b[^>]*>.*?<\/script>/gis, '');
  return [...withoutScripts.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)].map((match) => {
    const className = tagAttribute(match[0], 'class');
    const id = tagAttribute(match[0], 'id');
    return `${match[1].toLowerCase()}|${className}|${id}`;
  });
}

function sectionClasses(html) {
  const body = html.match(/<body\b[^>]*>(.*?)<\/body>/is)?.[1] ?? '';
  const pageMain = body.match(/<main\b[^>]*>.*?<\/main>/is)?.[0] ?? body;
  return [...pageMain.matchAll(/<section\b[^>]*>/gi)].map((match) => tagAttribute(match[0], 'class'));
}

function structureDifference(expected, actual) {
  const length = Math.max(expected.length, actual.length);
  for (let index = 0; index < length; index += 1) {
    if (expected[index] !== actual[index]) return `at ${index}: homepage=${expected[index] ?? '(end)'} geo=${actual[index] ?? '(end)'}`;
  }
  return '';
}

const failures = [];
const checked = new Map();

function expect(condition, message) {
  if (!condition) failures.push(message);
}

async function fetchPath(path) {
  if (checked.has(path)) return checked.get(path);
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
  const html = await response.text();
  const result = { response, html, structuredData: response.status === 200 ? schemas(html) : [] };
  checked.set(path, result);
  return result;
}

async function validateIndexablePage(path) {
  const { response, html, structuredData } = await fetchPath(path);
  const canonical = `${productionOrigin}${path === '/' ? '' : path}`;
  expect(response.status === 200, `${path}: expected 200, received ${response.status}`);
  expect(!response.headers.get('location'), `${path}: must not redirect`);
  expect(link(html, 'canonical') === canonical, `${path}: incorrect self-canonical`);
  expect((meta(html, 'name', 'robots') || '').includes('index'), `${path}: missing index robots directive`);
  expect(Boolean(meta(html, 'name', 'description')), `${path}: missing description`);
  expect(meta(html, 'property', 'og:url') === canonical, `${path}: incorrect og:url`);
  expect(Boolean(meta(html, 'property', 'og:image')), `${path}: missing og:image`);
  expect(meta(html, 'name', 'twitter:card') === 'summary_large_image', `${path}: missing large Twitter card`);
  expect((html.match(/<h1\b/gi) ?? []).length === 1, `${path}: expected exactly one H1`);
  expect(Boolean(schemaByType(structuredData, 'WebPage')), `${path}: missing WebPage schema`);
  expect(Boolean(schemaByType(structuredData, 'BreadcrumbList')), `${path}: missing BreadcrumbList schema`);
  expect(!schemaByType(structuredData, 'LocalBusiness'), `${path}: must not claim LocalBusiness`);
  return { html, structuredData };
}

const home = await validateIndexablePage('/');
expect(decode(home.html).includes('Branding · Websites · E-commerce · SEO · Social Media'), '/: core services missing from homepage hero');
expect(visibleText(home.html).includes('Digital presence for brands who take themselves seriously.'), '/: primary positioning missing from homepage hero');
expect(decode(home.html).includes('Request a Free Introductory Call'), '/: free-call request missing from homepage');
expect(!decode(home.html).includes('Digital presence · Chandigarh'), '/: geographic body content leaked into homepage');

const baseService = await validateIndexablePage('/services/web-design-development');
expect(decode(baseService.html).includes('Websites that explain your value'), '/services/web-design-development: current service headline missing');

await validateIndexablePage('/work/shree-hari-spintex');
const cityHub = await validateIndexablePage('/location/chandigarh');
const cityService = await validateIndexablePage('/location/chandigarh/web-design-development');
const regionHub = await validateIndexablePage('/region/usa');
const regionService = await validateIndexablePage('/region/usa/web-design-development');

const homeStructure = bodyStructure(home.html);
const cityStructureDifference = structureDifference(homeStructure, bodyStructure(cityHub.html));
const regionStructureDifference = structureDifference(homeStructure, bodyStructure(regionHub.html));
expect(!cityStructureDifference, `/location/chandigarh: DOM tags, classes or IDs differ from the homepage ${cityStructureDifference}`);
expect(!regionStructureDifference, `/region/usa: DOM tags, classes or IDs differ from the homepage ${regionStructureDifference}`);
expect(JSON.stringify(sectionClasses(cityHub.html)) === JSON.stringify(sectionClasses(home.html)), '/location/chandigarh: section order or section classes differ from the homepage');
expect(JSON.stringify(sectionClasses(regionHub.html)) === JSON.stringify(sectionClasses(home.html)), '/region/usa: section order or section classes differ from the homepage');

validateVisibleFaq('/location/chandigarh', cityHub);
validateVisibleFaq('/region/usa', regionHub);

const cityServiceSchema = schemaByType(cityService.structuredData, 'Service');
expect(cityServiceSchema?.areaServed?.['@type'] === 'City', '/location/chandigarh/web-design-development: areaServed must be City');
expect(cityServiceSchema?.areaServed?.name === 'Chandigarh', '/location/chandigarh/web-design-development: areaServed name mismatch');
const regionServiceSchema = schemaByType(regionService.structuredData, 'Service');
expect(regionServiceSchema?.areaServed?.['@type'] === 'Country', '/region/usa/web-design-development: areaServed must be Country');
expect(regionServiceSchema?.areaServed?.name === 'United States', '/region/usa/web-design-development: areaServed name mismatch');

const homeLanguages = languageAlternates(home.html);
const regionLanguages = languageAlternates(regionHub.html);
const serviceLanguages = languageAlternates(baseService.html);
const regionServiceLanguages = languageAlternates(regionService.html);
const expectedRegionLanguages = {
  'en-IN': `${productionOrigin}`,
  'x-default': `${productionOrigin}`,
  'en-US': `${productionOrigin}/region/usa`,
  'en-GB': `${productionOrigin}/region/uk`,
  'en-AE': `${productionOrigin}/region/uae`,
  'en-CA': `${productionOrigin}/region/canada`,
  'en-AU': `${productionOrigin}/region/australia`,
};
for (const [language, href] of Object.entries(expectedRegionLanguages)) {
  expect(homeLanguages[language] === href, `/: hreflang ${language} is not reciprocal`);
  expect(regionLanguages[language] === href, `/region/usa: hreflang ${language} is not reciprocal`);
}
expect(serviceLanguages['en-IN'] === `${productionOrigin}/services/web-design-development`, '/services/web-design-development: en-IN hreflang mismatch');
expect(serviceLanguages['en-US'] === `${productionOrigin}/region/usa/web-design-development`, '/services/web-design-development: en-US hreflang mismatch');
expect(regionServiceLanguages['en-IN'] === `${productionOrigin}/services/web-design-development`, '/region/usa/web-design-development: en-IN hreflang mismatch');
expect(regionServiceLanguages['en-US'] === `${productionOrigin}/region/usa/web-design-development`, '/region/usa/web-design-development: en-US hreflang mismatch');

for (const path of [
  '/location/not-real',
  '/location/chandigarh/ai-powered-creative',
  '/region/india',
  '/region/usa/social-media-management',
]) {
  const { response } = await fetchPath(path);
  expect(response.status === 404, `${path}: unsupported route should return 404, received ${response.status}`);
}

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
const sitemap = decode(await sitemapResponse.text());
expect(sitemapResponse.status === 200, '/sitemap.xml: expected 200');
const sitemapPaths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
const geographicHubPaths = sitemapPaths.filter((path) => /^\/(location|region)\/[^/]+$/.test(path));
for (const path of geographicHubPaths) {
  const page = await fetchPath(path);
  const { html } = page;
  const pageStructureDifference = structureDifference(homeStructure, bodyStructure(html));
  expect(!pageStructureDifference, `${path}: homepage composition differs ${pageStructureDifference}`);
  expect(JSON.stringify(sectionClasses(html)) === JSON.stringify(sectionClasses(home.html)), `${path}: section order or section classes differ from the homepage`);
  validateVisibleFaq(path, page);
}
for (const path of ['/location/chandigarh', '/location/chandigarh/web-design-development', '/region/usa', '/region/usa/web-design-development']) {
  expect(sitemap.includes(`<loc>${productionOrigin}${path}</loc>`), `/sitemap.xml: missing ${path}`);
}
for (const path of ['/location/not-real', '/location/chandigarh/ai-powered-creative', '/region/india', '/region/usa/social-media-management']) {
  expect(!sitemap.includes(`<loc>${productionOrigin}${path}</loc>`), `/sitemap.xml: unsupported route included ${path}`);
}

const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
const robots = await robotsResponse.text();
expect(robotsResponse.status === 200, '/robots.txt: expected 200');
expect(robots.includes('Allow: /'), '/robots.txt: crawl allow rule missing');

const llmsResponse = await fetch(`${baseUrl}/llms.txt`);
const llms = await llmsResponse.text();
expect(llmsResponse.status === 200, '/llms.txt: expected 200');
expect(llms.includes('## Markets served'), '/llms.txt: Markets served section missing');
expect(llms.includes(`${productionOrigin}/location/chandigarh`), '/llms.txt: city hub missing');
expect(llms.includes(`${productionOrigin}/region/usa`), '/llms.txt: region hub missing');
expect(llms.includes('They do not represent physical Kraftt offices, local branches or fabricated local client work.'), '/llms.txt: geographic accuracy guidance missing');

if (failures.length) {
  console.error(`Geographic SEO validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Geographic SEO validation passed.');
console.log(`Verified homepage-identical composition across ${geographicHubPaths.length} geographic hubs, plus strict route whitelists, self-canonicals, reciprocal hreflang, visible FAQ schema, areaServed schema, crawler files and 404 behaviour.`);
