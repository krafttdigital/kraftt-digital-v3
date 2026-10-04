import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import * as analytics from '../lib/analytics/core.ts';
import { submitOfferEnquiry } from '../app/offers/offerSubmission.ts';

const { AttributionStore, SESSION_TIMEOUT, configurePaths, configureServiceNames, trackEvent, pageContext, classifyReferrer } = analytics;
const paths = ['/', '/contact', '/audit', '/partner-program', '/offers/campaign-festive-season-offer', '/work/shree-hari-spintex', '/location/bathinda/web-design-development', '/region/uk/brand-identity', '/tools/roas-calculator', ...Object.keys(analytics.SERVICE_MAP).map(s => '/services/' + s)];
configurePaths(paths);
configureServiceNames({ 'Web Design & Development': 'web_design' });
assert.doesNotThrow(() => trackEvent('whatsapp_click'));
const memory = () => { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) }; };
const base = 'https://krafttdigital.in';
const now = Date.parse('2026-10-04T10:00:00Z');
const local = memory(), session = memory();
let store = new AttributionStore(local, session);
let attrs = store.visit(base + '/', '', true, now);
assert.equal(attrs.first_source, 'direct_unknown');
assert.equal(classifyReferrer('https://www.google.co.in/search?q=private', base).source, 'google');
for (const [referrer, source] of [['https://chatgpt.com/c/private', 'chatgpt'], ['https://chat.openai.com/c/private', 'chatgpt'], ['https://perplexity.ai/search/private', 'perplexity'], ['https://gemini.google.com/app/private', 'gemini'], ['https://copilot.microsoft.com/?q=private', 'copilot'], ['https://www.bing.com/chat?q=private', 'copilot'], ['https://claude.ai/chat/private', 'claude']]) {
  assert.equal(classifyReferrer(referrer, base).ai, source);
}
assert.equal(classifyReferrer('https://www.bing.com/search?q=private', base).ai, '');
assert.equal(classifyReferrer('https://chatgpt.com.attacker.test/', base).source, 'other_referral');
for (const [source, medium] of [['instagram', 'organic_social'], ['linkedin', 'organic_social'], ['whatsapp', 'messaging']]) {
  attrs = store.visit(`${base}/services/web-design-development?utm_source=${source}&utm_medium=${medium}&utm_campaign=outreach&utm_content=reel_01`, '', true, now + 1000);
  assert.equal(attrs.current_source, source); assert.equal(attrs.current_medium, medium);
  assert.equal(attrs.first_source, 'direct_unknown');
  attrs = store.visit(base + '/contact?utm_source=internal', base + '/services/web-design-development', false, now + 2000);
  assert.equal(attrs.current_source, source); assert.equal(attrs.current_landing_page, '/services/web-design-development');
}
store = new AttributionStore(local, session);
assert.equal(store.visit(base + '/contact', base + '/', true, now + 3000).current_source, 'whatsapp');
assert.equal(store.visit(base + '/', '', true, now + SESSION_TIMEOUT + 10000).current_source, 'direct_unknown');
assert.equal(new AttributionStore(local, memory()).visit(base + '/', '', true, now + 5000).first_source, 'direct_unknown');
const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
assert.doesNotThrow(() => new AttributionStore(blocked, blocked).visit(base + '/', '', true, now));
const aiAttrs = new AttributionStore(memory(), memory()).visit(base + '/work/shree-hari-spintex?email=private@example.com', 'https://chatgpt.com/c/private-prompt?email=private@example.com', true, now);
assert.equal(aiAttrs.ai_referrer, 'chatgpt'); assert.equal(aiAttrs.first_referrer, 'chatgpt.com');
assert.ok(!JSON.stringify(aiAttrs).includes('private'));
const unsafe = new AttributionStore(memory(), memory()).visit(base + '/?utm_source=alice@example.com&utm_campaign=9876543210&gclid=ANONYMOUS_CLICK_ID', '', true, now);
assert.equal(unsafe.first_source, 'google'); assert.equal(unsafe.first_campaign, '');
for (const [slug, service] of Object.entries(analytics.SERVICE_MAP)) assert.equal(pageContext('/services/' + slug).service, service);
assert.equal(pageContext('/location/bathinda/web-design-development').service, 'web_design');
assert.equal(pageContext('/region/uk/brand-identity').service, 'brand_identity');
assert.equal(pageContext('/alice@example.com').page_path, '/unknown');

