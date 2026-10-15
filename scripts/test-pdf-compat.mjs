import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Worker } from 'node:worker_threads';

const { version } = JSON.parse(await readFile(new URL('../node_modules/pdfjs-dist/package.json', import.meta.url), 'utf8'));
const shippedWorker = new URL(`../public/admin-assets/pdf.worker.legacy-${version}.min.mjs`, import.meta.url);
assert.deepEqual(await readFile(shippedWorker), await readFile(new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url)));

// Simulate the missing modern byte-array methods in the separate worker context,
// where a window-level polyfill cannot fix the reported toHex crash.
const probe = `
  const { parentPort, workerData } = require('node:worker_threads');
  const assert = require('node:assert/strict');
  for (const key of ['toHex', 'toBase64', 'setFromBase64', 'setFromHex']) {
    Object.defineProperty(Uint8Array.prototype, key, { value: undefined, configurable: true, writable: true });
  }
  for (const key of ['fromHex', 'fromBase64']) {
    Object.defineProperty(Uint8Array, key, { value: undefined, configurable: true, writable: true });
  }
  import(workerData).then(() => {
    assert.equal(new Uint8Array([0, 15, 128, 255]).toHex(), '000f80ff');
    assert.equal(new Uint8Array([0, 15, 128, 255]).toBase64(), 'AA+A/w==');
    assert.deepEqual([...Uint8Array.fromBase64('AA+A/w==')], [0, 15, 128, 255]);
    parentPort.postMessage('ok');
  }).catch(error => { throw error; });
`;
await new Promise((resolve, reject) => {
  const worker = new Worker(probe, { eval: true, workerData: shippedWorker.href });
  let verified = false;
  worker.on('message', value => { verified = value === 'ok'; });
  worker.on('error', reject);
  worker.on('exit', code => code === 0 && verified ? resolve() : reject(new Error(`PDF worker compatibility check failed (${code})`)));
});
console.log(`PDF.js ${version} worker restores missing byte-array methods; shipped worker matches the compatibility build.`);
