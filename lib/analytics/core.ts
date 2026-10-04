export const EVENTS = [
  'whatsapp_click', 'phone_click', 'email_click', 'contact_form_start', 'contact_form_submit',
  'book_call_click', 'pricing_engagement', 'package_cta_click', 'audit_start', 'audit_complete',
  'tool_start', 'tool_complete', 'case_study_cta_click', 'outbound_click', 'service_cta_click',
  'kraftt_page_view',
] as const;
export type EventName = typeof EVENTS[number];
const contextKeys = ['page_path', 'page_type', 'service', 'cta_location', 'cta_label', 'package_name',
  'case_study', 'tool_name', 'destination_type', 'form_id', 'page_location', 'page_referrer'] as const;
const touchKeys = ['source', 'medium', 'campaign', 'content', 'term', 'referrer', 'landing_page', 'touch_timestamp'] as const;
type ContextKey = typeof contextKeys[number];
type TouchKey = typeof touchKeys[number];
export type Params = Partial<Record<ContextKey | `first_${TouchKey}` | `current_${TouchKey}` | 'ai_referrer', string>>;
export type FormId = 'contact_enquiry' | 'audit_request' | 'offer_enquiry' | 'partner_application';
export const SERVICE_MAP: Record<string, string> = {
  'web-design-development': 'web_design', 'brand-identity': 'brand_identity',
  'ecommerce-store-development': 'ecommerce', 'marketplace-catalogue-building': 'marketplace',
  'ecommerce-seo': 'seo', 'social-media-management': 'social_media', 'landing-pages': 'landing_pages',
  'app-development': 'app_development', 'dashboards-internal-tools': 'custom_software',
  'content-copywriting': 'content_copywriting', 'ai-powered-creative': 'ai_creative',
};

declare global {
  interface Window { dataLayer?: Record<string, unknown>[] }
}

let allowedPaths = new Set<string>(['/']);
let attribution: Params = {};
let serviceNames: Record<string, string> = {};
export function configureServiceNames(names: Record<string, string>) { serviceNames = names; }
export function formContext(form?: HTMLFormElement): Params {
  try {
    const control = form?.elements.namedItem('service');
    return control instanceof HTMLSelectElement && serviceNames[control.value] ? { service: serviceNames[control.value] } : {};
  } catch { return {}; }
}
export function configurePaths(paths: readonly string[]) { allowedPaths = new Set(paths); }
export function safePath(value: string) {
  const path = value.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  return allowedPaths.has(path) ? path : '/unknown';
}
export function token(value: unknown): string {
  if (typeof value !== 'string' || value.length > 100 || /@|\+|\d{7,}/.test(value)) return '';
  const normalized = value.toLowerCase().replace(/[ -]+/g, '_').replace(/_+/g, '_');
  return /^[a-z0-9_]{1,100}$/.test(normalized) ? normalized : '';
}
export function pageContext(path: string): Params {
  const clean = safePath(path);
  const parts = clean.split('/').filter(Boolean);
  const service = SERVICE_MAP[parts.at(-1) ?? ''];
  const page_type = clean === '/' ? 'home' : service ? 'service' : parts[0] === 'work' && parts[1] ? 'case_study'
    : parts[0] === 'tools' && parts[1] ? 'tool' : parts[0] === 'services' && parts[1] === 'bundles' ? 'bundle'
      : token(parts[0]) || 'unknown';
  return { page_path: clean, page_type, service: service ?? '',
    case_study: page_type === 'case_study' ? token(parts[1]) : '',
    tool_name: page_type === 'tool' ? token(parts[1]) : '',
    package_name: page_type === 'bundle' ? token(parts[2]) : '' };
}
export function setAttribution(params: Params) { attribution = params; }
function sanitize(key: string, value: unknown): string {
  if (typeof value !== 'string') return '';
  if (key.endsWith('landing_page') || key === 'page_path') return safePath(value);
  if (key.endsWith('touch_timestamp')) return /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(value) ? value : '';
  if (key.endsWith('referrer')) {
    try { return new URL(value).origin; } catch { return /^[a-z0-9.-]+$/i.test(value) && !/@|\d{7,}/.test(value) ? value : ''; }
  }
  if (key === 'page_location') {
    try {
      const url = new URL(value);
      if (!/^https?:$/.test(url.protocol)) return '';
      const query = new URLSearchParams();
      for (const name of ['source', 'medium', 'campaign', 'content', 'term']) {
        const campaign = token(url.searchParams.get('utm_' + name));
        if (campaign) query.set('utm_' + name, campaign);
      }
      for (const name of ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid']) {
        const clickId = url.searchParams.get(name) || '';
        if (/^[a-zA-Z0-9_-]{5,256}$/.test(clickId)) query.set(name, clickId);
      }
      return url.origin + safePath(url.pathname) + (query.size ? '?' + query.toString() : '');
    } catch { return ''; }
  }
  return token(value);
}
export function trackEvent(event: EventName, params: Params = {}) {
  if (typeof window === 'undefined' || !Array.isArray(window.dataLayer) || !EVENTS.includes(event)) return;
  try {
    const context = pageContext(window.location.pathname);
    const input = { ...attribution, ...context, page_location: window.location.href,
      page_referrer: typeof document === 'undefined' ? '' : document.referrer, ...params };
    const keys = [...contextKeys, 'ai_referrer', ...touchKeys.map(k => `current_${k}`), ...touchKeys.map(k => `first_${k}`)];
    const payload: Record<string, string> = { event };
    for (const key of keys) {
      const value = sanitize(key, input[key as keyof Params]);
      if (value && Object.keys(payload).length <= 25) payload[key] = value;
    }
    // GTM remembers values across pushes. Clear omitted context to avoid carrying a
    // previous service/package/AI referral into an unrelated event.
    window.dataLayer.push(Object.fromEntries(keys.map(key => [key, null])));
    window.dataLayer.push(payload);
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true') console.debug('[analytics]', payload);
  } catch { /* Tracking must never interfere with navigation or confirmed submission. */ }
}
export function trackFormSuccess(form_id: FormId, form?: HTMLFormElement) {
  const context = { ...formContext(form), form_id, cta_location: 'form' };
  trackEvent('contact_form_submit', context);
  if (form_id === 'audit_request') trackEvent('audit_complete', context);
}

