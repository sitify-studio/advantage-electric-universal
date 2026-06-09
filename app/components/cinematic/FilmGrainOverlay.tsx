'use client';

/** Ultra-light film grain matrix over the fluid canvas (z-index -9). */
export function FilmGrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-[9] opacity-[0.04] mix-blend-overlay"
      aria-hidden
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <filter id="editorial-film-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#editorial-film-grain)" />
      </svg>
    </div>
  );
}
