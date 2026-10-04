# Kraftt Digital — Growth & Visibility Dashboard

Create this report manually in Looker Studio after GA4 events and custom dimensions have been verified. It is a specification, not an already connected dashboard.

## Sources and metric definitions

Connect the Kraftt GA4 property, Google Search Console Site Impression and URL Impression sources. Use authorized Bing/Clarity exports or separate dashboards where appropriate. Do not invent missing data. Set consistent time zones/date ranges; GA4 visits and Search Console clicks use different definitions and will not equal each other.

**Verified enquiry**: `contact_form_submit`, excluding `form_id=partner_application`. **Lead intent**: contact_form_submit, whatsapp_click, book_call_click, phone_click, audit_complete, excluding partner applications. These events are not unique leads or revenue. Audit acceptance already has a form submit, and some booking CTAs open WhatsApp.

**Lead Conversion Rate**: sessions with at least one lead-intent event / sessions, expressed as a percentage. Do not calculate SUM(Key Events) / Sessions and call it unique-lead conversion. Use GA4 session key event rate restricted to the specified events if supported by the report; otherwise use a session-level export (e.g. BigQuery with user_pseudo_id + ga_session_id) to deduplicate. Event counts remain valid for action volume. Enable exports prospectively if this precision is required; repository code cannot create them.

Use native **Session source/medium/campaign**, Session default/custom channel group and Landing page for acquisition tables. Use `first_*`/`current_*` fields in clearly labeled supplemental event-attribution tables. Those are event-scoped; they must not silently replace native session acquisition. Refresh the GA4 connector fields after registering custom definitions. Check dimension/metric compatibility before saving a chart; use separate charts or properly aggregated exports instead of a many-to-many blend.

## Page 1 — Executive Overview

Scorecards: Users (label active vs total consistently), Sessions, Engaged Sessions, Key Events, Lead Conversion Rate, Organic Leads, AI Referral Leads, Social Leads. Show both verified form enquiries and lead-intent sessions so contact clicks are not mistaken for completed enquiries.

Table: Source / Medium, Sessions, Engagement Rate, Key Events, Lead Conversion Rate. Organic Leads are lead-intent sessions in Organic Search; AI Referral Leads use AI Assistants; Social Leads use Organic Social/Paid Social. Filter key-event counts to the agreed set and exclude partner applications. Use native session channel dimensions for these segment totals.

## Page 2 — SEO

Source: Search Console. Table columns: Query, Landing Page, Clicks, Impressions, CTR, Average Position. Use the **URL Impression** connection for landing-page breakdowns and supported query/page combinations. Use Site Impression for site-level query totals; its impressions and URL impressions have different aggregation, so never sum or freely blend them.

If the connector does not support the requested query/page combination, display separate query and landing-page tables, or use a Search Console API/export with those dimensions. Do not join all queries to all pages. Filters: Date, Country, Device, Page, Branded / Non-Branded. A branded regex can start with `(?i)kraftt|kraftt digital|krafttdigital`; validate observed spellings before treating the split as complete. Compute CTR from clicks/impressions, rather than averaging row percentages. Average position requires the source's proper weighting, not an unweighted average.

Google query data is aggregated and privacy-filtered. Do not attribute a query to an individual GA4 visitor. AI Overview/AI Mode visibility belongs in Search Console where available; a separate AI-only breakdown may not be exposed. [Google describes how these systems contribute to search metrics](https://support.google.com/webmasters/answer/7042828).

## Page 3 — AI Traffic

Rows: ChatGPT, Perplexity, Gemini, Copilot, Claude, Other AI (only when a verified source is actually observed). Columns: AI Source, Sessions, Users, Engaged Sessions, WhatsApp Clicks, Contact Form Submits, Key Events, Conversion Rate.

For session metrics, use Session source plus the Kraftt AI Assistants channel. Normalize domain variants using a calculated field. For AI actions, use separate event-filtered charts with `ai_referrer` or the relevant native session source. Do not claim event-scoped `ai_referrer` guarantees compatible session aggregation in every connector. If session-level joins are needed, use a deduplicated export.

Show a separate supplemental card/table for detected Bing `/chat` or `/copilot` referrals categorized as Copilot by the website. A domain-only channel rule cannot distinguish these from ordinary Bing searches. Referrer-stripped visits cannot be recovered from Direct. Google AI Overview/AI Mode belongs primarily in Search Console, and Bing/Copilot visibility in Bing Webmaster Tools where available. No AI prompt is known.

## Page 4 — Services

Rows: Web Design, Brand Identity, E-commerce, Marketplace, SEO, Social Media, Landing Pages, App Development, Custom Software. Columns: Sessions, Organic Sessions, AI Sessions, Social Sessions, WhatsApp Clicks, Form Submissions, Conversion Rate.

For a coherent acquisition comparison, derive **Entry Service** from native session Landing page using the documented service-slug mapping, including matching location/region service routes. Report the session's lead actions against that entry service. Landing pages without a service go in Other/No service, rather than being arbitrarily assigned. This answers which service entrance converted.

Separately report event-scoped **Service** to answer which service CTA or enquiry selection generated actions. A visit to multiple services must not multiply total site sessions. Do not blend service event rows onto acquisition totals without session-level aggregation. Include Content/Copywriting and AI Creative in an optional additional section rather than dropping their observed traffic.

## Page 5 — Campaigns

Columns: Source, Medium, Campaign, Content, Landing Page, Sessions, Key Events, Conversion Rate. Use native Session source/medium/campaign and compatible session manual ad content where available. Review connector compatibility for manual content; otherwise show event-level current_content separately. Filter out Direct/Unassigned for campaign drilldowns without removing them from overall totals.

Add a supplemental first-touch vs current-attributed enquiry table using custom parameters; label it event attribution. Never join a content-level table to campaign totals unless both are aggregated at the same granularity. Apply the naming guide to future links; avoid rewriting historical inconsistent names as if they were collected differently.

## Page 6 — Landing Pages

Columns: Landing Page, Sessions, Source / Medium, Engagement Rate, WhatsApp Clicks, Form Submissions, Conversion Rate. Native landing-page dimensions serve session metrics. Prefer path-only presentation (drop query strings in the display) while retaining source/campaign dimensions. Include home and location/region entrances. Provide separate native session and custom `first_landing_page`/`current_landing_page` views; first touch can predate the report's date range.

## Page 7 — Geography / Device

Dimensions: Country, City where available, Device Category. Metrics: Users, Sessions, Key Events, Conversion Rate. Use native GA4 dimensions; do not infer precise location from IP or store addresses. City can be missing, aggregated or thresholded. Label unknown values honestly. Add device/country filters across GA4 pages; Search Console filters apply only to the GSC charts.

## Acceptance checks

Check one selected time range against GA4 and Search Console independently. Verify filters, native vs supplemental scopes, lead definitions, channel order and weighted rates. Confirm totals remain stable when a finer dimension is added and explain expected differences from thresholding, anonymous queries, time zones or attribution. Verify charts work with zero sessions and missing values. Restrict sharing to intended viewers; do not expose raw session exports or customer information.

Official connector guidance: [Search Console connection](https://cloud.google.com/looker/docs/studio/connect-to-search-console) and [using Search Console with Analytics](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).
