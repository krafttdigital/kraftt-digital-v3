import type { D1Database } from '@cloudflare/workers-types';

export const OWNER_EMAIL = 'krafttdigital@gmail.com';
export const INITIAL_MEMBER_EMAIL = 'tech.krafttdigital@gmail.com';
const POLICY_NAME = 'Kraftt Digital Administrators';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AdminUser = { email: string; name: string; role: 'owner' | 'member'; createdAt: string; updatedAt: string };
type UserRow = { email: string; name: string; role: string; created_at: string; updated_at: string };
type AccessPolicy = {
  id: string; name: string; decision: string; include: unknown[]; app_count?: number;
  exclude?: unknown[]; require?: unknown[]; session_duration?: string;
  purpose_justification_required?: boolean; purpose_justification_prompt?: string;
  approval_required?: boolean; approval_groups?: unknown[];
};
type AccessEnv = { ACCESS_ACCOUNT_ID?: string; ACCESS_POLICY_TOKEN?: string; ACCESS_AUD: string };

let tableReady: Promise<void> | undefined;
export async function ensureUsersTable(db: D1Database) {
  tableReady ??= (async () => {
    await db.exec(`CREATE TABLE IF NOT EXISTS admin_users (
      email TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);
    const count = await db.prepare('SELECT COUNT(*) AS total FROM admin_users').first<{ total: number }>();
    if (!count?.total) {
      await db.prepare("INSERT OR IGNORE INTO admin_users (email, name, role) VALUES (?, ?, 'owner')").bind(OWNER_EMAIL, 'Kraftt Digital').run();
      await db.prepare("INSERT OR IGNORE INTO admin_users (email, name, role) VALUES (?, ?, 'member')").bind(INITIAL_MEMBER_EMAIL, 'Kraftt Digital Tech').run();
    }
  })().catch(error => { tableReady = undefined; throw error; });
  return tableReady;
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') throw new Error('Enter a valid email address.');
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) throw new Error('Enter a valid email address.');
  return email;
}
export function normalizeName(value: unknown) {
  if (typeof value !== 'string') throw new Error('Enter a name.');
  const name = value.trim();
  if (!name || name.length > 100) throw new Error('Enter a name of 1–100 characters.');
  return name;
}
const toUser = (row: UserRow): AdminUser => ({ email: row.email, name: row.name, role: row.role === 'owner' ? 'owner' : 'member', createdAt: row.created_at, updatedAt: row.updated_at });
export async function listUsers(db: D1Database) {
  const rows = await db.prepare("SELECT email, name, role, created_at, updated_at FROM admin_users ORDER BY CASE role WHEN 'owner' THEN 0 ELSE 1 END, email").all<UserRow>();
  return (rows.results || []).map(toUser);
}
export async function activeUser(db: D1Database, email: string) {
  const row = await db.prepare('SELECT email, name, role, created_at, updated_at FROM admin_users WHERE email = ?').bind(email).first<UserRow>();
  return row ? toUser(row) : null;
}

async function cloudflare<T>(env: AccessEnv, path: string, method: 'GET' | 'PUT' = 'GET', body?: unknown): Promise<T> {
  if (!env.ACCESS_ACCOUNT_ID || !env.ACCESS_POLICY_TOKEN) throw new Error('Cloudflare Access user management is not configured.');
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.ACCESS_ACCOUNT_ID)}${path}`;
  const result = await fetch(url, {
    method, headers: { Authorization: `Bearer ${env.ACCESS_POLICY_TOKEN}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!result.ok) throw new Error(`Cloudflare Access could not ${method === 'GET' ? 'read' : 'update'} its policy (${result.status}).`);
  const data = await result.json() as { success?: boolean; result?: T };
  if (!data.success || data.result === undefined) throw new Error('Cloudflare Access rejected the policy request.');
  return data.result;
}

export function policyEmails(policy: AccessPolicy) {
  if (policy.decision !== 'allow' || policy.name !== POLICY_NAME || !Array.isArray(policy.include) || policy.include.length === 0 || (policy.app_count !== undefined && policy.app_count !== 1)) {
    throw new Error('The Access policy is not the dedicated Kraftt admin allow policy.');
  }
  const emails = policy.include.map(rule => {
    if (!rule || typeof rule !== 'object' || Object.keys(rule).some(key => key !== 'email')) throw new Error('The Access policy has non-email rules. Review it in Cloudflare before editing users.');
    const value = (rule as { email?: { email?: string } }).email?.email;
    return normalizeEmail(value);
  });
  if (!emails.includes(OWNER_EMAIL)) throw new Error('The owner must remain in the Access policy.');
  return emails;
}

async function loadPolicy(env: AccessEnv): Promise<AccessPolicy> {
  const [policies, apps] = await Promise.all([
    cloudflare<AccessPolicy[]>(env, '/access/policies?per_page=1000'),
    cloudflare<Array<{ aud?: string; policies?: Array<{ id?: string }> }>>(env, `/access/apps?aud=${encodeURIComponent(env.ACCESS_AUD)}&per_page=100`),
  ]);
  const matches = policies.filter(policy => policy.name === POLICY_NAME);
  if (matches.length !== 1) throw new Error('Could not identify one Kraftt admin Access policy.');
  const app = apps.find(item => item.aud === env.ACCESS_AUD);
  if (!app?.policies?.some(item => item.id === matches[0].id)) throw new Error('The Access policy is not attached to this admin application.');
  policyEmails(matches[0]);
  return matches[0];
}

async function savePolicy(env: AccessEnv, policy: AccessPolicy, emails: string[]) {
  const include = [...new Set(emails)].sort().map(email => ({ email: { email } }));
  await cloudflare<AccessPolicy>(env, `/access/policies/${encodeURIComponent(policy.id)}`, 'PUT', {
    name: policy.name, decision: policy.decision, include,
    ...(policy.exclude ? { exclude: policy.exclude } : {}),
    ...(policy.require ? { require: policy.require } : {}),
    ...(policy.session_duration ? { session_duration: policy.session_duration } : {}),
    ...(policy.purpose_justification_required !== undefined ? { purpose_justification_required: policy.purpose_justification_required } : {}),
    ...(policy.purpose_justification_prompt ? { purpose_justification_prompt: policy.purpose_justification_prompt } : {}),
    ...(policy.approval_required !== undefined ? { approval_required: policy.approval_required } : {}),
    ...(policy.approval_groups ? { approval_groups: policy.approval_groups } : {}),
  });
}

export const accessConfigured = (env: AccessEnv) => !!(env.ACCESS_ACCOUNT_ID && env.ACCESS_POLICY_TOKEN);

async function assertAligned(db: D1Database, emails: string[]) {
  const stored = (await listUsers(db)).map(user => user.email).sort();
  if (JSON.stringify(stored) !== JSON.stringify([...new Set(emails)].sort())) {
    throw new Error('The admin user list and Cloudflare Access policy differ. Reconcile them before changing membership.');
  }
}

export async function addUser(db: D1Database, env: AccessEnv, email: string, name: string) {
  if (await activeUser(db, email)) throw new Error('This user already exists.');
  const policy = await loadPolicy(env), oldEmails = policyEmails(policy);
  await assertAligned(db, oldEmails);
  if (oldEmails.includes(email)) throw new Error('This email is already in Cloudflare Access. Review the policy before adding it again.');
  await savePolicy(env, policy, [...oldEmails, email]);
  try { await db.prepare("INSERT INTO admin_users (email, name, role) VALUES (?, ?, 'member')").bind(email, name).run(); }
  catch (error) { try { await savePolicy(env, policy, oldEmails); } catch { /* The app allowlist still prevents D1 access. */ } throw error; }
}

export async function updateUser(db: D1Database, env: AccessEnv, oldEmail: string, email: string, name: string) {
  const user = await activeUser(db, oldEmail);
  if (!user) throw new Error('User not found.');
  if (user.role === 'owner') throw new Error('The owner account cannot be changed here.');
  if (email === oldEmail) { await db.prepare('UPDATE admin_users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?').bind(name, oldEmail).run(); return; }
  if (await activeUser(db, email)) throw new Error('The new email already belongs to a user.');
  const policy = await loadPolicy(env), oldEmails = policyEmails(policy);
  await assertAligned(db, oldEmails);
  if (!oldEmails.includes(oldEmail) || oldEmails.includes(email)) throw new Error('Cloudflare Access and the user list differ. Review the policy before changing this email.');
  await savePolicy(env, policy, [...oldEmails, email]);
  try { await db.prepare('UPDATE admin_users SET email = ?, name = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?').bind(email, name, oldEmail).run(); }
  catch (error) { try { await savePolicy(env, policy, oldEmails); } catch { /* Both emails still require a D1 row. */ } throw error; }
  await savePolicy(env, policy, [...oldEmails.filter(value => value !== oldEmail), email]);
}

export async function removeUser(db: D1Database, env: AccessEnv, email: string) {
  if (email === OWNER_EMAIL) throw new Error('The owner account cannot be removed.');
  if (!await activeUser(db, email)) throw new Error('User not found.');
  const policy = await loadPolicy(env), oldEmails = policyEmails(policy);
  await assertAligned(db, oldEmails);
  if (!oldEmails.includes(email)) throw new Error('Cloudflare Access and the user list differ. Review the policy before removing this user.');
  await db.prepare('DELETE FROM admin_users WHERE email = ?').bind(email).run();
  await savePolicy(env, policy, oldEmails.filter(value => value !== email));
}
