# Blog implementation notes

Prepared 18 November 2026.

## Content audit

The current source tree has no earlier public blog routes. Searching all available Git history for blog, insight and post paths found only project asset filenames.

The private drafts in `docs/seo-implementation-review.md` describe two historical URL intents.

- `/blog/how-much-should-a-website-cost-in-2026` focuses on costs, package scope and recurring charges.
- `/blog/shopify-vs-custom-website-choosing-the-right-platform` focuses on choosing a commerce platform.

The first new guide addresses the broader process of planning and building a small-business website. Its budget and ownership material can reuse the verified facts in those drafts. The startup identity guide has no equivalent draft in the repository. The historical article bodies are unavailable, so their full equivalence and original publication dates cannot be established.

## Verified business references

- `app/data/services.ts` records website development starting at ₹12,000 for one page, ₹25,000 for five pages and ₹45,000 for eight to ten pages. These are Kraftt prices. Domain, hosting and subscriptions are separate.
- The same record defines Starter Search Console, schema and GEO/AEO as add-ons. Business includes Search Console, with schema and GEO/AEO optional. Growth includes the listed launch work. Ongoing SEO and analytics follow the selected separate scope.
- `app/data/caseStudies.ts` documents Mittal Architect's project-led portfolio, service explanations and consultation paths. It documents Gate Seeds' catalogue, product pages and mobile WhatsApp enquiry route.
- Kiraq's records document an identity system, guidelines, colour system and storefront. Any explanation of a specific design decision must be supported by the project record.
- The organisation byline is Kraftt Digital, linked to About.

## Integration

- Insights links to `/blog` in the desktop footer and mobile footer group.
- `app/blog/posts.ts` registers articles and filters by explicit published status. Dates do not schedule visibility.
- Sitemap and `llms.txt` use the same published article list.
- The article registry calculates reading time from visible headings, text, lists, tables, diagram text, captions, FAQs and CTAs at 200 words per minute. URLs, image alt text and metadata descriptions are excluded.
- Existing analytics classifies the index as `blog` and article routes as `article`. The existing page path identifies each article. The implementation uses the existing page-view and CTA events.

## Evidence limits for editorial review

- Supplied search screenshots establish the displayed query/view. They do not substantiate sustained rankings, conversion growth or causal business outcomes.
- Gate Seeds and Mittal have documented delivered website work. Dated performance evidence needed for quantitative growth claims is absent.
- The historical article bodies and original publication dates remain unavailable.
- Fictional visual examples must be labelled and kept distinct from supplied client assets. Client logos should retain their original form.

## Research sources

Current search results were reviewed for website-planning, small-business website scope and startup-identity buyer intent. No search-volume or keyword-difficulty figures are published. Original guidance uses the current service and project records above and these primary references, linked naturally within the articles:

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google crawling and indexing FAQ: https://developers.google.com/search/help/crawling-index-faq
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Google AI features guidance: https://developers.google.com/search/docs/appearance/ai-features
- W3C design guidance: https://www.w3.org/WAI/tips/designing/
- W3C form labels: https://www.w3.org/WAI/tutorials/forms/labels/
- Wix hosting and export limits: https://support.wix.com/en/article/exporting-or-embedding-your-wix-site-elsewhere
- W3C contrast requirements: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- Adobe Fonts licensing: https://helpx.adobe.com/fonts/web/font-licensing/font-licensing.html
- Mailchimp voice and tone: https://styleguide.mailchimp.com/voice-and-tone/

## Original assets

Both hero illustrations were created with the built-in ImageGen tool. They depict fictional brands, explicitly labelled in captions. Existing client logos and screenshots were not altered. Exact planning and identity diagrams are rendered as accessible HTML, with Lucide icons from the existing dependency.

- `public/assets/blog/small-business-website-design.webp`: 1440 × 960, 158,510 bytes.
- `public/assets/blog/brand-identity-for-startups.webp`: 1440 × 960, 171,006 bytes.

Generation prompt specifications:

1. Website: a premium photoreal studio tabletop composition of a laptop and phone showing a responsive website for the fictional interiors brand FORME. Warm parchment and linen surfaces, forest green and umber accents. The interface shows “Spaces for everyday life”, a project gallery, “Projects” navigation and a clear “Enquire” button. Natural lighting and restrained editorial art direction. No actual client logos, performance claims, charts or testimonials.
2. Branding: an editorial overhead composition of a consistent identity for the fictional home-goods brand NIVA. A simple N symbol appears on a forest-green carton, tag, stationery and phone. Include an Aa type specimen, warm colour swatches and the words “NIVA” and “Made for everyday”. Parchment, linen, umber and forest-green palette, natural shadows and refined material texture. No real-client branding or claims of delivered work.

## Editorial decisions

Kraftt Digital is the organisation author, linked to the existing About page. The article records use 18 November 2026, the date these editions were prepared. If the first public release happens later, set `publishedAt` and `updatedAt` to the actual release/edit dates before deployment. Visibility depends on `status`, never on a date or scheduled task.

No business decision blocks local review. Individual-author attribution or quantitative case-study claims would require verified author information or dated evidence. The articles omit those unsupported claims.

## Files and verification

- `app/blog/` contains the index and article routes, two complete articles, article registry and types, shared layout and content components, diagrams and styles.
- `app/components/Footer.tsx`, `app/data/seo.ts`, `app/sitemap.ts` and `app/llms.txt/route.ts` integrate the directory with site discovery and search metadata.
- `lib/analytics/core.ts` identifies articles in the existing analytics flow.
- `scripts/test-blog.mjs` and `package.json` add the blog verification command. Run `npm run test:blog` for content checks. Set `BLOG_VALIDATE_BASE_URL` to a running local preview to include rendered HTML, metadata, sitemap, links and image checks.

The hosting build uses `npm run build:netlify`. To restart the preview after a successful build, run `npx next start -H 127.0.0.1 -p 3023` and open `/blog` on that port.

The production build, TypeScript check, blog tests and analytics regression tests passed. Lint completed with existing warnings. The site SEO validator passed for 169 sitemap URLs. Browser checks covered the index and both articles at 375, 390, 430, 768 and 1440 px. Images loaded, the pages fit their viewports, and the skip link, mobile contents, FAQ and scrollable tables worked by keyboard. Local CTA destinations were verified without submitting an enquiry.
