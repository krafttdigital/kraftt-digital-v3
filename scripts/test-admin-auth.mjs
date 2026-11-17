import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const outfile = join(tmpdir(), `kraftt-admin-auth-${crypto.randomUUID()}.mjs`);
await build({ entryPoints: ['admin-cloudflare/worker.ts'], bundle: true, format: 'esm', platform: 'neutral', target: 'es2022', outfile });
try {
  const { default: worker } = await import(pathToFileURL(outfile).href);
  const keypair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const publicKey = { ...await crypto.subtle.exportKey('jwk', keypair.publicKey), kid: 'test-key' };
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  async function token(email) {
    const header = encode({ alg: 'RS256', kid: 'test-key' });
    const payload = encode({ aud: ['test-audience'], exp: Math.floor(Date.now() / 1000) + 600, iss: 'https://test.cloudflareaccess.com', email });
    const signature = Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keypair.privateKey, new TextEncoder().encode(`${header}.${payload}`))).toString('base64url');
    return `${header}.${payload}.${signature}`;
  }
  const rows = new Map();
  const db = {
    async exec() {},
    prepare(sql) {
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async first() { if (sql.startsWith('SELECT COUNT')) return { total: rows.size }; return rows.get(args[0]) || null; },
        async all() { return { results: [...rows.values()] }; },
        async run() { const [email, name] = args; if (!rows.has(email)) rows.set(email, { email, name, role: sql.includes("'owner'") ? 'owner' : 'member', created_at: '2026-10-29', updated_at: '2026-10-29' }); return { success: true }; },
      };
    },
  };
  const env = { DB: db, ASSETS: { fetch: async () => new Response('assets') }, ACCESS_TEAM_DOMAIN: 'test.cloudflareaccess.com', ACCESS_AUD: 'test-audience' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => String(url).endsWith('/cdn-cgi/access/certs') ? Response.json({ keys: [publicKey] }) : originalFetch(url);
  try {
    const request = (email, path = '/api/me', method = 'GET') => new Request(`https://admin.krafttdigital.in${path}`, { method, headers: { 'Cf-Access-Jwt-Assertion': email } });
    const owner = await worker.fetch(request(await token('krafttdigital@gmail.com')), env);
    assert.equal(owner.status, 200);
    assert.equal((await owner.json()).canManageUsers, true);
    const member = await worker.fetch(request(await token('tech.krafttdigital@gmail.com')), env);
    assert.equal(member.status, 200);
    assert.equal((await member.json()).canManageUsers, false);
    assert.equal((await worker.fetch(request(await token('tech.krafttdigital@gmail.com'), '/api/users'), env)).status, 403);
    assert.equal((await worker.fetch(request(await token('tech.krafttdigital@gmail.com'), '/api/users', 'POST'), env)).status, 403);
    assert.equal((await worker.fetch(request(await token('tech.krafttdigital@gmail.com'), '/api/agency'), env)).status, 403);
    assert.equal((await worker.fetch(request(await token('tech.krafttdigital@gmail.com'), '/api/agency', 'PUT'), env)).status, 403);
    assert.equal((await worker.fetch(request(await token('outsider@example.com')), env)).status, 403);
    assert.equal((await worker.fetch(new Request('https://admin.krafttdigital.in/api/users'), env)).status, 401);
    assert.equal((await worker.fetch(request('invalid.jwt.signature'), env)).status, 401);
  } finally { globalThis.fetch = originalFetch; }
} finally { await unlink(outfile); }

console.log('Signed Access JWT and owner-only user API checks passed.');
