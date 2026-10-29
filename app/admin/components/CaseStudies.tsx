'use client';

import { useState } from 'react';
import { uid, type CaseStudy, type CaseStudyPermission, type Client } from '../../../lib/quotation/model';
import { Field, SelectField, TextField } from './Fields';

type Section = 'basics' | 'before' | 'brief' | 'decisions' | 'results' | 'voice' | 'hooks';
const sections: { id: Section; letter: string; title: string }[] = [
  { id: 'basics', letter: 'A', title: 'Basics' }, { id: 'before', letter: 'B', title: 'Before' },
  { id: 'brief', letter: 'C', title: 'The brief' }, { id: 'decisions', letter: 'D', title: 'Key decisions' },
  { id: 'results', letter: 'E', title: 'Results' }, { id: 'voice', letter: 'F', title: 'Client voice' },
  { id: 'hooks', letter: 'G', title: 'Story hooks' },
];

function Permission({ label, value, onChange }: { label: string; value: CaseStudyPermission; onChange: (value: CaseStudyPermission) => void }) {
  return <SelectField label={label} value={value} onChange={value => onChange(value as CaseStudyPermission)}>
    <option value="not_confirmed">Not confirmed</option><option value="yes">Yes</option><option value="no">No</option>
  </SelectField>;
}

