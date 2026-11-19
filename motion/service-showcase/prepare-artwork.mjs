import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { marketplacePackages } from '../../app/data/marketplace.ts';

const publicAssets = new URL('../../public/assets/', import.meta.url);
const artworkAssets = new URL('./assets/', import.meta.url);
const sources = [
  ['gate-seeds-desktop', 'case-studies/gate-seeds/after-home.webp', 900],
  ['gate-seeds-mobile', 'case-studies/gate-seeds/after-mobile.webp', 320],
  ['elixir-logo', 'projects/elixir-beverages/elixir-logo-rules.png', 700],
  ['elixir-palette', 'projects/elixir-beverages/elixir-color-pallete.png', 700],
  ['elixir-search', 'case-studies/elixir-beverages/results/brand-search-google.png', 850],
  ['vibed-vines-shop', 'projects/the-vibed-vines/tvv-shop-page-with-search-and-filters.png', 1000],
  ...['amazon', 'flipkart', 'myntra', 'meesho'].map(name => [name, `marketplaces/${name}.png`, 360]),
];

await mkdir(artworkAssets, { recursive: true });
await Promise.all(sources.map(([name, source, width]) =>
  sharp(fileURLToPath(new URL(source, publicAssets)))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(fileURLToPath(new URL(`${name}.webp`, artworkAssets))),
));

const packages = marketplacePackages.map(({ id, name, productAllowance }) => ({ id, name, productAllowance }));
await writeFile(new URL('marketplace-packages.js', artworkAssets),
  `window.showcaseMarketplacePackages = ${JSON.stringify(packages)};\n`);
