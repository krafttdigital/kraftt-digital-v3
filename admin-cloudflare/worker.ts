import { BACKUP_LIMIT, validateWorkspace } from '../lib/quotation/storage';
import type { D1Database, Fetcher } from '@cloudflare/workers-types';

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
}

const ADMIN_EMAILS = new Set(['krafttdigital@gmail.com', 'tech.krafttdigital@gmail.com']);
const CHUNK_SIZE = 300_000; // Below D1's 2 MB value limit, even with multibyte text.
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
let cachedKeys: Array<JsonWebKey & { kid?: string }> = [];
let keysValidUntil = 0;

function decodeBase64Url(value: string): Uint8Array {
  const raw = atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '='));
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}

async function authenticated(request: Request, env: Env): Promise<boolean> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || !env.ACCESS_AUD || !env.ACCESS_TEAM_DOMAIN) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))) as { alg?: string; kid?: string };
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1]))) as { aud?: string[] | string; exp?: number; nbf?: number; iss?: string; email?: string };
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || !header.kid || !claims.exp || claims.exp <= now || (claims.nbf && claims.nbf > now)) return false;
    if (claims.iss !== `https://${env.ACCESS_TEAM_DOMAIN}` || !(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(env.ACCESS_AUD)) return false;
    if (!claims.email || !ADMIN_EMAILS.has(claims.email.toLowerCase())) return false;
    if (Date.now() > keysValidUntil || !cachedKeys.some(key => key.kid === header.kid)) {
      const certs = await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
      if (!certs.ok) return false;
      const { keys } = await certs.json() as { keys: Array<JsonWebKey & { kid?: string }> };
      cachedKeys = keys;
      keysValidUntil = Date.now() + 5 * 60_000;
    }
    const jwk = cachedKeys.find(key => key.kid === header.kid && key.kty === 'RSA');
    if (!jwk) return false;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decodeBase64Url(parts[2]) as BufferSource, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  } catch {
    return false;
  }
}

async function readWorkspace(db: D1Database) {
  const rows = await db.prepare(`SELECT w.revision, w.active_snapshot, c.position, c.body
    FROM admin_workspace w LEFT JOIN admin_workspace_chunks c ON c.snapshot_id = w.active_snapshot
    WHERE w.id = 1 ORDER BY c.position`).all<{ revision: number; active_snapshot: string | null; position: number | null; body: string | null }>();
  if (!rows.results?.length) throw new Error('Database migration has not been applied.');
  const revision = rows.results[0].revision;
  if (!rows.results[0].active_snapshot) return { revision, workspace: null };
  const text = rows.results.map(row => row.body ?? '').join('');
  if (new TextEncoder().encode(text).byteLength > BACKUP_LIMIT) throw new Error('Stored workspace exceeds the backup limit.');
  return { revision, workspace: validateWorkspace(JSON.parse(text)) };
}

async function writeWorkspace(request: Request, db: D1Database) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > BACKUP_LIMIT + 1024) return response({ error: 'Workspace exceeds 10 MB.' }, 413);
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > BACKUP_LIMIT + 1024) return response({ error: 'Workspace exceeds 10 MB.' }, 413);
  let parsed: { workspace?: unknown; baseRevision?: unknown };
  try { parsed = JSON.parse(body); } catch { return response({ error: 'Invalid JSON.' }, 400); }
  if (!Number.isSafeInteger(parsed.baseRevision) || (parsed.baseRevision as number) < 0) return response({ error: 'Invalid revision.' }, 400);
  let text: string;
  try { text = JSON.stringify(validateWorkspace(parsed.workspace)); } catch { return response({ error: 'Invalid workspace data.' }, 400); }
  if (new TextEncoder().encode(text).byteLength > BACKUP_LIMIT) return response({ error: 'Workspace exceeds 10 MB.' }, 413);
  const snapshot = crypto.randomUUID();
  const chunks: string[] = [];
  for (let start = 0; start < text.length; start += CHUNK_SIZE) chunks.push(text.slice(start, start + CHUNK_SIZE));
  if (!chunks.length || chunks.length > 40) return response({ error: 'Workspace is too large for a single save.' }, 413);
  const statements = chunks.map((chunk, position) => db.prepare('INSERT INTO admin_workspace_chunks (snapshot_id, position, body) VALUES (?, ?, ?)').bind(snapshot, position, chunk));
  statements.push(db.prepare('UPDATE admin_workspace SET active_snapshot = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1 AND revision = ?').bind(snapshot, parsed.baseRevision));
  statements.push(db.prepare('DELETE FROM admin_workspace_chunks WHERE snapshot_id != (SELECT active_snapshot FROM admin_workspace WHERE id = 1)'));
  const result = await db.batch(statements);
  if (result[chunks.length].meta.changes !== 1) return response({ error: 'This workspace changed on another device. Export your edits, then reload the cloud copy.' }, 409);
  return response({ revision: (parsed.baseRevision as number) + 1 });
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (!path.startsWith('/api/')) return env.ASSETS.fetch(request as never) as unknown as Promise<Response>;
    if (path !== '/api/workspace') return response({ error: 'Not found.' }, 404);
    if (!await authenticated(request, env)) return response({ error: 'Cloudflare Access sign-in required.' }, 401);
    if (!env.DB) return response({ error: 'D1 database is not bound. Complete the deployment setup.' }, 503);
    if (request.method === 'PUT' && request.headers.get('Origin') !== new URL(request.url).origin) return response({ error: 'Cross-origin save rejected.' }, 403);
    try {
      if (request.method === 'GET') return response(await readWorkspace(env.DB));
      if (request.method === 'PUT') return await writeWorkspace(request, env.DB);
      return response({ error: 'Method not allowed.' }, 405);
    } catch {
      return response({ error: 'Cloud workspace is temporarily unavailable.' }, 503);
    }
  },
};

export default worker;
