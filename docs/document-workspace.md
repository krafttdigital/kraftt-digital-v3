# Kraftt company document workspace

Open /admin. The public site's pages and content are unchanged by this workspace update.

## Workflow

1. Open Clients to add, modify or remove a client. Saved documents keep a copy of the client details, so changing the directory never rewrites issued documents.
2. Choose Audit Generator, Quote & Terms, Proposal, Agreement, Welcome, Thank You or Monthly Report in the sidebar.
3. Create a blank document, choose a client and fill its template sections. Missing details remain visible as placeholders in the live PDF preview.
4. Save a draft, download a completed PDF, or finalise a read-only snapshot. Duplicate creates another draft; Create Revision preserves the issued original.

Every PDF page repeats the Kraftt. secondary text wordmark on the left and Prepared for / Client Name on the right, followed by a rule. The footer contains a rule, Kraftt Digital × Client Name and the current / total page count.

## Quote & Terms

Service checkboxes include every current site service tier and bundle. Selection copies the price, delivery estimate and exclusion information without modifying the site catalogue. Enter the main deliverable points under {{DELIVERABLES_1 — specify quantities, features and handover format}} and adjust the quotation amount where required. Custom-priced services retain a blank amount until you enter it. Custom services can also be added.

Use Services together for a combined scope, or Compare alternatives for independent options. Each option can contain several services or a bundle. Optional one-time services are offered through checkboxes and excluded from the agreed total unless explicitly included. Comparison payment scenarios let you choose a base option and its optional services. Charging the same catalogue service as both an included and optional service in one scenario is rejected.

Ongoing services are separate recurring offers with their own fee, billing period, coverage and start information. They never inflate one-time totals. Exclusions, handover and next steps are generated from the selected scope. Payment schedules are 50/50, 60/40 and 70/30, with the exact remaining rounding amount assigned to the balance. Discount and tax settings are explicit; no tax rate is assumed.

The nine standard quotation terms follow the supplied HTML template. Company Defaults controls the shared review, payment, support and cancellation settings for new documents. Apply current company terms updates a draft explicitly; issued snapshots keep their original agreed wording.

Blank and ordinary quotations fit two A4 pages. Extensive scope, multiple alternatives or long text continues onto additional pages with repeated headers and correct page counts. Text is never clipped merely to force two pages.

The six other document types are manual fill templates. Audit Generator records your verified findings; it does not crawl websites or invent metrics. Agreement includes the shared standard terms and signature lines. Templates do not create digital signatures, invoices, automated reports or a server-backed ERP.

## Storage and backups

Documents, clients and defaults are stored in this browser's localStorage. JSON export includes all document types and recently deleted documents. Import validates the backup before replacing data and asks for confirmation. The original quotation-only version 1 format migrates to version 2 without discarding quotations, clients, trash, presets or company settings. Unknown fields, duplicate identifiers and broken references are rejected.

Saving failures are shown; finalisation requires a successful save. Recently deleted documents can be restored. Keep regular JSON backups: clearing browser data removes this workspace. There is no cross-device syncing or concurrent-tab conflict resolution.

## Password configuration

Run node scripts/configure-admin-password.mjs to create a SHA-256 digest from a password entered privately in the terminal. Put NEXT_PUBLIC_DOCUMENT_WORKSPACE_PASSWORD_SHA256=the_digest in .env.local for development, or configure it in Netlify for the next separately authorised deployment. Restart or rebuild after changing it. .env.example alone is not loaded as runtime configuration.

This remains a frontend convenience password gate, not server authentication. Its public digest and browser data are accessible to device users and same-origin scripts. Noindex and sitemap exclusion are not access control. The password itself is not stored; the unlocked session is held in sessionStorage for the current tab. Secure authentication, team access and shared storage require a separate backend implementation.

## Verification

npm run test:quotations checks calculation precision, alternatives, checkbox selections, duplicate charging, recurring exclusions, payment splits, backup migration and document snapshots.
npm run test:quotations:pdf generates representative and blank PDFs for all seven document modules plus a long-content pagination fixture in ignored outputs/quotation-qa.
npm run build:netlify -- --webpack checks the production Next.js build.

Generated quotation, audit, agreement and report PDFs were rendered and visually inspected; headers, footers, page bounds and extracted rupee amounts were checked. Full interactive browser-flow verification remains outstanding because the computer-use browser controller was unavailable. Nothing was deployed by this update.