// Lightweight DOM event harness: execute the real delegated listeners, without sending network requests.
class Element {
  constructor(tag, props = {}, parent = null) { this.tag = tag; this.parent = parent; Object.assign(this, { className: '', textContent: '', ...props }); this.classList = { contains: name => this.className.split(' ').includes(name) }; }
  matches(selector) {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    const contains = selector.match(/^\[class\*="(.*)"\]$/); if (contains) return this.className.includes(contains[1]);
    return this.tag === selector;
  }
  closest(selectors) { return selectors.split(',').some(s => this.matches(s.trim())) ? this : this.parent?.closest(selectors) || null; }
  querySelector() { return null; }
  getAttribute() { return ''; }
}
class Input extends Element { constructor(props, parent) { super('input', { type: 'text', value: '', ...props }, parent); } }
class Select extends Element { constructor(props, parent) { super('select', props, parent); } }
class Textarea extends Element {}
Object.assign(globalThis, { Element, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: Textarea });
const listeners = new Map();
const document = { referrer: 'https://chatgpt.com/c/private', addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: (name, fn) => { if (listeners.get(name) === fn) listeners.delete(name); } };
globalThis.window = { location: new URL(base + '/services/web-design-development'), dataLayer: [], localStorage: memory(), sessionStorage: memory() };
function compile(file, mocks, extra = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const cjsModule = { exports: {} };
  vm.runInNewContext(output, { exports: cjsModule.exports, module: cjsModule, require: name => { if (!(name in mocks)) throw Error('Unmocked import ' + name); return mocks[name]; }, console, process, window, document, URL, URLSearchParams, Element, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: Textarea, ...extra }, { filename: file });
  return cjsModule.exports;
}
const cleanups = [];
const runtime = compile('app/components/AnalyticsRuntime.tsx', {
  react: { useEffect: fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); } },
  'next/navigation': { usePathname: () => window.location.pathname },
  '../../lib/analytics/config': { analyticsConfig: { gtmId: 'GTM-NTF8M2Q9' } },
  '../../lib/analytics/core': analytics,
});
const props = { paths, services: { 'Web Design & Development': 'web_design' } };
runtime.AnalyticsRuntime(props);
cleanups.splice(0).forEach(fn => fn()); runtime.AnalyticsRuntime(props); // Strict Mode remount
assert.equal(window.dataLayer.filter(e => e.event === 'kraftt_page_view').length, 1);
const events = name => window.dataLayer.filter(e => e.event === name);
for (const [href, label, event] of [['https://wa.me/919876543210?text=private', 'WhatsApp', 'whatsapp_click'], ['tel:+919876543210', 'Call', 'phone_click'], ['mailto:private@example.com', 'Email', 'email_click'], [base + '/contact', 'Book a free call', 'book_call_click'], ['https://example.com/', 'View project', 'outbound_click']]) {
  const anchor = new Element('a', { href, textContent: label });
  listeners.get('click')({ button: 0, target: new Element('svg', {}, anchor) });
  assert.equal(events(event).length, 1);
}
const form = new Element('form', { className: 'contact-form' });
const field = new Input({ value: 'Alice private@example.com 9876543210', name: 'name' }, form);
listeners.get('input')({ target: field }); listeners.get('change')({ target: field });
assert.equal(events('contact_form_start').length, 1);
const auditForm = new Element('form', { className: 'audit-form' });
const auditField = new Input({ value: 'Private details', name: 'name' }, auditForm);
listeners.get('input')({ target: auditField }); listeners.get('change')({ target: auditField });
assert.equal(events('audit_start').length, 1);
window.location = new URL(base + '/tools/roas-calculator');
runtime.AnalyticsRuntime(props);
const workspace = new Element('form', { id: 'tool-workspace' });
const toolField = new Input({ value: '25000' }, workspace);
listeners.get('input')({ target: toolField }); listeners.get('change')({ target: toolField });
assert.equal(events('tool_start').length, 1);
assert.equal(events('tool_start')[0].tool_name, 'roas_calculator');
assert.ok(!JSON.stringify(events('tool_start')).includes('25000'));
window.location = new URL(base + '/contact');
runtime.AnalyticsRuntime(props);
assert.equal(events('kraftt_page_view').length, 3);
assert.equal(events('kraftt_page_view').at(-1).current_source, 'chatgpt');
trackEvent('email_click', { service: 'private@example.com', cta_label: '9876543210', name: 'Alice', email: 'private@example.com' });
assert.ok(!JSON.stringify(window.dataLayer).includes('private'));
assert.ok(!JSON.stringify(window.dataLayer).includes('9876543210'));
assert.ok(window.dataLayer.filter(e => e.event).every(e => Object.keys(e).length <= 26));
assert.ok(window.dataLayer.some(e => e.service === null));
delete window.dataLayer; assert.doesNotThrow(() => trackEvent('phone_click')); window.dataLayer = [];

