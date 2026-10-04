# Search and AI discovery setup

## Metadata master applied 2026-10-04

`app/data/metadata-master.json` contains the 67 route records from `Kraftt_Metadata_Master_Codex.csv`. The central metadata helper applies titles, descriptions and social metadata without changing visible page content. All 20 regional service routes in the sheet exist in the enabled route configuration. Legacy services remain indexable and self-canonical pending a Search Console performance review.

The `/services/ecommerce-seo` title uses the sheet's permitted broad-SEO variant because the existing visible page is named "SEO Services" and covers business websites and stores. Research keywords and formula cells are not rendered or executed.

Existing reciprocal regional hreflang groups are preserved; other indexable pages have self-referencing `en-IN` and `x-default` links. Structured data uses stable organization IDs, Bathinda as the provider location, visible FAQs, collection lists, case-study articles and free WebApplication offers. Paid service/bundle offers describe published scope without numeric prices, because prices vary by visitor currency. No fabricated ratings, office addresses, outcomes or hidden FAQ content are added.

The homepage canonical and sitemap use `https://krafttdigital.in` (Next's normalized origin-only URL, equivalent to the CSV's trailing-slash form).

Google requires no special AI-only schema for AI Overviews or AI Mode. Crawlability and accurate ordinary structured data support discovery; indexing and AI citations are not guaranteed. Reference: https://developers.google.com/search/docs/appearance/ai-features

Search Console readiness does not mean ownership has been verified or the sitemap submitted. Complete the production steps below after deployment with a real verification token (or DNS verification).

## Production environment variables

Set these in the production hosting environment before the final build:

```env
NEXT_PUBLIC_SITE_URL=https://krafttdigital.in
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
INDEXNOW_KEY=97ebfd3d59fe427396c0127639a2663c
```

- `GOOGLE_SITE_VERIFICATION`: use only the value inside the Google Search Console HTML verification meta tag.
- `BING_SITE_VERIFICATION`: use only the Bing `msvalidate.01` content value.
- `INDEXNOW_KEY`: optional 8–128 character hexadecimal key. When present, `/indexnow-key.txt` serves the key; when absent or invalid, that route intentionally returns `404`.

Never invent or reuse a verification token from another property.

## Google Search Console

1. Deploy the production build with `NEXT_PUBLIC_SITE_URL` set to the final canonical origin.
2. In Search Console, add either:
   - a Domain property and verify it with the DNS record Google supplies; or
   - a URL-prefix property for `https://krafttdigital.in/` and choose **HTML tag**.
3. For HTML-tag verification, copy only the token from Google into `GOOGLE_SITE_VERIFICATION`, rebuild, deploy, then confirm the tag appears in the homepage source.
4. Click **Verify** in Search Console.
5. Open **Sitemaps**, enter `sitemap.xml`, and submit it.
6. Use URL Inspection on the homepage and one service/case-study URL to confirm the selected canonical and request initial indexing if needed.

Official references:
- https://support.google.com/webmasters/answer/9008080?hl=en
- https://support.google.com/webmasters/answer/7451001?hl=en

## Bing Webmaster Tools

1. Add the site by importing the verified Google Search Console property, or add it manually.
2. For manual meta-tag verification, copy only the Bing token into `BING_SITE_VERIFICATION`, rebuild and deploy.
3. Confirm the homepage source contains `<meta name="msvalidate.01" ...>` and complete verification in Bing.
4. Open **Sitemaps** and submit `https://krafttdigital.in/sitemap.xml` if it was not imported automatically.
5. Inspect the homepage and representative service/work URLs after Bing fetches the sitemap.

Official references:
- https://www2.bing.com/webmasters/help/add-and-verify-site-12184f8b
- https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed

## Optional IndexNow submission

IndexNow is useful after a deployment containing added, updated or removed public URLs.

1. Generate a unique hexadecimal key and set `INDEXNOW_KEY` in production.
2. Deploy and confirm `https://krafttdigital.in/indexnow-key.txt` returns that exact key.
3. Run `npm run indexnow` with `NEXT_PUBLIC_SITE_URL` and `INDEXNOW_KEY` available in the shell.
4. A response status of `200` means accepted; `202` means the key is awaiting validation.

Official reference: https://www.indexnow.org/documentation

## Local validation

With the development server running at `http://localhost:3000`, run:

```bash
npm run validate:seo
```

The validator fetches the generated sitemap, requests every listed path, checks HTTP `200`, exact production canonicals, unique title/description/social metadata, index/follow directives, and parses rendered JSON-LD. It also confirms that `/thank-you` is excluded from the sitemap and carries `noindex`.