## Quotation PDF reference design

Quote & Terms uses its own renderer matching the supplied two-page PDF: the italic serif headlines, two-column client details, bordered service table, dark total row, optional-services section, bottom details panel, split payment bar, single-column numbered terms and client signature line. The quotation footer includes the reference contact line. The other document modules keep their existing shared layout. Empty quotation previews display the three blank reference service rows; selected services replace them. Extended text and alternatives paginate without imposing a three-service limit or changing calculations.

## Client Agreement reference template

New Client Agreements use the supplied Elixir agreement's one-page artwork and wording. Both the original personal-name and business-name occurrences map to {{CLIENT_NAME}}; the full project name maps to {{PROJECT_TITLE}}. Choosing a client and entering a project fills those placeholders. All other details, including Delhi, the 2026-07-21 start date, the two-service description, payment and approval clauses, footer and original Kraftt signature, remain fixed as requested. Original identities have been removed from the published background pixels.

Older agreements retain their saved layout. A draft can explicitly apply the extracted template with the Use extracted Client Agreement template action. Issued snapshots require a revision. Client names up to 80 characters and project titles up to 120 are supported by this fixed one-page layout; the exporter reduces font size within the editable regions where needed and rejects overflow rather than clipping text.

Client Agreement now uses the shared Kraftt wordmark / Perpared for header and a ruled client-name / page-count footer. The editor permits direct client name and address entry, start date and number of services. These values replace the reference’s Delhi, fixed date and service description. Other reference clauses and the signature area stay unchanged.

Contact person/contact name now share the client contact field, separate from the business name. Agreement background is Parchment #F2EFE9, scope highlight is Linen #E8DCC8, the signature divider is removed, and the project block reads Digital Authority Scope - [count] services.

