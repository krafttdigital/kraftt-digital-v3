# Search and enquiry implementation review

Prepared 13 November 2026. Local implementation only; no deployment or external submissions. Read alongside `seo-sudit-kraftt.txt` (10 November audit).

## Baseline and checklist

- [x] Confirm existing repository: `D:\07-Live Sites\kraftt-digital-v3`, main. Preserve existing public-site/admin edits. No AGENTS.md found in the repository or its D: ancestors.
- [x] Read all seven CSVs in the standard search archive and all five in the AI-feature archive, retaining archive context; read standalone Metadata, Chart, Table and both issue CSVs separately.
- [x] Inspect public routes, metadata master and helper, sitemap, robots, hreflang, schema builders, offers/forms, calculator handlers, analytics and geographic templates.
- [x] Replace expired application flow, active listings and stale machine references; retain historical routes, terms and index settings pending owner review.
- [x] Clarify website-tier scope without changing prices; reorder core service navigation to website, e-commerce, branding, SEO, social and marketplace.
- [x] Add owner-confirmed client geography to project context and relevant work on the first four city hubs/service pages. No new market permutations.
- [x] Preserve calculator formula/output; deduplicate repeated completion events for identical answers and link methods to relevant services/work.
- [x] Prepare guide drafts and market inventory outside public routing.
- [ ] Private GSC URL Inspection, live CDN/WAF access and GTM/GA4 event verification require account access.
- [ ] Visual/mobile accessibility and field performance checks remain manual: the owner requested code and HTTP checks only.

## What changed

Offer availability uses the existing expiry comparison plus one active-offer filter. Both campaign forms now render a closed notice with a regular-project contact link after expiry; handlers also refuse an expired submission. This works for a tab left open across the deadline. Active-offer cards/marquee disappear when none are available. Closed campaign WhatsApp copy asks about a current scope, and the sticky enquiry links to Contact. Metadata explicitly labels the archived campaigns closed; llms.txt points to the availability hub. No discount or past deadline was altered. These historical pages remain indexable and in the sitemap for now.

The website service now distinguishes Starter add-ons, Business inclusions and Growth inclusions for Search Console, JSON-LD and AEO/GEO. It explains the work as page structure, useful answers, crawl checks and entity markup, with no promise of AI inclusion. The general workflow no longer implies Search Console is included in every tier. Existing tier prices, taxes, payments, revisions and ownership terms remain as authored.

Homepage introductory copy now explains research, choices, budget and agreed scope. The six core service headlines follow the owner's priorities. Existing services already contain audience, problems, deliverables, exclusions, workflow, prices and FAQs; those sections were retained.

Client geography comes from the owner's brief, not a ranking inference. Relevant project links on Bathinda, Barnala, Delhi and Gurugram pages are filtered by documented service. Kiraq's existing project record includes identity, a custom storefront and social work; Elixir supports identity and website references. A city's client does not prove every service there. Case-study business context now names client location while keeping existing delivered/intended/measured distinctions, screenshot caveats and testimonial qualifications.

The tool guides already explain inputs, assumptions, formulas, worked examples and FAQs. They now link to matching services and work without requiring a completed form. Monthly social links to Kiraq as related brand/storefront work, explicitly without claiming monthly social performance. Repeated calculation with identical answers sends one completion event per mounted tool; changed answers can produce another. One-time branding and recurring SEO remain separate.

The homepage result carousel previously sent raw PNGs through `unoptimized`. Responsive image optimization is now enabled for these images, preserving full-image containment, dimensions, swipe and descriptions. This is an image-delivery change; no Core Web Vitals improvement is claimed without measurement.

## Current observations versus historical input

Repository: 16 Indian hubs, 71 city-service combinations, five international hubs, 20 country-service combinations. Original routes and reciprocal language clusters are retained. Public robots currently allow all crawlers, including OAI-SearchBot under the wildcard; no new GPTBot training policy was introduced. CDN/WAF bot access is unverified. Google AI features have no special schema requirement. llms.txt remains a factual directory.

