# Kraftt Digital analytics setup

## What is implemented

Website → `dataLayer` → GTM `GTM-NTF8M2Q9` → GA4 `G-CHE056H2KV` and Google Ads `AW-18424492469`.

The repository implements the website side. Google, Bing, Clarity and Looker Studio account settings have **not** been configured or published by this implementation. Complete the checklist below before deploying the migration, so removing the previous direct Google tag does not leave a collection gap.

Audit: the root layout previously loaded one direct `gtag.js` with GA4 and Ads configuration. It had no business events, attribution utility, GTM, Clarity, Meta Pixel, LinkedIn Insight Tag, CMP or Consent Mode. Form checkboxes authorize contact; they are not tracking consent. The direct tag has been replaced with GTM to prevent duplicate tracking. Existing SEO metadata is preserved.

`next/script` loads the standard GTM bootstrap in the root head using `beforeInteractive`. The hidden fallback iframe is the first authored body child; Next.js may serialize its own hidden framework boundary before it. One invisible client component handles Next.js navigation and delegated interactions. Form success and tool completion are tracked in their actual successful handlers. No visible copy, markup, styling or navigation changes were made.

## Environment variables

Set public variables in Netlify → Site configuration → Environment variables, then rebuild. They are compiled into client bundles; changing a deployment variable without rebuilding is insufficient.

| Variable | Default when absent | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_GTM_ID` | `GTM-NTF8M2Q9` | Container loaded globally |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-CHE056H2KV` | Exposed as `kraftt_ga_id` for the GTM Google tag |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | `AW-18424492469` | Exposed as `kraftt_ads_id` for the GTM Ads destination |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Empty | Optional Clarity project; inactive until supplied |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | False | Sanitized console events in development only |

Identifiers are public, not secrets. Explicit empty or invalid IDs disable that integration. An empty GTM ID disables delegated tracking and attribution initialization; helpers remain harmless without a `dataLayer`. Do not add a separate GA4 script or a second GTM container. Clarity has a separate optional loader; if using it, do not also install Clarity through GTM.

## GTM: create the tags and triggers

