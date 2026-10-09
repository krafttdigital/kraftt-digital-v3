'use client';

import { useEffect, useState } from 'react';
import { generateQuotationPdf } from '../../../lib/quotation/pdf';
import type { Quotation } from '../../../lib/quotation/model';
import { PdfPreview } from './PdfPreview';

export function DocumentPreview({ quotation, blackAndWhite = false }: { quotation: Quotation; blackAndWhite?: boolean }) {
  const [state, setState] = useState<{ source: Quotation; blackAndWhite: boolean; url?: string; pages?: number; error?: string } | null>(null);
  const preview = state?.source.id === quotation.id && state.url ? state : null;
  const error = state?.source === quotation && state.blackAndWhite === blackAndWhite ? state.error : '';
  const loading = state?.source !== quotation || state.blackAndWhite !== blackAndWhite;
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      try {
        const result = await generateQuotationPdf(quotation, { preview: true, blackAndWhite });
        if (!alive) return;
        const objectUrl = URL.createObjectURL(result.blob);
        setState({ source: quotation, blackAndWhite, url: objectUrl, pages: result.pages });
      } catch (cause) { if (alive) setState(previous => ({ source: quotation, blackAndWhite, url: previous?.source.id === quotation.id ? previous.url : undefined, pages: previous?.source.id === quotation.id ? previous.pages : undefined, error: (cause as Error).message })); }
    }, 650);
    return () => { alive = false; clearTimeout(timer); };
  }, [quotation, blackAndWhite]);
  useEffect(() => { const url = state?.url; return () => { if (url) URL.revokeObjectURL(url); }; }, [state?.url]);
  return <aside className="admin-preview" aria-label="Document preview"><div className="admin-preview-heading"><span>Live PDF preview</span><small>{preview ? `A4 · ${preview.pages} pages` : 'A4 · Quotation & Terms'}</small></div>
    <PdfPreview key={quotation.id} title="Quotation & Terms" url={preview?.url} updating={loading} generationError={error} />
  </aside>;
}