Live HTTP observations on 13 November: `/portfolio`, four historical project paths, `/blog`, `/services/web-design`, `/services/dashboards-tools`, `/services/shopify-development` and `/services/ai-content` returned 404; the canonical website service returned 200. The sitemap/HTML results from 10 November are historical and should not be represented as a fresh Google crawl.

The local change maps the old portfolio index to Work, four identifiable portfolio project URLs to the same projects, and two unambiguous service aliases to their canonical services. No wildcard portfolio redirect or blanket homepage fallback. Shopify and AI-content legacy scope cannot be recovered from the supplied export alone, so those mappings remain proposals. No public blog route or original article text is present; the two historical article intents below are handled as private drafts to avoid duplicates.

## Proposed route and indexing decisions

| Route/group | Proposed action for review | Reason / missing evidence |
| --- | --- | --- |
| Both closed Diwali campaign detail pages | Retain the reversible closed state; consider eventual noindex and sitemap removal if no archival search value | Owner has not selected archive versus retirement. No redirect to a non-equivalent regular-price package. |
| Existing city and country pages | Retain routes and indexing; improve four first-cohort hubs before deciding consolidation | No bulk noindex based on low clicks or missing crawl date. Inspect intent, links and URL-level data first. |
| `/services/shopify-development` | Consider redirect to `/services/ecommerce-store-development` | Recover original service scope or confirm intended equivalence; current service includes multiple platforms. |
| `/services/ai-content` | Review against AI creative and content-copywriting services | Ambiguous former purpose; do not guess a replacement. |
| `/blog` and historical articles | Keep honest 404 until a useful destination is approved | No current content equivalent. Do not redirect all removed articles to Home. |
| Delhi / New Delhi | Use current Delhi intent; no second near-identical route | Review distinct demand before any split. |
| New markets and industries | Draft privately; publish only with distinct material and service capacity | All requested markets appear in the inventory below; no automatic city × service × industry expansion. |

## Evidence still needed

Elixir's supplied screenshot supports an observed brand-name search result, not “first from day one” or superiority over older competitors. Need exact query, engine, date, device/location and repeated observations before any broader claim. Mittal and Spintex screenshots similarly support the captured query/view only; AI summaries and search order can change. Capture dates should come from original records, not this implementation date.

Keep client-reported Spintex order/revenue qualifications wherever an excerpt appears. Request dated client records and attribution before quantitative outcomes. No independent testimonials, business photos, article publication dates or universal rankings were invented. Permissions beyond existing approved assets remain an owner review item. Project location is owner-confirmed and separate from the geography of an individual search screenshot.

Exact legal/payment/ownership terms, office addresses, local branches, language capability and international support hours must come from confirmed operational records. No new commitments were added.

## Guide draft 1 — What changes the cost of a business website in India?

Private editorial draft, proposed to revive the intent of `/blog/how-much-should-a-website-cost-in-2026`, not a new parallel article. Prices checked against current repository tiers; verify again before publication.

A website's cost depends on what it must explain, what visitors need to do and what the team must maintain. Kraftt's starting development fees are ₹12,000 for a single page, ₹25,000 for five pages and ₹45,000 for eight to ten pages. These are Kraftt prices, not an average for every Indian agency.

**Start with the job of the site.** One focused service can fit on a single page. A practice with separate services, project examples and contact information may need a five-page structure. A broader business may need eight to ten pages and a blog. More pages do not automatically make the site more useful: decide which questions deserve a separate destination.

**Compare scope before comparing price.** Starter includes basic on-page SEO and WhatsApp integration; Search Console, JSON-LD and AEO/GEO are listed extras. Business includes on-page SEO and Search Console; schema and AEO/GEO remain extras. Growth includes agreed launch SEO, relevant schema, AEO/GEO work and Search Console. None purchases a Google ranking or AI citation. Ongoing SEO is a separate monthly scope.

**Budget for the surrounding work.** A usable identity, approved words, product images and timely feedback affect delivery. Provider charges for domain, hosting and subscriptions are separate. Maintenance has its own allowance and price. Ask who owns the accounts and what happens at handover rather than assuming every future update is included.

