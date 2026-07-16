'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { buildSectionPalette } from '@/app/lib/sectionPalette';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { cn, getImageSrc } from '@/app/lib/utils';

interface AboutSectionProps {
  aboutSection?: Page['aboutSection'];
  page?: Page;
  className?: string;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function resolveAboutCta(data: Record<string, unknown>): { label: string; href: string } | null {
  const primary = data.primaryCta as { label?: string; href?: string } | undefined;
  if (primary?.label?.trim()) {
    return {
      label: primary.label.trim(),
      href: normalizeHref(primary.href?.trim() || '/contact-us'),
    };
  }

  const primaryButton = data.primaryButton as { label?: string; href?: string } | undefined;
  if (primaryButton?.label?.trim()) {
    return {
      label: primaryButton.label.trim(),
      href: normalizeHref(primaryButton.href?.trim() || '/contact-us'),
    };
  }

  const legacy = data.ctaButton as {
    text?: string;
    url?: string;
    label?: string;
    href?: string;
  };
  const label = legacy?.text?.trim() || legacy?.label?.trim();
  if (label) {
    return {
      label,
      href: normalizeHref(legacy?.url?.trim() || legacy?.href?.trim() || '/contact-us'),
    };
  }

  const button = data.button as { label?: string; text?: string; href?: string; url?: string };
  const buttonLabel = button?.label?.trim() || button?.text?.trim();
  if (buttonLabel) {
    return {
      label: buttonLabel,
      href: normalizeHref(button?.href?.trim() || button?.url?.trim() || '/contact-us'),
    };
  }

  return null;
}

export function AboutSection({ aboutSection, className }: AboutSectionProps) {
  const { site } = useWebBuilder();
  const { fonts } = useSectionTheme();
  const palette = useMemo(() => buildSectionPalette(site), [site]);

  const title = useMemo(() => tiptapToText(aboutSection?.title), [aboutSection?.title]);
  const description = useMemo(
    () => tiptapToText(aboutSection?.description),
    [aboutSection?.description]
  );
  const features = useMemo(
    () =>
      aboutSection?.features
        ?.map((f) => ({
          label: f.label?.trim() || '',
          description: tiptapToText(f.description),
        }))
        .filter((f) => f.label) ?? [],
    [aboutSection?.features]
  );
  const aboutImage = useMemo(() => {
    const url = aboutSection?.image?.url;
    return url ? getImageSrc(url) : '';
  }, [aboutSection?.image?.url]);
  const ctaButton = useMemo(() => {
    if (!aboutSection || typeof aboutSection !== 'object') return null;
    return resolveAboutCta(aboutSection as Record<string, unknown>);
  }, [aboutSection]);

  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.08 });
  const { ref: featuresRef, visibleItems: featuresVisible } = useStaggeredAnimation(
    features.length,
    90
  );

  if (!aboutSection || aboutSection.enabled === false) return null;
  if (!title && !description && features.length === 0 && !aboutImage) return null;

  const accent = palette.primaryButton;
  const surface = palette.bgTop;
  const imageAlt = aboutSection.image?.altText?.trim() || title || 'About Us';
  const hasTitle = Boolean(title?.trim());

  return (
    <section
      id="about"
      ref={sectionRef}
      data-about-layout="editorial-panel-v3"
      className={cn('relative overflow-hidden py-16 lg:py-24', className)}
      style={{ backgroundColor: surface }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 12%, transparent) 0%, transparent 100%)`,
        }}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 text-center md:px-12 lg:gap-14 lg:px-16">
        <div className="w-full max-w-md">
          <div
            className={cn(
              'relative transition-all duration-1000',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            <div
              className="relative overflow-hidden border p-4 sm:p-5"
              style={{
                borderColor: `color-mix(in srgb, ${palette.text} 12%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${surface} 92%, white)`,
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {aboutImage ? (
                  <OptimizedImage
                    src={aboutImage}
                    alt={imageAlt}
                    fill
                    sizes={IMAGE_SIZES.sectionWide}
                    className={cn(
                      'object-cover object-center transition-transform duration-[1600ms] ease-out',
                      isVisible ? 'scale-100' : 'scale-110'
                    )}
                    priority
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(145deg, ${palette.bgBottom} 0%, ${palette.orbGlow} 100%)`,
                    }}
                  />
                )}
              </div>
            </div>

          </div>
        </div>

        <div className={cn('flex w-full flex-col items-center justify-between', hasTitle ? 'pt-4' : 'pt-0')}>
          {hasTitle && (
            <div
              className={cn(
                'transition-all delay-100 duration-1000',
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
            >
              <span
                className="mb-5 block text-[10px] font-bold uppercase tracking-[0.5em]"
                style={{ color: accent, fontFamily: fonts.body }}
              >
                Studio Profile
              </span>

              <h2
                className="mx-auto max-w-4xl text-[clamp(2.2rem,4.8vw,4.75rem)] font-normal leading-[0.98] tracking-[-0.03em]"
                style={{ color: palette.text, fontFamily: fonts.heading }}
              >
                {title}
              </h2>
            </div>
          )}

          <div className={cn('flex w-full flex-col items-center gap-8', hasTitle ? 'mt-10' : 'mt-0')}>
            <div className="w-full">
              {features.length > 0 ? (
                <div
                  ref={featuresRef}
                  className="grid gap-4 text-left sm:grid-cols-2"
                >
                  {features.map((feature, i) => (
                    <div
                      key={i}
                      className={cn(
                        'border p-5 transition-all duration-700',
                        featuresVisible.includes(i)
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-5 opacity-0'
                      )}
                      style={{
                        borderColor: `color-mix(in srgb, ${palette.text} 12%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${surface} 96%, white)`,
                      }}
                    >
                      <span
                        className="block text-[10px] font-bold uppercase tracking-[0.35em]"
                        style={{ color: accent, fontFamily: fonts.body }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p
                        className="mt-3 text-lg font-normal leading-snug tracking-tight"
                        style={{ color: palette.text, fontFamily: fonts.heading }}
                      >
                        {feature.label}
                      </p>
                      {feature.description && (
                        <p
                          className="mt-2 text-sm font-light leading-relaxed"
                          style={{ color: palette.subtext, fontFamily: fonts.body }}
                        >
                          {feature.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                description && (
                  <p
                    className="mx-auto max-w-2xl text-base font-light leading-relaxed sm:text-lg"
                    style={{ color: palette.subtext, fontFamily: fonts.body }}
                  >
                    {description}
                  </p>
                )
              )}
            </div>

            {ctaButton && (
              <div className="flex justify-center">
                <Link
                  href={ctaButton.href}
                  className="inline-flex items-center justify-between gap-6 border px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-85"
                  style={{
                    borderColor: accent,
                    color: palette.text,
                    fontFamily: fonts.body,
                  }}
                >
                  <span>{ctaButton.label}</span>
                  <span style={{ color: accent }}>+</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
