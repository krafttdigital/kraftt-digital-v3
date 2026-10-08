'use client';

import { blankLine, copy, uid, type Discount, type LineItem, type Package } from '../../../lib/quotation/model';
import { Check, Field, TextField, SelectField, BulletEditor, OrderButtons, move } from './Fields';

export function DiscountEditor({ label, value, onChange }: { label: string; value: Discount; onChange: (value: Discount) => void }) {
  return <div className="admin-grid"><SelectField label={label} value={value.kind} onChange={kind => onChange({ ...value, kind: kind as Discount['kind'] })}><option value="none">None</option><option value="fixed">Fixed amount (₹)</option><option value="percent">Percentage (%)</option></SelectField>{value.kind !== 'none' && <Field label={`${label} value`} value={value.value} type="number" onChange={amount => onChange({ ...value, value: amount })} />}</div>;
}
export function LineEditor({ item, onChange }: { item: LineItem; onChange: (item: LineItem) => void }) {
  const change = <K extends keyof LineItem>(key: K, value: LineItem[K]) => onChange({ ...item, [key]: value });
  return <div className="admin-line-editor">
    <Field label="Service name" value={item.name} onChange={v => change('name', v)} maxLength={100} />
    <TextField label="Description" value={item.description} onChange={v => change('description', v)} />
    <div className="admin-grid"><SelectField label="Pricing method" value={item.pricing} onChange={v => change('pricing', v as LineItem['pricing'])}><option value="fixed">Fixed fee</option><option value="quantity">Quantity × unit rate</option><option value="bundle">Bundle fee</option></SelectField>{item.pricing !== 'quantity' && <Field label="Fee (₹)" value={item.fee} type="number" onChange={v => change('fee', v)} />}</div>
    {item.pricing === 'quantity' && <div className="admin-grid"><Field label="Quantity" type="number" value={item.quantity} onChange={v => change('quantity', v)} hint="Greater than zero; up to 3 decimal places." /><Field label="Unit rate (₹)" type="number" value={item.unitRate} onChange={v => change('unitRate', v)} /></div>}
    <Check label="Complimentary — no charge" checked={item.complimentary} onChange={v => change('complimentary', v)} />
    <Field label="Standard / reference value (₹, optional)" value={item.referenceValue} type="number" onChange={v => change('referenceValue', v)} hint="Use the value of this entire row; included bundle components are not charged separately." />
    {!item.complimentary && <DiscountEditor label="Item discount" value={item.discount} onChange={v => change('discount', v)} />}
    <BulletEditor label="Deliverable" values={item.deliverables} onChange={v => change('deliverables', v)} />
    {item.pricing === 'bundle' && <BulletEditor label="Included component" values={item.included} onChange={v => change('included', v)} />}
    <Field label="Service delivery estimate" value={item.delivery} onChange={v => change('delivery', v)} />
    <TextField label="Exclusions" value={item.exclusions} onChange={v => change('exclusions', v)} rows={2} />
    <TextField label="Handover details" value={item.handover} onChange={v => change('handover', v)} rows={2} />
  </div>;
}
export function PackageEditor({ item, onChange }: { item: Package; onChange: (item: Package) => void }) {
  const change = <K extends keyof Package>(key: K, value: Package[K]) => onChange({ ...item, [key]: value });
  return <div className="admin-package-editor">
    <div className="admin-grid"><Field label="Package name" value={item.name} onChange={v => change('name', v)} maxLength={100} /><Field label="Package delivery estimate" value={item.delivery} onChange={v => change('delivery', v)} /></div>
    <TextField label="Package description" value={item.description} onChange={v => change('description', v)} />
    <Check label="Recommended package" checked={item.recommended} onChange={v => change('recommended', v)} />
    <TextField label="Why choose this" value={item.why} onChange={v => change('why', v)} rows={2} />
    {item.lines.map((line, index) => <details className="admin-detail-card" key={line.id} open={item.lines.length === 1 || undefined}><summary><span>{String(index + 1).padStart(2, '0')} · {line.name || 'Unnamed service'}</span></summary><div className="admin-detail-inner"><OrderButtons label={line.name || 'service'} index={index} total={item.lines.length} reorder={delta => change('lines', move(item.lines, index, delta))} remove={() => change('lines', item.lines.filter(l => l.id !== line.id))} duplicate={() => change('lines', [...item.lines.slice(0, index + 1), { ...copy(line), id: uid() }, ...item.lines.slice(index + 1)])} /><LineEditor item={line} onChange={next => change('lines', item.lines.map(l => l.id === line.id ? next : l))} /></div></details>)}
    <button className="admin-small-button" type="button" onClick={() => change('lines', [...item.lines, blankLine()])}>+ Add billable service</button>
  </div>;
}