export function classifyReferrer(referrer: string, ownOrigin: string) {
  try {
    const url = new URL(referrer);
    if (url.origin === ownOrigin) return { source: 'internal', medium: '', ai: '', referrer: '' };
    const host = url.hostname.toLowerCase();
    const matches = (domain: string) => host === domain || host.endsWith('.' + domain);
    const ai = matches('chatgpt.com') || matches('openai.com') ? 'chatgpt' : matches('perplexity.ai') ? 'perplexity'
      : matches('gemini.google.com') ? 'gemini' : matches('copilot.microsoft.com') || (matches('bing.com') && /^\/(chat|copilot)(\/|$)/.test(url.pathname)) ? 'copilot'
        : matches('claude.ai') ? 'claude' : '';
    const source = ai || (/(^|\.)google\.[a-z.]+$/.test(host) ? 'google' : matches('bing.com') ? 'bing'
      : matches('instagram.com') ? 'instagram' : matches('linkedin.com') || matches('lnkd.in') ? 'linkedin'
        : matches('facebook.com') || matches('fb.com') ? 'facebook' : matches('whatsapp.com') || matches('wa.me') ? 'whatsapp' : 'other_referral');
    return { source, medium: source === 'google' || source === 'bing' ? 'organic' : ['instagram', 'linkedin', 'facebook'].includes(source) ? 'organic_social' : source === 'whatsapp' ? 'messaging' : 'referral', ai, referrer: host };
  } catch { return { source: 'direct_unknown', medium: 'none', ai: '', referrer: '' }; }
}

