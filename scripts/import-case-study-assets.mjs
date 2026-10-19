import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceRoot = 'D:/03-Kraftt Digital/Kraftt-Assets';
const targetRoot = path.resolve('public/assets/case-studies');
const assets = {
  'elixir-beverages': [
    ['Elixir Beverages/03-after/screenshots/home-desktop-viewport.png', 'website-desktop'],
    ['Elixir Beverages/03-after/screenshots/home-mobile-viewport.png', 'website-mobile'],
    ['Elixir Beverages/03-after/section-views/ingredients-desktop.png', 'ingredients'],
    ['Elixir Beverages/03-after/section-views/trade-desktop.png', 'trade-enquiry'],
    ['Elixir Beverages/05-results/search-console-performance-3-months-undated.png', 'search-console'],
  ],
  'gate-seeds': [
    ['Gate Seeds/02-before/screenshots/home-desktop-viewport.png', 'before-home'],
    ['Gate Seeds/03-after/screenshots/home-desktop-viewport.png', 'after-home'],
    ['Gate Seeds/03-after/screenshots/products-desktop-viewport.png', 'products'],
    ['Gate Seeds/03-after/screenshots/contact-mobile-viewport.png', 'contact-mobile'],
    ['Gate Seeds/06-client/photos/product-paddy-kranti.jpg', 'paddy-product'],
  ],
  'mittal-architect': [
    ['Mittal Architect/03-after/screenshots/home-desktop-viewport.png', 'website-home'],
    ['Mittal Architect/03-after/screenshots/projects-desktop-viewport.png', 'project-gallery'],
    ['Mittal Architect/03-after/screenshots/services-mobile-viewport.png', 'services-mobile'],
    ['Mittal Architect/03-after/selected-site-images/goyal-residence.webp', 'goyal-residence'],
    ['Mittal Architect/03-after/selected-site-images/ss-square-market.webp', 'ss-square-market'],
    ['Mittal Architect/05-results/local-search/03-architect-in-mansa.png', 'search-example'],
  ],
  'shree-hari-spintex': [
    ['Shree Hari Spintex/02-before/archived-site-2025/home-desktop-wayback-2025-03-26-viewport.png', 'before-home'],
    ['Shree Hari Spintex/03-after/screenshots/home-desktop-viewport.png', 'after-home'],
    ['Shree Hari Spintex/03-after/screenshots/products-desktop-viewport.png', 'products'],
    ['Shree Hari Spintex/03-after/screenshots/machinery-desktop-viewport.png', 'machinery'],
    ['Shree Hari Spintex/05-results/brand-search-as-supplied.png', 'brand-search'],
  ],
};

for (const [slug, entries] of Object.entries(assets)) {
  const targetDirectory = path.join(targetRoot, slug);
  await fs.mkdir(targetDirectory, { recursive: true });
  for (const [relativeSource, name] of entries) {
    const source = path.join(sourceRoot, relativeSource);
    const target = path.join(targetDirectory, `${name}.webp`);
    const { width } = await sharp(source).metadata();
    await sharp(source)
      .resize({ width: Math.min(width ?? 1600, 1600), withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(target);
    console.log(`${slug}/${name}.webp`);
  }
}
