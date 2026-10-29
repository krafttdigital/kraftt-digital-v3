import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundled = await build({
  stdin: { contents: "export * from './admin-cloudflare/users.ts';", resolveDir: process.cwd(), sourcefile: 'admin-users-test-entry.ts', loader: 'ts' },
  bundle: true, format: 'esm', platform: 'node', target: 'node22', write: false,
});
const users = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const rows = new Map();
const db = {
  async exec() {},
  prepare(sql) {
    let args = [];
    return {
      bind(...values) { args = values; return this; },
      async first() {
        if (sql.startsWith('SELECT COUNT')) return { total: rows.size };
        if (sql.startsWith('SELECT email')) return rows.get(args[0]) || null;
        throw Error(`Unexpected SQL: ${sql}`);
      },
      async all() { return { results: [...rows.values()].sort((a, b) => a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : a.email.localeCompare(b.email)) }; },
      async run() {
        if (sql.startsWith('INSERT')) {
          const [email, name] = args;
          if (!sql.includes('OR IGNORE') && rows.has(email)) throw Error('Duplicate user');
          if (!rows.has(email)) rows.set(email, { email, name, role: sql.includes("'owner'") ? 'owner' : 'member', created_at: '2026-10-29', updated_at: '2026-10-29' });
        } else if (sql.startsWith('UPDATE admin_users SET name')) rows.get(args[1]).name = args[0];
        else if (sql.startsWith('UPDATE admin_users SET email')) { const row = rows.get(args[2]); rows.delete(args[2]); rows.set(args[0], { ...row, email: args[0], name: args[1] }); }
        else if (sql.startsWith('DELETE')) rows.delete(args[0]);
        else throw Error(`Unexpected SQL: ${sql}`);
        return { success: true };
      },
    };
  },
};

await users.ensureUsersTable(db);
assert.deepEqual((await users.listUsers(db)).map(user => user.email), [users.OWNER_EMAIL, users.INITIAL_MEMBER_EMAIL]);
assert.equal(users.normalizeEmail(' TEST@EXAMPLE.COM '), 'test@example.com');
assert.throws(() => users.normalizeEmail('invalid'), /valid email/);
assert.throws(() => users.normalizeName(' '), /Enter a name/);

const policy = { id: 'policy-id', name: 'Kraftt Digital Administrators', decision: 'allow', app_count: 1,
  include: [users.OWNER_EMAIL, users.INITIAL_MEMBER_EMAIL].map(email => ({ email: { email } })) };
const env = { ACCESS_ACCOUNT_ID: 'account-id', ACCESS_POLICY_TOKEN: 'test-only', ACCESS_AUD: 'admin-aud' };
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  if (String(url).includes('/access/apps?')) return Response.json({ success: true, result: [{ aud: 'admin-aud', policies: [{ id: policy.id }] }] });
  if (String(url).includes('/access/policies?')) return Response.json({ success: true, result: [policy] });
  if (String(url).includes('/access/policies/policy-id') && options.method === 'PUT') {
    const body = JSON.parse(options.body);
    policy.include = body.include;
    return Response.json({ success: true, result: policy });
  }
  throw Error(`Unexpected Cloudflare request: ${url}`);
};
try {
  assert.deepEqual(users.policyEmails(policy), [users.OWNER_EMAIL, users.INITIAL_MEMBER_EMAIL]);
  assert.throws(() => users.policyEmails({ ...policy, include: [{ everyone: {} }] }), /non-email rules/);
  assert.throws(() => users.policyEmails({ ...policy, app_count: 2 }), /dedicated/);
  await users.addUser(db, env, 'new@example.com', 'New Member');
  assert.ok(await users.activeUser(db, 'new@example.com'));
  assert.ok(users.policyEmails(policy).includes('new@example.com'));
  await users.updateUser(db, env, 'new@example.com', 'updated@example.com', 'Updated Member');
  assert.equal(await users.activeUser(db, 'new@example.com'), null);
  assert.equal((await users.activeUser(db, 'updated@example.com')).name, 'Updated Member');
  assert.ok(!users.policyEmails(policy).includes('new@example.com'));
  await users.removeUser(db, env, 'updated@example.com');
  assert.equal(await users.activeUser(db, 'updated@example.com'), null);
  assert.ok(!users.policyEmails(policy).includes('updated@example.com'));
  await assert.rejects(users.removeUser(db, env, users.OWNER_EMAIL), /cannot be removed/);
  await users.removeUser(db, env, users.INITIAL_MEMBER_EMAIL);
  await users.ensureUsersTable(db);
  assert.equal(await users.activeUser(db, users.INITIAL_MEMBER_EMAIL), null, 'removed bootstrap member is not recreated');
} finally { globalThis.fetch = originalFetch; }

console.log('Owner-only user directory and Access policy sync checks passed.');
