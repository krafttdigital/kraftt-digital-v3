'use client';

import type { ReactNode, RefObject } from 'react';

export const formatINR = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);

export function revealResult(ref: RefObject<HTMLElement | null>) {
  window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

export function OptionQuestion({ label, value, options, onChange }: { label: string; value: string | null; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <div className="tool-question">
      <p>{label}</p>
      <div className="tool-options" role="group" aria-label={label}>
        {options.map((option) => <button type="button" key={option.value} className={`tool-option${value === option.value ? ' selected' : ''}`} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
      </div>
    </div>
  );
}

export function Field({ label, hint, children, wide = false }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return <label className={`tool-field${wide ? ' tool-field-wide' : ''}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export function ResultPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <div className="tool-result-panel"><p className="tool-eyebrow">{eyebrow}</p><h2>{title}</h2>{children}</div>;
}
