# Service showcase artwork

The HyperFrames scenes use published Kraftt project media for Website, Branding, SEO and Store. The Marketplace scene reads package allowances from `app/data/marketplace.ts` and uses the platform logos from the public site. The SEO image shows one supplied branded search result.

The website uses one settled WebP per scene. Remotion blends them as visitors scroll. Service details, case study links and live regional prices are rendered as HTML.

From this directory, prepare the source media, check the composition and export the five stills:

```sh
node prepare-artwork.mjs
npx hyperframes@0.9.67 check
npx hyperframes@0.9.67 snapshot --at 0.95,2.35,3.75,5.15,6.55 --no-end --keep --output .hyperframes/web-stills
node export-stills.mjs
```

The exporter writes five optimised WebP files to `public/assets/service-motion/`. The site build reads them directly.