// Invoke real component submit handlers with mocked successful, failed and in-flight HTTP responses.
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
function findNode(tree, predicate) {
  if (!tree || typeof tree !== 'object') return null;
  if (predicate(tree)) return tree;
  const children = tree.props?.children;
  for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) { const found = findNode(child, predicate); if (found) return found; }
  return null;
}
for (const [name, validState] of [['GstCalculator', ['exclusive', '25000', '18', '', 'yes', false]], ['RoasCalculator', ['25000', '100000', '', false]]]) {
  for (const valid of [true, false]) {
    window.location = new URL(base + '/tools/roas-calculator');
    window.dataLayer = [];
    let index = 0;
    const loaded = compile(`app/tools/components/${name}.tsx`, {
      react: { useState: initial => [valid ? validState[index++] : initial, () => {}], useMemo: fn => fn(), useRef: () => ({ current: null }) },
      'react/jsx-runtime': jsx,
      '../../../lib/analytics/core': analytics,
      './CalculatorPrimitives': { Field: 'field', OptionQuestion: 'options', ResultPanel: 'result', formatINR: String, revealResult() {} },
      './ToolSuite': { Button: 'button', ResultActions: 'actions' },
      '../../components/PricingCurrencyProvider': { usePricingCurrency: () => 'INR' },
      '../../data/pricing': { formatRegionalAmount: String },
    });
    const form = findNode(loaded[name](), node => node.type === 'form');
    form.props.onSubmit({ preventDefault() {} });
    assert.equal(events('tool_complete').length, valid ? 1 : 0, name + ': invalid input must not complete');
    assert.ok(!JSON.stringify(window.dataLayer).includes('25000'));
  }
}
window.location = new URL(base + '/contact');
const originalFormData = globalThis.FormData;
class MockFormData extends Map { constructor() { super(); } }
const formFiles = [['app/contact/ContactForm.tsx', 'ContactForm', 'contact_enquiry'], ['app/audit/AuditForm.tsx', 'AuditForm', 'audit_request'], ['app/offers/OfferEnquiryForm.tsx', 'OfferEnquiryForm', 'offer_enquiry'], ['app/partner-program/PartnerApplicationForm.tsx', 'PartnerApplicationForm', 'partner_application']];
for (const [file, component, formId] of formFiles) {
  for (const success of [true, false]) {
    window.dataLayer = [];
    let complete, count = 0;
    globalThis.FormData = MockFormData;
    const fakeForm = { reportValidity: () => true, reset() {}, elements: { namedItem: () => new Select({ value: 'Web Design & Development' }) } };
    const fetcher = () => { count++; return new Promise(resolve => { complete = () => resolve(new Response(JSON.stringify({ ok: success }), { status: success ? 200 : 422, headers: { 'Content-Type': 'application/json' } })); }); };
    const savedFetch = globalThis.fetch; globalThis.fetch = fetcher;
    const mocks = {
      react: { useRef: initial => ({ current: initial === null ? fakeForm : initial }), useState: value => [value, () => {}], useEffect() {} },
      'react/jsx-runtime': jsx, 'next/link': { default: 'a' }, '../data/services': { services: [] },
      '../data/site': { whatsappUrl: () => 'https://wa.me/000' },
      '../components/PricingCurrencyProvider': { usePricingCurrency: () => 'INR' }, '../data/pricing': { regionalizePriceCopy: text => text },
      './OfferAvailability': { useOfferExpired: () => false }, './offerSubmission': { submitOfferEnquiry }, '../../lib/analytics/core': analytics,
    };
    const loaded = compile(file, mocks, { fetch: fetcher, FormData: MockFormData });
    const tree = loaded[component]({ offer: { formEndpoint: 'https://formspree.invalid/mock', expiresAt: '2099-01-01', status: 'active' } });
    const event = { preventDefault() {} };
    const pending = tree.props.onSubmit(event); await tree.props.onSubmit(event);
    assert.equal(count, 1, file + ': repeated submit must not post twice');
    complete(); await pending;
    assert.equal(events('contact_form_submit').length, success ? 1 : 0, file);
    if (success) {
      assert.equal(events('contact_form_submit')[0].form_id, formId);
      if (['contact_enquiry', 'audit_request'].includes(formId)) assert.equal(events('contact_form_submit')[0].service, 'web_design');
    }
    assert.equal(events('audit_complete').length, success && formId === 'audit_request' ? 1 : 0);
    globalThis.fetch = savedFetch; globalThis.FormData = originalFormData;
  }
}

