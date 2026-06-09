'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

let registered = false;

/** Register ScrollTrigger once with performance-friendly defaults. */
export function ensureGsapScroll(): void {
  if (typeof window === 'undefined' || registered) return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
  ScrollTrigger.defaults({
    invalidateOnRefresh: true,
    anticipatePin: 1,
  });
}

/** Recalculate ScrollTrigger positions after layout / CMS content changes. */
export function refreshScrollLayout(): void {
  if (typeof window === 'undefined') return;
  ensureGsapScroll();
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

export { gsap, ScrollTrigger };
