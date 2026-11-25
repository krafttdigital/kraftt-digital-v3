'use client';
import { useEffect, useRef, useState } from 'react';
import { copy, createCaseStudy, createQuotation, duplicateQuotation, emptyWorkspace, finalise, type CaseStudy, type Quotation, type Workspace } from '../../../lib/quotation/model';
import { importBackup, loadWorkspace, saveWorkspace, validateWorkspace } from '../../../lib/quotation/storage';
import { generateQuotationPdf } from '../../../lib/quotation/pdf';
import { caseStudyFilename, generateCaseStudyHtml, generateCaseStudyPdf } from '../../../lib/quotation/case-study-export';
import { createBusinessDocument, documentKinds, documentNames, finaliseDocument, type BusinessDocument, type DocumentKind } from '../../../lib/documents/model';
import { generateBusinessPdf } from '../../../lib/documents/pdf';
import type { CatalogueItem } from '../../../lib/quotation/catalogue';
import { Clients } from './Clients';
import { CaseStudies } from './CaseStudies';
import { QuoteTermsEditor } from './QuoteTermsEditor';
import { BusinessDocumentEditor } from './BusinessDocumentEditor';
import { TermSettingsEditor } from './SettingsEditors';
import { loadCloudWorkspace, saveCloudWorkspace } from '../../../admin-cloudflare/workspace-api';
import { currentAdmin } from '../../../admin-cloudflare/users-api';
import { Users } from './Users';
import { compactDocumentLabel, documentViews, DocumentTemplates } from './DocumentTemplates';
import { AgencyDocumentHistory, type HistoryProjectActions } from './AgencyDocumentHistory';

