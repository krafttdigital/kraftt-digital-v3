import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const frames = [
  ['website', '0.95'],
  ['brand', '2.35'],
  ['seo', '3.75'],
  ['store', '5.15'],
  ['marketplace', '6.55'],
];
const output = new URL('../../public/assets/service-motion/', import.meta.url);
await mkdir(output, { recursive: true });

for (const [name, time] of frames) {
  const input = new URL(`./.hyperframes/web-stills/at-${time}s.png`, import.meta.url);
  const image = sharp(fileURLToPath(input));
  const { width, height } = await image.metadata();
  if (width !== 900 || height !== 540) throw new Error(`Unexpected canvas for ${name}: ${width}×${height}`);
  const { size } = await image.webp({ quality: 87, effort: 6 }).toFile(fileURLToPath(new URL(`${name}.webp`, output)));
  console.log(`${name}.webp: ${size} bytes`);
}
