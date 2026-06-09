'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { ensureGsapScroll, gsap, ScrollTrigger } from '@/app/lib/gsap-scroll';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';

type FluidAmbientContextValue = {
  timeScaleRef: MutableRefObject<number>;
  reducedMotion: boolean;
};

const FluidAmbientContext = createContext<FluidAmbientContextValue | null>(null);

export function useFluidAmbient(): FluidAmbientContextValue {
  const ctx = useContext(FluidAmbientContext);
  if (!ctx) {
    throw new Error('useFluidAmbient must be used within FluidAmbientProvider');
  }
  return ctx;
}

/** Optional hook for components outside provider (returns static scale). */
export function useFluidAmbientOptional(): FluidAmbientContextValue {
  const ctx = useContext(FluidAmbientContext);
  const fallback = useRef(1);
  const reducedMotion = usePrefersReducedMotion();
  return ctx ?? { timeScaleRef: fallback, reducedMotion };
}

function FluidScrollVelocitySync() {
  const { timeScaleRef } = useFluidAmbient();

  useEffect(() => {
    ensureGsapScroll();

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity());
        const target = 1 + Math.min(velocity / 900, 2.75);
        timeScaleRef.current += (target - timeScaleRef.current) * 0.18;
      },
    });

    const decay = () => {
      const drift = 1 - timeScaleRef.current;
      if (Math.abs(drift) > 0.001) {
        timeScaleRef.current += drift * 0.06;
      }
    };
    gsap.ticker.add(decay);

    return () => {
      trigger.kill();
      gsap.ticker.remove(decay);
    };
  }, [timeScaleRef]);

  return null;
}

export function FluidAmbientProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const timeScaleRef = useRef(1);

  return (
    <FluidAmbientContext.Provider value={{ timeScaleRef, reducedMotion }}>
      {!reducedMotion && <FluidScrollVelocitySync />}
      {children}
    </FluidAmbientContext.Provider>
  );
}
