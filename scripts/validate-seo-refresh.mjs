import assert from 'node:assert/strict';
const base = process.env.SEO_VALIDATE_BASE_URL ?? 'http://localhost:3013';
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const documents = new Map(), links = new Set();
let index = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (index < paths.length) {
    const path = paths[index++];
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    const html = await response.text(); documents.set(path, html);
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      if (!match[1].startsWith('/') || match[1].startsWith('//')) continue;
      const url = new URL(match[1].replaceAll('&amp;', '&'), base);
      if (!/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.startsWith('/api/')) links.add(url.pathname);
    }
  }
}));
for (const target of links) {
  if (documents.has(target)) continue;
  const response = await fetch(base + target, { redirect: 'manual' });
  assert.ok(response.status === 200 || [301, 308].includes(response.status), `Broken internal link ${target}: ${response.status}`);
}
for (const path of ['/offers/diwali-growth-website', '/offers/campaign-festive-season-offer']) {
  const html = documents.get(path);
  assert.ok(html.includes('This campaign has ended.'), path);
  assert.ok(!html.includes('data-analytics-form="offer_enquiry"'), 'Expired form must not be rendered');
  assert.ok(html.includes('href="/contact"'), 'Evergreen enquiry path required');
}
assert.ok(!documents.get('/offers').includes('Open for enquiries'));
for (const [from, to] of [['/portfolio', '/work'], ['/portfolio/kiraq', '/work/kiraq-jewellery'], ['/portfolio/mittal-architect', '/work/mittal-architect'], ['/portfolio/the-vibed-vines', '/work/the-vibed-vines'], ['/portfolio/aegis-squad', '/work/aegis-squad'], ['/services/web-design', '/services/web-design-development'], ['/services/dashboards-tools', '/services/dashboards-internal-tools']]) {
  const response = await fetch(base + from, { redirect: 'manual' });
  assert.ok([301, 308].includes(response.status), from + ' permanent redirect');
  assert.equal(new URL(response.headers.get('location'), base).pathname, to);
  assert.equal((await fetch(base + to, { redirect: 'manual' })).status, 200, 'No redirect chain: ' + to);
}
for (const city of ['bathinda', 'barnala', 'delhi', 'gurugram']) assert.ok(documents.get('/location/' + city).includes('Work you can explore.'));
for (const path of ['/admin', '/thank-you']) assert.match(await (await fetch(base + path)).text(), /content="[^"]*noindex/);
const llms = await (await fetch(base + '/llms.txt')).text(); assert.ok(!llms.includes('Current offers:'));
for (const path of ['/tools/website-cost-calculator', '/tools/social-media-cost-calculator']) {
  const html = documents.get(path);
  assert.ok(html.includes('Worked example') && html.includes('What to know first'));
}
console.log(`Refresh HTTP checks passed: ${paths.length} sitemap pages, ${links.size} unique internal page links, expiry UI, direct legacy redirects, local client context, crawler references and tool explanations.`);
