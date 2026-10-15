import { copyFileSync, readFileSync } from 'node:fs';
copyFileSync(new URL('../node_modules/pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), new URL('../public/admin-assets/pdf.worker.min.mjs', import.meta.url));
const { version } = JSON.parse(readFileSync(new URL('../node_modules/pdfjs-dist/package.json', import.meta.url), 'utf8'));
copyFileSync(new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url), new URL(`../public/admin-assets/pdf.worker.legacy-${version}.min.mjs`, import.meta.url));
