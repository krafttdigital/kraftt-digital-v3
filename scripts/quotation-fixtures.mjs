// Numeric verification fixtures only; studio examples are not application presets.
export function referenceQuotation(m, workspace, variant = 'kaushal') {
  const q = m.createQuotation(workspace, 'comparison');
  q.client.business = variant === 'kaushal' ? 'Kaushal Studio' : 'Aggarwal Clicks'; q.project = 'Website fixture';
  q.packages = [m.blankPackage('Growth Website', '45000'), m.blankPackage('Business Website', '25000')];
  q.packages.forEach(p => p.lines.forEach(l => { l.description = 'Agreed responsive pages, enquiry form and editable handover files.'; }));
  q.packages[0].recommended = true;
  q.addOns = [{ ...m.blankLine('GEO + AEO', '4000'), selected: false, appliesTo: [q.packages[1].id] }, { ...m.blankLine('Brand Starter', '12000'), selected: false, appliesTo: [] }];
  q.scenarios = q.packages.map(pkg => ({ id: m.uid(), name: pkg.name, packageId: pkg.id, addOnIds: [], display: true }));
  if (variant === 'aggarwal') q.packages.forEach(pkg => q.scenarios.push({ id: m.uid(), name: `${pkg.name} + Brand Starter`, packageId: pkg.id, addOnIds: [q.addOns[1].id], display: true }));
  q.recurring = ['month', 'year'].map((period, index) => ({ id: m.uid(), name: 'Maintenance', fee: index ? '12000' : '1500', period, alternativeGroup: 'maintenance', selected: false, coverage: 'Routine maintenance', start: '', notice: '30 days', notes: '' }));
  return q;
}
