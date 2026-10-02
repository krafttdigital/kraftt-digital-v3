const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://krafttdigital.in').replace(/\/$/, '');
const key = process.env.INDEXNOW_KEY?.trim();

if (!key || !/^[a-fA-F0-9]{8,128}$/.test(key)) {
  throw new Error('Set INDEXNOW_KEY to an 8–128 character hexadecimal key before submitting.');
}

const sitemapResponse = await fetch(`${siteOrigin}/sitemap.xml`);
if (!sitemapResponse.ok) {
  throw new Error(`Could not read ${siteOrigin}/sitemap.xml (${sitemapResponse.status}). Deploy the site first.`);
}

const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (urlList.length === 0) throw new Error('No URLs were found in the deployed sitemap.');

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(siteOrigin).host,
    key,
    keyLocation: `${siteOrigin}/indexnow-key.txt`,
    urlList,
  }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow rejected the submission (${response.status}): ${await response.text()}`);
}

console.log(`IndexNow accepted ${urlList.length} URLs with status ${response.status}.`);
