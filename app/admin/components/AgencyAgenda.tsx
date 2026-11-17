'use client';

import { agencyAgenda } from '../../../lib/admin-system/agenda';
import type { AgencyRecord } from '../../../lib/admin-system/model';

export function AgencyAgenda({ records, today, onOpenTasks }: { records: AgencyRecord[]; today: string; onOpenTasks: () => void }) {
  const items = agencyAgenda(records, today);
  return <section className="agency-card"><div className="agency-section-head"><div><h2>Upcoming actions</h2><p>Overdue and next seven days · India time</p></div><button className="agency-text-button" onClick={onOpenTasks}>Open tasks →</button></div>
    {items.slice(0, 7).map(item => <div className="agency-list-row" key={`${item.kind}:${item.id}`}><span><strong>{item.title}</strong><small>{item.kind} · {item.date.slice(0, 16)}</small></span><span className={item.date.slice(0, 10) < today ? 'agency-status-warn' : 'agency-pill'}>{item.date.slice(0, 10) < today ? 'Overdue' : 'Due'}</span></div>)}
    {!items.length && <p className="agency-empty">No upcoming actions. Add a task, meeting, renewal date or follow-up.</p>}
    {items.length > 7 && <p className="agency-help">Showing 7 of {items.length} upcoming actions.</p>}
  </section>;
}
