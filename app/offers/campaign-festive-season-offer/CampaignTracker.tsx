'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '../../../lib/analytics/core';
import styles from './page.module.css';
import { useOfferExpired } from '../OfferAvailability';

export function CampaignTracker({ expiresAt, initialExpired }: { expiresAt: string; initialExpired: boolean }) {
  const expired = useOfferExpired(expiresAt, initialExpired);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const root = document.getElementById('campaign-landing');
    const hero = document.getElementById('campaign-hero');
    if (!root || !hero) return;

    trackEvent('offer_landing_view', { cta_location: 'landing' });
    const seen = new Set<string>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target.id)) continue;
        seen.add(entry.target.id);
        if (entry.target.id === 'campaign-details') trackEvent('package_details_view', { cta_location: 'details' });
        if (entry.target.id === 'campaign-price') trackEvent('price_section_view', { cta_location: 'price' });
        if (entry.target.id.startsWith('campaign-project-')) {
          const slug = (entry.target as HTMLElement).dataset.project;
          if (slug) trackEvent('project_view', { case_study: slug, cta_location: 'projects' });
        }
      }
    }, { threshold: 0.25 });
    for (const id of ['campaign-details', 'campaign-price']) {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    }
    root.querySelectorAll<HTMLElement>('[data-project]').forEach((card, index) => {
      card.id = `campaign-project-${index + 1}`;
      observer.observe(card);
    });

    const updateSticky = () => {
      setShowSticky(hero.getBoundingClientRect().bottom < 0);
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const action = target.closest<HTMLElement>('[data-campaign-event]');
      if (action?.dataset.campaignEvent === 'hero_apply_click') trackEvent('hero_apply_click', { cta_location: 'hero' });
      if (action?.dataset.campaignEvent === 'project_click') trackEvent('project_click', { case_study: action.dataset.project, cta_location: 'projects' });
      if (action?.dataset.campaignEvent === 'sticky_apply_click') {
        trackEvent('sticky_apply_click', { cta_location: 'sticky' });
        event.preventDefault();
        document.getElementById('hero-application')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'start',
        });
      }
      if (target.closest('summary')?.closest('#campaign-faq')) trackEvent('faq_interaction', { cta_location: 'faq' });
    };
    const started = new Set<string>();
    const onFormStart = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const form = event.target.closest<HTMLFormElement>('form[data-campaign-form]');
      const placement = form?.dataset.campaignForm;
      if (!placement || started.has(placement)) return;
      started.add(placement);
      trackEvent(placement === 'hero' ? 'hero_form_start' : 'final_form_start', { form_id: 'offer_enquiry', cta_location: placement });
    };

    updateSticky();
    window.addEventListener('scroll', updateSticky, { passive: true });
    window.addEventListener('resize', updateSticky);
    root.addEventListener('click', onClick);
    root.addEventListener('focusin', onFormStart);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateSticky);
      window.removeEventListener('resize', updateSticky);
      root.removeEventListener('click', onClick);
      root.removeEventListener('focusin', onFormStart);
    };
  }, []);

  return showSticky ? <a className={styles.sticky} href={expired ? "/contact" : "#hero-application"} data-campaign-event={expired ? undefined : "sticky_apply_click"}>Enquire</a> : null;
}
