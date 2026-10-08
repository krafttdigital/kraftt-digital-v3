import type { BusinessDocument } from './model';
export const legacyReportTemplateKey = 'KRAFTT_MONTHLY_REPORT_V1';
export const reportTemplateKey = 'KRAFTT_MONTHLY_REPORT_V2';
export const legacyReportFields = [
  { key: 'REPORT_PERIOD', label: 'Reporting month / date range', group: 'Report details', type: 'short' },
  { key: 'DATA_SOURCE', label: 'Analytics source and reporting basis', group: 'Report details', type: 'short' },
  { key: 'REPORT_SUMMARY', label: 'Report introduction', group: 'Report details', optional: true },
  { key: 'TOTAL_VISITORS', label: 'Total visitors', group: 'Traffic insight', type: 'count' },
  { key: 'UNIQUE_VISITORS', label: 'Unique visitors', group: 'Traffic insight', type: 'count' },
  { key: 'TOP_PAGES', label: 'Top pages · one ranked page per line', group: 'Traffic insight' },
  { key: 'DIRECT_TRAFFIC', label: 'Direct traffic', group: 'Traffic sources', type: 'count' },
  { key: 'SEARCH_TRAFFIC', label: 'Google / SEO traffic', group: 'Traffic sources', type: 'count' },
  { key: 'SOCIAL_TRAFFIC', label: 'Social media traffic', group: 'Traffic sources', type: 'count' },
  { key: 'TRAFFIC_INSIGHT', label: 'Traffic interpretation and recommendation', group: 'Traffic sources' },
  { key: 'SESSION_DURATION', label: 'Average session duration · include units', group: 'User behaviour', type: 'short' },
  { key: 'BOUNCE_RATE', label: 'Bounce rate (%)', group: 'User behaviour', type: 'percent' },
  { key: 'CONVERSION_RATE', label: 'Conversion rate (%)', group: 'User behaviour', type: 'percent' },
  { key: 'CONVERSION_DEFINITION', label: 'Conversion / key event definition (optional)', group: 'User behaviour', optional: true },
  { key: 'BEHAVIOUR_INSIGHT', label: 'Behaviour interpretation and recommendation', group: 'User behaviour' },
  { key: 'UPDATES_IMPROVEMENTS', label: 'Updates & improvements completed this month', group: 'Updates & improvements' },
  { key: 'ADDITIONAL_NOTES', label: 'Next month / client actions / other service updates (optional)', group: 'Updates & improvements', optional: true },
] as const;
export const reportFields = [
  { key: 'REPORT_PERIOD', label: 'Reporting month / date range', group: 'Report details', type: 'short' },
  { key: 'DATA_SOURCE', label: 'Analytics source and reporting basis', group: 'Report details', type: 'short' },
  { key: 'REPORT_SUMMARY', label: 'Report introduction', group: 'Report details', optional: true },
  { key: 'TOTAL_IMPRESSIONS', label: 'Total Impressions', group: 'Traffic Insights', type: 'count' },
  { key: 'TOTAL_CLICKS', label: 'Total Clicks', group: 'Traffic Insights', type: 'count' },
  { key: 'AVG_CTR', label: 'Avg. CTR (%)', group: 'Traffic Insights', type: 'percent' },
  { key: 'TOP_PAGES', label: 'Top Pages · one ranked page per line', group: 'Traffic Insights' },
  { key: 'SEARCH_TRAFFIC', label: 'Google / Search Engines', group: 'Traffic Sources', type: 'count' },
  { key: 'SOCIAL_TRAFFIC', label: 'Social Media', group: 'Traffic Sources', type: 'count' },
  { key: 'UNKNOWN_TRAFFIC', label: 'Unknown Sources', group: 'Traffic Sources', type: 'count' },
  { key: 'HIGHEST_TRAFFIC_SOURCE', label: 'Highest Traffic Source', group: 'Traffic Sources', type: 'short' },
  { key: 'TRAFFIC_INSIGHT', label: 'Traffic interpretation and recommendation', group: 'Traffic Sources' },
  { key: 'TOP_QUERIES', label: 'Top Queries · one query per line', group: 'User Behavior' },
  { key: 'TOP_COUNTRIES', label: 'Top Countries · one country per line', group: 'User Behavior' },
  { key: 'AVG_SCROLL_DEPTH', label: 'Avg. Scroll Depth (%)', group: 'User Behavior', type: 'percent' },
  { key: 'AVG_ACTIVE_TIME', label: 'Avg. Active Time · include units', group: 'User Behavior', type: 'short' },
  { key: 'BEHAVIOUR_INSIGHT', label: 'Behavior interpretation and recommendation', group: 'User Behavior' },
  { key: 'UPDATES_IMPROVEMENTS', label: 'Updates & improvements completed this month', group: 'Updates & improvements' },
  { key: 'ADDITIONAL_NOTES', label: 'Next month / client actions / other service updates (optional)', group: 'Updates & improvements', optional: true },
] as const;
export function isCurrentReport(doc: BusinessDocument) { return doc.kind === 'report' && doc.fields.some(f => f.placeholder === reportTemplateKey && f.value === '1'); }
export function reportFieldsFor(doc: BusinessDocument) { return isCurrentReport(doc) ? reportFields : legacyReportFields; }
export function isTemplateReport(doc: BusinessDocument) { return doc.kind === 'report' && doc.fields.some(f => [reportTemplateKey, legacyReportTemplateKey].includes(f.placeholder) && f.value === '1'); }
export function reportValue(doc: BusinessDocument, key: string) { return doc.fields.find(f => f.placeholder === key)?.value || ''; }
export function reportErrors(doc: BusinessDocument) {
  const errors: string[] = [];
  for (const spec of reportFieldsFor(doc)) {
    const value = reportValue(doc, spec.key).trim();
    if (!value && !('optional' in spec)) errors.push(`Complete ${spec.label}.`);
    if ('type' in spec && value) {
      if (spec.type === 'count' && (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))) errors.push(`${spec.label}: enter a non-negative whole number.`);
      if (spec.type === 'percent' && (!/^\d+(?:\.\d{1,2})?$/.test(value) || Number(value) > 100)) errors.push(`${spec.label}: enter a percentage between 0 and 100.`);
      if (spec.type === 'short' && value.length > 180) errors.push(`${spec.label}: keep within 180 characters.`);
    }
  }
  if (doc.client.business.length > 120) errors.push('Keep the report client name within 120 characters.');
  return errors;
}
