import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Run locally when the source archive is available. The website only consumes
// the small copies in public; the original client archive is never modified.
const sourceRoot = process.env.KRAFTT_ASSETS_DIR ?? 'D:\\03-Kraftt Digital\\Kraftt-Assets';
const outputRoot = path.resolve('public/assets/case-studies');

const images = [
  ['Gate Seeds', 'gate-seeds', '02-before/screenshots/home-mobile-viewport.png', 'before-mobile.webp', 800],
  ['Gate Seeds', 'gate-seeds', '03-after/screenshots/home-mobile-viewport.png', 'after-mobile.webp', 800],
  ['Gate Seeds', 'gate-seeds', '04-process/wireframes/site-flow-sketch-preview.png', 'process.webp', 500],
  ['Gate Seeds', 'gate-seeds', '06-client/logos/GS-primary-logo.png', 'client-logo.webp', 320],
  ['Gate Seeds', 'gate-seeds', '06-client/photos/facility-photo-from-live-site.jpg', 'client-photo.webp', 960],
  ['Shree Hari Spintex', 'shree-hari-spintex', '02-before/user-supplied/old-home-desktop-as-supplied.png', 'before-home-supplied.webp', 1600],
  ['Shree Hari Spintex', 'shree-hari-spintex', '03-after/screenshots/home-mobile-viewport.png', 'after-mobile.webp', 800],
  ['Shree Hari Spintex', 'shree-hari-spintex', '04-process/wireframes/04-buyer-journey-sketch-preview.png', 'process.webp', 500],
  ['Shree Hari Spintex', 'shree-hari-spintex', '06-client/photos/published-facility/blowroom.jpg', 'client-photo.webp', 800],
  ['Mittal Architect', 'mittal-architect', '03-after/screenshots/home-mobile-viewport.png', 'after-mobile.webp', 800],
  ['Mittal Architect', 'mittal-architect', '04-process/wireframes/04-visitor-flow-sketch-preview.png', 'process.webp', 500],
  ['Mittal Architect', 'mittal-architect', '06-client/logo/mittal-architect-logo.webp', 'client-logo.webp', 320],
  ['Mittal Architect', 'mittal-architect', '06-client/photos/neeraj-mittal-site-portrait.webp', 'client-photo.webp', 960],
  ['Elixir Beverages', 'elixir-beverages', '04-process/wireframes/04-visitor-flow-sketch-preview.png', 'process.webp', 500],
  ['Elixir Beverages', 'elixir-beverages', '06-client/logos/site-variants/primary-horizontal.webp', 'client-logo.webp', 320],
];

const clips = [
  ['Gate Seeds', 'gate-seeds', '03-after/recordings/home-landscape-1440x900.webm'],
  ['Shree Hari Spintex', 'shree-hari-spintex', '03-after/screen-recordings/home-landscape-scroll.webm'],
  ['Mittal Architect', 'mittal-architect', '03-after/screen-recordings/home-landscape-scroll.webm'],
];

for (const [client, slug, source, name, width] of images) {
  const from = path.join(sourceRoot, client, source);
  const dir = path.join(outputRoot, slug);
  await mkdir(dir, { recursive: true });
  const to = path.join(dir, name);
  await sharp(from).resize({ width, withoutEnlargement: true }).webp({ quality: 77, effort: 5 }).toFile(to);
  const { size } = await stat(to);
  console.log(`${slug}/${name}: ${Math.round(size / 1024)} KB`);
}

for (const [client, slug, source] of clips) {
  const from = path.join(sourceRoot, client, source);
  const dir = path.join(outputRoot, slug);
  await mkdir(dir, { recursive: true });
  const to = path.join(dir, 'home-scroll.webm');
  await copyFile(from, to);
  const { size } = await stat(to);
  console.log(`${slug}/home-scroll.webm: ${Math.round(size / 1024)} KB`);
}