type View = 'clients' | 'users' | 'case-studies' | 'quote' | DocumentKind | 'defaults' | 'backup';
function file(blob: Blob, name: string) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
const label = (view: View) => view === 'quote' ? 'Quote & Terms' : view === 'clients' ? 'Clients' : view === 'users' ? 'Users' : view === 'case-studies' ? 'Case Studies' : view === 'defaults' ? 'Company Defaults' : view === 'backup' ? 'Backup' : documentNames[view];
export function ERPWorkspace({ catalogue, onLogout, cloud = false, initialView = 'clients', initialClientId, initialProjectTitle, onFinalised, onWorkspaceSaved, documentTabs = false, historyProjectActions }: { catalogue: CatalogueItem[]; onLogout: () => void; cloud?: boolean; initialView?: View; initialClientId?: string; initialProjectTitle?: string; onFinalised?: (item: Quotation | BusinessDocument) => void; onWorkspaceSaved?: () => void; documentTabs?: boolean; historyProjectActions?: HistoryProjectActions }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null), [view, setView] = useState<View>(initialView), [activeId, setActiveId] = useState(''), [status, setStatus] = useState('Opening workspace…'), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const editorStage = useRef<HTMLDivElement>(null);
  const templatePanel = useRef<HTMLDivElement>(null);
  const [migration, setMigration] = useState<{ browser: Workspace; cloud: Workspace | null; revision: number } | null>(null);
  const latest = useRef<Workspace | null>(null), dirty = useRef(false), revision = useRef(0), inFlight = useRef<Promise<boolean> | null>(null), blocked = useRef(false);
  function change(next: Workspace): boolean { if (blocked.current) { setError('Cloud sync is paused. Export a backup and reload the cloud workspace before editing.'); return false; } try { validateWorkspace(next); } catch (cause) { setError((cause as Error).message); return false; } latest.current = next; dirty.current = true; setWorkspace(next); setStatus(cloud ? 'Unsaved cloud changes…' : 'Unsaved changes…'); setError(''); return true; }
  async function persist(next = latest.current): Promise<boolean> {
    if (!next || blocked.current) return false;
    if (!cloud) { try { saveWorkspace(window.localStorage, next); dirty.current = false; setStatus('Saved on this browser'); return true; } catch (cause) { setStatus('Not saved — export a backup'); setError((cause as Error).message); return false; } }
    if (inFlight.current) { await inFlight.current; if (blocked.current) return false; if (dirty.current) return persist(latest.current); return true; }
    const task = (async () => {
      try {
        // Local storage is a recovery copy; a successful API response is the save confirmation.
        try { saveWorkspace(window.localStorage, next); } catch { /* Cloud remains the source of truth. */ }
        setStatus('Saving to cloud…');
        revision.current = await saveCloudWorkspace(next, revision.current);
        onWorkspaceSaved?.();
        if (latest.current === next) { dirty.current = false; setStatus('Saved to cloud'); }
        else setStatus('New changes waiting to save…');
        setError('');
        return true;
      } catch (cause) {
        if ((cause as Error & { status?: number }).status === 409) blocked.current = true;
        setStatus('Not saved to cloud — export a backup');
        setError((cause as Error).message);
        return false;
      }
    })();
    inFlight.current = task;
    try { return await task; } finally { inFlight.current = null; if (dirty.current && !blocked.current && latest.current !== next) void persist(latest.current); }
  }
  useEffect(() => {
    let cancelled = false;
    async function open() {
      try {
        let local: Workspace | null = null;
        if (cloud) { try { local = loadWorkspace(window.localStorage); } catch { /* A corrupt browser cache must not block the cloud copy. */ } }
        else local = loadWorkspace(window.localStorage);
        if (!cloud) { const state = local || emptyWorkspace(); latest.current = state; setWorkspace(state); setStatus('Ready · local browser workspace'); return; }
        const remote = await loadCloudWorkspace();
        if (cancelled) return;
        revision.current = remote.revision;
        if (local && JSON.stringify(local) !== JSON.stringify(remote.workspace)) { setMigration({ browser: local, cloud: remote.workspace, revision: remote.revision }); setStatus('Choose which workspace to open'); return; }
        const state = remote.workspace || emptyWorkspace(); latest.current = state; setWorkspace(state); setStatus('Ready · cloud workspace');
      } catch (cause) { if (!cancelled) { setStatus('Cloud workspace unavailable'); setError(`Workspace could not be opened. Existing data is preserved. ${(cause as Error).message}`); } }
    }
    void open(); return () => { cancelled = true; };
  }, [cloud]);
  useEffect(() => { if (!cloud) return; let active = true; void currentAdmin().then(user => { if (active) setCanManageUsers(user.canManageUsers); }).catch(() => { if (active) setCanManageUsers(false); }); return () => { active = false; }; }, [cloud]);
  // persist reads the latest state from refs; re-schedule only when the workspace changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!dirty.current) return; const timer = setTimeout(() => { void persist(); }, cloud ? 1500 : 600); return () => clearTimeout(timer); }, [workspace, cloud]);
  useEffect(() => { const flush = () => { if (dirty.current && latest.current) { try { saveWorkspace(window.localStorage, latest.current); if (!cloud) dirty.current = false; } catch { /* Keep the leave warning for unsaved data. */ } } }; const leave = (event: BeforeUnloadEvent) => { flush(); if (dirty.current) { event.preventDefault(); event.returnValue = ''; } }; const hide = () => { if (document.visibilityState === 'hidden') flush(); }; window.addEventListener('beforeunload', leave); document.addEventListener('visibilitychange', hide); return () => { window.removeEventListener('beforeunload', leave); document.removeEventListener('visibilitychange', hide); }; }, [cloud]);
  function openDocument(item: Quotation | BusinessDocument) {
    setView('kind' in item ? item.kind : 'quote');
    setActiveId(item.id);
    if (documentTabs) requestAnimationFrame(() => {
      editorStage.current?.focus({ preventScroll: true });
      const top = editorStage.current?.getBoundingClientRect().top;
      if (top != null && (top < 66 || top > window.innerHeight * .6)) editorStage.current?.scrollIntoView({ block: 'start' });
    });
  }
  function backToTemplate() {
    setActiveId('');
    requestAnimationFrame(() => {
      const create = templatePanel.current?.querySelector<HTMLButtonElement>('.admin-template-create');
      create?.focus();
    });
  }
  async function refreshHistory() {
    if (!cloud) return;
    if ((inFlight.current || dirty.current) && !await persist()) {
      throw new Error('Save your changes before refreshing history.');
    }
    const before = latest.current;
    const remote = await loadCloudWorkspace();
    if (before !== latest.current || dirty.current) return;
    const state = remote.workspace || emptyWorkspace();
    revision.current = remote.revision;
    try { saveWorkspace(window.localStorage, state); } catch { /* The cloud copy is authoritative. */ }
    latest.current = state;
    setWorkspace(state);
    setActiveId(id => [...state.documents, ...state.quotations].some(item => item.id === id) ? id : '');
    onWorkspaceSaved?.();
  }
  function newDocument() {
    if (!workspace) return;
    const client = workspace.clients.find(item => item.id === initialClientId);
    const project = initialProjectTitle !== undefined ? initialProjectTitle : client?.projectTitle || '';
    if (view === 'quote') {
      const q = createQuotation(workspace); q.headline = 'Your project. A clear investment.';
      if (client) { q.client = copy(client); q.project = project; }
      if (change({ ...workspace, quotations: [...workspace.quotations, q] })) openDocument(q);
    } else if (documentKinds.includes(view as DocumentKind)) {
      const doc = createBusinessDocument(view as DocumentKind, workspace);
      if (client) { doc.client = copy(client); doc.project = project; }
      if (change({ ...workspace, documents: [...workspace.documents, doc] })) openDocument(doc);
    }
  }
  const q = workspace?.quotations.find(q => q.id === activeId), doc = workspace?.documents.find(d => d.id === activeId);
  function updateQuote(next: Quotation) { if (!workspace || q?.status === 'finalised') return; change({ ...workspace, quotations: workspace.quotations.map(item => item.id === next.id ? next : item) }); }
  function updateCaseStudy(next: CaseStudy) { if (!workspace) return; change({ ...workspace, caseStudies: workspace.caseStudies.map(item => item.id === next.id ? next : item) }); }
  function updateDocument(next: BusinessDocument) { if (!workspace || doc?.status === 'finalised') return; change({ ...workspace, documents: workspace.documents.map(item => item.id === next.id ? next : item) }); }
  async function download(item: Quotation | BusinessDocument, blackAndWhite = false) { setBusy(true); setError(''); try { const result = 'kind' in item ? await generateBusinessPdf(item, { blackAndWhite }) : await generateQuotationPdf(item, { blackAndWhite }); file(result.blob, result.filename); } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); } }
  async function downloadCaseStudy(study: CaseStudy, format: 'pdf' | 'html') {
    setBusy(true); setError('');
    try {
      const blob = format === 'pdf' ? await generateCaseStudyPdf(study) : new Blob([generateCaseStudyHtml(study)], { type: 'text/html;charset=utf-8' });
      file(blob, caseStudyFilename(study, format));
    } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); }
  }
  async function finish(item: Quotation | BusinessDocument) { if (!workspace || !window.confirm('Finalise this document as a read-only snapshot? Future changes require a revision.')) return; try { const issued = 'kind' in item ? finaliseDocument(item) : finalise(item); const next = 'kind' in item ? { ...workspace, documents: workspace.documents.map(d => d.id === item.id ? issued as BusinessDocument : d) } : { ...workspace, quotations: workspace.quotations.map(q => q.id === item.id ? issued as Quotation : q) }; change(next); if (await persist(next)) onFinalised?.(issued); } catch (cause) { setError((cause as Error).message); } }
  function duplicate(item: Quotation | BusinessDocument, revision = false) { if (!workspace) return; if ('kind' in item) { const next = createBusinessDocument(item.kind, workspace), value = { ...copy(item), id: next.id, number: next.number, status: 'draft' as const, finalisedAt: '', createdAt: next.createdAt, modifiedAt: next.modifiedAt, revisionOf: revision ? item.id : '' }; change({ ...workspace, documents: [...workspace.documents, value] }); openDocument(value); } else { const value = duplicateQuotation(item, workspace, revision); change({ ...workspace, quotations: [...workspace.quotations, value] }); openDocument(value); } }
  function remove(item: Quotation | BusinessDocument) { if (!workspace || !window.confirm(`Move ${item.number} to Recently deleted?`)) return; if ('kind' in item) change({ ...workspace, documents: workspace.documents.filter(d => d.id !== item.id), documentTrash: [...workspace.documentTrash, item] }); else change({ ...workspace, quotations: workspace.quotations.filter(q => q.id !== item.id), trash: [...workspace.trash, item] }); setActiveId(''); }
  function exportBackup() { if (!workspace) return; try { file(new Blob([JSON.stringify(validateWorkspace(workspace), null, 2)], { type: 'application/json' }), `Kraftt_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`); } catch (cause) { setError((cause as Error).message); } }
  async function restore(selected?: File) { if (!selected) return; try { if (selected.size > 10 * 1024 * 1024) throw new Error('Backup exceeds 10 MB.'); const restored = importBackup(await selected.text()); if (!window.confirm(`Restore ${restored.clients.length} clients, ${restored.caseStudies.length} case studies and ${restored.quotations.length + restored.documents.length} documents? This replaces ${cloud ? 'cloud' : 'browser'} data. Export a backup first.`)) return; if (cloud) revision.current = await saveCloudWorkspace(restored, revision.current); try { saveWorkspace(window.localStorage, restored); } catch (cause) { if (!cloud) throw cause; } latest.current = restored; dirty.current = false; setWorkspace(restored); setActiveId(''); setView('clients'); setError(''); setStatus(cloud ? 'Backup saved to cloud' : 'Backup restored'); } catch (cause) { setError(`Import rejected: ${(cause as Error).message}`); } }
  function exportBrowserCopy() { if (!migration) return; file(new Blob([JSON.stringify(migration.browser, null, 2)], { type: 'application/json' }), `Kraftt_Browser_Copy_${new Date().toISOString().slice(0, 10)}.json`); }
  function openCloudCopy() { if (!migration || !window.confirm('Open the cloud copy and replace this browser cache? Download the browser copy first if it contains work you need.')) return; const state = migration.cloud || emptyWorkspace(); try { saveWorkspace(window.localStorage, state); } catch { /* Cloud still opens if browser storage is full. */ } latest.current = state; setWorkspace(state); setMigration(null); setStatus('Ready · cloud workspace'); setError(''); }
  async function importBrowserCopy() { if (!migration || !window.confirm(`Copy this browser's ${migration.browser.clients.length} clients and ${migration.browser.documents.length + migration.browser.quotations.length} documents to cloud? This replaces the current cloud workspace. Export it first if needed.`)) return; try { revision.current = await saveCloudWorkspace(migration.browser, migration.revision); latest.current = migration.browser; setWorkspace(migration.browser); setMigration(null); setStatus('Browser data saved to cloud'); setError(''); } catch (cause) { setError((cause as Error).message); } }
  const items = workspace ? view === 'quote' ? workspace.quotations : workspace.documents.filter(d => d.kind === view) : [];
  const trash = workspace ? view === 'quote' ? workspace.trash : workspace.documentTrash.filter(d => d.kind === view) : [];
  const documentView = documentViews.find(type => type === view);
  const inEditor = Boolean(q || doc);
  const editors = <>
    {view === 'quote' && q && workspace && <QuoteTermsEditor key={q.id} quotation={q} companyTerms={workspace.settings.terms} clients={workspace.clients} catalogue={catalogue} onChange={updateQuote} onSave={() => persist()} onFinalise={() => finish(q)} onDownload={blackAndWhite => void download(q, blackAndWhite)} onRevision={() => duplicate(q, true)} saveStatus={status} />}
    {documentKinds.includes(view as DocumentKind) && doc && workspace && <BusinessDocumentEditor key={doc.id} document={doc} catalogue={catalogue} clients={workspace.clients} onChange={updateDocument} onSave={() => persist()} onFinalise={() => finish(doc)} onDownload={blackAndWhite => void download(doc, blackAndWhite)} onRevision={() => duplicate(doc, true)} saveStatus={status} />}
  </>;
  const savedDocuments = workspace && <>
    {items.map(item => <article className="admin-saved-card" key={item.id}>
      <div>
        <span className="admin-badge">{item.status}</span>
        <h2>{item.client.business || 'Client not selected'}</h2>
        <p>{item.number} · {item.project || 'Blank template'}</p>
        <small>Modified {new Date(item.modifiedAt).toLocaleString('en-IN')}</small>
      </div>
      <div className="admin-row-actions">
        <button className="admin-small-button" onClick={() => openDocument(item)}>Open</button>
        <button className="admin-small-button" onClick={() => duplicate(item)}>Duplicate</button>
        <button className="admin-small-button" disabled={busy} onClick={() => void download(item)}>PDF</button>
        <button className="admin-small-button admin-danger" onClick={() => remove(item)}>Delete</button>
      </div>
    </article>)}
    {trash.length > 0 && <details className="admin-detail-card">
      <summary>Recently deleted ({trash.length})</summary>
      <div className="admin-detail-inner">{trash.map(item => <p key={item.id}>{item.number} <button className="admin-small-button" onClick={() => {
        if ('kind' in item) change({ ...workspace, documents: [...workspace.documents, item], documentTrash: workspace.documentTrash.filter(d => d.id !== item.id) });
        else change({ ...workspace, quotations: [...workspace.quotations, item], trash: workspace.trash.filter(q => q.id !== item.id) });
      }}>Restore</button></p>)}</div>
    </details>}
  </>;
  return <main className="admin-root admin-workspace"><aside className="admin-sidebar" hidden={Boolean(historyProjectActions)}><div><div className="admin-wordmark">Kraftt<span>.</span></div><span className="admin-eyebrow">Company workspace</span></div><nav aria-label="Company modules">{(['clients', ...(cloud && canManageUsers ? ['users' as View] : []), 'case-studies', 'audit', 'quote', 'invoice', 'proposal', 'agreement', 'welcome', 'thankyou', 'report'] as View[]).map(v => <button className={view === v ? 'active' : ''} key={v} onClick={() => { setView(v); setActiveId(''); setError(''); }}>{label(v)}</button>)}</nav><div className="admin-sidebar-footer"><button onClick={() => { setView('defaults'); setActiveId(''); }}>Company Defaults</button><br /><button onClick={() => { setView('backup'); setActiveId(''); }}>Backup</button><p>{cloud ? 'Saved to Cloudflare D1.' : 'Stored on this browser.'}<br />Export JSON backups regularly.</p><button onClick={() => { if (!cloud) { void persist().then(saved => { if (saved) onLogout(); }); return; } if (dirty.current && !window.confirm('Changes have not reached the cloud. Export a backup before logging out. Continue?')) return; onLogout(); }}>Logout ↗</button></div></aside><div className="admin-main">{error && <div className="admin-banner admin-error" role="alert">{error}</div>}
    {migration && <section className="admin-page"><span className="admin-eyebrow">Cloud migration</span><h1>Choose your workspace</h1><p className="admin-lead">This browser has a different local copy. Choose it explicitly before editing so no work is overwritten.</p><p>Browser: {migration.browser.clients.length} clients, {migration.browser.documents.length + migration.browser.quotations.length} documents. Cloud: {migration.cloud?.clients.length || 0} clients, {(migration.cloud?.documents.length || 0) + (migration.cloud?.quotations.length || 0)} documents.</p><div className="admin-row-actions"><button className="admin-button" onClick={importBrowserCopy}>Move this browser copy to cloud</button><button className="admin-small-button" onClick={openCloudCopy}>Open cloud workspace</button><button className="admin-small-button" onClick={exportBrowserCopy}>Download browser copy</button></div></section>}
    {!migration && view === 'clients' && workspace && <Clients clients={workspace.clients} onSave={client => change({ ...workspace, clients: [...workspace.clients.filter(c => c.id !== client.id), client] })} onRemove={id => { if (cloud) { setError('Use the Kraftt Admin Clients page to archive a client. Linked records are preserved.'); return; } if (window.confirm('Remove this client from the directory? Saved documents retain their existing client details.')) change({ ...workspace, clients: workspace.clients.filter(c => c.id !== id) }); }} />}
    {!migration && view === 'users' && cloud && canManageUsers && <Users />}
    {!migration && view === 'case-studies' && workspace && <CaseStudies key={activeId} studies={workspace.caseStudies} clients={workspace.clients} activeId={activeId} onCreate={clientId => { const study = createCaseStudy(workspace.clients.find(client => client.id === clientId)); change({ ...workspace, caseStudies: [...workspace.caseStudies, study] }); setActiveId(study.id); }} onChange={updateCaseStudy} onDelete={id => { if (!window.confirm('Delete this case study intake? Export a backup first if you may need these notes later.')) return; change({ ...workspace, caseStudies: workspace.caseStudies.filter(study => study.id !== id) }); }} onOpen={setActiveId} onSave={() => { void persist(); }} onDownload={(study, format) => { void downloadCaseStudy(study, format); }} downloadBusy={busy} saveStatus={status} />}
    {workspace && documentView && (documentTabs ? <div ref={templatePanel}>
      <DocumentTemplates view={documentView} onSelect={type => { if (type !== view) { setView(type); setActiveId(''); setError(''); } }} onCreate={newDocument} onBack={backToTemplate} editing={inEditor}
        history={<AgencyDocumentHistory documents={[...workspace.quotations, ...workspace.documents]} onOpen={openDocument} onRefresh={refreshHistory} projectActions={historyProjectActions} />}>
        {inEditor ? <div ref={editorStage} className="admin-document-stage" tabIndex={-1} role="region" aria-label="Document editor">{editors}</div> : (items.length > 0 || trash.length > 0) && <div className="admin-template-saved">
          <h3>Saved {compactDocumentLabel(documentView)}</h3>{savedDocuments}
        </div>}
      </DocumentTemplates>
    </div> : inEditor ? editors : <section className="admin-page">
      <span className="admin-eyebrow">Document templates</span><h1>{label(view)}</h1>
      <p className="admin-lead">Choose a client, fill a blank template and export your document.</p>
      <button className="admin-button" onClick={newDocument}>+ New {label(view)}</button>{savedDocuments}
    </section>)}
    {view === 'defaults' && workspace && <section className="admin-page admin-settings-page"><h1>Company Defaults</h1><p className="admin-lead">Shared terms for new documents. Issued snapshots keep their agreed terms.</p><TermSettingsEditor value={workspace.settings.terms} onChange={terms => change({ ...workspace, settings: { ...workspace.settings, terms } })} /><p className="admin-help">Every document uses the same Kraftt. / Prepared for header and Kraftt Digital × Client footer. Quotation terms follow the supplied template.</p></section>}
    {view === 'backup' && <section className="admin-page"><h1>Workspace backup</h1><p className="admin-lead">Clients, case study notes, all document types, company defaults and saved quotations in one portable JSON file.</p><button className="admin-button" disabled={!workspace} onClick={exportBackup}>Export JSON</button><label className="admin-file-button">Import JSON<input type="file" accept=".json,application/json" onChange={event => { void restore(event.target.files?.[0]); event.target.value = ''; }} /></label></section>}
    {!workspace && !migration && (cloud ? <section className="admin-page"><h1>Cloud workspace unavailable</h1><p className="admin-lead">Existing data has not been changed.</p><button className="admin-button" onClick={() => window.location.reload()}>Retry connection</button></section> : <section className="admin-page"><h1>Restore workspace</h1><label className="admin-file-button">Import JSON backup<input type="file" accept=".json,application/json" onChange={event => void restore(event.target.files?.[0])} /></label></section>)}
    <p className="admin-help" role="status">{status}</p>
  </div></main>;
}
