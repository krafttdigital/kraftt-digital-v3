import { blankLine, blankPackage, copy, uid, type Quotation } from './model';
import { addOnIds, formatPrice, priceFor, regionalizePriceCopy, type PriceId } from '../../app/data/pricing';
import type { Service } from '../../app/data/services';
import type { Bundle } from '../../app/data/bundles';

export type CatalogueItem = {
  id: string; name: string; group: string; kind: 'service' | 'bundle'; fee: string;
  priceLabel: string; period: string; description: string; deliverables: string[];
  components: string[]; delivery: string; exclusions: string; notes: string;
  recurringGroup?: string;
};
function indiaPrice(id: PriceId | null) {
  const record = id ? priceFor(id, 'INR') : null;
  return {
    fee: record?.amount == null ? '' : String(record.amount),
    period: record?.cadence === 'monthly' ? 'month' : record?.cadence === 'yearly' ? 'year' : '',
    priceLabel: formatPrice(id, 'INR'),
  };
}

export function buildCatalogue(services: Service[], bundles: Bundle[]): CatalogueItem[] {
  // Add-ons repeat across tiers and services. Keep one entry for each name and INR price.
  const extras = new Map<string, CatalogueItem>();
  const addOns = services.flatMap(service => service.tiers.flatMap(tier => [
    ...addOnIds(tier.priceId).map(id => ({ name: priceFor(id, 'INR').name, price: indiaPrice(id) })),
    ...(tier.quotedAddOns ?? []).map(name => ({ name, price: indiaPrice(null) })),
  ]));
  for (const { name, price } of addOns) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const id = `addon-${slug}-${price.fee || 'custom'}-${price.period || 'once'}`;
    if (!extras.has(id)) extras.set(id, {
      id, name, group: 'Service add-ons', kind: 'service', ...price,
      description: name, deliverables: [], components: [], delivery: '', exclusions: '', notes: '',
      // Independent add-ons can be agreed together; monthly/annual maintenance are alternatives.
      recurringGroup: /^(Monthly|Annual) maintenance \/ support$/i.test(name) ? 'Maintenance / Support' : name,
    });
  }
  return [
    ...services.flatMap(service => service.tiers.map((tier, index) => ({
      id: `service-${service.slug}-${index}`, name: `${service.name} — ${tier.name}`, group: service.name, kind: 'service' as const,
      ...indiaPrice(tier.priceId),
      description: service.headline, deliverables: [...tier.deliverables], components: [], delivery: tier.timeline,
      exclusions: [...new Set([...service.notIncluded, ...tier.notIncluded])].join('\n'), notes: '',
    }))),
    ...extras.values(),
    ...bundles.map(bundle => ({
      id: `bundle-${bundle.slug}`, name: bundle.name, group: 'Bundles', kind: 'bundle' as const, ...indiaPrice(null),
      description: bundle.headline, deliverables: [],
      components: bundle.inclusions.map(component => `${component.title}: ${component.items.join('; ')}`),
      delivery: bundle.timeline, exclusions: bundle.notIncluded.join('\n'), notes: [bundle.scopeNote, regionalizePriceCopy(bundle.continuation, 'INR')].filter(Boolean).join('\n'),
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
    q.recurring.push({ id: uid(), name: item.name, fee: item.fee, period: item.period, alternativeGroup: item.recurringGroup ?? item.group, selected: false, coverage: [item.description, ...item.deliverables, item.exclusions && `Not included: ${item.exclusions}`].filter(Boolean).join('\n'), start: '', notice: q.termSettings.cancellationNotice, notes: item.notes }); return q;
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
