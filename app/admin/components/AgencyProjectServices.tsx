'use client';

import { useState } from 'react';
import type { CatalogueItem } from '../../../lib/quotation/catalogue';

export function AgencyProjectServices({ catalogue, selected, onChange }: { catalogue: CatalogueItem[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const [search, setSearch] = useState('');
  const shown = catalogue.filter(item => selected.includes(item.id) || `${item.name} ${item.group}`.toLowerCase().includes(search.toLowerCase())).slice(0, 30);
  return <fieldset className="agency-services"><legend>Services in scope</legend><input aria-label="Find services" placeholder="Find a service or bundle" value={search} onChange={event => setSearch(event.target.value)} />
    <div>{shown.map(item => <label key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={event => onChange(event.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id))} /><span>{item.name}</span><small>{item.group}</small></label>)}</div>
    {!shown.length && <p>No matching catalogue services. You can still describe a custom scope above.</p>}
  </fieldset>;
}
