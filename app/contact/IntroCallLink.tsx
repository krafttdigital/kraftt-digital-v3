'use client';

import type { MouseEvent, ReactNode } from 'react';
import { whatsappUrl } from '../data/site';
import { parseLeadHandoff } from '../data/handoff';

const baseMessage = 'Hi Kraftt, I would like to request a free call about my business.';

export function IntroCallLink({ children, className = '', ariaLabel }: { children: ReactNode; className?: string; ariaLabel?: string }) {
  const attachContext = (event: MouseEvent<HTMLAnchorElement>) => {
    const params = new URLSearchParams(window.location.search);
    const handoff = parseLeadHandoff(params);
    const pageName = handoff.source === 'score' ? 'Digital Presence Score' : handoff.source === 'calculator' ? 'calculator' : handoff.source === 'offer' ? 'offer' : handoff.service ? 'Services' : 'website';
    const introduction = handoff.service
      ? `Hi Kraftt, I'd like a free call about ${handoff.service.name} (from the ${pageName} page).`
      : `Hi Kraftt, I'd like a free call (from the ${pageName} page).`;
    const context = ['service', 'bundle', 'market', 'tool', 'tier', 'focus', 'score', 'siteType', 'pages', 'addons', 'urgency', 'socialTier', 'platforms', 'posts', 'stories', 'community', 'roi', 'roas', 'breakEven', 'invoiceTotal', 'gstRate', 'gstMode']
      .flatMap((key) => { const value = params.get(key); return value ? [`${key}: ${value}`] : []; });
    event.currentTarget.href = whatsappUrl(context.length ? `${introduction}\n\nContext from the website:\n${context.join('\n')}` : introduction);
  };

  return <a className={className} aria-label={ariaLabel} href={whatsappUrl(baseMessage)} onClick={attachContext} target="_blank" rel="noopener noreferrer">{children}</a>;
}
