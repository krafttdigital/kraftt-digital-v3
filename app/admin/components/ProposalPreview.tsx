'use client';
import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

/** Keep page wrappers and their scroll container mounted when an edited PDF arrives. */
export function ProposalPreview({ url, title, updating, generationError }: { url?: string; title: string; updating: boolean; generationError?: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [rendering, setRendering] = useState(false);
  useEffect(() => {
    if (!url || !viewport.current) return;
    const root = viewport.current;
    let cancelled = false;
    let document: PDFDocumentProxy | undefined;
    let observer: IntersectionObserver | undefined;
    let loading: ReturnType<typeof import('pdfjs-dist')['getDocument']> | undefined;
    const tasks = new Set<RenderTask>();
    const pending = new Set<number>();
    const rendered = new Set<number>();
    async function render(index: number, holder: HTMLElement) {
      if (!document || cancelled || pending.has(index) || rendered.has(index)) return;
      pending.add(index);
      try {
        const pdfPage = await document.getPage(index + 1);
        if (cancelled) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const scale = Math.max(1, holder.clientWidth || 600) / base.width;
        const view = pdfPage.getViewport({ scale: scale * Math.min(window.devicePixelRatio || 1, 2) });
        const canvas = window.document.createElement('canvas');
        canvas.width = Math.ceil(view.width);
        canvas.height = Math.ceil(view.height);
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `${title}, page ${index + 1}`);
        const task = pdfPage.render({ canvas, viewport: view });
        tasks.add(task);
        try { await task.promise; } finally { tasks.delete(task); }
        if (!cancelled) { holder.replaceChildren(canvas); rendered.add(index); }
      } catch (cause) {
        if (!cancelled) setError((cause as Error).message || 'This PDF page could not be displayed.');
      } finally { pending.delete(index); }
    }
    async function load() {
      setRendering(true);
      setError('');
      try {
        const pdfjs = await import('pdfjs-dist');
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = '/admin-assets/pdf.worker.min.mjs';
        loading = pdfjs.getDocument({ url });
        document = await loading.promise;
        if (cancelled) return;
        // Preserve the visible page and the offset inside it, even if earlier pages change size.
        const holders = Array.from(root.children) as HTMLElement[];
        const anchor = holders.findIndex(holder => holder.offsetTop + holder.offsetHeight > root.scrollTop);
        const old = holders[Math.max(0, anchor)];
        const fraction = old ? (root.scrollTop - old.offsetTop) / Math.max(1, old.offsetHeight) : 0;
        const first = await document.getPage(1);
        if (cancelled) return;
        const size = first.getViewport({ scale: 1 });
        for (let i = 0; i < document.numPages; i++) {
          const holder = holders[i] || window.document.createElement('div');
          holder.className = 'admin-proposal-pdf-page';
          holder.dataset.page = String(i + 1);
          holder.style.aspectRatio = `${size.width} / ${size.height}`;
          if (!holder.parentNode) root.appendChild(holder);
        }
        while (root.children.length > document.numPages) root.lastElementChild?.remove();
        const next = root.children[Math.min(Math.max(0, anchor), document.numPages - 1)] as HTMLElement;
        if (next) root.scrollTop = next.offsetTop + fraction * next.offsetHeight;
        setPages(document.numPages);
        setPage(Math.min(Math.max(1, anchor + 1), document.numPages));
        observer = new IntersectionObserver(entries => {
          for (const entry of entries) if (entry.isIntersecting) {
            const holder = entry.target as HTMLElement;
            void render(Number(holder.dataset.page) - 1, holder);
          }
        }, { root, rootMargin: '500px 0px' });
        Array.from(root.children).forEach(holder => observer?.observe(holder));
      } catch (cause) {
        if (!cancelled) setError((cause as Error).message || 'The PDF preview could not be loaded.');
      } finally { if (!cancelled) setRendering(false); }
    }
    void load();
    return () => { cancelled = true; observer?.disconnect(); tasks.forEach(task => task.cancel()); void loading?.destroy(); };
  }, [url, title]);
  function move(next: number) {
    const root = viewport.current;
    const target = root?.children[next - 1] as HTMLElement | undefined;
    if (root && target) { root.scrollTop = target.offsetTop; setPage(next); }
  }
  return <>
    <div className="admin-proposal-preview-toolbar">
      <button type="button" disabled={page <= 1} onClick={() => move(page - 1)} aria-label="Previous preview page">‹</button>
      <span>Page {page} / {pages || '…'}</span>
      <button type="button" disabled={page >= pages} onClick={() => move(page + 1)} aria-label="Next preview page">›</button>
      <small role="status">{updating || rendering ? 'Updating…' : 'Preview'}</small>
    </div>
    {(generationError || error) && <p className="admin-error" role="alert">{generationError || error}</p>}
    <div className="admin-proposal-pdf-scroll" ref={viewport} tabIndex={0} aria-label={`${title} PDF pages`} onScroll={() => {
      const root = viewport.current;
      if (!root) return;
      const index = Array.from(root.children).findIndex(element => {
        const holder = element as HTMLElement;
        return holder.offsetTop + holder.offsetHeight > root.scrollTop + 20;
      });
      if (index >= 0) setPage(index + 1);
    }} />
    {url && <a className="admin-preview-link" href={url} target="_blank" rel="noreferrer">Open PDF in a new tab</a>}
  </>;
}

