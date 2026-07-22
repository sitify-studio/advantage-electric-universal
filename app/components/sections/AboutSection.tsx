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
  const { colors, fonts } = useSectionTheme();
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

  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const { ref: featuresRef, visibleItems: featuresVisible } = useStaggeredAnimation(
    features.length,
    100
  );

  if (!aboutSection || aboutSection.enabled === false) return null;
  if (!title && !description && features.length === 0 && !aboutImage) return null;

  const accent = palette.primaryButton;
  const text = palette.text;
  const subtext = palette.subtext;
  const surface = colors.pageBackground;
  const imageAlt = aboutSection.image?.altText?.trim() || title || 'About Us';
  const hasTitle = Boolean(title?.trim());

  return (
    <section
      id="about"
      ref={sectionRef}
      data-about-layout="split-reveal-v4"
      className={cn('relative overflow-hidden py-16 lg:py-24', className)}
      style={{ backgroundColor: surface }}
    >
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
      />

      <div className="relative mx-auto grid w-full max-w-[90rem] items-stretch gap-12 px-6 md:px-12 lg:grid-cols-12 lg:gap-16 lg:px-16 xl:px-20">
        <div
          className={cn(
            'relative min-h-[280px] w-full lg:col-span-6 lg:min-h-[320px] transition-all duration-[1100ms] ease-out',
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
          )}
        >
          <div className="relative h-full min-h-[280px] overflow-hidden lg:absolute lg:inset-0 lg:min-h-0">
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
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(180deg, transparent 55%, color-mix(in srgb, ${surface} 55%, transparent) 100%)`,
              }}
            />
          </div>

          <div
            className={cn(
              'absolute -bottom-4 -right-4 z-10 hidden h-28 w-28 border transition-all delay-300 duration-1000 sm:block lg:-right-6',
              isVisible ? 'opacity-100' : 'opacity-0'
            )}
            style={{ borderColor: `color-mix(in srgb, ${accent} 55%, transparent)` }}
            aria-hidden
          />
        </div>

        <div
          className={cn(
            'flex h-full flex-col justify-center lg:col-span-6 transition-all delay-150 duration-[1100ms] ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-10 shrink-0" style={{ backgroundColor: accent }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.5em]"
              style={{ color: accent, fontFamily: fonts.body }}
            >
              About
            </span>
          </div>

          {hasTitle && (
            <h2
              className="max-w-xl text-[clamp(2rem,4vw,3.35rem)] font-normal leading-[1.05] tracking-tight"
              style={{ color: text, fontFamily: fonts.heading }}
            >
              {title}
            </h2>
          )}

          {description && (
            <p
              className="mt-6 max-w-lg text-base font-light leading-relaxed sm:text-lg"
              style={{ color: subtext, fontFamily: fonts.body }}
            >
              {description}
            </p>
          )}

          {features.length > 0 && (
            <div ref={featuresRef} className="mt-10 space-y-0 border-t" style={{ borderColor: `color-mix(in srgb, ${text} 12%, transparent)` }}>
              {features.map((feature, i) => (
                <div
                  key={i}
                  className={cn(
                    'grid grid-cols-[auto_1fr] gap-5 border-b py-5 transition-all duration-700',
                    featuresVisible.includes(i)
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  )}
                  style={{ borderColor: `color-mix(in srgb, ${text} 12%, transparent)` }}
                >
                  <span
                    className="pt-1 text-[10px] font-bold uppercase tracking-[0.35em]"
                    style={{ color: accent, fontFamily: fonts.body }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p
                      className="text-lg font-normal leading-snug tracking-tight sm:text-xl"
                      style={{ color: text, fontFamily: fonts.heading }}
                    >
                      {feature.label}
                    </p>
                    {feature.description && (
                      <p
                        className="mt-2 text-sm font-light leading-relaxed"
                        style={{ color: subtext, fontFamily: fonts.body }}
                      >
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {ctaButton && (
            <div className="mt-10">
              <Link
                href={ctaButton.href}
                className="group inline-flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-80"
                style={{ color: text, fontFamily: fonts.body }}
              >
                <span className="relative pb-1">
                  {ctaButton.label}
                  <span
                    className="absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500 group-hover:scale-x-0"
                    style={{ backgroundColor: accent }}
                  />
                </span>
                <span
                  className="inline-flex h-9 w-9 items-center justify-center border text-sm transition-transform duration-500 group-hover:translate-x-1"
                  style={{ borderColor: accent, color: accent }}
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
