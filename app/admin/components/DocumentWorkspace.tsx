'use client';
import { useEffect, useState } from 'react';
import { SESSION_KEY } from '../../../lib/quotation/storage';
import type { CatalogueItem } from '../../../lib/quotation/catalogue';
import { ERPWorkspace } from './ERPWorkspace';
const digest = process.env.NEXT_PUBLIC_DOCUMENT_WORKSPACE_PASSWORD_SHA256?.trim().toLowerCase() || '';
const configured = /^[a-f0-9]{64}$/.test(digest);
export function DocumentWorkspace({ catalogue }: { catalogue: CatalogueItem[] }) {
  const [ready, setReady] = useState(false), [unlocked, setUnlocked] = useState(false), [password, setPassword] = useState(''), [show, setShow] = useState(false), [error, setError] = useState(''), [checking, setChecking] = useState(false);
  useEffect(() => {
    // Hydrate the current tab's external session storage after SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setUnlocked(configured && sessionStorage.getItem(SESSION_KEY) === digest); } catch { setError('Enable browser session storage to open the workspace.'); }
    setReady(true);
  }, []);
  async function login(event: React.FormEvent) {
    event.preventDefault(); setChecking(true); setError('');
    try { const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)); setPassword(''); const actual = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join(''); if (!configured || actual !== digest) throw Error('Incorrect password. Please try again.'); sessionStorage.setItem(SESSION_KEY, digest); setUnlocked(true); } catch (cause) { setPassword(''); setError((cause as Error).message); } finally { setChecking(false); }
  }
  if (!ready) return <main className="admin-root admin-gate"><p>Opening Kraftt workspace…</p></main>;
  if (unlocked) return <ERPWorkspace catalogue={catalogue} onLogout={() => { try { sessionStorage.removeItem(SESSION_KEY); setUnlocked(false); setShow(false); } catch { setError('Session storage could not be cleared.'); } }} />;
  return <main className="admin-root admin-gate"><div className="admin-gate-card"><div className="admin-wordmark">Kraftt<span>.</span></div><span className="admin-eyebrow">Kraftt Digital</span><h1>Company Workspace</h1><p>Clients. Documents.<br />One considered workflow.</p><form onSubmit={login}><label className="admin-field"><span>Workspace password</span><div className="admin-password"><input type={show ? 'text' : 'password'} value={password} maxLength={256} autoComplete="off" disabled={!configured || checking} onChange={event => setPassword(event.target.value)} /><button type="button" onClick={() => setShow(v => !v)} disabled={!configured}>{show ? 'Hide' : 'Show'}</button></div></label>{(!configured || error) && <p className="admin-error" role="alert">{error || 'Configure the workspace digest in .env.local and restart the server.'}</p>}<button className="admin-button" type="submit" disabled={!configured || checking || !password}>{checking ? 'Checking…' : 'Login'}</button></form><small>Kraftt company workspace</small></div></main>;
}