**A worked Kraftt estimate.** The calculator matches a two-to-five-page informational brief to Business at ₹25,000. Selecting Brand Identity adds ₹12,000: a ₹37,000 one-time starting estimate. Selecting ongoing SEO shows another ₹12,000/month, outside that one-time total. The final proposal still defines pages, features, content, exclusions and approvals. The calculator's six-to-ten-plus input matches Growth; the published Growth scope remains eight to ten pages, so a larger brief needs discussion rather than unlimited pages.

Starter's estimate is 3–4 days, Business 6–8 and Growth 10–12 after required content, access and approvals. New features or delayed feedback can change the agreed schedule. Selecting an earlier start in the calculator does not add a hidden rush charge.

Use `/tools/website-cost-calculator` to compare the starting options, `/services/web-design-development` for the tier checklists and `/work/mittal-architect` for an example of separating projects, expertise and enquiry paths. Ask for the written scope before making a decision.

## Guide draft 2 — Shopify versus a custom e-commerce build

Private editorial draft for the historical `/blog/shopify-vs-custom-website-choosing-the-right-platform` intent. Platform facts reviewed 13 November against Shopify's official pricing-plan and backup guidance. Do not publish a fixed platform fee without checking country, billing period and plan.

Choose the store approach around the catalogue, checkout, integrations and the team running it. Shopify provides a hosted commerce platform with recurring plan costs; a custom build gives more implementation choices while making hosting, maintenance and integration responsibilities part of the project scope. “Custom” design and reusable components can also be used with Shopify, so this is not a simple template-versus-original choice.

| Decision | Shopify route | Custom build route |
| --- | --- | --- |
| Ongoing cost | Platform plan plus any required apps, themes and provider fees | Hosting, maintenance and provider/integration costs according to the chosen stack |
| Catalogue and operations | Confirm the selected plan and apps support the actual workflows | Define and test each needed workflow explicitly |
| Design and integrations | Work within the platform's supported extension and integration options | Agree implementation, security and ongoing ownership responsibilities |
| Handover | Client account, staff permissions, installed apps and export/backup process | Source/access handover, deployment, database, backups and support plan |

Start by listing product count, variants, filters, shipping regions, payment needs and fulfilment workflow. Then identify the parts that must be different from a standard store. A distinctive storefront does not necessarily require a custom checkout or inventory system. Conversely, unusual business rules should be proven in a small working test before committing to the full build.

Kraftt's current store tiers start at ₹22,000, ₹40,000 and ₹70,000, with final catalogue/integration scope agreed in the proposal. Those are build-service prices, not Shopify subscriptions or every cost of operating an online store. The website calculator matches a starting tier; it does not price every commerce feature.

Ownership needs a written answer for both routes: who controls the domain and accounts, which code/assets are delivered, which third-party licences remain, how products and orders are exported, and who maintains the system. Shopify documents exports and theme backups; do not assume a single complete site-export file or that an export transfers every app's behaviour. For custom work, confirm backups are restorable and another developer can operate the delivered system under the agreed licence.

Review `/services/ecommerce-store-development`, use `/tools/website-cost-calculator` for a starting estimate and read `/work/kiraq-jewellery` as an example of brand, product presentation and storefront administration. Do not infer that this project demonstrates Shopify performance or a verified increase in sales.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans ; https://help.shopify.com/en/manual/shopify-admin/duplicate-store

## First-hand article brief — Gate Seeds

Proposed angle: “How a seed catalogue and enquiry route were restructured around the buyer's next question.” Use the existing before-home, product-range and mobile contact assets in `app/data/caseStudyFlow.ts`. Begin with the documented wheat/paddy catalogue and WhatsApp requirement; explain the product-navigation decision, visible catalogue changes and contact route. Link each decision to a supplied screen. Keep dated client reactions separate from traffic or enquiry measurements. The existing evidence supports delivery and feedback, not quantified growth. Confirm screenshot dates and exact project timeline before a dated public article.

