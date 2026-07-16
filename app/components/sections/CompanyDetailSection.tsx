'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { buildSectionPalette } from '@/app/lib/sectionPalette';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

export function CompanyDetailSection({ companyDetailSection, className }: CompanyDetailSectionProps) {
  const { site, pages } = useWebBuilder();
  const { fonts } = useSectionTheme();
  const palette = useMemo(() => buildSectionPalette(site), [site]);

  const heading = useMemo(
    () => tiptapToText(companyDetailSection?.title),
    [companyDetailSection?.title]
  );
  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description),
    [companyDetailSection?.description]
  );
  const sections = useMemo(
    () =>
      companyDetailSection?.details
        ?.map((detail) => ({
          heading: tiptapToText(detail.title) || detail.label?.trim() || '',
          description: tiptapToText(detail.description) || tiptapToText(detail.value),
          imageUrl: detail.image?.url ? getImageSrc(detail.image.url) : '',
          imageAlt: detail.image?.altText?.trim(),
        }))
        .filter((detail) => detail.heading || detail.description) ?? [],
    [companyDetailSection?.details]
  );

  const detailHref = useMemo(() => {
    const aboutPage = pages.find((p) => p.status === 'published' && p.pageType === 'about');
    if (aboutPage) return getPageHref(aboutPage);
    const contactPage = pages.find((p) => p.status === 'published' && p.pageType === 'contact');
    if (contactPage) return getPageHref(contactPage);
    return null;
  }, [pages]);

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });
  const { ref: sectionsRef, visibleItems: sectionsVisible } = useStaggeredAnimation(
    sections.length,
    150
  );

  if (!companyDetailSection || companyDetailSection.enabled === false) return null;
  if (!heading && !description && sections.length === 0) return null;

  const accent = palette.primaryButton;
  const text = palette.text;
  const subtext = palette.subtext;
  const surface = palette.bgTop;

  return (
    <section
      id="company-details"
      className={cn('relative overflow-hidden py-16 lg:py-24', className)}
      style={{ backgroundColor: surface }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-0 hidden h-full w-px -translate-x-1/2 lg:block"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)` }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[90rem] px-6 md:px-12 lg:px-16 xl:px-20">
        <div
          ref={titleRef}
          className={cn(
            'mb-10 max-w-4xl transition-all duration-1000 lg:mb-14',
            titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          )}
        >
          <SectionHeading
            eyebrow="Company Detail"
            title={heading}
            description={description}
            descriptionClassName="max-w-2xl"
          />
        </div>

        <div ref={sectionsRef} className="space-y-16 lg:space-y-24">
          {sections.map((section, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={cn(
                  'grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16 transition-all duration-1000',
                  sectionsVisible.includes(index)
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-20 opacity-0'
                )}
              >
                <div
                  className={cn(
                    'relative min-h-[260px] w-full lg:min-h-[320px]',
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  )}
                >
                  <div
                    className="relative h-full min-h-[260px] overflow-hidden lg:absolute lg:inset-0 lg:min-h-0"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accent} 14%, ${surface})`,
                    }}
                  >
                    {section.imageUrl && (
                      <Image
                        src={section.imageUrl}
                        alt={section.imageAlt || section.heading}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[2000ms] ease-out hover:scale-105"
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      'absolute -bottom-6 hidden text-7xl font-bold tracking-tighter opacity-5 lg:block',
                      isEven ? '-right-6' : '-left-6'
                    )}
                    style={{ color: text, fontFamily: fonts.heading }}
                  >
                    0{index + 1}
                  </div>
                </div>

                <div
                  className={cn(
                    'flex w-full flex-col justify-center text-left',
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  )}
                >
                  <div className="max-w-md">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="h-px w-8" style={{ background: accent }} />
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.3em]"
                        style={{ color: accent, fontFamily: fonts.body }}
                      >
                        Detail 0{index + 1}
                      </span>
                    </div>

                    {section.heading && (
                      <h3
                        className="mb-4 text-xl font-normal leading-snug tracking-tight sm:mb-6 sm:text-2xl md:text-3xl"
                        style={{ color: text, fontFamily: fonts.heading }}
                      >
                        {section.heading}
                      </h3>
                    )}

                    {section.description && (
                      <p
                        className="text-sm font-light leading-relaxed sm:text-base"
                        style={{ color: subtext, fontFamily: fonts.body }}
                      >
                        {section.description}
                      </p>
                    )}

                    {detailHref && (
                      <Link
                        href={detailHref}
                        className="group mt-8 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] transition-opacity hover:opacity-75"
                        style={{ color: accent, fontFamily: fonts.body }}
                      >
                        <span>Discover More</span>
                        <span className="h-px w-12 transition-all duration-500 group-hover:w-16" style={{ backgroundColor: accent }} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CompanyDetailSection;
