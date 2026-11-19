import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

// Read the same TypeScript article registry used by static route generation.
function load(file, mocks = {}, globals = {}) {
  const filename = path.resolve(file);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const testModule = { exports: {} };
  vm.runInNewContext(source, {
    exports: testModule.exports,
    module: testModule,
    ...globals,
    require(name) {
      if (name in mocks) return mocks[name];
      assert.ok(name.startsWith('.'), `Unexpected module in article data: ${name}`);
      return load(path.resolve(path.dirname(filename), name + '.ts'), mocks, globals);
    },
  }, { filename });
  return testModule.exports;
}

const registry = load('app/blog/posts.ts');
const posts = registry.publishedPosts();
const text = content => content.map(part => typeof part === 'string' ? part : part.text).join('');

test('publication status controls routes, including past drafts and future dated publications', () => {
  const draft = { ...posts[0], slug: 'private-draft', status: 'draft', publishedAt: '2020-01-01' };
  const published = { ...posts[0], slug: 'explicit-publication', status: 'published', publishedAt: '2100-01-01' };
  const fixtureRegistry = load('app/blog/posts.ts', {
    './articles/small-business-website-design': { smallBusinessWebsitePost: draft },
    './articles/brand-identity-for-startups': { startupBrandingPost: published },
  });
  assert.equal(fixtureRegistry.publishedPosts().length, 1);
  assert.equal(fixtureRegistry.findPublishedPost(published.slug).slug, published.slug);
  assert.equal(fixtureRegistry.findPublishedPost(draft.slug), undefined);
  assert.equal(fixtureRegistry.findPublishedPost('missing-article'), undefined);
});

test('sitemap omits drafts and future articles until their India publication date', () => {
  const draft = { ...posts[0], slug: 'draft', status: 'draft', publishedAt: '2026-11-01' };
  const scheduled = { ...posts[0], slug: 'scheduled', publishedAt: '2026-11-20', updatedAt: '2026-11-20' };
  const current = { ...posts[0], slug: 'current', publishedAt: '2026-11-18', updatedAt: '2026-11-19' };
  const origin = 'https://krafttdigital.in';
  const mock = {
    './articles/small-business-website-design': { smallBusinessWebsitePost: draft },
    './articles/brand-identity-for-startups': { startupBrandingPost: scheduled },
    './data/bundles': { bundles: [] },
    './data/diwaliGrowthOffer': { diwaliGrowthOffer: { pagePath: '/offers/diwali-growth-website' } },
    './data/offers': { offers: [{ pagePath: '/offers/campaign-festive-season-offer' }] },
    './data/geo': { locationHubPaths: [], locationServicePaths: [], regionHubPaths: [], regionServicePaths: [] },
    './data/projects': { projects: [] },
    './data/services': { services: [] },
    './data/seo': { absoluteUrl: value => value === '/' ? origin : origin + value },
    './tools/data': { tools: [{ slug: 'digital-presence-score' }] },
  };
  const fixture = load('app/blog/posts.ts', mock);
  mock['./blog/posts'] = { publishedPosts: () => [...fixture.publishedPosts(), current] };
  const sitemapAt = (instant) => {
    class FixedDate extends Date {
      constructor() { super(instant); }
    }
    const routes = load('app/sitemap.ts', mock, { Date: FixedDate }).default();
    return new Map(routes.map(route => [new URL(route.url).pathname, route]));
  };

  const beforeMidnight = sitemapAt('2026-11-19T18:29:59Z');
  assert.equal(beforeMidnight.has('/blog/draft'), false);
  assert.equal(beforeMidnight.has('/blog/scheduled'), false);
  assert.equal(beforeMidnight.get('/blog').lastModified, '2026-11-18');
  assert.equal(beforeMidnight.get('/blog/current').lastModified, '2026-11-19');
  assert.equal(beforeMidnight.get('/tools/digital-presence-score').lastModified, undefined);
  assert.ok(beforeMidnight.has('/offers/diwali-growth-website'));
  assert.ok(beforeMidnight.has('/offers/campaign-festive-season-offer'));

  const atMidnight = sitemapAt('2026-11-19T18:30:00Z');
  assert.equal(atMidnight.has('/blog/draft'), false);
  assert.equal(atMidnight.get('/blog/scheduled').lastModified, '2026-11-20');
  assert.equal(atMidnight.get('/blog').lastModified, '2026-11-20');
});

test('article slugs, dates and table-of-contents anchors are valid and distinct', () => {
  assert.ok(posts.length >= 2);
  assert.equal(new Set(posts.map(post => post.slug)).size, posts.length);
  assert.equal(new Set(posts.map(post => post.title)).size, posts.length);
  assert.equal(new Set(posts.map(post => post.description)).size, posts.length);
  for (const post of posts) {
    assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const value of [post.publishedAt, post.updatedAt]) {
      assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(new Date(value).toISOString().slice(0, 10), value);
    }
    assert.ok(post.updatedAt >= post.publishedAt, `${post.slug}: update predates publication`);
    const anchors = [...post.sections.map(section => section.id), 'article-faqs'];
    assert.equal(new Set(anchors).size, anchors.length, `${post.slug}: duplicate contents anchor`);
    for (const anchor of anchors) assert.match(anchor, /^[a-z][a-z0-9-]*$/);
    for (const section of post.sections) {
      for (const block of section.blocks) {
        if (block.type === 'table') {
          assert.ok(block.caption && block.columns.length > 1);
          assert.ok(block.rows.every(row => row.length === block.columns.length));
        }
      }
    }
  }
});