## Audience briefs

Architecture: use Mittal's portfolio structure, project detail and contact journey; add the practice's actual approval/process questions. Jewellery/retail: use Kiraq's identity, product presentation and administration, keeping social output distinct from performance. These have repository work to discuss.

Photographers: prepare image selection, performance, project organisation and enquiry requirements. MSMEs/manufacturers: catalogue, capabilities, quality/trust information and quotation routes, supported by Gate/Spintex examples. Startups/clothing: positioning, catalogue, launch content and operations requirements. Hotels/restaurants/cafes: draft menu/room discovery, booking/provider integration and update-responsibility questions. Ayurveda/medical: require owner/client-approved factual service descriptions, privacy requirements and qualified review of regulated claims before public copy. These are desired audiences; no claim of sector experience or regulatory expertise is added.

## Measurement and 30-day follow-up

Days 1–3: review local preview, historical offer treatment, redirects and private draft scope. Confirm the few unresolved legacy equivalents. When the owner approves publishing separately, record the release date and submit the canonical sitemap. Run live URL Inspection for the four city hubs and a relevant service page each. The local code does not access private GSC.

Days 4–7: inspect GA4/GTM configuration with account access. Existing successful-response events, phone/WhatsApp clicks, form starts, attribution and AI-referrer classification are retained. Use GTM Preview to verify tags fire once and personal form values never enter analytics. WhatsApp clicks are clicks, not confirmed leads. Classify qualified enquiries in the CRM using an agreed definition (real business, relevant scope and serviceable budget/timing); do not put personal details into GA4. Clarity has no fallback project ID and needs the owner's existing approved configuration if desired.

Days 8–14: collect the missing dated result context and approve one website-cost guide. Link it from its tool/service only after editorial approval. Check the first geographic cohort's crawl/indexing status; avoid requesting indexing for all template combinations. Evaluate the next markets against distinct reader needs and operational capacity.

Days 15–30: compare equal time windows using chart totals for site performance, URL-level data for priority pages, and query-level data for non-brand discovery. Track (1) qualified leads in CRM; (2) non-brand query clicks/impressions, keeping incomplete query coverage explicit; (3) priority-page indexing; (4) AI-feature impressions; (5) identifiable AI referrals and resulting enquiries separately. A referrer does not prove a specific prompt or citation. Annotate small samples and seasonal effects; code changes alone do not establish causality.

Performance: with a browser permitted later, test Home, website service, website-cost tool, Mittal and Bathinda under the same mobile conditions. Separate Lighthouse lab estimates from GSC/CrUX field LCP, CLS and INP. HTTP response timings are not Core Web Vitals. Check 375/390/430px, keyboard focus, reduced motion, sticky CTA, no horizontal overflow and the responsive screenshot delivery. Preserve important brand content.

Official search guidance: https://developers.google.com/search/docs/appearance/ai-features ; https://developers.openai.com/api/docs/bots . OAI-SearchBot search access is separate from GPTBot training preferences. No new training preference was inferred.

<!-- Generated historical export baseline, market inventory and validation follow below. -->

## Export baseline (historical, not a live result)

**Standard search ZIP:** Chart.csv: 92 rows; Devices.csv: 3 rows; Pages.csv: 142 rows; Queries.csv: 94 rows; Countries.csv: 49 rows; Search appearance.csv: 1 rows; Filters.csv: 2 rows.
**AI-features ZIP:** Countries.csv: 9 rows; Chart.csv: 92 rows; Filters.csv: 2 rows; Devices.csv: 3 rows; Pages.csv: 38 rows.

