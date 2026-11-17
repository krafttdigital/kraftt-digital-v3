'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import styles from './HomeResultsCarousel.module.css';

export type HomeResultSlide = {
  id: string;
  project: string;
  slug: string;
  src: string;
  mobileSrc?: string;
  alt: string;
  title: string;
  caption: string;
  kind: string;
  query?: string;
};

export function HomeResultsCarousel({ slides }: { slides: HomeResultSlide[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const swipeRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const count = slides.length;
  const active = slides[index];
  const previous = slides[(index - 1 + count) % count];
  const next = slides[(index + 1) % count];

  const move = useCallback((direction: number) => {
    setIndex((current) => (current + direction + count) % count);
  }, [count]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduceMotion(media.matches);
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updateMotion();
    updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!visible || !pageVisible || paused || reduceMotion || count < 2) return;
    const timer = window.setTimeout(() => move(1), 3000);
    return () => window.clearTimeout(timer);
  }, [visible, pageVisible, paused, reduceMotion, count, index, move]);

  const handleSwipeStart = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType === 'mouse' && event.button !== 0) || (event.target instanceof Element && event.target.closest('button, a'))) return;
    setPaused(true);
    swipeRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSwipeEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    setPaused(false);
    if (!start || start.pointerId !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) >= 40 && Math.abs(x) > Math.abs(y) * 1.2) move(x < 0 ? 1 : -1);
  };

  if (!active) return null;

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="home-results-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Work you can see</p>
            <h2 id="home-results-title">Results that <em>speak.</em></h2>
          </div>
          <p>Published pages and supplied search captures from our case studies. Each search view is a snapshot; placement can change by time and location.</p>
        </div>

        <div
          className={styles.card}
          role="region"
          aria-roledescription="carousel"
          aria-label="Case study results"
          onFocusCapture={(event) => { if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setPaused(true); }}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
        >
          <div className={styles.visual} key={active.id}>
            <div className={styles.mobileCarouselStage} onPointerDown={handleSwipeStart} onPointerUp={handleSwipeEnd} onPointerCancel={() => { swipeRef.current = null; setPaused(false); }}>
              <div className={`${styles.peek} ${styles.peekPrevious}`} aria-hidden="true"><Image src={previous.mobileSrc ?? previous.src} alt="" fill loading="lazy" sizes="45vw" draggable={false} style={{ objectFit: 'contain', objectPosition: 'center' }} /></div>
              <div className={styles.imageFrame}>
                <div className={styles.imageCanvas}>
                  <Image className={active.mobileSrc ? styles.desktopImage : undefined} src={active.src} alt={active.alt} fill loading="lazy" sizes="(max-width: 760px) 75vw, 60vw" draggable={false} style={{ objectFit: 'contain', objectPosition: 'center' }} />
                  {active.mobileSrc && <Image className={styles.mobileImage} src={active.mobileSrc} alt={`${active.alt} on mobile`} fill loading="lazy" sizes="(max-width: 760px) 75vw, 1px" draggable={false} style={{ objectFit: 'contain', objectPosition: 'center' }} />}
                </div>
              </div>
              <div className={`${styles.peek} ${styles.peekNext}`} aria-hidden="true"><Image src={next.mobileSrc ?? next.src} alt="" fill loading="lazy" sizes="45vw" draggable={false} style={{ objectFit: 'contain', objectPosition: 'center' }} /></div>
              <button className={`${styles.stageNav} ${styles.stageNavPrevious}`} type="button" onClick={() => move(-1)} aria-label="Previous result">←</button>
              <button className={`${styles.stageNav} ${styles.stageNavNext}`} type="button" onClick={() => move(1)} aria-label="Next result">→</button>
            </div>
            <span className={styles.imageLabel}>Supplied capture / published work</span>
          </div>
          <div className={styles.copy} key={`${active.id}-copy`}>
            <div className={styles.copyTop}><span>{active.kind}</span><span>{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span></div>
            <p className={styles.project}>{active.project}</p>
            <h3>{active.title}</h3>
            <p className={styles.description}>{active.caption}</p>
            {active.query && <p className={styles.query}>Search shown: “{active.query}”</p>}
            <div className={styles.mobilePagination}>
              <p>Result <strong>{String(index + 1).padStart(2, '0')}</strong> / {String(count).padStart(2, '0')}</p>
              <div aria-label="Choose a result">{slides.map((slide, slideIndex) => <button key={slide.id} type="button" aria-label={`Show result ${slideIndex + 1}: ${slide.title}`} aria-current={slideIndex === index ? 'true' : undefined} onClick={() => setIndex(slideIndex)} />)}</div>
            </div>
            <div className={styles.links}>
              <Link href={`/work/${active.slug}#case-proof`}>Read the case study <span aria-hidden="true">↗</span></Link>
              <a href={active.src} target="_blank" rel="noopener noreferrer">View full capture <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <p>Swipe or drag to explore</p>
          <div className={styles.progress} aria-hidden="true"><span style={{ width: `${((index + 1) / count) * 100}%` }} /></div>
        </div>
      </div>
    </section>
  );
}
