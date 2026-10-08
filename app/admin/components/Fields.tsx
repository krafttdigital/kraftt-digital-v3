'use client';

import type { ReactNode } from 'react';

export function Field({ label, value, onChange, type = 'text', hint, maxLength = 180 }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string; maxLength?: number }) {
  return <label className="admin-field"><span>{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} maxLength={maxLength} step={type === 'number' ? '0.01' : undefined} />{hint && <small>{hint}</small>}</label>;
}
export function TextField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className="admin-field"><span>{label}</span><textarea value={value} rows={rows} maxLength={20000} onChange={event => onChange(event.target.value)} /></label>;
}
export function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="admin-field"><span>{label}</span><select value={value} onChange={event => onChange(event.target.value)}>{children}</select></label>;
}
export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="admin-check"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /><span>{label}</span></label>;
}
export function move<T>(items: T[], index: number, delta: number): T[] {
  const next = [...items], target = index + delta;
  if (target < 0 || target >= items.length) return next;
  [next[index], next[target]] = [next[target], next[index]]; return next;
}
export function OrderButtons({ label, index, total, reorder, remove, duplicate }: { label: string; index: number; total: number; reorder: (delta: number) => void; remove: () => void; duplicate?: () => void }) {
  return <div className="admin-row-actions"><button type="button" className="admin-icon-button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => reorder(-1)}>↑</button><button type="button" className="admin-icon-button" aria-label={`Move ${label} down`} disabled={index === total - 1} onClick={() => reorder(1)}>↓</button>{duplicate && <button type="button" className="admin-small-button" onClick={duplicate}>Duplicate</button>}<button type="button" className="admin-small-button admin-danger" aria-label={`Remove ${label}`} onClick={remove}>Remove</button></div>;
}
export function BulletEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (values: string[]) => void }) {
  return <div className="admin-bullets"><h4>{label}</h4>{values.map((value, index) => <div className="admin-bullet-row" key={index}><label className="admin-field"><span className="admin-sr-only">{label} {index + 1}</span><textarea value={value} rows={2} maxLength={20000} onChange={event => onChange(values.map((v, i) => i === index ? event.target.value : v))} /></label><OrderButtons label={`${label} ${index + 1}`} index={index} total={values.length} reorder={delta => onChange(move(values, index, delta))} remove={() => onChange(values.filter((_, i) => i !== index))} /></div>)}<button className="admin-small-button" type="button" onClick={() => onChange([...values, ''])}>+ Add {label.toLowerCase()}</button></div>;
}
