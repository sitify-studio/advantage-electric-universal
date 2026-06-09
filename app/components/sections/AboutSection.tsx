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
  const { colors } = theme;

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

  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: featuresRef, visibleItems } = useStaggeredAnimation(features.length, 100);

  if (!aboutSection || aboutSection.enabled === false) return null;
  if (!title && !description && features.length === 0 && !aboutImage) return null;

  const primaryColor = colors.mainText;
  const secondaryColor = colors.primaryButton;

  return (
    <section
      id="about"
      ref={sectionRef}
      className={cn(
        'relative min-h-screen w-full overflow-hidden flex items-center',
        className
      )}
      style={{ backgroundColor: colors.pageBackground }}
    >
      <div className="flex flex-col pt-20 lg:flex-row w-full min-h-screen">
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-screen overflow-hidden">
          <div
            className={`relative w-full h-full transition-transform duration-[1.5s] ease-out ${
              sectionVisible ? 'scale-100' : 'scale-110'
            }`}
          >
            {aboutImage ? (
              <Image
                src={aboutImage}
                alt={aboutSection.image?.altText?.trim() || title || 'About Us'}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: `${secondaryColor}20` }} />
            )}
          </div>
        </div>

        <div
          className="w-full lg:w-1/2 flex items-center px-8 md:px-16 lg:px-24 py-20 lg:py-0"
          style={{ backgroundColor: colors.pageBackground }}
        >
          <div className="max-w-xl">
            <SectionHeading
              eyebrow="Excellence Defined"
              title={title}
              description={description}
              className={`transition-all duration-1000 delay-200 ${
                sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              descriptionClassName="mb-8 sm:mb-12"
            />

            {features.length > 0 && (
              <div
                ref={featuresRef}
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4 mb-8 sm:mb-12"
              >
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 transition-all duration-500 ${
                      visibleItems.includes(i) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${i * 100 + 600}ms` }}
                  >
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: secondaryColor }} />
                    <span className="text-sm text-slate-600 leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {ctaButton && (
              <div
                className={`transition-all duration-1000 delay-700 ${
                  sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <a
                  href={ctaButton.href}
                  className="group relative inline-flex items-center gap-8 sm:gap-12 px-6 sm:px-8 py-4 sm:py-5 border rounded-sm overflow-hidden transition-all duration-500 hover:border-opacity-100"
                  style={{ borderColor: `${secondaryColor}30` }}
                >
                  <span
                    className="relative z-10 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] transition-colors duration-500 group-hover:text-white"
                    style={{ color: primaryColor }}
                  >
                    {ctaButton.label}
                  </span>
                  <div
                    className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <svg
                    className="relative z-10 w-4 h-4 transition-all duration-500 group-hover:translate-x-2"
                    style={{ color: `${secondaryColor}99` }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute left-6 bottom-12 hidden xl:block rotate-180" style={{ writingMode: 'vertical-rl' }}>
        <span className="text-[10px] uppercase tracking-[0.6em] font-medium" style={{ color: `${secondaryColor}60` }}>
          Architectural Interior & Design
        </span>
      </div>
    </section>
  );
}

export default AboutSection;
