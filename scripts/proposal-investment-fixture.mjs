import { layoutProposal } from './proposal-layout-fixture.mjs';
import { loadProjectModule } from './quotation-test-modules.mjs';
const p=loadProjectModule('lib/documents/proposal-template.ts');
export function investmentProposal(){
 const doc=layoutProposal(),data=p.readProposal(doc);
 data.settings={...data.settings,packageName:'Kraftt Business Launch - Tailored Package',pricingMode:'custom',packageValue:'30000',discount:{kind:'percent',value:'15'},showValueBar:false};
 data.services=data.services.slice(0,5).map((s,i)=>({...s,kind:i<3?'included':'complimentary',fee:'0',referenceValue:String(12000-i*1500),summary:'Agreed setup, client-supplied content and practical handover for the launch.'}));
 const scope=data.sections.find(s=>s.kind==='scope'),c=p.proposalComponent('scope');
 c.rows=['Discovery & direction','Approved production deliverables','Review & handover'].map(label=>({...p.proposalRow(),label,detail:'This commitment is written independently and can differ from the investment service names.'}));scope.components=[c];
 for(const field of doc.fields){if(field.placeholder==='PROPOSAL_SETTINGS')field.value=JSON.stringify(data.settings);const s=data.sections.find(s=>'PROPOSAL_SECTION_'+s.id===field.placeholder);if(s)field.value=JSON.stringify(s);}
 doc.fields=doc.fields.filter(f=>!f.placeholder.startsWith('PROPOSAL_SERVICE_'));
 doc.fields.push(...data.services.map(s=>({id:s.id,label:s.name,placeholder:'PROPOSAL_SERVICE_'+s.id,value:JSON.stringify(s)})));
 return doc;
}
