'use client';

import { type RefObject } from 'react';
import {
  useEditorialCinematicReveal,
  type EditorialCinematicRevealOptions,
} from '@/app/hooks/useEditorialCinematicReveal';

type ScrollImageRevealOptions = Omit<
  EditorialCinematicRevealOptions,
  'triggerRef' | 'maskRef' | 'imageRef'
> & {
  /** @deprecated Use maskRef as container with clip-path */
  containerRef?: RefObject<HTMLElement | null>;
  maskRef?: RefObject<HTMLElement | null>;
  imageRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
};

/**
 * @deprecated Prefer `useEditorialCinematicReveal` + `EditorialScrollRevealImage`.
 */
export function useScrollImageReveal(
  containerRef: RefObject<HTMLElement | null>,
  imageRef: RefObject<HTMLElement | null>,
  options: Omit<ScrollImageRevealOptions, 'imageRef'> = {},
) {
  const triggerRef = options.triggerRef ?? containerRef;
  const maskRef = options.maskRef ?? containerRef;

  useEditorialCinematicReveal({
    triggerRef,
    maskRef,
    imageRef,
    floatRef: options.floatRef,
    enabled: options.enabled,
    start: options.start ?? 'top 92%',
    end: options.end ?? 'bottom 15%',
    scrub: typeof options.scrub === 'number' ? options.scrub : 1.4,
    initialScale: options.initialScale,
    initialYPercent: options.initialYPercent ?? -12,
    microParallaxYPercent: options.microParallaxYPercent,
  });
}
