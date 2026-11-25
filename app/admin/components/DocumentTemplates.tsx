'use client';

import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { documentNames, type DocumentKind } from '../../../lib/documents/model';

export type DocumentView = 'quote' | DocumentKind;
export const documentViews = ['quote', 'invoice', 'proposal', 'agreement', 'audit', 'welcome', 'thankyou', 'report'] satisfies DocumentView[];
export const documentTitle = (type: DocumentView) => type === 'quote' ? 'Quote & Terms' : documentNames[type];

export const compactDocumentLabel = (type: DocumentView) => type === 'quote' ? 'quotes' : type === 'audit' ? 'audits' : type === 'thankyou' || type === 'welcome' ? documentTitle(type).toLowerCase() + ' letters' : documentTitle(type).toLowerCase() + 's';

const descriptions: Record<DocumentView, string> = {
  quote: 'Set out services, pricing, payment milestones and terms for a client.',
  invoice: 'Bill a client for completed work or a scheduled payment.',
  proposal: 'Present the recommended scope, investment and next steps.',
  agreement: 'Set out the agreed project details and client terms.',
  audit: 'Summarise verified findings and recommend what to improve.',
  welcome: 'Welcome a new client and share what happens next.',
  thankyou: 'Send a thank-you note at the end of a project.',
  report: 'Share performance, work completed and priorities for the next month.',
};

export function DocumentTemplates({ view, onSelect, onCreate, onBack, editing, history, children }: {
  view: DocumentView;
  onSelect: (view: DocumentView) => void;
  onCreate: () => void;
  onBack: () => void;
  editing: boolean;
  history: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  const tabs = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = tabs.current;
    const active = list?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    if (!list || !active) return;
    const bounds = list.getBoundingClientRect();
    const tab = active.getBoundingClientRect();
    if (tab.left < bounds.left) list.scrollLeft += tab.left - bounds.left - 4;
    if (tab.right > bounds.right) list.scrollLeft += tab.right - bounds.right + 4;
  }, [view]);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % documentViews.length; break;
      case 'ArrowLeft': next = (index + documentViews.length - 1) % documentViews.length; break;
      case 'Home': next = 0; break;
      case 'End': next = documentViews.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const tab = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
    tab?.focus({ preventScroll: true });
    onSelect(documentViews[next]);
  }

  return <div className="admin-document-library">
    <div className="admin-template-toolbar">
      <div ref={tabs} className="admin-template-tabs" role="tablist" aria-label="Document templates">
        {documentViews.map((type, index) => <button
          key={type}
          id={id + '-' + type}
          type="button"
          role="tab"
          aria-selected={type === view}
          aria-controls={id + '-' + type + '-panel'}
          tabIndex={type === view ? 0 : -1}
          onClick={() => onSelect(type)}
          onKeyDown={event => moveTab(event, index)}
        >{documentTitle(type)}</button>)}
      </div>
      {history}
    </div>
    {documentViews.map(type => <section key={type} hidden={type !== view} className="admin-template-panel" role="tabpanel" id={id + '-' + type + '-panel'} aria-labelledby={id + '-' + type}>
      {type === view && <>
      {editing ? <button type="button" className="admin-small-button admin-document-back" onClick={onBack}><ArrowLeft size={16} /> Back to template</button> : <div className="admin-template-overview">
        <div className="admin-template-icon"><FileText size={25} strokeWidth={1.6} aria-hidden="true" /></div>
        <div><h2>{documentTitle(view)}</h2><p>{descriptions[view]}</p></div>
        <button className="admin-template-create" type="button" onClick={onCreate}>Create {view === 'quote' ? 'quote' : view === 'audit' ? 'audit' : documentTitle(view).toLowerCase()} <ArrowRight size={17} /></button>
      </div>}
      {children}
      </>}
    </section>)}
  </div>;
}
