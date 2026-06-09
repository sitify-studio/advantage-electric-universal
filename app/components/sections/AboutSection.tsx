'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { buildSectionPalette } from '@/app/lib/sectionPalette';
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

  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });

  if (!aboutSection || aboutSection.enabled === false) return null;
  if (!title && !description && features.length === 0 && !aboutImage) return null;

  return (
    <section
      id="about"
      className={cn('relative flex min-h-screen w-full flex-col overflow-hidden', className)}
      style={{
        background: `linear-gradient(180deg, ${palette.bgTop} 0%, ${palette.bgBottom} 100%)`,
      }}
    >
      <div
        ref={contentRef}
        className={cn(
          'relative z-30 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center transition-all duration-1000',
          contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        )}
      >
        <SectionHeading
          eyebrow="About"
          title={title}
          description={description}
          align="center"
          className="max-w-3xl"
          titleClassName="!text-[clamp(1.65rem,3.5vw,2.75rem)]"
          descriptionClassName="max-w-2xl !text-sm sm:!text-[15px] mt-1"
        />

        {features.length > 0 && (
          <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col items-center">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.4em]"
                  style={{ color: palette.primaryButton, fontFamily: fonts.body }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p
                  className="mt-2 text-sm font-light leading-relaxed"
                  style={{ color: palette.subtext, fontFamily: fonts.body }}
                >
                  {feature}
                </p>
              </div>
            ))}
          </div>
        )}

        {ctaButton && (
          <div className="relative z-30 mt-8">
            <Link
              href={ctaButton.href}
              className="inline-block px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-90"
              style={{
                backgroundColor: palette.primaryButton,
                color: palette.textOnDark,
                fontFamily: fonts.body,
              }}
            >
              {ctaButton.label}
            </Link>
          </div>
        )}
      </div>

      {aboutImage && (
        <div className="relative z-10 mt-auto h-[38vh] w-full overflow-hidden md:h-[42vh]">
          <Image
            src={aboutImage}
            alt={aboutSection.image?.altText?.trim() || title || 'About Us'}
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${palette.bgBottom} 0%, transparent 40%)`,
            }}
          />
        </div>
      )}
    </section>
  );
}

export default AboutSection;
