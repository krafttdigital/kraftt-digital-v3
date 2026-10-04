// Retain the original GIFs as sources and for existing external asset URLs.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const sourceDir = new URL('../public/assets/animation%20icons/', import.meta.url);
const outputDir = new URL('../public/assets/animated-service-icons/', import.meta.url);
await mkdir(outputDir, { recursive: true });
const files = ['website', 'branding', 'stores', 'marketplace', 'seo', 'socialmedia', 'landing page', 'appdev', 'dashobard'];
const manifest = {};
for (const name of files) {
  const source = await readFile(new URL(`${name}.gif`, sourceDir));
  const metadata = await sharp(source, { animated: true }).metadata();
  const variants = {};
  for (const width of [160, 640]) {
    const pipeline = sharp(source, { animated: true });
    if (width !== metadata.width) pipeline.resize({ width });
    const output = await pipeline.webp({ lossless: true, effort: 4, minSize: true, loop: metadata.loop, delay: metadata.delay }).toBuffer();
    const result = await sharp(output, { animated: true }).metadata();
    if (result.pages !== metadata.pages || result.loop !== metadata.loop || JSON.stringify(result.delay) !== JSON.stringify(metadata.delay)) throw new Error(`Animation timing changed: ${name}`);
    const hash = createHash('sha256').update(output).digest('hex').slice(0, 12);
    const filename = `${name.replaceAll(' ', '-')}-${width}.${hash}.webp`;
    await writeFile(new URL(filename, outputDir), output);
    variants[width] = `/assets/animated-service-icons/${filename}`;
    console.log(`${name} ${width}px: ${source.length} -> ${output.length} bytes`);
  }
  manifest[name] = variants;
}
await writeFile(new URL('../app/data/service-icon-assets.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
