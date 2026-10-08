'use client';

import { useState } from 'react';
import { addCatalogueItem, type CatalogueItem, type CatalogueDestination } from '../../../lib/quotation/catalogue';
import type { Quotation } from '../../../lib/quotation/model';
import { Field, SelectField } from './Fields';

export function CataloguePicker({ quotation, catalogue, onChange }: { quotation: Quotation; catalogue: CatalogueItem[]; onChange: (quotation: Quotation) => void }) {
  const [search, setSearch] = useState(''), [itemId, setItemId] = useState(''), [target, setTarget] = useState<CatalogueDestination>('scope'), [scopeId, setScopeId] = useState(''), [error, setError] = useState('');
  const filtered = catalogue.filter(item => `${item.group} ${item.name}`.toLowerCase().includes(search.toLowerCase()));
  const item = catalogue.find(item => item.id === itemId);
  const packageId = quotation.packages.some(p => p.id === scopeId) ? scopeId : quotation.selectedPackageId || quotation.packages[0]?.id || '';
  const destinations: [CatalogueDestination, string][] = [['scope', 'Billable service in this scope / option'], ['alternative', 'Separate alternative option'], ['addon', 'Optional add-on (initially unselected)'], ['component', 'Included bundle component (no extra charge)']];
  function add() {
    if (!item) return;
    try { onChange(addCatalogueItem(quotation, item, item.period ? 'recurring' : target, packageId)); setError(''); setItemId(''); } catch (cause) { setError((cause as Error).message); }
  }
  return <div className="admin-catalogue"><h3>Kraftt service catalogue</h3><p className="admin-help">Choose any published service tier or bundle, then tailor its scope and fee. Custom services can be entered directly below.</p><Field label="Find a service or bundle" value={search} onChange={setSearch} /><SelectField label="Service / tier / bundle" value={itemId} onChange={id => { setItemId(id); setError(''); }}><option value="">Choose from the catalogue…</option>{[...new Set(filtered.map(item => item.group))].map(group => <optgroup label={group} key={group}>{filtered.filter(item => item.group === group).map(item => <option key={item.id} value={item.id}>{item.name.replace(`${group} — `, '')} · {item.priceLabel}</option>)}</optgroup>)}</SelectField>
    {item && <><p className="admin-help">{item.description}<br />{item.period ? `${item.priceLabel} · separate recurring billing` : item.fee ? `${item.priceLabel} · copied as editable INR pricing` : 'Custom quote · enter the agreed fee after adding'}</p>{!item.period && <SelectField label="Add as" value={target} onChange={v => setTarget(v as CatalogueDestination)}>{destinations.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</SelectField>}{!item.period && ['scope', 'component'].includes(target) && <SelectField label="Receiving scope / option" value={packageId} onChange={setScopeId}>{quotation.packages.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}</SelectField>}<button className="admin-small-button" type="button" onClick={add}>{item.period ? 'Add separate recurring service' : 'Add to quotation'}</button></>}
    {error && <p className="admin-error" role="alert">{error}</p>}
  </div>;
}
