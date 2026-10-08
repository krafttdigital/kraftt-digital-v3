'use client';
import type { Client } from '../../../lib/quotation/model';
import { SelectField } from './Fields';
export function ClientSelector({ clients, value, onChange }: { clients: Client[]; value: Client; onChange: (client: Client) => void }) {
  return <SelectField label="Choose client" value={clients.some(c => c.id === value.id) ? value.id : ''} onChange={id => { const client = clients.find(c => c.id === id); if (client) onChange(structuredClone(client)); }}><option value="">{value.business ? `${value.business} (saved document client)` : 'Choose a client…'}</option>{clients.map(c => <option key={c.id} value={c.id}>{c.business}</option>)}</SelectField>;
}
