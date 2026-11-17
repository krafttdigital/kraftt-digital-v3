'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import styles from './animated-testimonials.module.css';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  translation?: string;
  isExcerpt?: boolean;
  relationshipLabel?: string;
  evidenceNote?: string;
  sourceImages?: readonly { src: string; alt: string; label: string }[];
  logo?: string;
  href?: string;
  rating?: number | null;
  kind?: 'review' | 'reaction';
}

export interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
  variant?: 'home' | 'work';
}

function ReviewCard({ item, active, number }: { item: Testimonial; active: boolean; number: number }) {
  return <>
    <div className={styles.cardTop}><span>{item.kind === 'reaction' ? 'Client reactions' : 'Client testimonial'} / {String(number).padStart(2, '0')}</span><span aria-hidden="true">“</span></div>
    <div className={styles.quote}>
      <p>{item.content}</p>
      {active && item.translation && <p className={styles.translation}><strong>English translation</strong>{item.translation}</p>}
      {active && item.evidenceNote && <small className={styles.evidenceNote}>{item.evidenceNote}</small>}
    </div>
    {active && Boolean(item.sourceImages?.length) && <div className={styles.proof} aria-label={`Original messages from ${item.name}`}>
      {item.sourceImages?.map(source => <a key={source.src} href={source.src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${source.label.toLowerCase()} from ${item.name}`}>
        <span className={styles.proofImage}><Image src={source.src} alt={source.alt} fill sizes="(max-width: 760px) 38vw, 180px" /></span>
        <span>{source.label} ↗</span>
      </a>)}
    </div>}
    <div className={styles.person}>
      {item.logo && <span className={styles.logo}><Image src={item.logo} alt="" width={48} height={48} sizes="48px" /></span>}
      <span className={styles.identity}><strong>{item.name}</strong><small>{item.role} · {item.company}</small>{active && item.relationshipLabel && <small>{item.relationshipLabel}</small>}{active && item.isExcerpt && <small>Review excerpt</small>}</span>
      {active && item.href && <Link href={item.href} className={styles.projectLink} aria-label={`View ${item.company} project`}>↗</Link>}
    </div>
  </>;
}

export function AnimatedTestimonials({ testimonials, variant = 'home' }: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = testimonials.length;
  const move = useCallback((step: number) => setActiveIndex(index => (index + step + count) % count), [count]);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(motion.matches);
    update();
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(entries => setIsVisible(entries[0]?.isIntersecting ?? false), { threshold: 0.25 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (count < 2 || !isVisible || paused || reducedMotion) return;
    const timer = window.setInterval(() => move(1), 8000);
    return () => window.clearInterval(timer);
  }, [count, isVisible, paused, reducedMotion, move]);

  if (!count) return null;
  const visibleCards = count === 1 ? [{ index: 0, position: 0 }] : [
    { index: (activeIndex - 1 + count) % count, position: -1 },
    { index: activeIndex, position: 0 },
    { index: (activeIndex + 1) % count, position: 1 },
  ];
  const uniqueCards = count === 2 ? visibleCards.filter((card, index) => index !== 0) : visibleCards;

  const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || count < 2) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) move(dx < 0 ? 1 : -1);
  };

  return <section id={variant === 'home' ? 'testimonials' : undefined} ref={rootRef} className={`${styles.section} ${variant === 'work' ? styles.work : ''}`} aria-labelledby={variant === 'home' ? 'home-testimonials-title' : 'work-testimonials-title'} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }} onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={onTouchEnd} onTouchCancel={() => { touchStart.current = null; }}>
    <header className={styles.heading}>
      <span className={styles.eyebrow}>{variant === 'home' ? 'In their own words' : 'Client voice'}</span>
      {variant === 'home' ? <h2 id="home-testimonials-title">What our <em>clients say.</em></h2> : <h3 id="work-testimonials-title">In their words.</h3>}
      {variant === 'home' && <p>Real feedback from the people behind the projects.</p>}
    </header>
    <div className={styles.stage} aria-live="off">
      {uniqueCards.map(({ index, position }) => {
        const item = testimonials[index];
        return position === 0 ? <article key={item.id} className={`${styles.card} ${styles.active}`} aria-label={`Testimonial ${index + 1} of ${count}`}><ReviewCard item={item} active number={index + 1} /></article> : <button key={item.id} type="button" className={`${styles.card} ${styles.side} ${position < 0 ? styles.previous : styles.next}`} onClick={() => setActiveIndex(index)} aria-label={`Show testimonial from ${item.name}`}><ReviewCard item={item} active={false} number={index + 1} /></button>;
      })}
    </div>
    {count > 1 && <nav className={styles.controls} aria-label="Testimonial controls">
      <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial"><ChevronLeft size={20} aria-hidden="true" /></button>
      <span aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
      <button type="button" onClick={() => move(1)} aria-label="Next testimonial"><ChevronRight size={20} aria-hidden="true" /></button>
    </nav>}
  </section>;
}
