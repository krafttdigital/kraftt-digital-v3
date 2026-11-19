import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { loadProjectModule } from './quotation-test-modules.mjs';

const { priceCatalogue } = loadProjectModule('app/data/pricing-catalogue.ts');
const { addOnIds, formatPrice, formatServicePrice, geographicCurrency, priceFor, pricingDestination, pricingEnquiry, regionalizePriceCopy } = loadProjectModule('app/data/pricing.ts');
const { serviceBySlug, services } = loadProjectModule('app/data/services.ts');
const { websiteEstimate, socialEstimate } = loadProjectModule('app/tools/packageEstimates.ts');
const { locationHubPaths, locationServicePaths, regionHubPaths, regionServicePaths } = loadProjectModule('app/data/geo/geo-services.ts');
const paths = [...locationHubPaths, ...locationServicePaths, ...regionHubPaths, ...regionServicePaths];

test('approved regions, cadence and missing prices retain independent values', () => {
  assert.equal(formatServicePrice('web-1', 'INR', true), 'From ₹12,000 · one-time');
  assert.equal(formatServicePrice('web-1', 'USD', true), 'From $299 · one-time');
  assert.equal(formatServicePrice('social-1', 'USD', true), 'From $299/month');
  assert.equal(formatServicePrice('web-1-annual-maintenance-support', 'USD'), '$249/year');
  assert.equal(formatServicePrice('shopify-2-extra-product-upload-per-product', 'USD'), 'Request a quote');
  assert.equal(formatPrice('web-1', 'INR', true), 'From ₹12,000 INR · one-time');
  assert.equal(formatPrice('web-1', 'USD', true), 'From US$299 USD · one-time');
  assert.equal(formatPrice('social-1', 'USD', true), 'From US$299 USD/month');
  assert.equal(priceFor('ecomseo-2', 'USD').amount, 549);
  assert.equal(priceFor('social-2', 'USD').amount, 599);
  assert.equal(formatPrice('web-1-annual-maintenance-support', 'USD'), 'US$249 USD/year');
  assert.equal(formatPrice('shopify-1-extra-product-upload-per-product', 'USD'), 'US$2 USD · one-time');
  assert.equal(formatPrice('shopify-2-extra-product-upload-per-product', 'USD'), 'Request a quote');
  assert.equal(formatPrice(null, 'INR'), 'Request a quote');
  for (const tier of serviceBySlug('marketplace-catalogue-building').tiers) {
    for (const id of [tier.priceId, ...addOnIds(tier.priceId)]) {
      assert.equal(priceFor(id, 'USD').amount, null);
      assert.equal(formatPrice(id, 'USD', true), 'Request a quote');
    }
  }
  for (const service of services) {
    for (const faq of [...service.faqs, ...serviceBySlug(service.slug).faqs]) {
      for (const match of faq.answer.matchAll(/\{\{([^}]+)\}\}/g)) assert.ok(Object.hasOwn(priceCatalogue, match[1]), match[1]);
      assert.doesNotMatch(regionalizePriceCopy(faq.answer, 'USD'), /₹|\{\{/u);
    }
  }
});

const menuFile = process.env.KRAFTT_SERVICE_MENU;
test('catalogue matches every package and add-on in the supplied embedded menu', { skip: !menuFile }, () => {
  const html = readFileSync(menuFile, 'utf8');
  const categories = JSON.parse(html.match(/^const serviceCategories = (.+);$/m)[1]);
  let compared = 0;
  for (const category of categories) {
    const slug = category.slug.endsWith('#marketplace-setup') ? 'marketplace-catalogue-building' : category.slug;
    const service = serviceBySlug(slug);
    assert.deepEqual(service.tiers.map(tier => tier.priceId), category.packages.map(pack => pack.id));
    for (const pack of category.packages) {
      for (const [currency, property] of [['INR', 'inr'], ['USD', 'usd']]) {
        const record = priceFor(pack.id, currency);
        assert.equal(record.service, slug);
        assert.equal(record.amount, pack.price[property]);
        assert.equal(record.cadence, pack.price.cadence);
        assert.deepEqual(addOnIds(pack.id).map(id => {
          const addon = priceFor(id, currency);
          assert.equal(addon.packageId, pack.id);
          return [addon.name, addon.amount, addon.cadence];
        }), pack.addons.map(addon => [addon.name, addon[property], addon.cadence]));
      }
      compared += 1 + pack.addons.length;
    }
  }
  assert.equal(compared, Object.keys(priceCatalogue).length - 1, 'The standalone audit is outside the service menu');
});

test('switching reuses matching locations and countries and leaves unsupported services on the shared route', () => {
  assert.equal(geographicCurrency('/region/uk/web-design-development'), 'USD');
  assert.equal(geographicCurrency('/location/delhi'), 'INR');
  assert.equal(geographicCurrency('/services/web-design-development'), null);
  assert.equal(pricingDestination('/region/uk/web-design-development', 'INR', '/location/delhi', paths), '/location/delhi/web-design-development');
  assert.equal(pricingDestination('/services/brand-identity', 'USD', '/region/uk', paths), '/region/uk/brand-identity');
  assert.equal(pricingDestination('/location/delhi/social-media-management', 'USD', '/region/uk', paths), '/services/social-media-management');
  assert.equal(pricingDestination('/services/marketplace-catalogue-building', 'USD', '/region/uk', paths), null);
  assert.equal(pricingDestination('/region/uk', 'INR', '/location/missing', paths), '/location');
  assert.equal(pricingDestination('/location/delhi', 'USD', null, paths), '/region');
});

test('estimates total only approved one-time amounts and flag custom work', () => {
  const brief = { siteType: 'informational', scope: 'business', seo: true, brand: true, urgency: '30-days' };
  const india = websiteEstimate(brief, 'INR'), international = websiteEstimate(brief, 'USD');
  assert.equal(india.oneTimeTotal, 37000);
  assert.equal(india.seo.amount, 12000);
  assert.equal(international.oneTimeTotal, 898);
  assert.equal(international.seo.amount, 299);
  assert.equal(international.seo.cadence, 'monthly');
  assert.equal(websiteEstimate({ ...brief, scope: 'custom' }, 'USD').oneTimeTotal, null);
  assert.equal(websiteEstimate({ ...brief, siteType: 'marketplace', scope: 'growth' }, 'USD').oneTimeTotal, null);
  const indiaMarketplace = websiteEstimate({ ...brief, siteType: 'marketplace', scope: 'growth' }, 'INR');
  assert.equal(indiaMarketplace.oneTimeTotal, 62000);
  assert.equal(indiaMarketplace.customSeo, true);
  assert.equal(websiteEstimate({ ...brief, siteType: 'ecommerce', scope: 'complete' }, 'USD').base.amount, 1499);
  assert.equal(socialEstimate('2', '21', false, 'USD').base.amount, 599);
  assert.equal(socialEstimate('3', '30', true, 'USD').needsQuote, true);
  assert.equal(socialEstimate('4', '15', false, 'INR').base, null);
  assert.equal(socialEstimate('1', '31', false, 'INR').base, null);
});

test('enquiries preserve the estimate currency and rebuild values from approved package IDs', () => {
  const params = new URLSearchParams('source=calculator&quote_currency=USD&package=web-2&addons=seo,brand&amount=1');
  const data = pricingEnquiry(params, 'INR', 'web-design-development');
  assert.equal(data.pricing_currency, 'INR');
  assert.equal(data.pricing_market, 'india');
  assert.equal(data.package_id, 'web-2');
  assert.equal(data.estimate_currency, 'USD');
  assert.ok(data.estimate_summary.includes('US$898 USD · one-time'));
  assert.ok(data.estimate_summary.includes('US$299 USD/month'));
  assert.equal(pricingEnquiry(params, 'USD', 'ecommerce-store-development').package_id, '');
  params.set('quote_currency', 'GBP');
  assert.deepEqual(pricingEnquiry(params, 'USD', 'web-design-development'), { pricing_market: 'international', pricing_currency: 'USD' });
});

const preview = process.env.PRICING_PREVIEW_URL;
test('regional HTML, FAQ schema and offers agree under either country header', { skip: !preview }, async () => {
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(preview).hostname));
  const cases = [
    ['/services/web-design-development', 'INR', '₹12,000 · one-time', 12000],
    ['/location/delhi/web-design-development', 'INR', '₹12,000 · one-time', 12000],
    ['/region/uk/web-design-development', 'USD', '$299 · one-time', 299],
    ['/region/usa/ecommerce-seo', 'USD', '$299/month', 299, 'month'],
    ['/services/landing-pages', null, 'Request a quote'],
    ['/services/bundles/starter-business-launch', null, 'Request a quote'],
  ];
  for (const [route, currency, label, price, cadence] of cases) {
    const response = await fetch(new URL(route, preview), { headers: { 'x-country-code': currency === 'USD' ? 'IN' : 'GB' } });
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.ok(html.includes(label), route + ': rendered package price');
    const tags = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/g)];
    const entities = tags.flatMap(match => JSON.parse(match[1])['@graph'] ?? []);
    const service = entities.find(entity => entity['@type'] === 'Service');
    assert.ok(service, route);
    if (!currency) { assert.equal(service.offers, undefined, route); continue; }
    assert.equal(service.offers[0].price, price, route);
    assert.equal(service.offers[0].priceCurrency, currency, route);
    assert.equal(service.offers[0].priceSpecification?.unitText, cadence, route);
    const faq = entities.find(entity => entity['@type'] === 'FAQPage');
    assert.ok(faq.mainEntity.some(item => item.acceptedAnswer.text.includes(label)), route + ': FAQ price');
    if (geographicCurrency(route)) assert.ok(html.match(/<meta name="description"[^>]+>/)?.[0].includes(label), route + ': metadata price');
  }
});
