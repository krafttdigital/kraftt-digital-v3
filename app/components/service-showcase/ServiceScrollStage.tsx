'use client';

import Image from 'next/image';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { PlayerRef } from '@remotion/player';
import { artworkHeight, artworkWidth, chapterPosition, framesPerChapter, type ShowcaseChapter } from './motion';
import styles from './showcase.module.css';

const ServiceMotionPlayer = lazy(() => import('./ServiceMotionPlayer'));

export function ServiceScrollStage({ chapters }: { chapters: ShowcaseChapter[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef | null>(null);
  const frame = useRef(0);
  const [active, setActive] = useState(0);
  const [motion, setMotion] = useState(false);
  const connectPlayer = useCallback((instance: PlayerRef | null) => {
    player.current = instance;
    instance?.seekTo(frame.current);
  }, []);

  useEffect(() => {
    const stageNode = stage.current;
    const section = stageNode?.closest('#what-we-build');
    if (!stageNode || !section) return;
    const cards = chapters.map(chapter => document.getElementById(chapter.id));
    if (cards.some(card => !card)) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stacked = window.matchMedia('(max-width: 820px)');
    let inView = false;
    let pending = 0;
    let current = 0;

    function measure() {
      pending = 0;
      if (!inView || !stageNode) return;
      const { top, height } = stageNode.getBoundingClientRect();
      const readingLine = stacked.matches && !reduce.matches
        ? top + height + 36
        : window.innerHeight * 0.52;
      const anchors = cards.map(card => {
        const bounds = card!.getBoundingClientRect();
        return bounds.top + (stacked.matches && !reduce.matches ? 0 : bounds.height / 2);
      });
      const position = chapterPosition(anchors, readingLine);
      const next = Math.round(position);
      if (next !== current) {
        current = next;
        setActive(next);
      }
      const nextFrame = Math.round(position * framesPerChapter);
      if (nextFrame !== frame.current) {
        frame.current = nextFrame;
        player.current?.seekTo(nextFrame);
      }
    }

    function schedule() {
      if (inView && !pending) pending = requestAnimationFrame(measure);
    }
    function syncMotion() {
      setMotion(inView && !reduce.matches);
      schedule();
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncMotion();
    }, { rootMargin: '280px 0px' });
    const resize = new ResizeObserver(schedule);
    observer.observe(section);
    resize.observe(section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduce.addEventListener('change', syncMotion);
    return () => {
      cancelAnimationFrame(pending);
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduce.removeEventListener('change', syncMotion);
    };
  }, [chapters]);

  return <div ref={stage} className={styles.stage} data-motion={motion ? 'on' : undefined}>
    <div className={styles.artwork} aria-hidden="true" inert>
      <Image src={chapters[active].artwork} alt="" width={artworkWidth} height={artworkHeight} unoptimized />
      {motion && <div className={styles.player} data-service-player>
        <Suspense fallback={null}>
          <ServiceMotionPlayer images={chapters.map(chapter => chapter.artwork)} playerRef={connectPlayer} />
        </Suspense>
      </div>}
    </div>
    <nav className={styles.chapters} aria-label="Jump to a service">
      {chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`}
        aria-current={active === index ? 'location' : undefined}>{chapter.label}</a>)}
    </nav>
  </div>;
}
