'use client';

import { useState } from 'react';
import type { Quotation } from '../../../lib/quotation/model';
import type { BusinessDocument } from '../../../lib/documents/model';
import type { DocumentLink, Invoice, Project } from '../../../lib/admin-system/model';

export function AgencyDocumentHistory({ documents, query, links, projects, invoices, onRefresh, onLink, onAddLedger }: {
  documents: (BusinessDocument | Quotation)[]; query: string; links: DocumentLink[];
  projects: Project[]; invoices: Invoice[]; onRefresh: () => void;
  onLink: (doc: BusinessDocument | Quotation, projectId: string) => void;
  onAddLedger: (doc: BusinessDocument, projectId: string) => void;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const visible = documents.filter(item => `${item.number} ${item.client.business} ${item.project} ${'kind' in item ? item.kind : 'quote'}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="agency-card"><div className="agency-section-head"><div><h2>Document history</h2><p>Saved drafts and issued snapshots. PDFs are generated on demand.</p></div><button className="agency-small" onClick={onRefresh}>Refresh history</button></div>
    <div className="agency-table-wrap"><table><thead><tr><th>Number</th><th>Type</th><th>Client</th><th>Status</th><th>Modified</th><th>Project</th><th>Invoice ledger</th></tr></thead><tbody>{visible.map(doc => {
      const link = links.find(item => item.documentId === doc.id);
      const projectId = selected[doc.id] ?? link?.projectId ?? '';
      const related = projects.filter(item => item.clientId === doc.client.id);
      return <tr key={doc.id}><td>{doc.number}</td><td>{'kind' in doc ? doc.kind : 'Quote & Terms'}</td><td>{doc.client.business || '—'}</td><td>{doc.status}</td><td>{new Date(doc.modifiedAt).toLocaleDateString('en-IN')}</td><td>{related.length ? <div className="agency-ledger-link"><select aria-label={`Project for ${doc.number}`} value={projectId} onChange={event => setSelected({ ...selected, [doc.id]: event.target.value })}><option value="">Choose project</option>{related.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button disabled={!projectId || projectId === link?.projectId} onClick={() => onLink(doc, projectId)}>Link</button></div> : 'No project'}</td><td>{'kind' in doc && doc.kind === 'invoice' && doc.status === 'finalised' ? invoices.some(item => item.documentId === doc.id) ? 'Linked' : <button onClick={() => onAddLedger(doc, projectId)}>Add to ledger</button> : '—'}</td></tr>;
    })}</tbody></table></div>{!visible.length && <p className="agency-empty">No matching saved documents. Create one with a template below.</p>}
  </section>;
}
