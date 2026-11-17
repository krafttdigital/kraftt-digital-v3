'use client';

import { useState } from 'react';
import { agencyAgenda } from '../../../lib/admin-system/agenda';
import type { AgencyRecord } from '../../../lib/admin-system/model';

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AgencyCalendar({ records }: { records: AgencyRecord[] }) {
  const [month, setMonth] = useState(today().slice(0, 7));
  const [selected, setSelected] = useState(today());
  const [year, part] = month.split('-').map(Number);
  const start = (new Date(Date.UTC(year, part - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, part, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((start + days) / 7) * 7 }, (_, index) => index - start + 1);
  const end = `${month}-${String(days).padStart(2, '0')}`;
  const items = agencyAgenda(records, end, 0).filter(item => item.date.startsWith(month));
  const selectedItems = items.filter(item => item.date.slice(0, 10) === selected);
  const move = (offset: number) => { const date = new Date(Date.UTC(year, part - 1 + offset, 1)); const next = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; setMonth(next); setSelected(`${next}-01`); };
  return <section className="agency-card agency-calendar"><div className="agency-section-head"><div><h2>Calendar</h2><p>Tasks, meetings, reminders and renewals · India time</p></div><div><button className="agency-small" onClick={() => move(-1)} aria-label="Previous month">←</button><strong>{new Date(Date.UTC(year, part - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</strong><button className="agency-small" onClick={() => move(1)} aria-label="Next month">→</button><button className="agency-small" onClick={() => { setMonth(today().slice(0, 7)); setSelected(today()); }}>Today</button></div></div>
    <div className="agency-calendar-grid" role="group" aria-label={`${month} calendar`}>{weekday.map(day => <span className="agency-calendar-weekday" key={day}>{day}</span>)}{cells.map((day, index) => day < 1 || day > days ? <span className="agency-calendar-empty" key={`empty-${index}`} /> : (() => { const date = `${month}-${String(day).padStart(2, '0')}`, count = items.filter(item => item.date.slice(0, 10) === date).length; return <button key={date} className={`${date === selected ? 'selected' : ''} ${date === today() ? 'today' : ''}`} aria-label={`${date}, ${count} items`} aria-pressed={date === selected} onClick={() => setSelected(date)}><strong>{day}</strong>{count > 0 && <small>{count} item{count === 1 ? '' : 's'}</small>}</button>; })())}</div>
    <h3>{selected} · {selectedItems.length} item{selectedItems.length === 1 ? '' : 's'}</h3>{selectedItems.map(item => <div className="agency-list-row" key={`${item.kind}:${item.id}`}><span><strong>{item.title}</strong><small>{item.kind} · {item.date.slice(0, 16)}</small></span></div>)}{!selectedItems.length && <p className="agency-empty">Nothing scheduled for this day.</p>}
  </section>;
}
