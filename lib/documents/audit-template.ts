import type { BusinessDocument } from './model';
export const auditTemplateKey = 'KRAFTT_AUDIT_V1';
export type AuditFieldSpec = { key: string; label: string; group: string; type?: 'score' | 'short'; optional?: boolean; initial?: string };
export const auditFields: AuditFieldSpec[] = [
  { key: 'SNAPSHOT_HEADLINE', label: 'Snapshot headline', group: 'Snapshot', type: 'short', initial: 'What is working, what is missing, and what to fix first.' },
  { key: 'SNAPSHOT_SUMMARY', label: 'Discovery summary / business context', group: 'Snapshot' },
  { key: 'OVERALL_SCORE', label: 'Overall readiness (%)', group: 'Readiness', type: 'score' },
  { key: 'OVERALL_INTERPRETATION', label: 'Score interpretation', group: 'Readiness' },
  { key: 'TAKEAWAY', label: 'Main takeaway', group: 'Readiness', type: 'short' },
  ...['BRAND', 'DIGITAL', 'OPERATIONS', 'GROWTH'].flatMap((key, index): AuditFieldSpec[] => [
    { key: key + '_LABEL', label: `Category ${index + 1} name`, group: 'Readiness', type: 'short', initial: ['Brand', 'Digital presence', 'Operations', 'Growth readiness'][index] },
    { key: key + '_SCORE', label: `Category ${index + 1} score (%)`, group: 'Readiness', type: 'score' },
    { key: key + '_NOTE', label: `Category ${index + 1} observation`, group: 'Readiness' },
  ]),
  { key: 'STRENGTHS', label: 'What is already strong · one point per line', group: 'Top findings' },
  { key: 'ISSUES', label: 'What needs attention first · one point per line', group: 'Top findings' },
  { key: 'KRAFTT_LINE', label: 'Kraftt closing insight', group: 'Top findings', optional: true },
  { key: 'PRIORITY_HEADLINE', label: 'Priority map headline', group: 'Priority map', type: 'short', initial: 'Fix now, build next, and leave the rest for later.' },
  { key: 'PRIORITY_SUMMARY', label: 'Priority map introduction', group: 'Priority map' },
  ...['FIX_NOW', 'BUILD_NEXT', 'LATER'].flatMap((key): AuditFieldSpec[] => [
    { key: key + '_TITLE', label: key.replaceAll('_', ' ') + ' · priority', group: 'Priority map', type: 'short' },
    { key: key + '_ACTIONS', label: key.replaceAll('_', ' ') + ' · actions, one per line', group: 'Priority map' },
  ]),
  { key: 'ROADMAP', label: 'Workflow stages · one per line', group: 'Roadmap & next steps', initial: 'Audit\nRoadmap\nProposal\nDelivery\nReview' },
  { key: 'ROADMAP_NOTE', label: 'How Kraftt would move this forward', group: 'Roadmap & next steps' },
  { key: 'FIRST_MOVE', label: 'Recommended first move', group: 'Roadmap & next steps', type: 'short' },
  { key: 'FIRST_SCOPE', label: 'What Kraftt would start with · scope', group: 'Roadmap & next steps' },
  { key: 'NEXT_STEP', label: 'Next step', group: 'Roadmap & next steps', type: 'short' },
  { key: 'NEXT_STEP_NOTE', label: 'Meeting, proposal or follow-up details', group: 'Roadmap & next steps' },
];
export function isTemplateAudit(doc: BusinessDocument) { return doc.kind === 'audit' && doc.fields.some(f => f.placeholder === auditTemplateKey && f.value === '1'); }
export function auditValue(doc: BusinessDocument, key: string) { return doc.fields.find(f => f.placeholder === key)?.value || ''; }
export function auditExtras(doc: BusinessDocument) { return doc.fields.filter(f => /^AUDIT_EXTRA_.+_TITLE$/.test(f.placeholder)).map(f => { const id = f.placeholder.slice(12, -6); return { id, title: f.value, body: auditValue(doc, `AUDIT_EXTRA_${id}_BODY`), source: auditValue(doc, `AUDIT_EXTRA_${id}_SOURCE`), image: auditValue(doc, `AUDIT_EXTRA_${id}_IMAGE`) }; }); }
export function auditErrors(doc: BusinessDocument) {
  const errors: string[] = [], scores = auditValue(doc, 'INCLUDE_SCORES') !== '0';
  if (doc.client.business.length > 120) errors.push('Keep the audit client name within 120 characters.');
  for (const spec of auditFields) {
    if (!scores && spec.group === 'Readiness') continue;
    const value = auditValue(doc, spec.key).trim();
    if (!value && !spec.optional) errors.push(`Complete ${spec.label}.`);
    if (spec.type === 'score' && value && (!/^\d{1,3}(?:\.\d)?$/.test(value) || Number(value) > 100)) errors.push(`${spec.label}: enter a score between 0 and 100.`);
    if (spec.type === 'short' && value.length > 180) errors.push(`${spec.label}: keep within 180 characters.`);
  }
  for (const extra of auditExtras(doc)) {
    if (extra.title.length > 180) errors.push('Keep each additional finding title within 180 characters.');
    if (!extra.title.trim() || !extra.body.trim()) errors.push('Complete the title and observations for each additional finding.');
    if (extra.image && (!/^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(extra.image) || extra.image.length > 400000)) errors.push('Use a supported, compressed evidence image.');
  }
  return errors;
}
