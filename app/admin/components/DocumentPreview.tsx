'use client';

import { useEffect, useState } from 'react';
import { generateQuotationPdf } from '../../../lib/quotation/pdf';
import type { Quotation } from '../../../lib/quotation/model';

export function DocumentPreview({ quotation, blackAndWhite = false }: { quotation: Quotation; blackAndWhite?: boolean }) {
  const [state, setState] = useState<{ source: Quotation; blackAndWhite: boolean; url?: string; pages?: number; error?: string } | null>(null);
  const preview = state?.source === quotation && state.blackAndWhite === blackAndWhite && state.url ? state : null;
  const error = state?.source === quotation && state.blackAndWhite === blackAndWhite ? state.error : '';
  const loading = state?.source !== quotation || state.blackAndWhite !== blackAndWhite;
  useEffect(() => {
    let alive = true, objectUrl = '';
    const timer = setTimeout(async () => {
      try {
        const result = await generateQuotationPdf(quotation, { preview: true, blackAndWhite });
        if (!alive) return;
        objectUrl = URL.createObjectURL(result.blob);
        setState({ source: quotation, blackAndWhite, url: objectUrl, pages: result.pages });
      } catch (cause) { if (alive) setState({ source: quotation, blackAndWhite, error: (cause as Error).message }); }
    }, 650);
    return () => { alive = false; clearTimeout(timer); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [quotation, blackAndWhite]);
  return <aside className="admin-preview" aria-label="Document preview"><div className="admin-preview-heading"><span>Live PDF preview</span><small>{preview ? `A4 · ${preview.pages} pages` : 'A4 · Quotation & Terms'}</small></div>
    {loading && <div className="admin-preview-message" role="status">Preparing your document…</div>}
    {error && <div className="admin-preview-message"><h3>Complete the document to preview</h3><p className="admin-prewrap">{error}</p></div>}
    {preview && <><iframe title="Quotation PDF preview" src={`${preview.url}#toolbar=0&navpanes=0&view=FitH`} /><a className="admin-preview-link" href={preview.url} target="_blank" rel="noreferrer">Open PDF in a new tab</a></>}
  </aside>;
}
