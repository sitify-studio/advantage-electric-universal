'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

type HeroIntroContextValue = {
  isHeroIntroPending: boolean;
  beginHeroIntro: () => void;
  completeHeroIntro: () => void;
};

const HeroIntroContext = createContext<HeroIntroContextValue | null>(null);

export function HeroIntroProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomeRoute = pathname === '/';
  const { pages } = useWebBuilder();

  const introExpected = useMemo(
    () => Boolean(pages?.find((p) => p.pageType === 'home')?.hero?.enabled),
    [pages]
  );

  const [introActive, setIntroActive] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);

  // Reset intro when leaving home; do not re-arm after hero has completed (avoids stuck hidden header).
  useEffect(() => {
    if (!isHomeRoute) {
      setIntroCompleted(false);
      setIntroActive(false);
    }
  }, [isHomeRoute]);

  useEffect(() => {
    if (isHomeRoute && introExpected && !introCompleted) {
      setIntroActive(true);
    } else if (!introExpected) {
      setIntroActive(false);
    }
  }, [isHomeRoute, introExpected, introCompleted]);

  const beginHeroIntro = useCallback(() => {
    if (!introCompleted) setIntroActive(true);
  }, [introCompleted]);

  const completeHeroIntro = useCallback(() => {
    setIntroActive(false);
    setIntroCompleted(true);
  }, []);

  const isHeroIntroPending = introExpected && introActive && isHomeRoute;

  const value = useMemo(
    () => ({
      isHeroIntroPending,
      beginHeroIntro,
      completeHeroIntro,
    }),
    [isHeroIntroPending, beginHeroIntro, completeHeroIntro]
  );

  return (
    <HeroIntroContext.Provider value={value}>{children}</HeroIntroContext.Provider>
  );
}

export function useHeroIntro(): HeroIntroContextValue {
  const ctx = useContext(HeroIntroContext);
  if (!ctx) {
    return {
      isHeroIntroPending: false,
      beginHeroIntro: () => {},
      completeHeroIntro: () => {},
    };
  }
  return ctx;
}
