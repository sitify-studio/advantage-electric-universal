'use client';

import { useThemeColors } from '@/app/hooks/useTheme';

/** Fixed page background from site builder theme (replaces WebGL fluid). */
export function AmbientFoundation() {
  const { pageBackground } = useThemeColors();

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ backgroundColor: pageBackground }}
    />
  );
}
