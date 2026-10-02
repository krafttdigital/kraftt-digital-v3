'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type LoaderPhase = 'visible' | 'leaving' | 'hidden';

export function SiteLoader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<LoaderPhase>('visible');
  const initialPath = useRef(true);
  const routeFallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const leave = window.setTimeout(() => setPhase('leaving'), 850);
    const hide = window.setTimeout(() => setPhase('hidden'), 1300);

    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    if (initialPath.current) {
      initialPath.current = false;
      return;
    }

    if (routeFallback.current) window.clearTimeout(routeFallback.current);
    const leave = window.setTimeout(() => setPhase('leaving'), 220);
    const hide = window.setTimeout(() => setPhase('hidden'), 670);

    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(hide);
    };
  }, [pathname]);

  useEffect(() => {
    const handleInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (destination.origin !== current.origin || destination.pathname === current.pathname) return;

      setPhase('visible');
      if (routeFallback.current) window.clearTimeout(routeFallback.current);
      routeFallback.current = window.setTimeout(() => setPhase('hidden'), 5000);
    };

    document.addEventListener('click', handleInternalNavigation, true);
    return () => {
      document.removeEventListener('click', handleInternalNavigation, true);
      if (routeFallback.current) window.clearTimeout(routeFallback.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('site-loader-active', phase !== 'hidden');
    return () => document.documentElement.classList.remove('site-loader-active');
  }, [phase]);

  return (
    <div className="site-loader" data-phase={phase} role="status" aria-live="polite" aria-label="Loading Kraftt Digital">
      <div className="site-loader-frame" aria-hidden="true">
        <Image className="site-loader-art" src="/loading.svg" alt="" width={720} height={720} priority unoptimized />
        <span className="site-loader-label">Kraftt Digital</span>
      </div>
      <span className="sr-only">Loading Kraftt Digital</span>
    </div>
  );
}
