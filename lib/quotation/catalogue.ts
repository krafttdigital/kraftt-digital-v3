import { blankLine, blankPackage, copy, uid, type Quotation } from './model';

export type CatalogueItem = {
  id: string; name: string; group: string; kind: 'service' | 'bundle'; fee: string;
  priceLabel: string; period: string; description: string; deliverables: string[];
  components: string[]; delivery: string; exclusions: string; notes: string;
};
type ServiceSource = { slug: string; name: string; headline: string; notIncluded: string[]; tiers: { name: string; price: string; timeline: string; deliverables: string[]; notIncluded: string[] }[] };
type BundleSource = { slug: string; name: string; headline: string; price: string; timeline: string; deliverables: string[]; inclusions: { title: string; items: string[] }[]; notIncluded: string[]; scopeNote: string; continuation: string };
export function buildCatalogue(services: ServiceSource[], bundles: BundleSource[]): CatalogueItem[] {
  const fee = (value: string) => value.match(/₹\s*([\d,]+(?:\.\d{1,2})?)/)?.[1].replaceAll(',', '') || '';
  return [
    ...services.flatMap(service => service.tiers.map((tier, index) => ({
      id: `service-${service.slug}-${index}`, name: `${service.name} — ${tier.name}`, group: service.name, kind: 'service' as const,
      fee: fee(tier.price), priceLabel: tier.price, period: /\/month|per month/i.test(tier.price) ? 'month' : /\/year|per year/i.test(tier.price) ? 'year' : '',
      description: service.headline, deliverables: [...tier.deliverables], components: [], delivery: tier.timeline,
      exclusions: [...new Set([...service.notIncluded, ...tier.notIncluded])].join('\n'), notes: '',
    }))),
    ...bundles.map(bundle => ({
      id: `bundle-${bundle.slug}`, name: bundle.name, group: 'Bundles', kind: 'bundle' as const, fee: fee(bundle.price), priceLabel: bundle.price,
      period: '', description: bundle.headline, deliverables: [],
      components: bundle.inclusions.map(component => `${component.title}: ${component.items.join('; ')}`),
      delivery: bundle.timeline, exclusions: bundle.notIncluded.join('\n'), notes: [bundle.scopeNote, bundle.continuation].filter(Boolean).join('\n'),
    })),
  ];
}
export type CatalogueDestination = 'scope' | 'alternative' | 'addon' | 'component' | 'recurring';
export function addCatalogueItem(quotation: Quotation, item: CatalogueItem, destination: CatalogueDestination, packageId: string): Quotation {
  if (quotation.status === 'finalised') throw new Error('Create a revision to edit a finalised quotation.');
  if (item.period && destination !== 'recurring') throw new Error('This is recurring pricing. Add it as a recurring service, then edit its separate billing terms.');
  const q = copy(quotation); q.modifiedAt = new Date().toISOString();
  if (destination === 'recurring') {
    if (!item.period) throw new Error('This catalogue entry is a one-time service.');
    q.recurring.push({ id: uid(), name: item.name, fee: item.fee, period: item.period, alternativeGroup: item.group, selected: false, coverage: [item.description, ...item.deliverables, item.exclusions && `Not included: ${item.exclusions}`].filter(Boolean).join('\n'), start: '', notice: q.termSettings.cancellationNotice, notes: item.notes }); return q;
  }
  const line = { ...blankLine(item.name, item.fee), description: [item.description, item.notes].filter(Boolean).join('\n'), deliverables: [...item.deliverables], included: [...item.components], pricing: item.kind === 'bundle' ? 'bundle' as const : 'fixed' as const, delivery: item.delivery, exclusions: item.exclusions };
  if (destination === 'addon') { q.addOns.push({ ...line, selected: false, appliesTo: [] }); return q; }
  if (destination === 'alternative') {
    const pkg = { ...blankPackage(item.name, item.fee), lines: [line], delivery: item.delivery };
    const blank = q.packages.findIndex(p => !p.description && !p.why && !p.delivery && p.lines.every(l => !l.name.trim() && l.fee === '' && !l.description && !l.deliverables.length && !l.included.length));
    if (blank >= 0) { pkg.id = q.packages[blank].id; q.packages[blank] = pkg; }
    else q.packages.push(pkg);
    q.mode = 'comparison';
    // Offer the base alternative, never generate package/add-on permutations.
    const scenario = q.scenarios.find(s => s.packageId === pkg.id);
    if (scenario && blank >= 0) { scenario.name = pkg.name; scenario.addOnIds = []; scenario.display = true; }
    else q.scenarios.push({ id: uid(), name: pkg.name, packageId: pkg.id, addOnIds: [], display: true });
    return q;
  }
  const pkg = q.packages.find(p => p.id === packageId);
  if (!pkg) throw new Error('Choose a scope / option to receive this service.');
  if (destination === 'component') {
    const bundle = pkg.lines.find(l => l.pricing === 'bundle');
    if (!bundle) throw new Error('Add a bundle row to this scope first.');
    bundle.included.push([item.name, ...item.deliverables, ...item.components].join(': ')); return q;
  }
  // Replace only the untouched blank starter row; preserve all authored scope.
  pkg.lines = pkg.lines.filter(l => l.name.trim() || l.fee !== '' || l.description || l.deliverables.length || l.included.length);
  pkg.lines.push(line); return q;
}
