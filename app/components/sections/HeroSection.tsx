'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { HeroEtherealOrb } from '@/app/components/cinematic/HeroEtherealOrb';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { tiptapToText } from '@/app/lib/seo';
import { buildSectionPalette } from '@/app/lib/sectionPalette';
import { cn } from '@/app/lib/utils';

interface HeroSectionProps {
  hero?: Page['hero'];
  page?: Page;
  className?: string;
}

function resolveCtaButton(hero?: Page['hero']): { label: string; href: string } | null {
  const primary = hero?.primaryCta;
  if (primary?.label?.trim()) {
    return {
      label: primary.label.trim(),
      href: primary.href?.trim() || '/',
    };
  }
  return null;
}

export function HeroSection({ hero, className }: HeroSectionProps) {
  const { site } = useWebBuilder();
  const theme = useSectionTheme();
  const { fonts } = theme;
  const palette = useMemo(() => buildSectionPalette(site), [site]);

  const title = useMemo(() => tiptapToText(hero?.title), [hero?.title]);
  const subtitle = useMemo(
    () => tiptapToText(hero?.subtitle) || tiptapToText(hero?.eyebrow),
    [hero?.subtitle, hero?.eyebrow]
  );
  const description = useMemo(() => tiptapToText(hero?.description), [hero?.description]);
  const ctaButton = useMemo(() => resolveCtaButton(hero), [hero]);

  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  if (!hero || hero.enabled === false) return null;
  if (!title && !description && !subtitle) return null;

  return (
    <section
      className={cn('relative overflow-hidden flex flex-col min-h-screen w-full', className)}
      style={{
        background: `linear-gradient(180deg, ${palette.bgTop} 0%, ${palette.bgBottom} 100%)`,
      }}
    >
      <div
        ref={contentRef}
        className={cn(
          'relative z-30 flex flex-col items-center text-center px-6 w-full mx-auto',
          'transition-all duration-1000',
          contentVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
        )}
      >
        <SectionHeading
          eyebrow={subtitle}
          title={title}
          description={description}
          align="center"
          as="h1"
          className="max-w-3xl"
          titleClassName="!text-[clamp(1.65rem,3.5vw,2.75rem)]"
          descriptionClassName="max-w-2xl !text-sm sm:!text-[15px] mt-1"
        />

        {ctaButton && (
          <div className="mt-5 relative z-30">
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

      {/* 3D Object container scaled to take up the bottom area of the full screen height smoothly */}
      <div className="relative w-full h-[45vh] md:h-[50vh] mt-auto z-10 pointer-events-none overflow-hidden">
        <HeroEtherealOrb palette={palette} className="w-full h-full" />
      </div>
    </section>
  );
}

export default HeroSection;