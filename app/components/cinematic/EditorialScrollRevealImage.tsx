'use client';

import { memo, useRef } from 'react';
import { cn } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import {
  useEditorialCinematicReveal,
  useEditorialImageHover,
} from '@/app/hooks/useEditorialCinematicReveal';
import { refreshScrollLayout } from '@/app/lib/gsap-scroll';

const GRAIN_SVG =
  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27 viewBox=%270 0 200 200%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27200%27 height=%27200%27 filter=%27url(%23n)%27 opacity=%271%27/%3E%3C/svg%3E")';

export type EditorialScrollRevealImageProps = {
  src: string;
  alt?: string;
  hudLabel?: string | null;
  aspectClassName?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  scrub?: number;
  enabled?: boolean;
};

/**
 * Reusable editorial image: scroll clip-path reveal + inner parallax + grain + HUD.
 * Initial transform/clip live in CSS — GSAP owns inline styles after mount (no React style reset).
 */
export const EditorialScrollRevealImage = memo(function EditorialScrollRevealImage({
  src,
  alt = '',
  hudLabel,
  aspectClassName = 'aspect-[4/5]',
  className,
  imageClassName,
  sizes = '(max-width: 1024px) 100vw, 55vw',
  priority = false,
  scrub = 1.4,
  enabled = true,
}: EditorialScrollRevealImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useEditorialCinematicReveal({
    enabled: enabled && Boolean(src),
    triggerRef: wrapperRef,
    maskRef,
    imageRef,
    floatRef,
    scrub,
  });

  useEditorialImageHover(maskRef, floatRef, enabled && Boolean(src));

  if (!src) return null;

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <div
        ref={maskRef}
        className={cn(
          'editorial-reveal-mask group relative w-full overflow-hidden bg-zinc-100',
          'shadow-[0_24px_80px_rgba(0,0,0,0.08)]',
          aspectClassName,
        )}
      >
        <div
          ref={imageRef}
          className={cn(
            'editorial-reveal-inner absolute inset-0 h-[120%] w-full -top-[10%] will-change-transform',
            imageClassName,
          )}
        >
          <div
            ref={floatRef}
            className="editorial-reveal-float absolute inset-0 h-full w-full will-change-transform"
          >
            <OptimizedImage
              src={src}
              alt={alt}
              fill
              priority={priority}
              className="object-cover object-center"
              sizes={sizes}
              onLoad={() => refreshScrollLayout()}
            />
          </div>
        </div>

        {hudLabel ? (
          <div className="pointer-events-none absolute right-0 top-0 z-10 bg-zinc-900 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {hudLabel}
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_SVG }}
          aria-hidden
        />
      </div>
    </div>
  );
});
