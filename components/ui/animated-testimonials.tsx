'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import styles from './animated-testimonials.module.css';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  translation?: string;
  relationshipLabel?: string;
  logo: string;
  href: string;
  rating?: number | null;
}

export interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
}

function arrangeReviews(testimonials: Testimonial[], perPage: number) {
  const companies = new Map<string, Testimonial[]>();
  for (const item of testimonials) {
    const group = companies.get(item.company) ?? [];
    group.push(item);
    companies.set(item.company, group);
  }
  // Stable interleaving avoids adjacent reviews from the same project and SSR randomness.
  const ordered: Testimonial[] = [];
  for (let round = 0; ordered.length < testimonials.length; round++) {
    for (const group of companies.values()) if (group[round]) ordered.push(group[round]);
  }
  return Array.from({ length: Math.max(1, ordered.length - perPage + 1) }, (_, start) => {
    const candidates = [...ordered.slice(start), ...ordered.slice(0, start)];
    const selected: Testimonial[] = [];
    for (const item of candidates) {
      if (selected.length === perPage) break;
      if (!selected.some(other => other.company === item.company)) selected.push(item);
    }
    // Still show available reviews if fewer distinct projects exist than card slots.
    for (const item of candidates) {
      if (selected.length === perPage) break;
      if (!selected.includes(item)) selected.push(item);
    }
    return selected;
  });
}

const subscribeToViewport = (notify: () => void) => {
  const queries = ['(max-width: 760px)', '(max-width: 1000px)'].map(query => window.matchMedia(query));
  queries.forEach(query => query.addEventListener('change', notify));
  return () => queries.forEach(query => query.removeEventListener('change', notify));
};
const viewportSnapshot = () => window.matchMedia('(max-width: 760px)').matches ? 1 : window.matchMedia('(max-width: 1000px)').matches ? 2 : 3;
const serverSnapshot = () => 3;

export function AnimatedTestimonials({ testimonials }: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const perPage = useSyncExternalStore(subscribeToViewport, viewportSnapshot, serverSnapshot);
  const pages = useMemo(() => arrangeReviews(testimonials, perPage), [testimonials, perPage]);
  const pageCount = pages.length;
  const active = Math.min(activeIndex, pageCount - 1);
  const reduceMotion = useReducedMotion();
  const rotating = inView && !keyboardFocused && !hovered && !manuallyPaused && !reduceMotion && pageCount > 1;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveIndex(index => (index + 1) % pageCount);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [rotating, pageCount, activeIndex]);

  if (!testimonials.length) return null;

  return (
    <section id="testimonials" ref={sectionRef} className={styles.section} aria-labelledby="home-testimonials-title"
      onPointerDownCapture={() => setKeyboardFocused(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setKeyboardFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false); }}>
      <div className={styles.inner}>
        <header className={styles.heading}>
          <span className={styles.eyebrow}>Client testimonials</span>
          <h2 id="home-testimonials-title">What our <em>clients say.</em></h2>
        </header>
        <div className={styles.stage} aria-roledescription="carousel" aria-label="Client testimonials" aria-live={rotating ? 'off' : 'polite'}>
          {pages.map((items, page) => <motion.div key={`${perPage}-${page}`} className={styles.slide} role="group" aria-hidden={active !== page} inert={active !== page} aria-roledescription="slide" aria-label={`${page + 1} of ${pageCount}`}
            initial={false} animate={{ opacity: active === page ? 1 : 0, x: reduceMotion || active === page ? 0 : 16 }} transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' }} style={{ zIndex: active === page ? 1 : 0, pointerEvents: active === page ? 'auto' : 'none' }}>
            {items.map(item => <article key={item.id} className={styles.card}>
              <span className={styles.quoteMark} aria-hidden="true">“</span>
              <blockquote><p>{item.content}</p>{item.translation && <p><strong>English translation:</strong> {item.translation}</p>}</blockquote>
              <footer className={styles.person}>
                <div className={styles.logo}><Image src={item.logo} alt={`${item.company} logo`} width={112} height={72} sizes="64px" /></div>
                <div className={styles.identity}><h3>{item.name}</h3><p>{item.role} · {item.company}</p><p>Client review{item.relationshipLabel ? ` · ${item.relationshipLabel}` : ''}</p><Link href={item.href}>View their project <span aria-hidden="true">↗</span></Link></div>
              </footer>
            </article>)}
          </motion.div>)}
        </div>
        {pageCount > 1 && <nav className={styles.controls} aria-label="Testimonial navigation">
          <div className={styles.dots}>
            {pages.map((items, page) => <button key={page} type="button" aria-label={`View testimonial page ${page + 1}: ${items.map(item => item.name).join(' and ')}`} aria-current={active === page ? 'true' : undefined} onClick={() => setActiveIndex(page)}><span data-active={active === page} /></button>)}
          </div>
          <button className={styles.pause} type="button" aria-label={manuallyPaused ? 'Play testimonials' : 'Pause testimonials'} aria-pressed={manuallyPaused} onClick={() => setManuallyPaused(value => !value)}>{manuallyPaused ? 'Play' : 'Pause'}</button>
        </nav>}
      </div>
    </section>
  );
}

