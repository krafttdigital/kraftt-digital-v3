import { BACKUP_LIMIT, validateWorkspace } from '../lib/quotation/storage';
import { OWNER_EMAIL, accessConfigured, activeUser, addUser, ensureUsersTable, listUsers, normalizeEmail, normalizeName, removeUser, updateUser } from './users';
import type { D1Database, Fetcher } from '@cloudflare/workers-types';

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ACCESS_ACCOUNT_ID?: string;
  ACCESS_POLICY_TOKEN?: string;
}

const CHUNK_SIZE = 300_000; // Below D1's 2 MB value limit, even with multibyte text.
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
let cachedKeys: Array<JsonWebKey & { kid?: string }> = [];
let keysValidUntil = 0;

function decodeBase64Url(value: string): Uint8Array {
  const raw = atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '='));
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}

async function verifiedEmail(request: Request, env: Env): Promise<string | null> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || !env.ACCESS_AUD || !env.ACCESS_TEAM_DOMAIN) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))) as { alg?: string; kid?: string };
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1]))) as { aud?: string[] | string; exp?: number; nbf?: number; iss?: string; email?: string };
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || !header.kid || !claims.exp || claims.exp <= now || (claims.nbf && claims.nbf > now)) return null;
    if (claims.iss !== `https://${env.ACCESS_TEAM_DOMAIN}` || !(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(env.ACCESS_AUD)) return null;
    if (!claims.email) return null;
    const email = normalizeEmail(claims.email);
    if (Date.now() > keysValidUntil || !cachedKeys.some(key => key.kid === header.kid)) {
      const certs = await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
      if (!certs.ok) return null;
      const { keys } = await certs.json() as { keys: Array<JsonWebKey & { kid?: string }> };
      cachedKeys = keys;
      keysValidUntil = Date.now() + 5 * 60_000;
    }
    const jwk = cachedKeys.find(key => key.kid === header.kid && key.kty === 'RSA');
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decodeBase64Url(parts[2]) as BufferSource, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    return valid ? email : null;
  } catch {
    return null;
  }
}

async function userBody(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 4096) throw new Error('User request is too large.');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 4096) throw new Error('User request is too large.');
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid user details.');
  return value as Record<string, unknown>;
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
    if (!['/api/workspace', '/api/me', '/api/users'].includes(path)) return response({ error: 'Not found.' }, 404);
    if (!env.DB) return response({ error: 'D1 database is not bound. Complete the deployment setup.' }, 503);
    const email = await verifiedEmail(request, env);
    if (!email) return response({ error: 'Cloudflare Access sign-in required.' }, 401);
    try { await ensureUsersTable(env.DB); } catch { return response({ error: 'Admin user directory is temporarily unavailable.' }, 503); }
    let user;
    try { user = await activeUser(env.DB, email); } catch { return response({ error: 'Admin user directory is temporarily unavailable.' }, 503); }
    if (!user) return response({ error: 'This email is not authorised for the admin.' }, 403);
    if (path === '/api/me') return request.method === 'GET' ? response({ email: user.email, name: user.name, canManageUsers: user.email === OWNER_EMAIL }) : response({ error: 'Method not allowed.' }, 405);
    if (path === '/api/users') {
      if (user.email !== OWNER_EMAIL) return response({ error: 'Only the owner can manage users.' }, 403);
      if (request.method === 'GET') {
        try { return response({ users: await listUsers(env.DB), accessConfigured: accessConfigured(env) }); }
        catch { return response({ error: 'Admin user directory is temporarily unavailable.' }, 503); }
      }
      if (!['POST', 'PATCH', 'DELETE'].includes(request.method)) return response({ error: 'Method not allowed.' }, 405);
      if (request.headers.get('Origin') !== new URL(request.url).origin) return response({ error: 'Cross-origin user change rejected.' }, 403);
      try {
        const body = await userBody(request);
        if (request.method === 'POST') await addUser(env.DB, env, normalizeEmail(body.email), normalizeName(body.name));
        if (request.method === 'PATCH') await updateUser(env.DB, env, normalizeEmail(body.oldEmail), normalizeEmail(body.email), normalizeName(body.name));
        if (request.method === 'DELETE') await removeUser(env.DB, env, normalizeEmail(body.email));
        return response({ users: await listUsers(env.DB) });
      } catch (error) { return response({ error: error instanceof Error ? error.message : 'User change failed.' }, 400); }
    }
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