test('reading time counts the visible article, excluding URLs, alt text and metadata', () => {
  const hidden = 'hidden '.repeat(500);
  const fixture = {
    ...posts[0], title: 'Title', description: hidden,
    hero: { ...posts[0].hero, alt: hidden, caption: 'Caption' },
    introduction: ['Intro ', { text: 'link', href: 'https://example.com/' + hidden }],
    sections: [{
      id: 'section', title: 'Section', blocks: [
        { type: 'paragraph', content: ['Paragraph'] },
        { type: 'list', items: [['Item one'], ['Item two']] },
        { type: 'table', caption: 'Comparison', columns: ['Left', 'Right'], rows: [['Low', 'High']] },
        { type: 'callout', title: 'Notice', content: ['Detail'] },
        { type: 'checklist', title: 'Check', items: ['First', 'Second'] },
        { type: 'figure', src: '/image.webp', alt: hidden, caption: 'Photo', width: 100, height: 100 },
        { type: 'cta', title: 'Act', content: 'Now', link: { label: 'Go', href: '/some-long-url' } },
      ],
    }],
    faqs: [{ question: 'Why', answer: ['Because'] }],
    closing: { title: 'End', content: 'Close', primary: { label: 'Call', href: '/contact' }, secondary: { label: 'Read', href: '/blog' } },
  };
  assert.equal(registry.articleWordCount(fixture), 30);
  assert.equal(registry.readingTime(fixture), 1);
  fixture.sections[0].blocks.push({ type: 'paragraph', content: ['word '.repeat(170)] });
  assert.equal(registry.readingTime(fixture), 1, '200 words is one minute');
  fixture.sections[0].blocks.push({ type: 'paragraph', content: ['Extra'] });
  assert.equal(registry.readingTime(fixture), 2, '201 words rounds to two minutes');
  const beforeDiagram = registry.articleWordCount(fixture);
  fixture.sections[0].blocks.push({ type: 'diagram', variant: 'website-plan' });
  assert.ok(registry.articleWordCount(fixture) > beforeDiagram, 'Visible diagram labels contribute to reading time');
});

const decode = value => value
  .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
  .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
  .replaceAll('&quot;', '"').replaceAll('&apos;', "'")
  .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&nbsp;', ' ').replaceAll('&amp;', '&');
const normalize = value => value.replace(/\s+/g, ' ').trim();
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), decode(match[2])]));
}
function tags(html, element) {
  return (html.match(new RegExp(`<${element}\\b[^>]*>`, 'gi')) ?? []).map(attributes);
}
function metadata(html, name, by = 'name') {
  return tags(html, 'meta').find(tag => tag[by] === name)?.content;
}
function structuredData(html) {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)]
    .flatMap(match => {
      const data = JSON.parse(match[1]);
      return data['@graph'] ?? [data];
    });
}
const base = process.env.BLOG_VALIDATE_BASE_URL?.replace(/\/$/, '');