// No visible JSX changed in the existing forms/tools; only handlers and imports changed.
for (const file of [...formFiles.map(f => f[0]), ...fs.readdirSync('app/tools/components').filter(f => f.endsWith('.tsx')).map(f => 'app/tools/components/' + f)]) {
  const prior = execFileSync('git', ['show', 'HEAD:' + file], { encoding: 'utf8' });
  const current = fs.readFileSync(file, 'utf8');
  const jsxNodes = source => { const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX); const nodes = []; const walk = node => { if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) { nodes.push(node.getText(tree)); return; } ts.forEachChild(node, walk); }; walk(tree); return nodes; };
  assert.deepEqual(jsxNodes(current), jsxNodes(prior), file + ': visible markup must remain identical');
}
const layout = fs.readFileSync('app/layout.tsx', 'utf8');
assert.equal((layout.match(/id="kraftt-gtm"/g) || []).length, 1);
assert.ok(layout.includes('strategy="beforeInteractive"'));
assert.ok(!layout.includes('gtag(') && !layout.includes('/gtag/js'));
assert.match(layout, /<body[^>]*>\s*\{analyticsConfig.gtmId && <noscript>/);
const configSource = 'lib/analytics/config.ts';
for (const env of [{}, { NEXT_PUBLIC_GTM_ID: '', NEXT_PUBLIC_GA_MEASUREMENT_ID: '', NEXT_PUBLIC_GOOGLE_ADS_ID: '', NEXT_PUBLIC_CLARITY_PROJECT_ID: '' }, { NEXT_PUBLIC_GTM_ID: "unsafe'", NEXT_PUBLIC_CLARITY_PROJECT_ID: 'unsafe<script>' }]) {
  const { analyticsConfig } = compile(configSource, {}, { process: { env } });
  if (Object.keys(env).length) { assert.equal(analyticsConfig.gtmId, ''); assert.equal(analyticsConfig.clarityId, ''); }
  else { assert.equal(analyticsConfig.gtmId, 'GTM-NTF8M2Q9'); assert.equal(analyticsConfig.gaId, 'G-CHE056H2KV'); assert.equal(analyticsConfig.adsId, 'AW-18424492469'); }
}
delete globalThis.window;
console.log('Analytics attribution, AI, privacy, click/route deduplication, actual form response handlers, markup invariance and configuration tests passed. No external form submissions were made.');