export function CaseStudies({ studies, clients, activeId, onCreate, onChange, onDelete, onOpen, onSave, onDownload, downloadBusy, saveStatus }: {
  studies: CaseStudy[]; clients: Client[]; activeId: string;
  onCreate: (clientId: string) => void; onChange: (study: CaseStudy) => void; onDelete: (id: string) => void;
  onOpen: (id: string) => void; onSave: () => void; onDownload: (study: CaseStudy, format: 'pdf' | 'html') => void; downloadBusy: boolean; saveStatus: string;
}) {
  const [newClientId, setNewClientId] = useState('');
  const [section, setSection] = useState<Section>('basics');
  const study = studies.find(item => item.id === activeId);

  if (!study) return <section className="admin-page admin-case-studies">
    <span className="admin-eyebrow">Project stories · working notes</span>
    <h1>Case studies</h1>
    <p className="admin-lead">Capture what happened for each project. Rough notes are fine; leave unverified figures blank or write “Not measured.”</p>
    <div className="admin-case-new admin-card">
      <SelectField label="Start with a client" value={newClientId} onChange={setNewClientId}>
        <option value="">Choose later</option>
        {clients.map(client => <option value={client.id} key={client.id}>{client.business}</option>)}
      </SelectField>
      <button className="admin-button" type="button" onClick={() => onCreate(newClientId)}>+ New case study</button>
    </div>
    {studies.map(item => <article className="admin-saved-card" key={item.id}>
      <div><span className="admin-badge">Intake notes</span><h2>{item.basics.clientName || 'Untitled project'}</h2>
        <p>{[item.basics.industry, item.basics.city, item.basics.services].filter(Boolean).join(' · ') || 'Add the project basics'}</p>
        <small>Edited {new Date(item.modifiedAt).toLocaleString('en-IN')}</small></div>
      <div className="admin-row-actions"><button className="admin-small-button" type="button" onClick={() => onOpen(item.id)}>Open notes</button><button className="admin-small-button" type="button" disabled={downloadBusy} onClick={() => onDownload(item, 'pdf')}>PDF</button><button className="admin-small-button" type="button" disabled={downloadBusy} onClick={() => onDownload(item, 'html')}>HTML</button><button className="admin-small-button admin-danger" type="button" onClick={() => onDelete(item.id)}>Delete</button></div>
    </article>)}
    {!studies.length && <p className="admin-empty">No case studies yet. Start with any client or an unlinked project.</p>}
  </section>;

  const update = (next: CaseStudy) => onChange({ ...next, modifiedAt: new Date().toISOString() });
  const basics = (patch: Partial<CaseStudy['basics']>) => update({ ...study, basics: { ...study.basics, ...patch } });
  const before = (patch: Partial<CaseStudy['before']>) => update({ ...study, before: { ...study.before, ...patch } });
  const brief = (patch: Partial<CaseStudy['brief']>) => update({ ...study, brief: { ...study.brief, ...patch } });
  const results = (patch: Partial<CaseStudy['results']>) => update({ ...study, results: { ...study.results, ...patch } });
  const voice = (patch: Partial<CaseStudy['voice']>) => update({ ...study, voice: { ...study.voice, ...patch } });
  const hooks = (patch: Partial<CaseStudy['hooks']>) => update({ ...study, hooks: { ...study.hooks, ...patch } });
  const sectionIndex = sections.findIndex(item => item.id === section);

  return <section className="admin-page admin-case-studies">
    <div className="admin-case-header"><div><button className="admin-case-back" type="button" onClick={() => onOpen('')}>← All case studies</button><span className="admin-eyebrow">Case study intake · private working notes</span><h1>{study.basics.clientName || 'Untitled project'}</h1><p>Write what you know. Keep unverified outcomes clearly marked.</p></div>
      <div className="admin-case-save"><div className="admin-row-actions"><button className="admin-small-button" type="button" disabled={downloadBusy} onClick={() => onDownload(study, 'html')}>Download HTML</button><button className="admin-small-button" type="button" disabled={downloadBusy} onClick={() => onDownload(study, 'pdf')}>Download PDF</button><button className="admin-button" type="button" onClick={onSave}>Save now</button></div><small role="status">{saveStatus}</small></div></div>
    <nav className="admin-case-tabs" aria-label="Case study sections">{sections.map(item => <button key={item.id} type="button" aria-current={section === item.id ? 'step' : undefined} onClick={() => setSection(item.id)}><span>{item.letter}</span>{item.title}</button>)}</nav>
    <div className="admin-case-panel admin-card">
      <div className="admin-case-panel-heading"><span className="admin-eyebrow">{sections[sectionIndex].letter} / {sections.length.toString().padStart(2, '0')}</span><h2>{sections[sectionIndex].title}</h2></div>
      {section === 'basics' && <>
        <div className="admin-grid"><SelectField label="Linked client in directory" value={study.clientId} onChange={id => { const client = clients.find(item => item.id === id); update({ ...study, clientId: id, basics: { ...study.basics, clientName: client?.business || study.basics.clientName } }); }}><option value="">No linked client</option>{clients.map(client => <option value={client.id} key={client.id}>{client.business}</option>)}</SelectField><Field label="Client name" value={study.basics.clientName} onChange={clientName => basics({ clientName })} /></div>
        <div className="admin-grid"><Field label="Business / project" value={study.basics.business} onChange={business => basics({ business })} /><Field label="Industry" value={study.basics.industry} onChange={industry => basics({ industry })} /><Field label="City" value={study.basics.city} onChange={city => basics({ city })} /><Field label="Live website link" type="url" value={study.basics.website} onChange={website => basics({ website })} maxLength={1000} /><Field label="Project dates" value={study.basics.projectDates} onChange={projectDates => basics({ projectDates })} /><Field label="Services delivered" value={study.basics.services} onChange={services => basics({ services })} maxLength={1000} /></div>
        <div className="admin-case-divider"><h3>Permission to publish</h3><p>Record the approval before using the client name, logo or screenshots publicly.</p></div>
        <div className="admin-grid"><Permission label="Name, logo and screenshots approved?" value={study.basics.assetPermission} onChange={assetPermission => basics({ assetPermission })} /><Field label="Approved by" value={study.basics.approvedBy} onChange={approvedBy => basics({ approvedBy })} /><Field label="Approval date" type="date" value={study.basics.approvedOn} onChange={approvedOn => basics({ approvedOn })} /><Permission label="Happy to be tagged or do a collab post?" value={study.basics.tagCollab} onChange={tagCollab => basics({ tagCollab })} /></div>
      </>}
      {section === 'before' && <>
        <TextField label="What the business does and who its customers are" value={study.before.businessCustomers} onChange={businessCustomers => before({ businessCustomers })} rows={3} />
        <TextField label="How customers found them before" value={study.before.discoveryChannels} onChange={discoveryChannels => before({ discoveryChannels })} rows={2} />
        <TextField label="Visible problems with the old site or presence" value={study.before.visibleProblems} onChange={visibleProblems => before({ visibleProblems })} rows={4} />
        <p className="admin-help">Describe only what a visitor could see, such as missing catalogue information or an unclear enquiry path.</p>
        <div className="admin-grid"><Field label="Old desktop screenshot link" value={study.before.desktopScreenshot} onChange={desktopScreenshot => before({ desktopScreenshot })} maxLength={1000} /><Field label="Date captured" type="date" value={study.before.desktopDate} onChange={desktopDate => before({ desktopDate })} /><Field label="Old mobile screenshot link" value={study.before.mobileScreenshot} onChange={mobileScreenshot => before({ mobileScreenshot })} maxLength={1000} /><Field label="Date captured" type="date" value={study.before.mobileDate} onChange={mobileDate => before({ mobileDate })} /></div>
        <p className="admin-help">Use shared links for screenshots so they can be opened from another computer. Images are not uploaded with these notes.</p>
      </>}
      {section === 'brief' && <><TextField label="What the client asked for, in their own words" value={study.brief.clientWords} onChange={clientWords => brief({ clientWords })} rows={4} /><TextField label="What they actually needed, if different" value={study.brief.actualNeed} onChange={actualNeed => brief({ actualNeed })} rows={4} /><TextField label="Constraints: budget, timeline, content, language or audience" value={study.brief.constraints} onChange={constraints => brief({ constraints })} rows={3} /></>}
      {section === 'decisions' && <>
        <p className="admin-case-intro">Record 3–5 decisions. For each, explain the reason and what a visitor can actually see.</p>
        <div className="admin-case-decision-head"><span>Decision</span><span>Why we made it</span><span>What changed visibly</span></div>
        {study.decisions.map((item, index) => <div className="admin-case-decision" key={item.id}>
          <span className="admin-case-row-number">{String(index + 1).padStart(2, '0')}</span>
          <TextField label="Decision" value={item.decision} onChange={decision => update({ ...study, decisions: study.decisions.map(row => row.id === item.id ? { ...row, decision } : row) })} rows={3} />
          <TextField label="Why we made it" value={item.reason} onChange={reason => update({ ...study, decisions: study.decisions.map(row => row.id === item.id ? { ...row, reason } : row) })} rows={3} />
          <TextField label="What changed visibly" value={item.visibleChange} onChange={visibleChange => update({ ...study, decisions: study.decisions.map(row => row.id === item.id ? { ...row, visibleChange } : row) })} rows={3} />
          <button className="admin-small-button admin-danger" type="button" disabled={study.decisions.length <= 3} onClick={() => update({ ...study, decisions: study.decisions.filter(row => row.id !== item.id) })}>Remove</button>
        </div>)}
        <button className="admin-small-button" type="button" disabled={study.decisions.length >= 5} onClick={() => update({ ...study, decisions: [...study.decisions, { id: uid(), decision: '', reason: '', visibleChange: '' }] })}>+ Add decision</button>
        <p className="admin-help">Ideas: page structure, catalogue layout, WhatsApp enquiry path, audience wording, SEO, speed, mobile layout and trust elements.</p>
      </>}
      {section === 'results' && <>
        <p className="admin-case-intro">Only record results you can source. “Not measured” is a complete answer; never guess a number.</p>
        {study.results.metrics.map((item, index) => <div className="admin-case-result" key={item.id}><div className="admin-case-result-title"><strong>Result {String(index + 1).padStart(2, '0')}</strong><button className="admin-small-button admin-danger" type="button" disabled={study.results.metrics.length <= 1} onClick={() => results({ metrics: study.results.metrics.filter(row => row.id !== item.id) })}>Remove</button></div>
          <div className="admin-grid"><Field label="Metric" value={item.metric} onChange={metric => results({ metrics: study.results.metrics.map(row => row.id === item.id ? { ...row, metric } : row) })} /><Field label="Number or result" value={item.value} onChange={value => results({ metrics: study.results.metrics.map(row => row.id === item.id ? { ...row, value } : row) })} /><Field label="Date range" value={item.dateRange} onChange={dateRange => results({ metrics: study.results.metrics.map(row => row.id === item.id ? { ...row, dateRange } : row) })} /><Field label="Source / evidence link" value={item.source} onChange={source => results({ metrics: study.results.metrics.map(row => row.id === item.id ? { ...row, source } : row) })} maxLength={1000} /></div>
          <button className="admin-small-button" type="button" onClick={() => results({ metrics: study.results.metrics.map(row => row.id === item.id ? { ...row, value: 'Not measured' } : row) })}>Mark not measured</button>
        </div>)}
        <button className="admin-small-button" type="button" disabled={study.results.metrics.length >= 20} onClick={() => results({ metrics: [...study.results.metrics, { id: uid(), metric: '', value: '', dateRange: '', source: '' }] })}>+ Add result</button>
        <div className="admin-case-divider"><h3>Context and limits</h3></div>
        <TextField label="Enquiry changes the client confirmed" value={study.results.enquiryChanges} onChange={enquiryChanges => results({ enquiryChanges })} /><Field label="Message or screenshot evidence link" value={study.results.enquiryEvidence} onChange={enquiryEvidence => results({ enquiryEvidence })} maxLength={1000} /><TextField label="What we cannot claim" value={study.results.cannotClaim} onChange={cannotClaim => results({ cannotClaim })} />
      </>}
      {section === 'voice' && <><TextField label="Testimonial text" value={study.voice.testimonial} onChange={testimonial => voice({ testimonial })} rows={5} /><Field label="Voice note link, if any" value={study.voice.voiceNote} onChange={voiceNote => voice({ voiceNote })} maxLength={1000} /><Permission label="Permission to publish testimonial?" value={study.voice.publishPermission} onChange={publishPermission => voice({ publishPermission })} /><TextField label="One thing the client worried about at the start" value={study.voice.startingConcern} onChange={startingConcern => voice({ startingConcern })} /></>}
      {section === 'hooks' && <><TextField label="The most surprising thing we found" value={study.hooks.surprise} onChange={surprise => hooks({ surprise })} /><TextField label="A decision we debated, and what we chose" value={study.hooks.debatedDecision} onChange={debatedDecision => hooks({ debatedDecision })} /><TextField label="A common mistake in this industry’s old sites" value={study.hooks.commonMistake} onChange={commonMistake => hooks({ commonMistake })} /><TextField label="What we would do differently next time" value={study.hooks.nextTime} onChange={nextTime => hooks({ nextTime })} /><TextField label="One line an owner in this industry would relate to" value={study.hooks.relatableLine} onChange={relatableLine => hooks({ relatableLine })} /></>}
      <div className="admin-case-next"><span>{sections[sectionIndex].letter} of G</span><div className="admin-row-actions"><button className="admin-small-button" type="button" disabled={sectionIndex === 0} onClick={() => setSection(sections[sectionIndex - 1].id)}>← Previous</button><button className="admin-button" type="button" disabled={sectionIndex === sections.length - 1} onClick={() => setSection(sections[sectionIndex + 1].id)}>Next section →</button></div></div>
    </div>
  </section>;
}
