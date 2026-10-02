'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import Balancer from 'react-wrap-balancer';

import { cn } from '@/lib/utils';
import { Cta, type CtaProps } from '@/components/ui/hero-03-utils/cta';

export interface Hero03Props {
  eyebrow?: string;
  title: string;
  description: string;
  portraitImage: string;
  portraitAlt?: string;
  animation?: 'none' | 'subtle';
  primaryCTA: CtaProps;
  secondaryCTA?: CtaProps;
  variant?: 'standard' | 'compact';
}

const variantStyles = {
  standard: {
    section: 'pb-0 pt-40 sm:pt-48',
    title: 'text-[clamp(3.6rem,8vw,7.5rem)] leading-[0.88]',
    description: 'mx-auto max-w-2xl text-base leading-relaxed sm:text-xl',
    header: 'gap-6',
    content: 'gap-12 sm:gap-16',
    portrait: 'max-w-[1500px]',
  },
  compact: {
    section: 'pb-0 pt-32 sm:pt-40',
    title: 'text-[clamp(3rem,6vw,6rem)] leading-[0.92]',
    description: 'mx-auto max-w-xl text-sm leading-relaxed sm:text-lg',
    header: 'gap-5',
    content: 'gap-10 sm:gap-14',
    portrait: 'max-w-6xl',
  },
} as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const mediaItem: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function Reveal({ active, variants, className, children }: Readonly<{
  active: boolean;
  variants?: Variants;
  className?: string;
  children: React.ReactNode;
}>) {
  if (!active) return <div className={className}>{children}</div>;
  return <motion.div variants={variants ?? item} className={className}>{children}</motion.div>;
}

export function Hero03({
  eyebrow,
  title,
  description,
  portraitImage,
  portraitAlt = '',
  animation = 'none',
  primaryCTA,
  secondaryCTA,
  variant = 'standard',
}: Readonly<Hero03Props>) {
  const reduce = useReducedMotion();
  const animate = animation === 'subtle' && !reduce;
  const vs = variantStyles[variant];

  return (
    <section className="hero03-shell relative isolate w-full overflow-hidden bg-[#0d0d0d] text-[#e8dcc8]">
      <motion.div
        className={cn('relative z-[1] mx-auto flex max-w-[1600px] flex-col px-5 sm:px-8', vs.section, vs.content)}
        variants={animate ? container : undefined}
        initial={animate ? 'hidden' : false}
        whileInView={animate ? 'visible' : undefined}
        viewport={{ once: true, margin: '-80px' }}
      >
        <Reveal active={animate} className={cn('mx-auto flex w-full max-w-5xl flex-col items-center text-center', vs.header)}>
          {eyebrow && <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-[#c5a882]">{eyebrow}</p>}
          <h1 className={cn('m-0 max-w-5xl font-serif font-light tracking-[-0.045em] text-balance', vs.title)}>
            <Balancer>{title}</Balancer>
          </h1>
          <p className={cn('m-0 text-[#b9afa0]', vs.description)}><Balancer>{description}</Balancer></p>
          {(primaryCTA?.ctaEnabled || secondaryCTA?.ctaEnabled) && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
              {primaryCTA?.ctaEnabled && <Cta cta={primaryCTA} />}
              {secondaryCTA?.ctaEnabled && <Cta cta={{ ...secondaryCTA, variant: secondaryCTA.variant ?? 'link' }} />}
            </div>
          )}
        </Reveal>

        <Reveal active={animate} variants={mediaItem} className="w-full">
          <div className={cn('relative mx-auto w-full', vs.portrait)}>
            <div className="hero03-media relative mx-auto w-full overflow-hidden">
              <Image
                src={portraitImage}
                alt={portraitAlt}
                width={1672}
                height={941}
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1600px) 94vw, 1500px"
                className="relative block aspect-[16/8.4] w-full object-cover object-center"
              />
            </div>
          </div>
        </Reveal>
      </motion.div>
    </section>
  );
}

export default Hero03;
