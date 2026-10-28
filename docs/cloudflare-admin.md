# Separate Kraftt admin on Cloudflare

## Shared database upgrade — live 28 October 2026

On 28 October 2026, the `kraftt-admin-data` D1 database and workspace tables were created in the Kraftt Cloudflare account. The D1-backed `kraftt-admin` Worker was deployed to `admin.krafttdigital.in` as version `1c89ad39-7928-4ed2-bc3a-b9c59aeb47df`. The admin build and validation passed; Wrangler confirmed the D1 binding and custom domain trigger. Unauthenticated requests to both `/` and `/api/workspace` redirect to the existing Cloudflare Access login. An authenticated save, refresh and cross-device read still need to be checked after the owner signs in. The API saves clients, case study intake notes, form fields, quotations, documents, settings and trash as validated JSON. PDF previews and downloads remain browser-generated; generated PDF files are **not** stored in D1. The public website's `/admin` route remains browser-only.

The Case Studies intake module was published later on 28 October 2026 as Worker version `ac91d12c-42e4-451b-8233-07dadb42c12e`. It has A–G form sections, 3–5 key-decision rows, verified result rows, permission fields and a “Not measured” option. Existing version 1 and 2 workspace backups receive an empty case-study list during validation. The admin build, targeted lint, source TypeScript check and migration/backup test passed. Access still redirects unauthenticated requests; authenticated editing remains to be checked in the owner's session.

The API checks the signed Cloudflare Access JWT against the configured team domain and application audience, then permits only `krafttdigital@gmail.com` and `tech.krafttdigital@gmail.com`. Keep the existing Access **All traffic** policy. The Worker also rejects cross-origin saves and uses revision checks to prevent silent overwrites from another device. The audience in `wrangler.admin.jsonc` must still match the live Access application when you deploy; if the application is recreated, update it first.

### One-time setup and deployment

The database already exists; **do not run `d1 create` again**. The local `wrangler.admin.jsonc` has the actual D1 ID and `DB` binding. For future deployments, from `D:\07-Live Sites\kraftt-digital-v3` in PowerShell:

```powershell
npx wrangler login --scopes account:read --scopes user:read --scopes workers_scripts:write --scopes workers_routes:write --scopes zone:read
npm run build:admin
npm run validate:admin
npm run deploy:admin
```

The SQL tables were already applied through the Cloudflare dashboard. The idempotent migration can be recorded later with `npx wrangler d1 migrations apply DB --remote --config wrangler.admin.jsonc` if Wrangler has D1 write access; it is not required to deploy the current Worker. Keep the existing custom domain, Access policy and password digest build variable. No API token should be committed or pasted into chat.

### First sign-in and migration

1. Export a JSON backup from each browser that has important work before deploying.
2. Sign in to `admin.krafttdigital.in`. If that browser holds a different local workspace, the admin asks whether to move the browser copy to cloud or open the cloud copy. Download the browser copy before replacing it if needed. Only one browser copy is imported automatically by your explicit choice; import any other distinct backup through **Backup** after reconciling it manually.
3. Create or edit a test client, wait for **Saved to cloud**, then sign in from another computer and confirm it appears. Refresh both devices. A concurrent edit is rejected with a conflict message; export the unsaved copy, reload the cloud version and reconcile the changes.
4. Open a document preview and download its PDF. D1 should contain only workspace JSON, never generated PDFs.

Cloudflare D1 is the source of truth after migration. A browser cache is kept as a recovery copy, and JSON export remains available. The admin shows a save error if D1 is unavailable; do not treat a local cache as a successful cloud save.

The previous deployment details below describe the earlier browser-only release and remain useful as historical context.

## Live deployment — 13 October 2026

PDF preview compatibility update: version `08199734-9b71-418b-9b1d-1a318ec63479`, deployed with Wrangler. The PDF.js API and worker now use the official legacy build, fixing `a.toHex is not a function` in browsers without the new byte-array APIs. The worker URL includes the PDF.js version. `npm run test:pdf-compat` verifies the shipped worker restores missing byte-array methods in an isolated worker. Local quotation/proposal rendering and preview-page retention after editing passed; live Access protection was rechecked after deployment. Live authenticated PDF rendering still needs the owner's sign-in.

- Address: https://admin.krafttdigital.in
- Worker: `kraftt-admin`, uploaded through the Cloudflare dashboard from `dist/admin` (33 files).
- Initial version prefix: `3c4ffe5f` (superseded by the compatibility update above).
- Custom domain connected; HTTPS redirects unauthenticated visitors to Cloudflare Access.
- All traffic uses the owner-approved **Kraftt Digital Administrators** policy: `krafttdigital@gmail.com` and `tech.krafttdigital@gmail.com`. Session duration: 24 hours.
- Production `workers.dev` and preview URLs are disabled.
- The public homepage was checked and still loads. No public-site DNS records were edited.
- Existing browser data has not been copied. Use Backup export/import as described below.
- This initial release is a manual upload, not a Git-connected Cloudflare build. Future local changes need a new build and deployment. The Git setup below remains optional.