type Touch = Record<TouchKey, string> & { ai: string; click_ids: string };
type Stored = { touch: Touch; lastActivity: number };
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
const FIRST_KEY = 'kraftt_analytics_first_v1';
const CURRENT_KEY = 'kraftt_analytics_current_v1';
export const SESSION_TIMEOUT = 30 * 60 * 1000;
const FIRST_TIMEOUT = 90 * 24 * 60 * 60 * 1000;
function read(storage: StorageLike | undefined, key: string, now: number, ttl: number): Stored | null {
  try {
    const record = JSON.parse(storage?.getItem(key) || 'null') as Stored | null;
    if (!record || !Number.isFinite(record.lastActivity) || record.lastActivity > now || now - record.lastActivity > ttl) return null;
    const touch = record.touch;
    if (!touch || !token(touch.source) || !token(touch.medium) || !allowedPaths.has(touch.landing_page) || !sanitize('first_touch_timestamp', touch.touch_timestamp)) return null;
    return { lastActivity: record.lastActivity, touch: {
      source: token(touch.source), medium: token(touch.medium), campaign: token(touch.campaign), content: token(touch.content), term: token(touch.term),
      referrer: sanitize('first_referrer', touch.referrer), landing_page: touch.landing_page, touch_timestamp: touch.touch_timestamp,
      ai: token(touch.ai), click_ids: token(touch.click_ids),
    } };
  } catch { return null; }
}
function write(storage: StorageLike | undefined, key: string, value: Stored) { try { storage?.setItem(key, JSON.stringify(value)); } catch { /* In-memory attribution still works. */ } }
export class AttributionStore {
  private first: Stored | null = null;
  private current: Stored | null = null;
  private local?: StorageLike;
  private session?: StorageLike;
  constructor(local?: StorageLike, session?: StorageLike) { this.local = local; this.session = session; }
  visit(href: string, referrer: string, entry: boolean, now = Date.now()): Params {
    const url = new URL(href);
    this.first ??= read(this.local, FIRST_KEY, now, FIRST_TIMEOUT);
    this.current ??= read(this.session, CURRENT_KEY, now, SESSION_TIMEOUT);
    const detected = classifyReferrer(referrer, url.origin);
    const campaign = (name: string) => token(url.searchParams.get('utm_' + name));
    const source = campaign('source');
    // Store presence only. Native Google/Microsoft click IDs remain in the URL for their own tags.
    const clickIds = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid'].filter(k => /^[a-zA-Z0-9_-]{5,256}$/.test(url.searchParams.get(k) || ''));
    const clickSource = clickIds.some(k => ['gclid', 'gbraid', 'wbraid'].includes(k)) ? 'google' : clickIds.includes('msclkid') ? 'bing' : clickIds.includes('fbclid') ? 'facebook' : '';
    const acquisition = entry && detected.source !== 'internal';
    const incoming: Touch = {
      source: acquisition ? source || clickSource || detected.source : 'direct_unknown',
      medium: acquisition ? campaign('medium') || (clickSource ? 'paid' : source ? 'referral' : detected.medium) : 'none',
      campaign: acquisition ? campaign('campaign') : '', content: acquisition ? campaign('content') : '', term: acquisition ? campaign('term') : '',
      referrer: acquisition ? detected.referrer : '', landing_page: safePath(url.pathname), touch_timestamp: new Date(now).toISOString(),
      ai: acquisition ? detected.ai || (['chatgpt', 'perplexity', 'gemini', 'copilot', 'claude'].includes(source) ? source : '') : '',
      click_ids: acquisition ? clickIds.join('_') : '',
    };
    if (!this.first || now - this.first.lastActivity > FIRST_TIMEOUT) {
      this.first = { touch: incoming, lastActivity: now }; write(this.local, FIRST_KEY, this.first);
    }
    const acquired = acquisition && (source || clickSource || !['direct_unknown', 'internal'].includes(detected.source));
    const changed = !this.current || [...touchKeys.filter(key => key !== 'touch_timestamp'), 'click_ids'].some(key => incoming[key as keyof Touch] !== this.current?.touch[key as keyof Touch]);
    const newCampaign = acquired && changed;
    if (!this.current || now - this.current.lastActivity > SESSION_TIMEOUT || newCampaign) this.current = { touch: incoming, lastActivity: now };
    this.current.lastActivity = now; write(this.session, CURRENT_KEY, this.current);
    const params: Params = { ai_referrer: this.current.touch.ai };
    for (const key of touchKeys) {
      params[`first_${key}`] = this.first.touch[key];
      if (key !== 'touch_timestamp') params[`current_${key}`] = this.current.touch[key];
    }
    return params;
  }
}
