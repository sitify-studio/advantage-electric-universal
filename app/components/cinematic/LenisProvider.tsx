'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import {
  ensureGsapScroll,
  refreshScrollLayout,
  gsap,
  ScrollTrigger,
} from '@/app/lib/gsap-scroll';

type LenisContextValue = {
  lenis: Lenis | null;
  reducedMotion: boolean;
};

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  reducedMotion: false,
});

export function useLenis(): LenisContextValue {
  return useContext(LenisContext);
}

/** Refresh ScrollTrigger when async site builder content finishes loading. */
function ScrollLayoutSync() {
  const { loading, pages, services, blogPosts, projects } = useWebBuilder();

  useEffect(() => {
    if (loading) return;
    refreshScrollLayout();
    const delayed = window.setTimeout(refreshScrollLayout, 350);
    return () => window.clearTimeout(delayed);
  }, [loading, pages, services, blogPosts, projects]);

  return null;
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    ensureGsapScroll();

    if (reducedMotion) {
      refreshScrollLayout();
      return;
    }

    const instance = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.15,
      autoResize: true,
      anchors: true,
    });

    setLenis(instance);

    const root = document.documentElement;

    instance.on('scroll', ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(root, {
      scrollTop(value?: number) {
        if (arguments.length && typeof value === 'number') {
          instance.scrollTo(value, { immediate: true });
        }
        return instance.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    /** All ScrollTriggers must use the Lenis-proxied scroller or scrub animations stay at 0. */
    ScrollTrigger.defaults({
      scroller: root,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    });

    const onStRefresh = () => instance.resize();
    ScrollTrigger.addEventListener('refresh', onStRefresh);

    const onTicker = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => refreshScrollLayout();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('load', onResize);

    requestAnimationFrame(refreshScrollLayout);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      ScrollTrigger.removeEventListener('refresh', onStRefresh);
      gsap.ticker.remove(onTicker);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  return (
    <LenisContext.Provider value={{ lenis, reducedMotion }}>
      <ScrollLayoutSync />
      {children}
    </LenisContext.Provider>
  );
}
