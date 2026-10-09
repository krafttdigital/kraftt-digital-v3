import { blankLine, copy, uid, type Quotation, type LineItem } from './model';
import type { CatalogueItem } from './catalogue';

export function handoverFor(item: CatalogueItem) {
  if (item.kind === 'bundle') return 'Agreed final files, deliverables and relevant access for each included bundle component after full payment.';
  if (/Brand|Creative/i.test(item.group)) return 'Approved final design assets in the formats specified in the deliverables, plus agreed guidelines and source files only where expressly included.';
  if (/Copywriting/i.test(item.group)) return 'Approved copy in the agreed editable document format.';
  if (/Marketplace/i.test(item.group)) return 'Completed agreed listings, catalogue records and relevant platform access; the client retains account ownership.';
  if (/Software|App/i.test(item.group)) return 'Agreed working build, operating notes, project files and relevant access as specified in the deliverables.';
  return 'Completed agreed deliverables, relevant files and access in the handover format specified above, after full payment.';
}
function selectedLine(item: CatalogueItem): LineItem { return { ...blankLine(item.name, item.fee), id: `catalogue-${item.id}`, description: '', deliverables: [], included: [], pricing: item.kind === 'bundle' ? 'bundle' : 'fixed', delivery: item.delivery, exclusions: item.exclusions, handover: handoverFor(item) }; }
export function toggleService(q: Quotation, item: CatalogueItem, packageId: string, checked: boolean) {
  if (q.status === 'finalised') return q;
  const next = copy(q), pkg = next.packages.find(p => p.id === packageId); if (!pkg) return q;
  const id = `catalogue-${item.id}`;
  pkg.lines = pkg.lines.filter(l => l.id !== id && (l.name.trim() || l.fee !== '' || l.description));
  if (checked) pkg.lines.push({ ...selectedLine(item), name: item.period ? `${item.name} — first ${item.period}` : item.name, delivery: item.period ? `First ${item.period}; start date to be agreed` : item.delivery });
  next.modifiedAt = new Date().toISOString(); return next;
}
export function toggleOptional(q: Quotation, item: CatalogueItem, checked: boolean) {
  if (q.status === 'finalised' || item.period) return q;
  const next = copy(q), id = `optional-${item.id}`;
  next.addOns = next.addOns.filter(a => a.id !== id);
  next.scenarios = next.scenarios.map(s => ({ ...s, addOnIds: s.addOnIds.filter(a => a !== id) }));
  if (checked) next.addOns.push({ ...selectedLine(item), id, appliesTo: [], selected: false });
  next.modifiedAt = new Date().toISOString(); return next;
}
export function toggleOngoing(q: Quotation, item: CatalogueItem, checked: boolean) {
  if (q.status === 'finalised' || !item.period) return q;
  const next = copy(q), id = `ongoing-${item.id}`;
  next.recurring = next.recurring.filter(r => r.id !== id);
  if (checked) next.recurring.push({ id, name: item.name, fee: item.fee, period: item.period, alternativeGroup: item.recurringGroup ?? item.group, selected: false, coverage: '', start: '', notice: q.termSettings.cancellationNotice, notes: '' });
  next.modifiedAt = new Date().toISOString(); return next;
}
export function addComparisonOption(q: Quotation) {
  const next = copy(q), id = uid(), name = `Option ${q.packages.length + 1}`;
  next.packages.push({ id, name, description: '', recommended: false, why: '', delivery: '', lines: [] });
  next.scenarios.push({ id: uid(), name, packageId: id, addOnIds: [], display: true }); next.mode = 'comparison'; return next;
}
