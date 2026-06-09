'use client';

import { useLayoutEffect, type RefObject } from 'react';
import { ensureGsapScroll, gsap, refreshScrollLayout } from '@/app/lib/gsap-scroll';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { useLenis } from '@/app/components/cinematic/LenisProvider';

export type EditorialCinematicRevealOptions = {
  enabled?: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  maskRef: RefObject<HTMLElement | null>;
  imageRef: RefObject<HTMLElement | null>;
  floatRef?: RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
  scrub?: number;
  initialScale?: number;
  initialYPercent?: number;
  microParallaxYPercent?: number;
};

/**
 * Luvsic-style scroll reveal: clip-path unroll + inner parallax + viewport micro-drift.
 * Initial state lives in CSS classes (not React `style`) so re-renders do not reset GSAP.
 */
export function useEditorialCinematicReveal({
  enabled = true,
  triggerRef,
  maskRef,
  imageRef,
  floatRef,
  start = 'top 92%',
  end = 'bottom 15%',
  scrub = 1.4,
  initialScale = 1.3,
  initialYPercent = -12,
  microParallaxYPercent = 8,
}: EditorialCinematicRevealOptions) {
  const reducedMotion = usePrefersReducedMotion();
  const { lenis } = useLenis();

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const mask = maskRef.current;
    const image = imageRef.current;
    const float = floatRef?.current ?? null;
    if (!enabled || !trigger || !mask || !image) return;

    /* Lenis + scrollerProxy must exist before ScrollTriggers are created. */
    if (!reducedMotion && !lenis) return;

    ensureGsapScroll();

    if (reducedMotion) {
      gsap.set(mask, {
        clipPath: 'inset(0% 0% 0% 0%)',
        WebkitClipPath: 'inset(0% 0% 0% 0%)',
      });
      gsap.set(image, { scale: 1, yPercent: 0, clearProps: 'transform' });
      if (float) gsap.set(float, { yPercent: 0, clearProps: 'transform' });
      return;
    }

    gsap.set(mask, {
      clipPath: 'inset(100% 0% 0% 0%)',
      WebkitClipPath: 'inset(100% 0% 0% 0%)',
      force3D: true,
    });

    gsap.set(image, {
      scale: initialScale,
      yPercent: initialYPercent,
      transformOrigin: 'center center',
      force3D: true,
    });

    if (float) {
      gsap.set(float, { yPercent: 0, force3D: true });
    }

    const scroller =
      typeof document !== 'undefined' ? document.documentElement : undefined;

    const ctx = gsap.context(() => {
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger,
          scroller,
          start,
          end,
          scrub,
          invalidateOnRefresh: true,
        },
      });

      revealTl.to(
        mask,
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          WebkitClipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
        },
        0,
      );

      revealTl.to(
        image,
        {
          scale: 1,
          yPercent: 0,
          ease: 'none',
        },
        0,
      );

      const microTarget = float ?? image;
      gsap.fromTo(
        microTarget,
        { yPercent: 0 },
        {
          yPercent: microParallaxYPercent,
          ease: 'none',
          scrollTrigger: {
            trigger,
            scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.8,
            invalidateOnRefresh: true,
          },
        },
      );
    }, trigger);

    const refresh = () => refreshScrollLayout();
    refresh();
    const t1 = window.setTimeout(refresh, 100);
    const t2 = window.setTimeout(refresh, 400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ctx.revert();
    };
  }, [
    enabled,
    reducedMotion,
    lenis,
    triggerRef,
    maskRef,
    imageRef,
    floatRef,
    start,
    end,
    scrub,
    initialScale,
    initialYPercent,
    microParallaxYPercent,
  ]);
}

/** Subtle hover scale on the float layer (does not fight reveal scale on the parent). */
export function useEditorialImageHover(
  maskRef: RefObject<HTMLElement | null>,
  floatRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const mask = maskRef.current;
    const float = floatRef.current;
    if (!enabled || !mask || !float || reducedMotion) return;

    const onEnter = () => {
      gsap.to(float, {
        scale: 1.02,
        duration: 0.85,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    const onLeave = () => {
      gsap.to(float, {
        scale: 1,
        duration: 0.85,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    mask.addEventListener('mouseenter', onEnter);
    mask.addEventListener('mouseleave', onLeave);

    return () => {
      mask.removeEventListener('mouseenter', onEnter);
      mask.removeEventListener('mouseleave', onLeave);
    };
  }, [maskRef, floatRef, enabled, reducedMotion]);
}
