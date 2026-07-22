'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { buildSectionPalette } from '@/app/lib/sectionPalette';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

const FEATURE_ICONS = [
  // Medal
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" aria-hidden>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9.2 13.8 8 21l4-2.2L16 21l-1.2-7.2" />
      <path d="M10 7.5h4" />
    </svg>
  ),
  // Personalized
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19c1.4-3.2 3.7-4.8 6.5-4.8s5.1 1.6 6.5 4.8" />
      <circle cx="17.5" cy="9.5" r="3.2" />
      <path d="M17.5 12.7v2.2M16.4 13.8h2.2" />
    </svg>
  ),
  // Forward thinking / podium
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" aria-hidden>
      <path d="M5 19h14" />
      <path d="M7 19v-5h3v5" />
      <path d="M10.5 19V8h3v11" />
      <path d="M14 19v-3h3v3" />
      <path d="M12 4.5l.8 1.6 1.8.3-1.3 1.2.3 1.8L12 8.5l-1.6.9.3-1.8-1.3-1.2 1.8-.3L12 4.5z" />
    </svg>
  ),
  // Chart / results
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M7.5 15.5 11 11l2.5 2.5 3-4" />
    </svg>
  ),
];

export function CompanyDetailSection({ companyDetailSection, className }: CompanyDetailSectionProps) {
  const { site } = useWebBuilder();
  const { colors, fonts } = useSectionTheme();
  const palette = useMemo(() => buildSectionPalette(site), [site]);

  const heading = useMemo(
    () => tiptapToText(companyDetailSection?.title),
    [companyDetailSection?.title]
  );
  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description),
    [companyDetailSection?.description]
  );
  const details = useMemo(
    () =>
      companyDetailSection?.details
        ?.map((detail) => ({
          heading: tiptapToText(detail.title) || detail.label?.trim() || '',
          description: tiptapToText(detail.description) || tiptapToText(detail.value),
          imageUrl: detail.image?.url ? getImageSrc(detail.image.url) : '',
          imageAlt: detail.image?.altText?.trim() || '',
        }))
        .filter((detail) => detail.heading || detail.description || detail.imageUrl) ?? [],
    [companyDetailSection?.details]
  );

  const collageImages = useMemo(() => {
    const withImages = details.filter((d) => d.imageUrl).slice(0, 3);
    if (withImages.length >= 3) return withImages;
    // Prefer detail images; pad with empties so collage layout still holds
    const padded = [...withImages];
    while (padded.length < 3) {
      padded.push({ heading: '', description: '', imageUrl: '', imageAlt: '' });
    }
    return padded.slice(0, 3);
  }, [details]);

  const features = useMemo(() => details.filter((d) => d.heading || d.description).slice(0, 4), [details]);

  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const { ref: featuresRef, visibleItems: featuresVisible } = useStaggeredAnimation(features.length, 100);

  if (!companyDetailSection || companyDetailSection.enabled === false) return null;
  if (!heading && !description && details.length === 0) return null;

  const bg = colors.pageBackground;
  const text = palette.text;
  const subtext = palette.subtext;
  const accent = colors.primaryButton;

  const collageSlots = [
    { className: 'left-[38%] top-0 z-[1] w-[52%] aspect-[4/5]' },
    { className: 'left-0 top-[28%] z-[2] w-[50%] aspect-[4/5]' },
    { className: 'left-[42%] top-[52%] z-[3] w-[52%] aspect-[4/5]' },
  ];

  return (
    <section
      id="company-details"
      ref={sectionRef}
      className={cn('relative overflow-hidden py-16 lg:py-24', className)}
      style={{ backgroundColor: bg }}
    >
      {/* Soft rounded-square pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${text} 0.5px, transparent 0.6px)`,
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 70% 80% at 20% 50%, black 10%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 80% at 20% 50%, black 10%, transparent 70%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[55%] opacity-[0.045]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 72px,
            color-mix(in srgb, ${text} 35%, transparent) 72px,
            color-mix(in srgb, ${text} 35%, transparent) 74px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 72px,
            color-mix(in srgb, ${text} 35%, transparent) 72px,
            color-mix(in srgb, ${text} 35%, transparent) 74px
          )`,
          maskImage: 'linear-gradient(90deg, black 0%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(90deg, black 0%, transparent 85%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[90rem] items-stretch gap-12 px-6 md:px-12 lg:grid-cols-2 lg:gap-16 lg:px-16 xl:gap-20 xl:px-20">
        {/* Collage — stretches to match content height */}
        <div
          className={cn(
            'relative min-h-[340px] w-full transition-all duration-[1100ms] ease-out lg:min-h-[420px]',
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
          )}
        >
          <div className="relative h-full min-h-[340px] w-full lg:absolute lg:inset-0 lg:min-h-0">
            {collageImages.map((img, i) => (
              <div
                key={i}
                className={cn('absolute overflow-hidden rounded-[1.75rem] shadow-lg', collageSlots[i].className)}
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 12%, ${bg})`,
                  boxShadow: `0 18px 40px color-mix(in srgb, ${text} 12%, transparent)`,
                }}
              >
                {img.imageUrl ? (
                  <Image
                    src={img.imageUrl}
                    alt={img.imageAlt || img.heading || `Team ${i + 1}`}
                    fill
                    sizes="(max-width: 1024px) 45vw, 22vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div
          className={cn(
            'flex h-full flex-col justify-center transition-all delay-150 duration-[1100ms] ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}
        >
          {heading && (
            <h2
              className="max-w-xl text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal leading-[1.08] tracking-tight"
              style={{ color: text, fontFamily: fonts.heading }}
            >
              {heading}
            </h2>
          )}

          {description && (
            <p
              className="mt-5 max-w-xl text-base font-light leading-relaxed sm:text-lg"
              style={{ color: subtext, fontFamily: fonts.body }}
            >
              {description}
            </p>
          )}

          {features.length > 0 && (
            <div
              ref={featuresRef}
              className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 sm:gap-y-12"
            >
              {features.map((feature, i) => {
                const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                return (
                  <div
                    key={i}
                    className={cn(
                      'transition-all duration-700',
                      featuresVisible.includes(i)
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-5 opacity-0'
                    )}
                  >
                    <div className="mb-3">{Icon(text)}</div>
                    <div
                      className="mb-4 h-px w-8"
                      style={{ backgroundColor: `color-mix(in srgb, ${text} 45%, transparent)` }}
                    />
                    {feature.heading && (
                      <h3
                        className="mb-2 text-base font-semibold tracking-tight sm:text-lg"
                        style={{ color: text, fontFamily: fonts.body }}
                      >
                        {feature.heading}
                      </h3>
                    )}
                    {feature.description && (
                      <p
                        className="text-sm font-light leading-relaxed"
                        style={{ color: subtext, fontFamily: fonts.body }}
                      >
                        {feature.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CompanyDetailSection;
