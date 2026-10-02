'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { ClientReview } from '../data/reviews';
import { ReviewCard } from './ReviewCard';

type ReviewsCarouselProps = {
  reviews: ClientReview[];
  variant: 'home' | 'project';
  projectName?: string;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function ReviewsCarousel({ reviews, variant, projectName }: ReviewsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const isHome = variant === 'home';

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % reviews.length);
  }, [reviews.length]);

  const goPrevious = () => {
    setActiveIndex((current) => (current - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (reduceMotion || isPaused || reviews.length < 2) return;
    const timer = window.setInterval(goNext, 8000);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, reduceMotion, reviews.length]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = carouselRef.current?.getBoundingClientRect();
    const watermark = watermarkRef.current;
    if (!bounds || !watermark || reduceMotion) return;
    const horizontalDistance = event.clientX - (bounds.left + bounds.width / 2);
    const verticalDistance = event.clientY - (bounds.top + bounds.height / 2);
    const x = Math.max(-16, Math.min(16, horizontalDistance / 15.625));
    const y = Math.max(-8, Math.min(8, verticalDistance / 22.5));
    watermark.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const handlePointerLeave = () => {
    if (watermarkRef.current) watermarkRef.current.style.transform = 'translate3d(0, 0, 0)';
    setIsPaused(false);
  };

  return (
    <div
      className="client-reviews-carousel"
      ref={carouselRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <span
        ref={watermarkRef}
        className="client-reviews-watermark"
        aria-hidden="true"
      >
        {String(activeIndex + 1).padStart(2, '0')}
      </span>

      <div className="client-reviews-rail" aria-hidden="true">
        <span>Testimonials</span>
        <i><b style={{ height: `${((activeIndex + 1) / reviews.length) * 100}%` }} /></i>
      </div>

      <div className="client-reviews-stage">
        <header className="client-reviews-heading">
          <div>
            <p className="eyebrow eyebrow-dark">{isHome ? 'Client reviews' : 'Client perspective'}</p>
            <span>{String(reviews.length).padStart(2, '0')} perspective{reviews.length === 1 ? '' : 's'}</span>
          </div>
          <h2 id={`client-reviews-${variant}-title`}>
            {isHome ? <>Proof, <em>in their words.</em></> : <>What the <em>client says.</em></>}
          </h2>
          <div className="client-reviews-heading-action">
            <p>
              {isHome
                ? 'Real feedback from the people behind the work.'
                : `First-hand feedback from ${projectName ?? 'this project'}.`}
            </p>
            <Link href={isHome ? '/work' : '/audit'}>
              {isHome ? 'Explore the work' : 'Start with an audit'} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        <div className="client-reviews-slides" aria-live="polite" aria-atomic="true">
          {reviews.map((review, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                className={`client-review-slide${isActive ? ' is-active' : ''}`}
                key={review.id}
                aria-hidden={!isActive}
                inert={!isActive}
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: reduceMotion
                    ? 'none'
                    : `translate3d(${isActive ? 0 : index < activeIndex ? -24 : 24}px, 0, 0)`,
                  filter: isActive ? 'blur(0px)' : 'blur(7px)',
                }}
              >
                <ReviewCard review={review} index={index} showProjectLink={isHome} />
              </div>
            );
          })}
        </div>

        <div className="client-reviews-controls">
          <span>Review {String(activeIndex + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}</span>
          {reviews.length > 1 && (
            <div>
              <button type="button" onClick={goPrevious} aria-label="Show previous client review">
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" onClick={goNext} aria-label="Show next client review">
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="client-reviews-ticker" aria-hidden="true">
        <div>
          {[...reviews, ...reviews, ...reviews].map((review, index) => (
            <span key={`${review.id}-${index}`}>{review.company} <i>•</i></span>
          ))}
        </div>
      </div>
    </div>
  );
}
