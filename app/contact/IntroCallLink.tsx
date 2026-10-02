'use client';

import type { MouseEvent, ReactNode } from 'react';
import { whatsappUrl } from '../data/site';

const baseMessage = 'Hi Kraftt, I would like to request a free introductory call about my business.';

export function IntroCallLink({ children, className = '', ariaLabel }: { children: ReactNode; className?: string; ariaLabel?: string }) {
  const attachContext = (event: MouseEvent<HTMLAnchorElement>) => {
    const params = new URLSearchParams(window.location.search);
    const context = ['service', 'bundle', 'market', 'tool', 'tier', 'focus', 'score', 'siteType', 'pages', 'addons', 'urgency', 'socialTier', 'platforms', 'posts', 'stories', 'community', 'roi', 'roas', 'breakEven', 'invoiceTotal', 'gstRate', 'gstMode']
      .flatMap((key) => { const value = params.get(key); return value ? [`${key}: ${value}`] : []; });
    if (context.length) event.currentTarget.href = whatsappUrl(`${baseMessage}\n\nContext from the website:\n${context.join('\n')}`);
  };

  return <a className={className} aria-label={ariaLabel} href={whatsappUrl(baseMessage)} onClick={attachContext} target="_blank" rel="noopener noreferrer">{children}</a>;
}