Sign in at [Google Tag Manager](https://tagmanager.google.com/), choose the Kraftt account, and open container **GTM-NTF8M2Q9**. Audit existing tags first; edit matching tags rather than adding duplicates. Do not combine Google tags or overwrite existing destinations merely to clear an installation warning.

1. Under Variables → New, create Data Layer Variables, Version 2, with the exact names below. Give each a readable title such as `DLV - service`.
2. Create `DLV - kraftt_ga_id` and `DLV - kraftt_ads_id`. The bootstrap makes these available before GTM loads. They must resolve to the IDs above in Preview.
3. Create a **Google tag** whose Tag ID is `{{DLV - kraftt_ga_id}}`. Trigger on **Initialization – All Pages**, restricted to the ID matching `^G-[A-Z0-9]+$`. Add configuration parameter `send_page_view` with boolean **false**. A blank ID must not fire a tag. If initialization settings already contain a Google tag, update it instead of creating another.
4. Create a **Custom Event** trigger with event name `kraftt_page_view` (exact match). Create one **GA4 Event** tag with Measurement ID `{{DLV - kraftt_ga_id}}`, Event Name **page_view**, and the parameter variables below. This is the only pageview tag.
5. Create a second Custom Event trigger, enable regex matching, and enter:

   ```regex
   ^(whatsapp_click|phone_click|email_click|contact_form_start|contact_form_submit|book_call_click|pricing_engagement|package_cta_click|audit_start|audit_complete|tool_start|tool_complete|case_study_cta_click|outbound_click|service_cta_click)$
   ```

6. Create one **GA4 Event** tag with Measurement ID `{{DLV - kraftt_ga_id}}`, Event Name `{{Event}}` (the built-in Event variable), and that business-event trigger. Require a nonempty valid GA ID. Use the same event parameters below. Do not add GTM click, form submission, History Change or extra All Pages pageview tags for these interactions.
7. For Google Ads, retain/attach destination **AW-18424492469** through a Google tag configured with `{{DLV - kraftt_ads_id}}`, Initialization – All Pages, restricted to a valid `^AW-\d+$` ID. If an existing shared Google tag already sends to this destination, keep that one and do not add another. Add a **Conversion Linker**, All Pages, if the container does not already have one. No Ads conversion label was supplied, so code does not invent an Ads conversion tag.
8. Open Preview, run the checks below, then **Submit → Publish** with a description of this migration. Deploy the repository after the container is ready. Preview changes alone do not apply to visitors.

### Required GA4 settings to avoid duplicates and unsafe link collection

In GA4 → Admin → Data streams → the Kraftt web stream → Enhanced measurement:

- Open Page views advanced settings and disable pageviews based on browser history changes. The website emits one `kraftt_page_view` initially and once for each changed route; Next.js Strict Mode does not duplicate it. Query-only changes do not count as a new page.
- Disable Form interactions. Automatic `form_submit` cannot confirm the Formspree API accepted a request.
- Disable Outbound clicks; its automatic `click` event can include a WhatsApp URL containing a prepared personal message. The custom events send only destination categories.
- Do not turn on unrelated automatic events until their payloads have been reviewed for personal data.
- Under Google tag settings, enable email redaction and configure query-parameter redaction for personal fields used in links, such as `email`, `phone`, `name`, `message`, `address`, `text`, `context`, `requirements`, `website_or_instagram`, `electronic_signature`. Review tags that automatically collect a page URL or referrer. Never forward raw Click URL, Click Text, Form Data or invoice contents.

The custom event `page_location` retains only the allowlisted route, validated UTMs and recognized anonymous click IDs, so native campaign/Ads attribution can still work. The supplemental `first_*` and `current_*` fields do not override GA4 source/medium or Google click IDs. Do not map them to Google's native `campaign_*` settings. External referrers contain the origin/domain only, with no conversation path or query.

Google documents the separate controls for [manual pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views) and [Enhanced measurement](https://support.google.com/analytics/answer/9216061).

### Event parameters and Data Layer Variables

Create a Version 2 Data Layer Variable for each parameter you want to forward. In each GA4 event tag's Event Parameters table, put the exact parameter name on the left and its `DLV` variable on the right. The helper clears stale values before each event; do not substitute previous nonempty values or send `null` as a literal string.

Recommended shared list (24 parameters):

```text
page_location, page_referrer, page_path, page_type, service,
cta_location, cta_label, package_name, case_study, tool_name,
destination_type, form_id, ai_referrer,
first_source, first_medium, first_campaign, first_landing_page,
current_source, current_medium, current_campaign, current_content,
current_term, current_referrer, current_landing_page
```

Additional stored/pushed context: `first_content`, `first_term`, `first_referrer`, `first_touch_timestamp`. Add these only if needed, replacing less useful parameters to stay within the event parameter limit. The helper caps payloads at 25 parameters, prioritizing event context, then current attribution, then first attribution; rare densely populated events can omit a trailing first-touch field. Full first-touch records remain available in local storage. Do not register timestamps or click IDs as high-cardinality custom dimensions.

## Event definitions

| Event | Trigger / meaning |
| --- | --- |
| `kraftt_page_view` | Internal website signal; GTM maps it to GA4 `page_view` |
| `whatsapp_click` | One event per existing WhatsApp link click, or after a validated form opens WhatsApp; not a sent message |
| `phone_click`, `email_click` | Existing tel/mailto links; not a completed call or delivered email |
| `book_call_click` | Existing booking/free-call CTA; not a booked appointment |
| `contact_form_start` | First nonempty field/selection or checked option in each mounted enquiry form |
| `contact_form_submit` | Confirmed successful Formspree response only; includes `form_id` |
| `audit_start` | First meaningful audit-form input |
| `audit_complete` | Audit request accepted by Formspree; not completion of the paid audit or payment |
| `pricing_engagement` | Interaction with a pricing area or navigation to existing packages |
| `package_cta_click` | Package discussion/enquiry CTA or existing bundle card; static package heading/route becomes `package_name` |
| `service_cta_click` | Enquiry/pricing CTA on a service page, or navigation to a service |
| `case_study_cta_click` | Enquiry CTA from a case study |
| `tool_start` | First field/option/button interaction in the existing tool workspace |
| `tool_complete` | Valid calculation result shown, or invoice PDF successfully generated |
| `outbound_click` | Other external web links; no URL, email, phone or link text forwarded |

Forms: `contact_enquiry`, `audit_request`, `offer_enquiry`, `partner_application`. Contact/audit service selections are mapped against published options, never free text. Filter out partner applications in sales lead reports. A successful audit request produces both `contact_form_submit` and `audit_complete`; do not sum them as two enquiries. A booking CTA pointing to WhatsApp can produce both intent events; report sessions with any lead intent rather than adding event counts as unique people. Tools intentionally count each valid calculation/download; starts count once per mounted workspace. Package, case-study and service events add business context to a click; they are not extra leads.

Seven tools covered: Digital Presence Score, Website Cost Calculator, Social Media Cost Calculator, SEO ROI Calculator, ROAS Calculator, GST Calculator and GST Invoice Generator. No entered answers, financial amounts, customer/seller names, addresses, invoice data or personal messages enter analytics.

### Service mapping

| Route slug | `service` |
| --- | --- |
| web-design-development | web_design |
| brand-identity | brand_identity |
| ecommerce-store-development | ecommerce |
| marketplace-catalogue-building | marketplace |
| ecommerce-seo | seo |
| social-media-management | social_media |
| landing-pages | landing_pages |
| app-development | app_development |
| dashboards-internal-tools | custom_software |
| content-copywriting | content_copywriting |
| ai-powered-creative | ai_creative |

The visible SEO offering is broad SEO, hence `seo`. This mapping also handles `/location/{city}/{service}` and `/region/{country}/{service}`. Only sitemap routes plus existing offers/thank-you routes enter tracking; unknown paths become `/unknown`. New public routes should be added to the sitemap so their tracking path is recognized.

## Attribution and privacy

Local storage `kraftt_analytics_first_v1`: earliest visit, including direct/unknown, retained for 90 days. The first-touch record is not refreshed by internal navigation. Session storage `kraftt_analytics_current_v1`: acquisition context retained across routes in that tab; expires after 30 minutes of inactivity, checked on the next route/entry or interaction. Click/input/change activity refreshes it at most once per second. A new external acquisition or changed campaign updates current attribution; a refresh with identical acquisition context preserves it. This supplemental record is not a replacement for GA4's session definition. A current direct visit does not rewrite native Google attribution.

Captured fields: source, medium, campaign, content, term, referrer domain, allowlisted landing path and timestamp. Recognized click IDs: `gclid`, `gbraid`, `wbraid`, `msclkid`, `fbclid`. Storage records only which click-ID types were present; the original IDs remain in the browser URL and sanitized native `page_location`, not custom dimensions. Invalid/PII-like UTM values are discarded. Browser storage denial/malformed records are handled without affecting the page; in-memory attribution remains available during the current load. Storage is not synchronized across devices, browsers or incognito profiles. Clearing storage resets first touch.

No names, email addresses, telephone numbers, free-text messages, signatures or addresses are read into event payloads. Keep campaign names anonymous: format checks cannot determine whether an innocuous-looking token is a person's name. Production does not log analytics events.

**Consent/CMP review required for jurisdictions where tracking consent is required.** No CMP or Consent Mode currently exists; no banner was introduced. Before a consent-required launch, use a CMP to establish defaults before GTM, gate GA4/Ads/Clarity and first-party attribution storage, and pass consent updates. Form contact checkboxes are not a substitute. Optional Clarity is currently disabled.

## GA4 Key Events and custom definitions

After publishing GTM and generating test events, choose GA4 → Admin → Data display → Events/Key events. Mark these names as Key Events, or create them by exact name if the UI permits: `contact_form_submit`, `whatsapp_click`, `book_call_click`, `phone_click`, `audit_complete`. Optional secondary key events: `tool_complete`, `email_click`. Prefer session key event rate for lead-intent reporting. Separate verified form enquiries from contact clicks; none establishes a sale.

Under Admin → Data display → Custom definitions → Create custom dimension, use **Event** scope. Create only fields needed by reports; names must match exactly.

| Dimension name | Event parameter |
| --- | --- |
| Service | service |
| Page Type | page_type |
| Page Path | page_path |
| CTA Location | cta_location |
| CTA Label | cta_label |
| Package Name | package_name |
| Case Study | case_study |
| Tool Name | tool_name |
| Destination Type | destination_type |
| Form ID | form_id |
| AI Referrer | ai_referrer |
| First Source / Medium / Campaign / Landing Page | first_source / first_medium / first_campaign / first_landing_page (four definitions) |
| Current Source / Medium / Campaign / Content / Term / Referrer / Landing Page | current_source / current_medium / current_campaign / current_content / current_term / current_referrer / current_landing_page (seven definitions) |

Use built-in Page location and Page referrer rather than custom duplicates. Additional optional first-content/term/referrer definitions consume quota. Standard GA4 permits [50 event-scoped custom dimensions](https://support.google.com/analytics/answer/14240153). Allow approximately 24–48 hours for new definitions to appear in reports; registering definitions does not backfill earlier reporting.

## AI Assistants channel

GA4 → Admin → Data display → Channel groups → Create new channel group (or edit an existing Kraftt custom group). Name the group **Kraftt channels** and add a channel **AI Assistants** before generic Referral. For **Source matches regex**, use:

```regex
^(?:([a-z0-9-]+\.)*(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai)|gemini\.google\.com|copilot\.microsoft\.com|chatgpt|perplexity|gemini|copilot|claude)$
```

Use this custom group in Traffic acquisition and Looker Studio. Retain the standard group's other channels. Review whether the account already has an AI channel before adding an overlapping rule. [Google's custom-channel instructions](https://support.google.com/analytics/answer/13051316) explain channel ordering.

Do not classify every `bing.com` visit as Copilot: ordinary Bing searches are search traffic. Code recognizes `/chat` and `/copilot` paths when the browser supplies them, using only the category and hostname. The custom `ai_referrer` can capture this case even if a domain-only GA4 channel cannot. Do not include all `google.com` in the AI channel. Google AI Overview/AI Mode clicks are search traffic; use Search Console's available aggregated reporting. Referrer-stripped AI visits remain direct/unknown. No individual organic query or private AI prompt is identified.

## Optional Microsoft Clarity

Create a Clarity project and copy its project ID to `NEXT_PUBLIC_CLARITY_PROJECT_ID`, then rebuild. The root loader runs once after hydration. Review [Clarity masking](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking), select **Strict** masking before enabling collection, and verify forms and the live invoice preview do not reveal personal information in recordings. No custom user IDs or personal tags are sent. Configure consent requirements before enabling it. Do not also install its GTM tag.

## Search Console, Bing and Looker Studio

1. In Google Search Console, verify the domain property `krafttdigital.in` using DNS, or retain the existing verified property. Submit `https://krafttdigital.in/sitemap.xml` and inspect representative indexed pages. Do not replace the existing metadata project.
2. In GA4 → Admin → Product links → Search Console links, link the verified property and this web stream with an appropriately authorized account. Query performance comes from Search Console, not from GA4's individual visitors.
3. In Bing Webmaster Tools, add/import the same site, verify it, submit the sitemap and review indexation and search-query reports. Review AI/Copilot visibility only where Bing makes it available. No keyword-report browser script is required. Existing verification and IndexNow configuration are preserved.
4. In Looker Studio → Create → Report, connect the Kraftt GA4 property and Search Console. Add Site Impression and URL Impression as separate GSC data sources when required. Authorize each connection using an account with access. Build the seven pages in [analytics-dashboard-spec.md](analytics-dashboard-spec.md), with date/country/device filters and clearly defined lead-intent metrics.
5. Bing and Clarity may require separate dashboards or approved export/connectors. Never pretend their metrics are GA4 events or combine incompatible query/session rows into person-level attribution.

## Deployment verification

1. Locally run `npm run test:analytics`, `npm run test:offers`, `npm run lint`, then `npm run build:netlify -- --webpack`. The analytics tests mock HTTP; they never send an actual enquiry.
2. Use GTM Preview with the production/preview URL. Confirm one container and the correct Google destination IDs. Check initial `kraftt_page_view` maps to one GA4 `page_view`, and a Next.js route change adds exactly one more. Do not create a History Change trigger.
3. Test direct, Google referrer, Instagram/LinkedIn organic-social UTMs and WhatsApp messaging UTMs. Inspect first/current fields, navigate internally and ensure the landing page remains the original entry.
4. Click WhatsApp, phone, email and a booking CTA; check one event of each relevant name. Do not use prepared personal messages as analytics parameters. Contact intent and secondary contextual events are intentionally separate.
5. Start an enquiry and verify one start per mounted form. Use a controlled/mock failed API response: no submit/complete conversion. Test a real successful enquiry only with the site's owner's authorization; confirm one submit after acceptance. Audit accepted requests additionally generate audit_complete.
6. Calculate a tool result; verify start/completion and no entered values. Test privacy using personal-looking query parameters and fields: they must not appear in the custom payload.
7. In GA4 DebugView, select the preview device. Use `debug_mode=true` only in a temporary Preview/debug event setting, not all production traffic. Check Realtime after publishing. The stream's “data collection inactive” warning alone does not prove installation failure and may lag actual activity.
8. Inspect browser network requests to `g/collect` for measurement ID `G-CHE056H2KV`, expected event names and sanitized locations. Ad blockers, denied consent and blocked Google requests legitimately prevent collection. Do not circumvent them.

Troubleshooting: 404 pages must be resolved before tag verification; a missing/unpublished container can prevent GTM from loading. Events in dataLayer but absent from GA4 usually mean the container/event tag is unpublished, the trigger regex/ID is wrong, or consent/ad-blocking prevents collection. Double pageviews generally mean automatic send_page_view, Enhanced Measurement history, or a second tag is still active. Missing dimensions mean definitions have not been created or reporting has not processed them. Removing the direct tag alone does not configure the GTM workspace.

See [utm-naming-guide.md](utm-naming-guide.md) for external campaign links. No internal link was given UTMs.