test('local HTTP pages expose articles, metadata, structured data, assets and usable links', { skip: !base }, async () => {
  const production = 'https://krafttdigital.in';
  const checked = new Map();
  async function get(urlPath) {
    const url = new URL(urlPath, base);
    assert.equal(url.origin, new URL(base).origin, 'HTTP checks must stay on the local preview');
    if (!checked.has(url.href)) {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const body = await response.text();
      checked.set(url.href, { response, body });
    }
    return checked.get(url.href);
  }
  const index = await get('/blog');
  assert.equal(index.response.status, 200);
  assert.equal(tags(index.body, 'link').find(tag => tag.rel === 'canonical')?.href, production + '/blog');
  assert.doesNotMatch(metadata(index.body, 'robots') ?? '', /noindex|nofollow/i);
  assert.ok(structuredData(index.body).some(entity => entity['@type'] === 'CollectionPage'));
  const robots = await get('/robots.txt');
  assert.equal(robots.response.status, 200);
  assert.doesNotMatch(robots.body, /^Disallow:\s*\/(?:blog\S*)?\s*$/im);
  const home = await get('/');
  const homepageWithoutFooter = home.body.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '');
  assert.ok(tags(home.body, 'a').some(tag => tag.href === '/blog'), 'Homepage footer links to Insights');
  assert.ok(!tags(homepageWithoutFooter, 'a').some(tag => tag.href === '/blog'), 'Insights stays out of homepage content and navigation');
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.response.status, 200);
  const llms = await get('/llms.txt');
  assert.equal(llms.response.status, 200);
  const sitemapEntries = [...sitemap.body.matchAll(/<url>(.*?)<\/url>/gs)].map(match => match[1]);
  const titles = new Set();
  const descriptions = new Set();
  const internalLinks = new Set();
  const assets = new Set();

  for (const post of posts) {
    const route = `/blog/${post.slug}`;
    const canonical = production + route;
    const { response, body } = await get(route);
    assert.equal(response.status, 200, route);
    assert.ok(tags(index.body, 'a').some(tag => tag.href === route), 'Index must have a crawlable article link');
    assert.ok(llms.body.includes(canonical));
    const entry = sitemapEntries.find(item => item.includes(`<loc>${canonical}</loc>`));
    assert.ok(entry, `${route}: sitemap entry missing`);
    assert.ok(entry.includes(`<lastmod>${post.updatedAt}`), `${route}: sitemap update date differs`);
    assert.equal(tags(body, 'link').find(tag => tag.rel === 'canonical')?.href, canonical);
    assert.doesNotMatch(metadata(body, 'robots') ?? '', /noindex|nofollow/i);
    assert.doesNotMatch(response.headers.get('x-robots-tag') ?? '', /noindex|nofollow/i);
    const pageTitle = decode(body.match(/<title>(.*?)<\/title>/s)?.[1] ?? '');
    assert.ok(pageTitle.includes(post.title));
    assert.ok(!titles.has(pageTitle), 'Article titles must be distinct');
    titles.add(pageTitle);
    const description = metadata(body, 'description');
    assert.equal(description, post.description);
    assert.ok(!descriptions.has(description), 'Article descriptions must be distinct');
    descriptions.add(description);
    assert.equal(metadata(body, 'og:type', 'property'), 'article');
    assert.equal(metadata(body, 'og:url', 'property'), canonical);
    assert.equal(metadata(body, 'og:image', 'property'), production + post.hero.src);
    const graph = structuredData(body);
    const article = graph.find(entity => entity['@type'] === 'BlogPosting');
    assert.ok(article);
    assert.equal(article.headline, post.title);
    assert.equal(article.datePublished, post.publishedAt);
    assert.equal(article.dateModified, post.updatedAt);
    assert.equal(article.wordCount, registry.articleWordCount(post));
    assert.equal(article.author.name, registry.blogAuthor.name);
    assert.equal(article.author['@type'], 'Organization');
    const breadcrumbs = graph.find(entity => entity['@type'] === 'BreadcrumbList');
    assert.ok(breadcrumbs.itemListElement.some(item => item.item === production + '/blog'));
    assert.ok(tags(body, 'time').some(tag => tag.datetime === post.publishedAt));
    const articleHtml = body.match(/<article\b[^>]*>(.*?)<\/article>/s)?.[1];
    assert.ok(articleHtml, 'Article must be present in server-rendered HTML');
    const visible = normalize(decode(articleHtml.replace(/<script\b[^>]*>.*?<\/script>/gs, '').replace(/<!--.*?-->/gs, '').replace(/<[^>]*>/g, '')));
    assert.ok(visible.includes(`${registry.readingTime(post)} min read`));
    assert.ok(visible.includes(normalize(text(post.introduction))));
    const ids = [...articleHtml.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${route}: duplicate HTML IDs`);
    for (const section of post.sections) {
      assert.ok(ids.includes(section.id), `${route}: missing anchor ${section.id}`);
      assert.ok(visible.includes(section.title));
      for (const block of section.blocks) {
        if (block.type === 'paragraph') assert.ok(visible.includes(normalize(text(block.content))), `${route}: paragraph omitted from rendered HTML`);
      }
    }
    for (const link of tags(articleHtml, 'a')) {
      const href = link.href ?? '';
      if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Broken contents link ${href}`);
      else if (href.startsWith('/')) internalLinks.add(href);
      else assert.match(href, /^https:\/\//, `Unsupported article link ${href}`);
    }
    for (const image of tags(articleHtml, 'img')) {
      assert.ok(image.alt && Number(image.width) > 0 && Number(image.height) > 0);
      if (image.src.startsWith('/')) assets.add(image.src);
    }
    assets.add(post.hero.src);
    const related = posts.find(other => other.slug !== post.slug);
    assert.ok(tags(body, 'a').some(tag => tag.href === `/blog/${related.slug}`));
  }
  for (const href of internalLinks) {
    assert.equal((await get(href)).response.status, 200, `Broken article/CTA route ${href}`);
  }
  for (const src of assets) {
    const response = await fetch(new URL(src, base), { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, `Broken article image ${src}`);
    assert.match(response.headers.get('content-type') ?? '', /^image\//);
    assert.ok((await response.arrayBuffer()).byteLength > 0);
  }
  const missing = await get('/blog/not-a-published-article');
  assert.equal(missing.response.status, 404);
  console.log(`Verified ${posts.length} rendered articles, ${internalLinks.size} internal/CTA links and ${assets.size} image URLs.`);
});
