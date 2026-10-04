'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsConfig } from '../../lib/analytics/config';
import { AttributionStore, configurePaths, configureServiceNames, formContext, pageContext, safePath, setAttribution, token, trackEvent, type FormId, type Params } from '../../lib/analytics/core';

let store: AttributionStore | undefined;
let lastPath: string | undefined;
let lastInteraction = 0;
const startedForms = new WeakSet<HTMLFormElement>();
const startedTools = new WeakSet<Element>();
const engagedPricing = new WeakSet<Element>();

function storage(kind: 'localStorage' | 'sessionStorage') { try { return window[kind]; } catch { return undefined; } }
function formId(form: HTMLFormElement): FormId | undefined {
  if (form.classList.contains('contact-form')) return 'contact_enquiry';
  if (form.classList.contains('offer-enquiry-form')) return 'offer_enquiry';
  if (form.classList.contains('partner-application-form')) return 'partner_application';
  if (form.classList.contains('audit-form')) return 'audit_request';
}
function location(element: Element): string {
  if (element.closest('header, nav')) return 'navigation';
  if (element.closest('footer')) return 'footer';
  if (element.closest('.floating-whatsapp')) return 'floating';
  if (element.closest('form')) return 'form';
  if (element.closest('#packages, #pricing, #compare-bundles, [class*="packageCard"], [class*="package-card"]')) return 'pricing';
  const section = element.closest('section');
  const classes = section?.className || '';
  if (/hero/.test(classes)) return 'hero';
  if (/final|bottom|cta/.test(classes)) return 'bottom';
  if (/faq/.test(classes)) return 'faq';
  return 'body';
}
function pricing(element: Element) {
  const area = element.closest('#packages, #pricing, #compare-bundles, [class*="packageCard"], [class*="package-card"], .service-simple-package, .bundle-detail-hero');
  if (area && !engagedPricing.has(area)) {
    engagedPricing.add(area); trackEvent('pricing_engagement', { cta_location: 'pricing' });
  }
  return area;
}
function interaction(event: Event) {
  if (!(event.target instanceof Element)) return;
  const now = Date.now();
  if (store && now - lastInteraction > 1000) {
    lastInteraction = now;
    setAttribution(store.visit(window.location.href, document.referrer, false, now));
  }
  const target = event.target;
  const field = target.closest('input, select, textarea');
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
    const meaningful = field.type !== 'hidden' && field.name !== '_gotcha' && (field instanceof HTMLInputElement && ['checkbox', 'radio'].includes(field.type) ? field.checked : Boolean(field.value.trim()));
    const form = field.closest('form');
    const id = form && formId(form);
    if (meaningful && form && id && !startedForms.has(form)) {
      startedForms.add(form); trackEvent('contact_form_start', { ...formContext(form), form_id: id, cta_location: 'form' });
      if (id === 'audit_request') trackEvent('audit_start', { form_id: id, cta_location: 'form' });
    }
  }
  const tool = target.closest('#tool-workspace');
  const toolContext = pageContext(window.location.pathname);
  if (tool && toolContext.tool_name && (field || target.closest('button')) && !startedTools.has(tool)) {
    startedTools.add(tool); trackEvent('tool_start', { cta_location: 'tool' });
  }
}
function click(event: MouseEvent) {
  if (event.button !== 0 || !(event.target instanceof Element)) return;
  interaction(event);
  const anchor = event.target.closest('a');
  if (!anchor) return;
  let url: URL;
  try { url = new URL(anchor.href, window.location.origin); } catch { return; }
  const context = pageContext(window.location.pathname);
  const params: Params = { cta_location: location(anchor) };
  const text = (anchor.textContent || anchor.getAttribute('aria-label') || '').toLowerCase();
  const whatsapp = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com', 'whatsapp.com'].includes(url.hostname);
  const booking = /(book|schedule|free|introductory).{0,25}(call|consultation)/.test(text) || ['calendly.com', 'cal.com'].includes(url.hostname);
  const enquiry = whatsapp || url.protocol === 'tel:' || url.protocol === 'mailto:' || booking || url.origin === window.location.origin && ['/contact', '/audit'].includes(url.pathname);
  const area = pricing(anchor);
  const packageCard = anchor.closest('.service-simple-package, [class*="packageCard"], [class*="package-card"], .bundle-detail-hero, .services-flow-bundle-card');
  const bundleDestination = url.origin === window.location.origin && pageContext(url.pathname).page_type === 'bundle';
  if ((packageCard || context.page_type === 'bundle') && (enquiry || bundleDestination)) {
    // These headings are static published package names, never form input or WhatsApp query text.
    params.package_name = token(packageCard?.querySelector('h3')?.textContent?.trim().replace(/[—–&]/g, ' ')) || context.package_name || pageContext(url.pathname).package_name;
    trackEvent('package_cta_click', { ...params, cta_location: packageCard ? 'pricing' : params.cta_location, cta_label: bundleDestination ? 'view_bundle' : 'discuss_package' });
  }
  if (whatsapp) trackEvent('whatsapp_click', { ...params, destination_type: 'whatsapp', cta_label: 'whatsapp' });
  else if (url.protocol === 'tel:') trackEvent('phone_click', { ...params, destination_type: 'phone', cta_label: 'phone' });
  else if (url.protocol === 'mailto:') trackEvent('email_click', { ...params, destination_type: 'email', cta_label: 'email' });
  else if (!booking && /^https?:$/.test(url.protocol) && url.origin !== window.location.origin) trackEvent('outbound_click', { ...params, destination_type: 'external', cta_label: 'external_link' });
  if (booking) trackEvent('book_call_click', { ...params, destination_type: 'booking', cta_label: 'book_call' });
  if (context.page_type === 'case_study' && enquiry) trackEvent('case_study_cta_click', { ...params, cta_label: 'enquire' });
  if (context.service && (enquiry || area || url.hash === '#packages')) trackEvent('service_cta_click', { ...params, cta_label: enquiry ? 'enquire' : 'view_pricing' });
  else if (url.origin === window.location.origin && pageContext(url.pathname).service) trackEvent('service_cta_click', { ...params, service: pageContext(url.pathname).service, cta_label: 'view_service' });
  if (['#packages', '#compare-bundles'].includes(url.hash) && !area) trackEvent('pricing_engagement', { ...params, cta_label: 'view_pricing' });
}

export function AnalyticsRuntime({ paths, services }: { paths: string[]; services: Record<string, string> }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!analyticsConfig.gtmId) return;
    configurePaths(paths);
    configureServiceNames(services);
    store ??= new AttributionStore(storage('localStorage'), storage('sessionStorage'));
    const initial = lastPath === undefined;
    const previous = lastPath;
    const path = safePath(pathname || '/');
    setAttribution(store.visit(window.location.href, document.referrer, initial));
    if (previous !== path) {
      lastPath = path;
      trackEvent('kraftt_page_view', {
        page_location: window.location.href,
        page_referrer: initial ? document.referrer : window.location.origin + (previous || '/'),
      });
    }
  }, [pathname, paths, services]);
  useEffect(() => {
    if (!analyticsConfig.gtmId) return;
    document.addEventListener('click', click, true);
    document.addEventListener('input', interaction, true);
    document.addEventListener('change', interaction, true);
    return () => {
      document.removeEventListener('click', click, true);
      document.removeEventListener('input', interaction, true);
      document.removeEventListener('change', interaction, true);
    };
  }, []);
  return null;
}