Agreement now matches the Quote & Terms palette (#F6F3ED page, #EFE9DC highlight), bolds Perpared for in the header and contact/business names in the opening sentence, and uses a bold contact person in the client details block. Pagination is replaced with Contact . hello@krafttdigital.in at right in the footer.

The Client Agreement Black & white print checkbox uses a white page background for both preview and PDF download, preserving the scope highlight. The printer controls grayscale conversion. This export preference does not modify saved document contents or the standard colour PDF.

Quote & Terms also offers the Black & white print checkbox. It sets every page background to white in preview and export, retaining all highlight colors and wording. The export preference is independent of saved quotation contents.

Thank You now renders as a letter with the shared Cormorant/Outfit typography and quotation palette, prepared-for header, client/email footer, editable gratitude, completed work, highlighted handover, support and next steps. Long handover notes continue safely across pages. White-background printing is available without changing saved contents.

The supplied Business Transformation Audit is implemented for new Audit Generator documents: a dark snapshot page, overall/manual category readiness, strengths and issues, optional additional findings with source notes and compressed evidence images, and a light priority-map page with Fix Now / Build Next / Later, workflow stages, first project and next steps. Score categories can be renamed or scores omitted. No reference client claims or numerical scores are automatically inserted. Core pages expand safely for long input; evidence pages sit before the priority map. Shared typography/header and print mode are available. Existing generic audits render unchanged; a draft-only conversion action is explicit. JPEG/PNG evidence is limited to 400 KB of encoded data per field and included in document snapshots/backups.

New Monthly Reports use four columns in each section: Traffic Insights (Total Impressions, Total Clicks, Avg. CTR, Top Pages); Traffic Sources (Google / Search Engines, Social Media, Unknown Sources, Highest Traffic Source); User Behavior (Top Queries, Top Countries, Avg. Scroll Depth, Avg. Active Time). Values are manually entered for the same period, with source/reporting basis documented. Counts and percentages are validated; ranked lists use one entry per line and active time includes units. Introduction, insights, completed updates and optional next-month/client actions are supported. Cormorant display figures, Outfit text, the shared palette, header/footer and white-background print mode match the other documents. Long material continues onto additional pages. Saved V1 and generic reports retain their fields and renderers. An explicit draft-only update keeps matching fields and leaves new metrics blank; visitor counts are never relabeled as impressions or clicks.

Welcome now renders as a client onboarding letter with the shared Cormorant/Outfit typography, quotation palette, prepared-for header and client/email footer. New letters start with six blank editable sections: welcome message, confirmed scope and goals, contacts/communication/reviews, content/assets/access requirements, kickoff/first milestone and client next steps. Existing welcome field contents remain editable. No sample dates, scope, delivery commitments or access requirements are prefilled. Getting Started is highlighted and long requirements continue across pages. White-background printing retains highlights without modifying saved contents.

Clients include an optional Project title (up to 120 characters). Selecting a saved client in any document, including Quote & Terms, copies that title into the document project field. You can override it for that document. Selecting a different client replaces the project title with that client's value (or clears it when blank). Directory edits do not rewrite saved document snapshots. Existing browser data and JSON backups without the new field remain supported.

## Configurable Growth Proposal

New Proposals use the supplied ten-section structure: Cover, Overview, Observations, Recommendation, Scope, Timeline, Investment, Terms, optional Beyond This Scope and Closing. Beyond This Scope starts hidden. Every section has an editable label, headline, narrative and optional closing quote. Sections can be hidden, removed, restored and reordered; custom sections can also be duplicated. Each section supports repeatable text, statistic grids, Strength/Opportunity observations, Today/With Kraftt journey chips, numbered timeline stages, kickoff checklists, comparison grids with Best Fit highlighting and callout panels. Components and their rows can be added, duplicated, reordered, hidden and removed.

A shared service list drives both Scope and Investment. Catalogue entries or custom services/bundles support fixed fees or quantity × rate, reference values, short investment summaries, detailed deliverables and delivery windows. Priced services and bundles form the recommended total; included and complimentary rows add no charge. Optional add-ons, alternative offers and recurring retainers are displayed separately and excluded from that total. Use included rows for the components already covered by a bundle, rather than charging them again. Discounts can be fixed or percentage-based; savings and 50/50, 60/40 or 70/30 payment amounts are calculated using the quotation money helpers. Payment triggers, package name, billing notes, proportional value breakdown and signatory are configurable. Narrative placeholders {{CLIENT_NAME}}, {{CONTACT_NAME}}, {{PROJECT_TITLE}} and {{CLIENT_ADDRESS}} resolve from the selected document client.

The renderer uses shared Cormorant/Outfit typography, paper/linen colors, Kraftt. / Perpared for header and client/email footer, with dark Cover/Closing pages. White-background print mode keeps highlight panels and uses readable dark text on the former dark pages. Long content continues without clipping; the template's optional sections and custom components change the final page count. Reference customer facts, pricing and promises are not prefilled. Saved generic proposals retain their renderer and fields; a draft can explicitly switch to the configurable template after copying its prior content. Structured section/service values are validated before finalisation and remain part of snapshots and JSON backups.


### Proposal layout and preview

The cover retains its existing design. Overview uses three brand-value pillars with an optional bottom quote. Observations support repeatable Strength / Opportunity rows and a separate bold opening statement. Recommendations start with four editable trust/service pillars (a fifth can be added), with an optional journey diagram and closing quote. Scope is written independently using custom numbered commitments and an optional bottom note. Investment services never populate or change Scope. Investment can calculate its subtotal from service fees or use a custom package value, even for all-included/complimentary packages. Custom pricing replaces the subtotal; discounts and Terms payments use that amount. Investment uses compact colored treatment rows, with a diagonally crossed-out standard value below each price. The payment schedule appears only on Terms. Timeline phases have connected number markers and bordered timing badges.

Proposal preview uses a local PDF.js worker and keeps its page wrappers and scroll position when edits regenerate the PDF. Other document viewers are unchanged. The pinned `pdfjs-dist` dependency and `scripts/sync-pdf-worker.mjs` keep the bundled worker in sync after package installation. No client PDF is sent to a third-party viewer.


### Multipage form navigation

Proposal, Audit, Monthly Report and quotation editors use a persistent horizontal section bar above the form pane. Only the selected section is displayed; Previous/Next and Left/Right/Home/End keyboard controls move between sections. The form pane scrolls independently, so navigation stays available and the existing PDF preview remains mounted when switching sections. Proposal section IDs preserve selection across renaming/reordering; deleted sections fall back to Client & Details, and hidden sections remain editable. Audit settings and additional evidence have separate sections. Single-page letter/agreement forms keep their existing layout.
