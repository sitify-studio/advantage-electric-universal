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

function parseHex(hex: string): [number, number, number] | null {
  const c = hex.replace('#', '').trim();
  if (c.length !== 3 && c.length !== 6) return null;
  const full = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function mixHex(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return a;
  return toHex(
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t
  );
}

function lightenHex(hex: string, amount: number): string {
  return mixHex(hex, '#ffffff', amount);
}

function darkenHex(hex: string, amount: number): string {
  return mixHex(hex, '#000000', amount);
}

function resolveThemeHex(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c?.trim() && !c.trim().startsWith('var(')) return c.trim();
  }
  return '#888888';
}

/** All hero + orb colors derived from site builder theme */
function buildOrbPalette(site: ReturnType<typeof useWebBuilder>['site']) {
  const theme = site?.theme;

  const pageBg = resolveThemeHex(theme?.pageBackgroundColor, theme?.sectionBackgroundColorLight);
  const sectionBg = resolveThemeHex(theme?.sectionBackgroundColorLight, theme?.pageBackgroundColor);
  const primary = resolveThemeHex(
    theme?.primaryButtonColorLight,
    theme?.primaryButtonColorDark,
    theme?.darkPrimaryColor
  );
  const hover = resolveThemeHex(
    theme?.hoverActiveColorLight,
    theme?.hoverActiveColorDark,
    theme?.primaryButtonColorLight
  );
  const mainText = resolveThemeHex(
    theme?.lightPrimaryColor,
    theme?.mainTextColor,
    theme?.darkPrimaryColor
  );
  const secondaryText = resolveThemeHex(
    theme?.lightSecondaryColor,
    theme?.secondaryTextColor,
    theme?.darkSecondaryColor
  );
  const textOnDark = resolveThemeHex(theme?.textOnDarkColor, '#ffffff');

  const bgTop = lightenHex(pageBg, 0.08);
  const bgBottom = mixHex(sectionBg, primary, 0.4);

  const orbPeach = mixHex(lightenHex(primary, 0.25), lightenHex(sectionBg, 0.1), 0.35);

  return {
    bgTop,
    bgBottom,
    orbBase: lightenHex(orbPeach, 0.12),
    orbGlow: lightenHex(mixHex(primary, orbPeach, 0.5), 0.28),
    particle: darkenHex(mixHex(hover, primary, 0.55), 0.08),
    spark: lightenHex(mixHex(primary, '#ffd54f', 0.35), 0.3),
    sparkHighlight: lightenHex(mixHex(textOnDark, '#fff9c4', 0.4), 0.1),
    ambientLight: lightenHex(pageBg, 0.2),
    text: mainText,
    subtext: secondaryText,
    primaryButton: primary,
    textOnDark,
  };
}

export function HeroSection({ hero, className }: HeroSectionProps) {
  const { site } = useWebBuilder();
  const theme = useSectionTheme();
  const { fonts } = theme;
  const palette = useMemo(() => buildOrbPalette(site), [site]);

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