Standard search chart (9 August–8 November): 31 clicks / 1234 impressions, 2.51% CTR. Query rows: 21 clicks / 566 impressions; page rows: 32 clicks / 1,767 impressions. Dimensional totals are not substituted for chart totals, and no reconciliation is invented. “kraftt” accounts for 18 visible query clicks; query rows do not explain every click.
AI chart: 117 impressions; page rows: 164 impressions. No clicks, prompts/queries or conversions supplied. AI impressions are a separate measure from identifiable AI referral sessions.
Standalone files: Metadata identifies All known pages; Chart has 87 daily rows, ending 6 November at 146 indexed / 55 not indexed. Table has 27 affected URLs, including 22 location URLs, all with 01-01-1970 crawl values treated as missing data. Critical issues has seven reason rows: 404 (12), canonical alternates (7), noindex (3), redirects (3), redirect error (1), crawled-not-indexed (2), discovered-not-indexed (27). Non-critical issues has no data rows. This standalone Chart is a whole-index summary, not a time series proving 81 URLs became indexed. No private URL Inspection was available.
Website-cost calculator URL row: {"Top pages":"https://krafttdigital.in/tools/website-cost-calculator","Clicks":"0","Impressions":"251","CTR":"0%","Position":"55.17"}.

## Phased market inventory
Existing hub and child routes are preserved. Signals below are historical hub URL rows only (not city-wide attribution); no supplied row means unknown, not zero demand. Every market needs operational capacity, original buyer information and relevant evidence before expansion.

| Indian market | Existing hub | Hub clicks / impressions | In affected Table | Evidence / unique material | Action and missing inputs |
| --- | --- | --- | --- | --- | --- |
| Bathinda | /location/bathinda | 2 / 30 | No hub row | Bharat Bhushan Singla; Kiraq; Spintex; Gate Seeds | Cohort 1: strengthened relevant work; collect dated results |
| Barnala | /location/barnala | Not supplied | Yes | Mittal Architect | Cohort 1: strengthened relevant work; collect dated results |
| Ludhiana | /location/ludhiana | Not supplied | Yes | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Patiala | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Jalandhar | /location/jalandhar | 0 / 3 | No hub row | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Amritsar | /location/amritsar | Not supplied | Yes | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Delhi | /location/delhi | Not supplied | Yes | Aegis Squad (early founder project) | Cohort 1: strengthened relevant work; collect dated results |
| New Delhi | Shared Delhi intent; no new route | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Gurugram | /location/gurugram | 0 / 3 | No hub row | Elixir Beverages | Cohort 1: strengthened relevant work; collect dated results |
| Faridabad | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Jaipur | /location/jaipur | Not supplied | Yes | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Noida | /location/noida | 0 / 2 | No hub row | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Jodhpur | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Ahmedabad | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Bengaluru | /location/bengaluru | Not supplied | Yes | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Pune | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Mumbai | /location/mumbai | 0 / 2 | No hub row | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Chennai | /location/chennai | 0 / 1 | No hub row | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Visakhapatnam | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Kolkata | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Indore | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Bhopal | Not routed | Not supplied | No hub row | No distinct source content supplied | Private roadmap; confirm demand, capacity and original material |
| Mohali | /location/mohali | 0 / 15 | No hub row | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Chandigarh | /location/chandigarh | 0 / 5 | No hub row | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Hyderabad | /location/hyderabad | Not supplied | No hub row | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |
| Mansa | /location/mansa | 0 / 1 | No hub row | Existing local context; no owner-confirmed client for this market | Cohort 2: retain; review distinct need and service demand |

Bengaluru retains its existing slug; Bangalore is a display/search synonym. Noida is listed once. Visakhapatnam uses the normalized spelling without inventing an indexed route. Existing Mohali, Chandigarh, Hyderabad and Mansa are retained even though absent from the new expansion list.

