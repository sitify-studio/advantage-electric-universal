'use client';

import type { ReactNode } from 'react';

/** Stylized serif italic accent for a single character inside display headlines. */
export function EditorialAccentChar({ children }: { children: ReactNode }) {
  return (
    <span className="hero-editorial-script relative z-30 mx-0.5 text-[clamp(4.75rem,10vw,11rem)] leading-[0.88] tracking-normal text-zinc-700">
      {children}
    </span>
  );
}

/** Wraps vowels O/o in a line with editorial accent styling. */
export function accentLetterO(text: string): ReactNode[] {
  return text.split('').map((char, i) =>
    char === 'O' || char === 'o' ? (
      <EditorialAccentChar key={`${i}-${char}`}>{char}</EditorialAccentChar>
    ) : (
      char
    ),
  );
}
