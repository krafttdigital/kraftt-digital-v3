'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

export type ProjectGallerySlide = {
  src: string;
  alt: string;
  width: number;
  height: number;
  detail: string;
};

type ProjectGalleryCarouselProps = {
  slides: ProjectGallerySlide[];
  projectName: string;
};

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ProjectGalleryCarousel({ slides, projectName }: ProjectGalleryCarouselProps) {
  const count = slides.length;
  const frameRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const positionRef = useRef(0);
  const targetRef = useRef(0);
  const widthRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const dragRef = useRef<{ id: number; x: number; position: number; velocity: number; time: number } | null>(null);
  const [selected, setSelected] = useState(0);
  const reduceMotion = useReducedMotion();

  const indexAt = useCallback(
    (position: number) => ((Math.round(position) % count) + count) % count,
    [count],
  );

  const paint = useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * 0.72;
    const position = positionRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      let offset = index - position;
      offset = ((offset % count) + count) % count;
      if (offset > count / 2) offset -= count;

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, 0.62);
      const tilt = Math.min(37 * ramp, 76) * Math.sign(offset);
      const edge = Math.min(1, Math.max(0, count / 2 - distance));

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-0.48 * width * ramp}px) rotateY(${-tilt}deg)`;
      card.style.opacity = String(Math.max(0, 1 - 0.13 * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count]);

  const settle = useCallback((target: number) => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    targetRef.current = target;
    setSelected(indexAt(target));

    if (reduceMotion) {
      positionRef.current = target;
      paint();
      animationRef.current = null;
      return;
    }

    const step = () => {
      const remaining = target - positionRef.current;
      if (Math.abs(remaining) < 0.0004) {
        positionRef.current = target;
        paint();
        animationRef.current = null;
        return;
      }
      positionRef.current += remaining * 0.16;
      paint();
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
  }, [indexAt, paint, reduceMotion]);

  const goTo = useCallback((index: number) => {
    const target = index + Math.round((targetRef.current - index) / count) * count;
    settle(target);
  }, [count, settle]);

  const nudge = useCallback((direction: number) => {
    settle(Math.round(targetRef.current) + direction);
  }, [settle]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = positionRef.current;
    suppressClickRef.current = false;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      position: positionRef.current,
      velocity: 0,
      time: performance.now(),
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = widthRef.current * 0.72;
    if (!pitch) return;

    const now = performance.now();
    const previous = positionRef.current;
    if (Math.abs(event.clientX - drag.x) > 6) suppressClickRef.current = true;
    positionRef.current = drag.position - (event.clientX - drag.x) / pitch;
    drag.velocity = ((positionRef.current - previous) / Math.max(now - drag.time, 1)) * 1000;
    drag.time = now;
    paint();
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.velocity * 0.18));
    settle(Math.round(positionRef.current + carried));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const firstCard = cardRefs.current[0];
      if (!firstCard) return;
      widthRef.current = firstCard.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  useEffect(() => () => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
  }, []);

  const active = slides[selected];

  return (
    <div
      className="project-gallery-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${projectName} project gallery`}
    >
      <div className="project-gallery-carousel-shell">
        <button type="button" className="project-gallery-carousel-nav is-previous" onClick={() => nudge(-1)} aria-label="Show previous project image">
          <ChevronLeft aria-hidden="true" />
        </button>

        <div
          className="project-gallery-carousel-frame"
          ref={frameRef}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              nudge(-1);
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              nudge(1);
            }
          }}
        >
          <div className="project-gallery-carousel-track">
            {slides.map((slide, index) => (
              <button
                type="button"
                className={`project-gallery-carousel-card${index === selected ? ' is-active' : ''}`}
                key={slide.src}
                ref={(node) => { cardRefs.current[index] = node; }}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }
                  goTo(index);
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}: ${slide.alt}`}
                aria-current={index === selected ? 'true' : undefined}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  draggable={false}
                  sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) 65vw, 56vw"
                />
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="project-gallery-carousel-nav is-next" onClick={() => nudge(1)} aria-label="Show next project image">
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="project-gallery-carousel-caption" aria-live="polite" aria-atomic="true">
        <div>
          <span>Surface {String(selected + 1).padStart(2, '0')}</span>
          <span>{String(selected + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
        </div>
        <h3>{active.alt}</h3>
        <p>{active.detail}</p>
      </div>

      <div className="project-gallery-carousel-pagination" aria-label="Choose a project image">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.src}
            onClick={() => goTo(index)}
            aria-label={`Go to image ${index + 1}: ${slide.alt}`}
            aria-current={index === selected ? 'true' : undefined}
          />
        ))}
      </div>
      <p className="project-gallery-carousel-hint">Drag, swipe or use arrow keys to explore.</p>
    </div>
  );
}