| International market | Existing hub | Historical country clicks / impressions | Action / missing material |
| --- | --- | --- | --- |
| United States | /region/usa | 1 / 119 | Retain existing English market page; evaluate demand and distinct scope; verify delivery/language capacity, pricing and buyer information before new content. |
| Canada | /region/canada | 0 / 8 | Retain existing English market page; evaluate demand and distinct scope; verify delivery/language capacity, pricing and buyer information before new content. |
| United Arab Emirates | /region/uae | 0 / 1 | Retain existing English market page; evaluate demand and distinct scope; verify delivery/language capacity, pricing and buyer information before new content. |
| France | Not routed | 0 / 10 | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| Germany | Not routed | 0 / 3 | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| Nigeria | Not routed | 0 / 1 | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| South Africa | Not routed | 0 / 2 | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| Japan | Not routed | Not supplied | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| China | Not routed | Not supplied | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| Russia | Not routed | 0 / 2 | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| Australia | /region/australia | 0 / 6 | Retain existing English market page; evaluate demand and distinct scope; verify delivery/language capacity, pricing and buyer information before new content. |
| New Zealand | Not routed | 0 / 1 | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| Indonesia | Not routed | 0 / 8 | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| Mexico | Not routed | 0 / 2 | Private roadmap only; verify delivery/language capacity, pricing and buyer information before new content. |
| United Kingdom | /region/uk | 0 / 3 | Retain existing English market page; evaluate demand and distinct scope; verify delivery/language capacity, pricing and buyer information before new content. |
| Belgium | Not routed | 0 / 1 | Interpretation of “Belgia” pending owner confirmation; verify delivery/language capacity, pricing and buyer information before new content. |

Country-level impressions do not establish a need for every service page or a local office. No translations or international support commitments were created.


## Files and verification record

- Offer state, forms and archive UI: app/data/offers.ts; app/offers/OfferAvailability.tsx; app/offers/ClosedOffer.tsx (new); app/offers/OfferEnquiryForm.tsx; app/offers/page.tsx; both campaign page.tsx files; DiwaliGrowthEnquiryForm.tsx; CampaignTracker.tsx.
- Copy and search references: app/components/HomeShowcase.tsx; app/data/services.ts; app/data/metadata-master.json; app/sitemap.ts; app/llms.txt/route.ts; next.config.ts.
- Local evidence: app/data/geo/clientEvidence.ts (new); app/location/_components/LocalWorkEvidence.tsx (new), LocationLandingPage.tsx and LocationServicePage.tsx; app/work/[slug]/CaseStudyNarrative.tsx.
- Tools/media: app/tools/components/ToolEditorial.tsx, WebsiteCostCalculator.tsx, SocialMediaCostCalculator.tsx; app/components/HomeResultsCarousel.tsx.
- Checks: scripts/test-seo-refresh.mjs and scripts/validate-seo-refresh.mjs (new); scripts/test-analytics.mjs; scripts/validate-geo.mjs. Existing test mocks were updated for current form imports and DOM dataset. Obsolete markup-equality and homepage-composition assertions were replaced with content/indexability checks: geographic pages intentionally have distinct content. Canonical checks now use the actual trailing-slash convention. Technical hreflang, FAQ, areaServed and 404 checks remain.

Passed: 160/160 local sitemap URLs via validate:seo; 21 geographic hubs via validate:geo; 160 pages and 158 unique internal page links via validate-seo-refresh; seven direct legacy redirect mappings with 200 destinations; expired forms absent from server HTML; paused/before/at/after expiry tests; website/store/social formula and duplicate-event tests; mocked enquiry success/failure and privacy/attribution tests. No external test submissions.

Lint: zero errors, ten warnings in existing/generated files. Vinext production build passes, with a pre-existing emitted CSS filename-collision warning that needs visual review. The first concurrent Next/Vinext attempt mixed generated route types; running next typegen resolves that. A later sandboxed Next build compiled and type-checked but was blocked creating a generated About segment directory (EPERM); final retry status is recorded below.

Image delivery: source Elixir brand-search PNG is 108,307 bytes. The local Vinext image endpoint returns that PNG unchanged; enabling the responsive optimizer does not by itself demonstrate a byte reduction in this preview. Verify resizing/WebP behaviour on the actual Next deployment before claiming savings. No browser/lab/CWV numbers were generated.

Local production preview: http://localhost:3013/ . No deployment, push, external publication or bulk route/index changes were performed.

Final build status: npm run build:netlify passed after the filesystem-permitted retry, generating 168 pages. npx tsc --noEmit passed. npm run build (Vinext) passed. The production preview's final HTTP refresh check passed. No remaining build blocker.

