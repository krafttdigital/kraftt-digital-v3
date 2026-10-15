import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'dist/admin');
const html = await readFile(resolve(output, 'index.html'), 'utf8');
assert.match(html, /name="robots" content="noindex, nofollow/);
assert.match(await readFile(resolve(output, 'robots.txt'), 'utf8'), /Disallow: \//);
assert.match(await readFile(resolve(output, '_headers'), 'utf8'), /X-Robots-Tag: noindex/);
for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)) {
  assert.ok((await readFile(resolve(output, `.${match[1]}`))).length, `Missing asset ${match[1]}`);
}
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }))).flat();
}
const source = resolve(root, 'public/admin-assets');
const assets = await files(source);
for (const path of assets) {
  assert.deepEqual(await readFile(resolve(output, 'admin-assets', relative(source, path))), await readFile(path));
}
for (const path of await files(output)) {
  assert.ok(!/\.env|\.map$/.test(relative(output, path)), 'Unexpected environment or source-map file');
  if (!/\.(js|html)$/.test(path)) continue;
  assert.doesNotMatch(await readFile(path, 'utf8'), /googletagmanager\.com|clarity\.ms\/tag|GTM-NTF8M2Q9/);
}
console.log(`Admin build verified: ${assets.length} document assets match, entry files exist, noindex present, no public tracking scripts.`);
