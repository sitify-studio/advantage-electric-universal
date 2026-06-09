'use client';

import { useMemo } from 'react';
import { useThemeFonts } from '@/app/hooks/useTheme';

/** Builder heading (italic) + body (bold) for the editorial hero — no hardcoded fonts. */
export function useHeroEditorialFonts() {
  const { heading, body } = useThemeFonts();

  return useMemo(
    () => ({
      headingFont: heading?.trim() || '',
      bodyFont: body?.trim() || '',
      scriptStyle: {
        fontFamily: 'var(--wb-heading-font), Georgia, serif',
        fontStyle: 'italic' as const,
        fontWeight: 400,
      },
      sansStyle: {
        fontFamily: 'var(--wb-body-font), ui-sans-serif, system-ui, sans-serif',
        fontStyle: 'normal' as const,
        fontWeight: 700,
      },
    }),
    [heading, body],
  );
}
