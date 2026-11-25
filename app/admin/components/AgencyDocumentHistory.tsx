'use client';

import { History, Search, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { Quotation } from '../../../lib/quotation/model';
import type { BusinessDocument } from '../../../lib/documents/model';
import type { DocumentLink, Invoice, Project } from '../../../lib/admin-system/model';
import { documentTitle } from './DocumentTemplates';

export type HistoryProjectActions = {
  links: DocumentLink[];
  projects: Project[];
  invoices: Invoice[];
  error: string;
  onLink: (doc: BusinessDocument | Quotation, projectId: string) => void;
  onAddLedger: (doc: BusinessDocument, projectId: string) => void;
};

export function AgencyDocumentHistory({ documents, onOpen, onRefresh, projectActions }: {
  documents: (BusinessDocument | Quotation)[];
  onOpen: (doc: BusinessDocument | Quotation) => void;
  onRefresh: () => Promise<void>;
  projectActions?: HistoryProjectActions;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const term = query.trim().toLowerCase();
  const visible = open ? documents.filter(item => {
    const type = documentTitle('kind' in item ? item.kind : 'quote');
    return [item.number, item.client.business, item.project, item.status, type].join(' ').toLowerCase().includes(term);
  }).sort((first, second) => second.modifiedAt.localeCompare(first.modifiedAt)) : [];

  function showHistory() {
    setOpen(true);
    setError('');
    dialog.current?.showModal();
    search.current?.focus();
  }

  async function refresh() {
    setRefreshing(true);
    setError('');
    try { await onRefresh(); }
    catch (cause) { setError((cause as Error).message); }
    finally { setRefreshing(false); }
  }

  return <>
    <button className="admin-history-trigger" type="button" aria-haspopup="dialog" onClick={showHistory}><History size={17} aria-hidden="true" /> History</button>
    <dialog className="admin-history-dialog" ref={dialog} aria-labelledby={id} onClose={() => setOpen(false)}>
      <div className="admin-history-heading">
        <h2 id={id}>Document history</h2>
        <button className="admin-history-close" type="button" onClick={() => dialog.current?.close()} aria-label="Close document history"><X size={20} aria-hidden="true" /></button>
      </div>
      <div className="admin-history-tools">
        <label><Search size={16} aria-hidden="true" /><input ref={search} type="search" aria-label="Search documents" placeholder="Search by client, number or type" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <button className="admin-small-button" type="button" disabled={refreshing} onClick={() => void refresh()}>{refreshing ? 'Refreshing…' : 'Refresh history'}</button>
      </div>
      {(error || projectActions?.error) && <p className="admin-error" role="alert">{error || projectActions?.error}</p>}
      {visible.length > 0 ? <div className="agency-table-wrap admin-history-table" tabIndex={0} role="region" aria-label="Saved documents">
        <table><thead><tr><th scope="col">Document</th><th scope="col">Client</th><th scope="col">Status</th><th scope="col">Modified</th>{projectActions && <><th scope="col">Project</th><th scope="col">Invoice ledger</th></>}<th scope="col">Action</th></tr></thead>
          <tbody>{visible.map(doc => {
            const type = documentTitle('kind' in doc ? doc.kind : 'quote');
            const link = projectActions?.links.find(item => item.documentId === doc.id);
            const projectId = selected[doc.id] ?? link?.projectId ?? '';
            const related = projectActions?.projects.filter(item => item.clientId === doc.client.id);
            return <tr key={doc.id}>
              <th scope="row">{doc.number}<small>{type}</small></th>
              <td>{doc.client.business || '—'}</td>
              <td className="admin-history-status">{doc.status}</td>
              <td>{new Date(doc.modifiedAt).toLocaleDateString('en-IN')}</td>
              {projectActions && <>
                <td>{related?.length ? <div className="agency-ledger-link"><select aria-label={`Project for ${doc.number}`} value={projectId} onChange={event => setSelected({ ...selected, [doc.id]: event.target.value })}><option value="">Choose project</option>{related.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button type="button" disabled={!projectId || projectId === link?.projectId} onClick={() => projectActions.onLink(doc, projectId)}>Link</button></div> : 'No project'}</td>
                <td>{'kind' in doc && doc.kind === 'invoice' && doc.status === 'finalised'
                  ? projectActions.invoices.some(item => item.documentId === doc.id) ? 'Linked' : <button type="button" onClick={() => projectActions.onAddLedger(doc, projectId)}>Add to ledger</button>
                  : '—'}</td>
              </>}
              <td><button type="button" aria-label={`Open ${doc.number}`} onClick={() => { dialog.current?.close(); onOpen(doc); }}>Open</button></td>
            </tr>;
          })}</tbody>
        </table>
      </div> : <p className="admin-history-empty">{term ? 'No documents match your search.' : 'Saved drafts and finalised documents will appear here.'}</p>}
    </dialog>
  </>;
}
