import { memo, useId, useRef } from 'react';
import { cn } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** Left-edge organic wave — smooth cubic curves (Luvsic-style paper in water). */
const PAPER_WAVE_PATHS = [
  'M 0.2,0 C 0.28,0.1 0.14,0.28 0.22,0.46 C 0.3,0.64 0.1,0.82 0.18,1 L 1,1 L 1,0 Z',
  'M 0.34,0 C 0.06,0.16 0.38,0.34 0.04,0.52 C 0.32,0.7 0.0,0.88 0.26,1 L 1,1 L 1,0 Z',
  'M 0.1,0 C 0.2,0.14 0.08,0.32 0.18,0.5 C 0.12,0.68 0.28,0.86 0.04,1 L 1,1 L 1,0 Z',
  'M 0.26,0 C 0.12,0.12 0.36,0.3 0.08,0.48 C 0.28,0.66 0.06,0.84 0.22,1 L 1,1 L 1,0 Z',
  'M 0.18,0 C 0.24,0.11 0.16,0.29 0.24,0.47 C 0.22,0.65 0.14,0.83 0.2,1 L 1,1 L 1,0 Z',
] as const;

export type OrganicFloatingPaperImageProps = {
  src: string;
  alt?: string;
  aspectClassName?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  backgroundColor?: string;
};

export const OrganicFloatingPaperImage = memo(function OrganicFloatingPaperImage({
  src,
  alt = '',
  aspectClassName = 'aspect-[4/3]',
  className,
  backgroundColor = '#e5e7eb', // Default gray-200
}: OrganicFloatingPaperImageProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `paper-wave-${uid}`;
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const path = pathRef.current;
      const inner = innerRef.current;
      if (!root || !path || reducedMotion) return;

      const morphTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 95%',
          end: 'bottom 5%',
          scrub: 1.5,
        },
      });

      PAPER_WAVE_PATHS.forEach((d, i) => {
        if (i === 0) {
          gsap.set(path, { attr: { d: PAPER_WAVE_PATHS[0] } });
          return;
        }
        morphTl.to(path, { attr: { d }, ease: 'none', duration: 1 });
      });

      gsap.fromTo(
        root,
        {
          rotate: -3.5,
          skewY: -2,
          y: 40,
          scale: 0.9,
          transformOrigin: '50% 50%',
        },
        {
          rotate: 3.5,
          skewY: 2,
          y: -40,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        },
      );

      if (inner) {
        gsap.fromTo(
          inner,
          { scale: 1.25, yPercent: -10 },
          {
            scale: 1.1,
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.6,
            },
          },
        );
      }
    },
    { scope: rootRef, dependencies: [reducedMotion, src] },
  );

  if (!src) return null;

  return (
    <div ref={rootRef} className={cn('relative w-full will-change-transform', className)}>
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path ref={pathRef} d={PAPER_WAVE_PATHS[0]} />
          </clipPath>
        </defs>
      </svg>

      <div
        className={cn(
          'relative w-full overflow-hidden',
          'shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] transition-shadow duration-700',
          aspectClassName,
        )}
        style={{
          clipPath: `url(#${clipId})`,
          backgroundColor: backgroundColor,
        }}
      >
        <div ref={innerRef} className="absolute inset-0 h-[120%] w-full -top-[10%] will-change-transform">
          <OptimizedImage
            src={src}
            alt={alt}
            fill
            className="object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
});
