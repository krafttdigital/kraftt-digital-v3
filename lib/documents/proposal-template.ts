import type { BusinessDocument, DocumentField } from './model';
import { blankLine, calculateLine, decimal, paymentPreset, paymentSchedule, uid, type Discount } from '../quotation/model';
import type { CatalogueItem } from '../quotation/catalogue';
export const proposalTemplateKey = 'KRAFTT_PROPOSAL_V1';
export const sectionKinds = ['cover','overview','observations','recommendation','scope','timeline','investment','terms','beyond','closing','custom'] as const;
export const componentKinds = ['text','stats','observations','journey','timeline','checklist','comparison','callout','pillars','scope'] as const;
export const serviceKinds = ['priced','bundle','included','complimentary','optional','alternative','recurring'] as const;
export type ProposalRow = { id: string; label: string; value: string; detail: string; highlight: boolean };
export type ProposalComponent = { id: string; type: typeof componentKinds[number]; title: string; note: string; enabled: boolean; rows: ProposalRow[] };
export type ProposalSection = { id: string; kind: typeof sectionKinds[number]; enabled: boolean; eyebrow: string; headline: string; body: string; quote: string; footerNote?: string; components: ProposalComponent[] };
export type ProposalService = { id: string; kind: typeof serviceKinds[number]; name: string; summary?: string; description: string; delivery: string; pricing: 'fixed' | 'quantity'; fee: string; quantity: string; unitRate: string; referenceValue: string; period: string };
export type ProposalSettings = { packageName: string; pricingMode?: 'itemised' | 'custom'; packageValue?: string; discount: Discount; discountLabel: string; payment: '50/50' | '60/40' | '70/30'; firstTrigger: string; finalTrigger: string; investmentNote: string; showValueBar: boolean; preparedBy: string };
export const proposalRow = (): ProposalRow => ({ id: uid(), label: '', value: '', detail: '', highlight: false });
export const proposalComponent = (type: ProposalComponent['type']): ProposalComponent => ({ id: uid(), type, title: '', note: '', enabled: true, rows: [proposalRow()] });
export const proposalService = (): ProposalService => ({ id: uid(), kind: 'priced', name: '', summary: '', description: '', delivery: '', pricing: 'fixed', fee: '', quantity: '1', unitRate: '', referenceValue: '', period: '' });
export function serviceFromCatalogue(item: CatalogueItem): ProposalService { return { ...proposalService(), kind: item.period ? 'recurring' : item.kind === 'bundle' ? 'bundle' : 'priced', name: item.name, description: [item.description,...item.deliverables,...item.components,item.exclusions && 'Not included: ' + item.exclusions,item.notes].filter(Boolean).join('\n'), fee: item.fee, delivery: item.delivery, period: item.period }; }
export function proposalSection(kind: ProposalSection['kind'] = 'custom'): ProposalSection { const names: Record<ProposalSection['kind'],string> = { cover:'Growth Proposal', overview:'Overview', observations:'What We Observed', recommendation:'What We Recommend', scope:'Scope of Work', timeline:'Timeline', investment:'Investment', terms:'Terms', beyond:'Beyond This Scope', closing:"Let's Talk", custom:'Custom Section' }; return { id: uid(), kind, enabled: kind !== 'beyond', eyebrow: names[kind], headline: '', body: '', quote: '', components: [] }; }
export function createProposalFields(): DocumentField[] {
  const settings: ProposalSettings = { packageName:'', pricingMode:'itemised', packageValue:'', discount:{kind:'none',value:''}, discountLabel:'', payment:'50/50', firstTrigger:'To begin work', finalTrigger:'On delivery', investmentNote:'', showValueBar:false, preparedBy:'' };
  const sections = sectionKinds.filter(kind => kind !== 'custom').map(kind => { const section = proposalSection(kind); if(kind==='scope')section.components.push(proposalComponent('scope')); if(kind==='overview'){const c=proposalComponent('stats');c.rows=Array.from({length:3},proposalRow);section.components.push(c);} if(kind==='recommendation'){const c=proposalComponent('pillars');c.rows=Array.from({length:4},proposalRow);section.components.push(c);} if (kind === 'observations') section.components.push(proposalComponent('observations')); if (kind === 'timeline') { const c=proposalComponent('timeline'); c.rows=['Proposal Review','Kickoff','Design & Build','Review','Launch'].map(label=>({...proposalRow(),label})); section.components.push(c); } if(kind==='terms') { const c=proposalComponent('checklist'); c.title='What you will need at kickoff'; section.components.push(c); } return section; });
  return [{id:uid(),label:'Proposal template',placeholder:proposalTemplateKey,value:'1'}, {id:uid(),label:'Investment & payment settings',placeholder:'PROPOSAL_SETTINGS',value:JSON.stringify(settings)}, ...sections.map(s=>({id:s.id,label:s.eyebrow,placeholder:'PROPOSAL_SECTION_'+s.id,value:JSON.stringify(s)})), ...[proposalService()].map(s=>({id:s.id,label:'Service',placeholder:'PROPOSAL_SERVICE_'+s.id,value:JSON.stringify(s)}))];
}
export function isTemplateProposal(doc: BusinessDocument) { return doc.kind === 'proposal' && doc.fields.some(f=>f.placeholder===proposalTemplateKey && f.value==='1'); }
function object(value: unknown): asserts value is Record<string,unknown> { if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Expected a structured proposal component.'); }
function text(value: unknown, limit=12000): asserts value is string { if(typeof value!=='string' || value.length>limit) throw new Error('Proposal text exceeds its allowed length.'); }
function flag(value: unknown): asserts value is boolean { if(typeof value!=='boolean') throw new Error('Invalid proposal toggle.'); }
function member(value: unknown, allowed: readonly string[]) { if(typeof value!=='string' || !allowed.includes(value)) throw new Error('Unsupported proposal component type.'); }
function id(value: unknown) { text(value,100); if(!/^[a-zA-Z0-9_-]+$/.test(value)) throw new Error('Invalid proposal component ID.'); }
function unique(items: {id:string}[]) { if(new Set(items.map(i=>i.id)).size!==items.length) throw new Error('Duplicate proposal component IDs.'); }
export function readProposal(doc: BusinessDocument): {settings:ProposalSettings;sections:ProposalSection[];services:ProposalService[]} {
  const parse=(field:DocumentField)=>{ if(field.value.length>20000) throw new Error('Keep each proposal section within 20,000 characters; split long sections.'); try{return JSON.parse(field.value) as unknown;}catch{throw new Error('Proposal component data is invalid.');} };
  const settingFields=doc.fields.filter(f=>f.placeholder==='PROPOSAL_SETTINGS'); if(settingFields.length!==1) throw new Error('Proposal investment settings are missing or duplicated.');
  const settings=parse(settingFields[0]); object(settings);
  for(const k of ['packageName','discountLabel','firstTrigger','finalTrigger','preparedBy']) text(settings[k],180);
  if(settings.pricingMode!==undefined)member(settings.pricingMode,['itemised','custom']);if(settings.packageValue!==undefined)text(settings.packageValue,40);
  text(settings.investmentNote); flag(settings.showValueBar); member(settings.payment,['50/50','60/40','70/30']); object(settings.discount); member(settings.discount.kind,['none','fixed','percent']);text(settings.discount.value,40);
  const sections=doc.fields.filter(f=>f.placeholder.startsWith('PROPOSAL_SECTION_')).map(f=>{const s=parse(f);object(s);id(s.id);member(s.kind,sectionKinds);flag(s.enabled);text(s.eyebrow,100);text(s.headline,180);text(s.body);text(s.quote,2000);if(s.footerNote!==undefined)text(s.footerNote,2000);if(f.placeholder!=='PROPOSAL_SECTION_'+s.id)throw new Error('Proposal section ID mismatch.');if(!Array.isArray(s.components)||s.components.length>20)throw new Error('Use at most 20 components per section.');
    for(const c of s.components){object(c);id(c.id);member(c.type,componentKinds);text(c.title,180);text(c.note,2000);flag(c.enabled);if(!Array.isArray(c.rows)||c.rows.length>30)throw new Error('Use at most 30 rows per component.');for(const row of c.rows){object(row);id(row.id);text(row.label,180);text(row.value,2000);text(row.detail,6000);flag(row.highlight);}unique(c.rows as ProposalRow[]);}unique(s.components as ProposalComponent[]);return s as unknown as ProposalSection;});
  const services=doc.fields.filter(f=>f.placeholder.startsWith('PROPOSAL_SERVICE_')).map(f=>{const s=parse(f);object(s);id(s.id);member(s.kind,serviceKinds);member(s.pricing,['fixed','quantity']);for(const k of ['name','delivery','period'])text(s[k],180);for(const k of ['fee','quantity','unitRate','referenceValue'])text(s[k],40);text(s.description);if(s.summary!==undefined)text(s.summary,1000);if(f.placeholder!=='PROPOSAL_SERVICE_'+s.id)throw new Error('Proposal service ID mismatch.');return s as unknown as ProposalService;});
  if(sections.length>30||services.length>100)throw new Error('Use at most 30 sections and 100 services.');unique(sections);unique(services);
  for(const kind of sectionKinds.filter(k=>k!=='custom')) if(sections.filter(s=>s.kind===kind).length>1)throw new Error('Duplicate built-in proposal section.');
  return {settings:settings as unknown as ProposalSettings,sections,services};
}
export function proposalCalculation(services:ProposalService[],settings:ProposalSettings) {
  const lines=services.map(s=> { const line={...blankLine(s.name,s.fee || '0'),description:s.description,pricing:s.pricing,quantity:s.quantity,unitRate:s.unitRate||'0',referenceValue:s.referenceValue,complimentary:s.kind==='complimentary'||s.kind==='included'};if(s.kind==='included')line.fee='0';return {service:s,...calculateLine(line)}; });
  const recommended=lines.filter(l=>['priced','bundle','included','complimentary'].includes(l.service.kind));
  const itemisedSubtotal=recommended.reduce((n,l)=>n+l.net,0);
  const subtotal=settings.pricingMode==='custom'?decimal(settings.packageValue||'',2,'Custom package value'):itemisedSubtotal; if(!Number.isSafeInteger(subtotal)||subtotal>100_000_000_000)throw new Error('Proposal total is too large.');
  let discount=0;
  if(settings.discount.kind==='fixed')discount=decimal(settings.discount.value,2,'Proposal discount');
  if(settings.discount.kind==='percent'){const pct=decimal(settings.discount.value,2,'Proposal discount');if(pct>10000)throw new Error('Proposal discount must be between 0 and 100%.');discount=Number((BigInt(subtotal)*BigInt(pct)+BigInt(5000))/BigInt(10000));}
  if(discount>subtotal)throw new Error('Proposal discount exceeds the recommended investment.');
  const total=subtotal-discount,reference=Math.max(settings.pricingMode==='custom'?subtotal:0,recommended.reduce((n,l)=>n+l.reference,0));
  if(!Number.isSafeInteger(reference))throw new Error('Proposal reference value is too large.');
  return {lines,recommended,itemisedSubtotal,subtotal,discount,total,reference,savings:reference-total,payments:paymentSchedule(total,paymentPreset(settings.payment))};
}
export function proposalErrors(doc:BusinessDocument) {
  try { const {sections,services,settings}=readProposal(doc), errors:string[]=[];
    for(const kind of ['cover','scope','investment','terms','closing'])if(!sections.some(s=>s.kind===kind&&s.enabled))errors.push(`Enable the ${kind} section.`);
    if(!services.length||!services.some(s=>['priced','bundle','included','complimentary'].includes(s.kind)))errors.push('Add a recommended service or bundle.');
    for(const s of services){if(!s.name.trim()||!s.description.trim())errors.push('Complete each service name and deliverables.');if(['priced','bundle','optional','alternative','recurring'].includes(s.kind)&&!(s.pricing==='quantity'?s.quantity.trim()&&s.unitRate.trim():s.fee.trim()))errors.push('Enter each service price.');if(s.kind==='recurring'&&!s.period.trim())errors.push('Enter the recurring billing period.');}
    for(const s of sections.filter(s=>s.enabled)){if(s.kind==='scope'&&!s.body.trim()&&!s.components.some(c=>c.enabled&&c.rows.length))errors.push('Write the Scope of Work or add custom scope commitments.');if(!s.headline.trim())errors.push(`Complete the ${s.eyebrow} headline.`);if(!['scope','investment','timeline'].includes(s.kind)&&!s.body.trim())errors.push(`Complete the ${s.eyebrow} content.`);for(const c of s.components.filter(c=>c.enabled)){if(!c.rows.length)errors.push(`Add rows to ${c.type}.`);for(const r of c.rows){if(!r.label.trim()&&!r.detail.trim()&&!r.value.trim())errors.push(`Complete the ${c.type} rows.`);if(['stats','journey'].includes(c.type)&&!r.value.trim())errors.push(`Complete values in ${c.type}.`);if(['stats','observations','journey','timeline','comparison'].includes(c.type)&&(!r.label.trim()||!(r.value.trim()||r.detail.trim())))errors.push(`Complete labels and details in ${c.type}.`);}}}
    if(settings.pricingMode==='custom'&&!settings.packageValue?.trim())errors.push('Enter the custom package value.');
    proposalCalculation(services,settings);return errors;
  } catch(cause){return [(cause as Error).message];}
}
