'use client';

import { useEffect, useState } from 'react';
import { changeAdminUser, loadAdminUsers, type AdminUserView } from '../../../admin-cloudflare/users-api';
import { Field } from './Fields';

export function Users() {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [ready, setReady] = useState(false), [accessConfigured, setAccessConfigured] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const [name, setName] = useState(''), [email, setEmail] = useState('');
  const [editing, setEditing] = useState(''), [editName, setEditName] = useState(''), [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    let active = true;
    void loadAdminUsers().then(result => { if (active) { setUsers(result.users); setAccessConfigured(result.accessConfigured); setReady(true); } })
      .catch(cause => { if (active) { setError((cause as Error).message); setReady(true); } });
    return () => { active = false; };
  }, []);

  async function run(method: 'POST' | 'PATCH' | 'DELETE', payload: Record<string, string>, done: string) {
    setBusy(true); setError(''); setMessage('');
    try {
      setUsers(await changeAdminUser(method, payload));
      setMessage(done);
      if (method === 'POST') { setName(''); setEmail(''); }
      if (method === 'PATCH') setEditing('');
    } catch (cause) {
      setError((cause as Error).message);
      // A cloud-policy failure can occur after the local user row changes.
      try { setUsers((await loadAdminUsers()).users); } catch { /* Keep the last known list. */ }
    } finally { setBusy(false); }
  }

  return <section className="admin-page admin-users-page">
    <span className="admin-eyebrow">Owner controls</span><h1>Users</h1>
    <p className="admin-lead">Manage who can open the shared admin workspace. Only krafttdigital@gmail.com can add, update or remove users.</p>
    {!ready && <p role="status">Loading users…</p>}
    {error && <p className="admin-banner admin-error" role="alert">{error}</p>}
    {message && <p className="admin-banner" role="status">{message}</p>}
    {ready && !accessConfigured && <p className="admin-banner" role="status">The Cloudflare Access policy connection is not configured. Existing users can continue to work. Adding, changing an email or removing a user is unavailable until that connection is set up.</p>}
    {ready && <>
      <div className="admin-card admin-users-add"><div><span className="admin-eyebrow">New member</span><h2>Add a user</h2><p>They will use their own Cloudflare Access email sign-in and the existing workspace password.</p></div>
        <form onSubmit={event => { event.preventDefault(); void run('POST', { name, email }, `${email.trim()} can now sign in.`); }}>
          <Field label="Name" value={name} onChange={setName} maxLength={100} /><Field label="Email address" type="email" value={email} onChange={setEmail} maxLength={254} />
          <button className="admin-button" type="submit" disabled={busy || !accessConfigured || !name.trim() || !email.trim()}>Add user</button>
        </form>
      </div>
      <div className="admin-users-list"><div className="admin-users-list-head"><h2>People with access</h2><span>{users.length} {users.length === 1 ? 'user' : 'users'}</span></div>
        {users.map(user => <article className="admin-saved-card admin-user-card" key={user.email}>
          {editing === user.email ? <form className="admin-user-edit" onSubmit={event => { event.preventDefault(); void run('PATCH', { oldEmail: user.email, email: editEmail, name: editName }, 'User updated.'); }}>
            <Field label="Name" value={editName} onChange={setEditName} maxLength={100} /><Field label="Email address" type="email" value={editEmail} onChange={setEditEmail} maxLength={254} />
            <div className="admin-row-actions"><button className="admin-button" type="submit" disabled={busy || !editName.trim() || !editEmail.trim() || (!accessConfigured && editEmail.trim().toLowerCase() !== user.email)}>Save changes</button><button className="admin-small-button" type="button" onClick={() => setEditing('')}>Cancel</button></div>
          </form> : <><div><span className="admin-badge">{user.role === 'owner' ? 'Owner' : 'Member'}</span><h2>{user.name}</h2><p>{user.email}</p><small>Added {new Date(user.createdAt).toLocaleDateString('en-IN')}</small></div>
            {user.role !== 'owner' && <div className="admin-row-actions"><button className="admin-small-button" type="button" disabled={busy} onClick={() => { setEditing(user.email); setEditName(user.name); setEditEmail(user.email); }}>Edit</button><button className="admin-small-button admin-danger" type="button" disabled={busy || !accessConfigured} onClick={() => { if (window.confirm(`Remove ${user.email} from the admin? They will lose access to the workspace.`)) void run('DELETE', { email: user.email }, 'User removed.'); }}>Remove</button></div>}</>}
        </article>)}
      </div>
    </>}
  </section>;
}
