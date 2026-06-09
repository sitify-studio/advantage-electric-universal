'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
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
  const theme = useSectionTheme();
  const { colors, fonts } = theme;

  const title = useMemo(() => tiptapToText(aboutSection?.title), [aboutSection?.title]);
  const description = useMemo(
    () => tiptapToText(aboutSection?.description),
    [aboutSection?.description]
  );
  const features = useMemo(
    () =>
      aboutSection?.features
        ?.map((f) => f.label?.trim())
        .filter((label): label is string => Boolean(label)) ?? [],
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

  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: featuresRef, visibleItems } = useStaggeredAnimation(features.length, 100);

  if (!aboutSection || aboutSection.enabled === false) return null;
  if (!title && !description && features.length === 0 && !aboutImage) return null;

  const accentColor = colors.primaryButton;
  const pageBg = colors.pageBackground;

  return (
    <section
      id="about"
      ref={sectionRef}
      className={cn('relative w-full overflow-hidden py-16 lg:py-0 lg:min-h-screen', className)}
      style={{ backgroundColor: pageBg }}
    >
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full blur-3xl opacity-25"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full blur-[100px] opacity-15"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10 flex w-full flex-col lg:min-h-screen lg:flex-row lg:items-stretch">
        <div
          ref={imageRef}
          className="relative flex w-full flex-col px-6 pt-8 lg:w-1/2 lg:min-h-screen lg:px-12 lg:py-12 lg:pt-12"
        >
          <div
            className={cn(
              'group relative flex-1 transition-all duration-[1.4s] ease-out',
              imageVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}
          >
            <div
              className="absolute -bottom-5 -right-5 hidden h-full w-full border sm:block"
              style={{ borderColor: `${accentColor}35` }}
            />

            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6] lg:aspect-auto lg:h-full lg:min-h-[420px]">
              {aboutImage ? (
                <>
                  <Image
                    src={aboutImage}
                    alt={aboutSection.image?.altText?.trim() || title || 'About Us'}
                    fill
                    className={cn(
                      'object-cover transition-all duration-[2s] ease-out',
                      'grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.04]',
                      imageVisible ? 'scale-100' : 'scale-110'
                    )}
                    priority
                  />
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, transparent 40%, ${accentColor}18 100%)`,
                    }}
                  />
                </>
              ) : (
                <div className="h-full w-full" style={{ backgroundColor: `${accentColor}15` }} />
              )}

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(to right, transparent 55%, ${pageBg} 100%)`,
                }}
              />

              <div
                className={cn(
                  'absolute left-0 top-0 h-full w-1 origin-top transition-transform duration-[1.2s] ease-out',
                  imageVisible ? 'scale-y-100' : 'scale-y-0'
                )}
                style={{ backgroundColor: accentColor }}
              />
            </div>

            <span
              className={cn(
                'absolute -left-2 top-6 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-1000 delay-300 sm:left-0',
                imageVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{ color: `${accentColor}80`, writingMode: 'vertical-rl' }}
            >
              01
            </span>
          </div>
        </div>

        <div className="flex w-full items-center px-6 py-12 lg:w-1/2 lg:min-h-screen lg:px-12 lg:py-12">
          <div className="max-w-xl">
            <SectionHeading
              eyebrow="About"
              title={title}
              description={description}
              descriptionClassName="max-w-2xl mb-8 sm:mb-10"
              className={cn(
                'transition-all duration-1000 delay-150',
                sectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
            />

            {features.length > 0 && (
              <div ref={featuresRef} className="mb-8 space-y-0 sm:mb-10">
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className={cn(
                      'border-t border-slate-200/80 py-4 transition-all duration-700',
                      visibleItems.includes(i)
                        ? 'translate-x-0 opacity-100'
                        : '-translate-x-3 opacity-0'
                    )}
                    style={{ transitionDelay: `${i * 80 + 200}ms` }}
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.35em]"
                        style={{ color: accentColor }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="h-px w-10" style={{ backgroundColor: `${accentColor}40` }} />
                    </div>
                    <span className="text-sm font-light leading-relaxed text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {ctaButton && (
              <div
                className={cn(
                  'transition-all duration-1000 delay-500',
                  sectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                )}
              >
                <a href={ctaButton.href} className="group inline-flex items-center gap-4">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900 transition-colors group-hover:opacity-70"
                    style={{ fontFamily: fonts.body }}
                  >
                    {ctaButton.label}
                  </span>
                  <div
                    className="h-px w-8 transition-all duration-500 group-hover:w-14"
                    style={{ backgroundColor: accentColor }}
                  />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
