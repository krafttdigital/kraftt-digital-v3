'use client';

import { useEffect, useRef } from 'react';

type RevealDirection = 'up' | 'left' | 'right' | 'scale';

export function Reveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    element.classList.add('reveal-enhanced');
    const startTransform = {
      up: 'translate3d(0, 32px, 0)',
      left: 'translate3d(-34px, 0, 0)',
      right: 'translate3d(34px, 0, 0)',
      scale: 'scale(.965)',
    }[direction];
    const endTransform = direction === 'scale' ? 'scale(1)' : 'translate3d(0, 0, 0)';
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      animation = element.animate(
        [
          { opacity: 0, transform: startTransform },
          { opacity: 1, transform: endTransform },
        ],
        {
          duration: 720,
          delay: delay * 1000,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        },
      );
      animation.addEventListener('finish', () => {
        element.classList.remove('reveal-enhanced');
        animation?.cancel();
      }, { once: true });
    }, { rootMargin: '0px 0px -10% 0px' });

    observer.observe(element);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [delay, direction]);

  return <div ref={ref} className={className}>{children}</div>;
}