The live Access login page was verified. Completing email verification and the existing workspace password login requires the owner; document previews behind that login have not been rechecked on production.

## What this deploys

`admin.krafttdigital.in` runs the existing client and document workspace as a separate React app on Cloudflare Workers with Static Assets. It reuses the same editors, catalogue, PDF generators, fonts and templates. The website remains on Netlify with its existing build command and configuration.

The October 13 release was a hosting split without a database. The D1 upgrade above supersedes its browser-only storage behavior once you deploy it.

## Before switching addresses

1. On the browser holding your current work, open `https://krafttdigital.in/admin`.
2. Open **Backup** and export a JSON backup. Keep it somewhere safe; it contains client information.
3. After the new address is live, sign in there and import this backup from **Backup**.
4. Check the clients and documents, open a document preview and download a PDF before editing exclusively on the new address.

The original `/admin` stays available for recovery. Nothing automatically redirects it or deletes its storage. If you later retire it, export backups from every browser that has unique work first.

## Build configuration

Commit/push the new files and package.json changes to the connected Git repository before configuring Cloudflare's Git build.

| Setting | Value |
| --- | --- |
| Cloudflare product | Workers with Static Assets |
| Worker name | `kraftt-admin` |
| Git repository | The existing Kraftt repository |
| Root directory | Repository root |
| Build command | `npm run build:admin` |
| Deploy command | `npm run deploy:admin` |
| Node version | `22.16.0` or a supported newer version (minimum 22.13) |
| Wrangler config | `wrangler.admin.jsonc` (already selected by deploy command) |
| Asset output | `dist/admin` (already selected in Wrangler config) |

Add `NEXT_PUBLIC_DOCUMENT_WORKSPACE_PASSWORD_SHA256` as a **build environment variable**, using the same digest from your local `.env.local` or existing Netlify build configuration. Do not paste your actual password into this variable. This value is intentionally bundled by the existing browser password screen; it is not server authentication. No other website environment variables are needed.

Local commands:

```powershell
npm run build:admin
npm run validate:admin
npm run preview:admin
```

The build stops if the digest is absent or malformed. Fonts, PDF worker and agreement artwork are copied from `public/admin-assets`. The public site's assets, scripts, loader and analytics are excluded.

## Publish and protect the admin

1. In Cloudflare **Workers & Pages**, create/connect the `kraftt-admin` Worker to the repository with the settings above. Alternatively, sign in locally with `npx wrangler login`, then run the build, validation and `npm run deploy:admin`.
2. The checked-in configuration disables `workers.dev` and preview URLs and now explicitly preserves the live custom domain. On this existing Worker, leave its approved Access policy enabled during future deployments.
3. In this Worker's **Access** tab, choose **Protect this Worker behind Access**, select **All traffic**, and allow only your own Cloudflare account or explicitly approved email addresses. For specific email policies, edit the application in Zero Trust. Do not use an Everyone or bypass policy. Worker-level Access protects the app and its assets, including any domains added later.
4. In the Worker's **Settings > Domains & Routes**, add the Custom Domain `admin.krafttdigital.in`. Cloudflare creates the appropriate DNS record and certificate for that Worker. Do not create a CNAME to Netlify. Keep the existing root and `www` records unchanged. If Cloudflare reports an existing conflicting `admin` record, inspect its purpose before replacing it.
5. In a private browser window, verify the Cloudflare Access sign-in appears before the workspace. An unapproved account must not be allowed in. After Access authentication, the existing workspace password screen still appears.
6. Restore the backup and verify document preview/export. Cloudflare Access logout is at `https://admin.krafttdigital.in/cdn-cgi/access/logout`; the workspace's Logout button only clears the local workspace unlock.

The custom domain was initially connected in the dashboard and is now also recorded in `wrangler.admin.jsonc` so subsequent CLI deployments retain the same hostname. The Access policy is managed in Cloudflare, not in this configuration file.

No credentials or Cloudflare account IDs are checked into this repository. `wrangler login` requires the owner to complete Cloudflare authentication. Browser dashboard authentication does not automatically sign in the CLI.

## Checks after deployment

- Authorized sign-in at the root address opens the workspace; refresh works.
- No GTM, GA4 or Clarity scripts load in the admin build.
- Clients, all document types, Backup and Company Defaults are present.
- A quotation and another document preview successfully; downloaded PDFs keep their fonts/artwork.
- Reopen the browser and confirm restored data persists.
- Public homepage and existing Netlify deployment still work.

## References

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare Access for Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
- [Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
