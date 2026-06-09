'use client';

import NextImage from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

type CtaSectionInput = Page['ctaSection'] & {
  subtitle?: unknown;
  label?: unknown;
  image?: { url?: string } | string;
  mediaItems?: Array<{ url?: string }>;
  ctaButton?: { text?: string; url?: string; label?: string; href?: string };
};

interface CTASectionProps {
  ctaSection?: Page['ctaSection'];
  className?: string;
}

function resolveCtaBackgroundImage(cta?: CtaSectionInput): string {
  if (!cta) return '';

  const raw =
    cta.backgroundImage ??
    (typeof cta.image === 'string' ? cta.image : cta.image?.url) ??
    cta.mediaItems?.[0]?.url;

  if (!raw) return '';
  if (typeof raw === 'string') return getImageSrc(raw);
  return '';
}

function resolveCtaButton(cta?: CtaSectionInput): { label: string; href: string } | null {
  if (!cta) return null;

  const primary = cta.primaryButton;
  if (primary?.label?.trim()) {
    return {
      label: primary.label.trim(),
      href: primary.href?.trim() || '/',
    };
  }

  const legacy = cta.ctaButton;
  const label = legacy?.text?.trim() || legacy?.label?.trim();
  if (label) {
    return {
      label,
      href: legacy?.url?.trim() || legacy?.href?.trim() || '/contact-us',
    };
  }

  return null;
}

export function CTASection({ ctaSection, className }: CTASectionProps) {
  const theme = useSectionTheme();
  const { colors } = theme;
  const cta = ctaSection as CtaSectionInput | undefined;

  const subHeading = useMemo(
    () => tiptapToText(cta?.subtitle) || tiptapToText(cta?.label) || 'Next Steps',
    [cta?.subtitle, cta?.label]
  );
  const heading = useMemo(() => tiptapToText(cta?.title), [cta?.title]);
  const description = useMemo(() => tiptapToText(cta?.description), [cta?.description]);
  const ctaButton = useMemo(() => resolveCtaButton(cta), [cta]);
  const ctaImage = useMemo(() => resolveCtaBackgroundImage(cta), [cta]);

  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  if (!ctaSection || ctaSection.enabled === false) return null;
  if (!heading && !description && !ctaButton) return null;

  const primaryColor = colors.mainText;

  return (
    <section className={cn('relative min-h-[80vh] flex items-center overflow-hidden bg-neutral-950', className)}>
      <div className="absolute inset-0 z-0">
        {ctaImage && (
          <NextImage
            src={ctaImage}
            alt="CTA background"
            fill
            className="object-cover opacity-40 grayscale"
            quality={90}
          />
        )}
        <div
          className="absolute inset-0 bg-neutral-950/80"
          style={{
            background: `linear-gradient(to right, ${primaryColor} 0%, transparent 100%)`,
          }}
        />
      </div>

      <div className="absolute top-0 left-1/4 w-px h-full bg-white/10 hidden lg:block" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div
          ref={contentRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-1000 ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="lg:col-span-8 lg:col-start-2">
            <SectionHeading
              eyebrow={subHeading}
              title={heading}
              description={description}
              variant="dark"
              descriptionClassName="max-w-2xl mb-8"
            />

            {ctaButton && (
              <div className="flex flex-col sm:flex-row items-start gap-8">
                <a
                  href={ctaButton.href}
                  className="group relative px-12 py-5 bg-white text-black text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:bg-transparent hover:text-white"
                >
                  <span className="absolute inset-0 border border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10">{ctaButton.label}</span>
                </a>

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Direct Inquiries</span>
                  <span className="text-white font-light text-lg tracking-tight">Available 24/7</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
    </section>
  );
}

export default CTASection;
