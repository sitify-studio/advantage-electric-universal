'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

export function CompanyDetailSection({ companyDetailSection, className }: CompanyDetailSectionProps) {
  const theme = useSectionTheme();
  const { colors } = theme;

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

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: sectionsRef, visibleItems: sectionsVisible } = useStaggeredAnimation(sections.length, 150);

  if (!companyDetailSection || companyDetailSection.enabled === false) return null;
  if (!heading && !description && sections.length === 0) return null;

  const primaryColor = colors.mainText;
  const secondaryColor = colors.primaryButton;

  return (
    <section
      id="company-details"
      className={cn('relative pt-0 pb-8 lg:pb-10 overflow-hidden bg-[#fcfcfc]', className)}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full hidden lg:block z-0"
        style={{ backgroundColor: `${secondaryColor}20` }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div
          ref={titleRef}
          className={`max-w-4xl mb-8 lg:mb-10 transition-all duration-1000 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <SectionHeading
            eyebrow="Company Detail"
            title={heading}
            description={description}
            descriptionClassName="max-w-2xl"
          />
        </div>

        <div ref={sectionsRef} className="space-y-32 lg:space-y-48">
          {sections.map((section, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 sm:gap-12 lg:gap-24 transition-all duration-1000 ${
                  sectionsVisible.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
              >
                <div className="flex-1 w-full relative">
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-sm"
                    style={{ backgroundColor: `${secondaryColor}20` }}
                  >
                    {section.imageUrl && (
                      <Image
                        src={section.imageUrl}
                        alt={section.imageAlt || section.heading}
                        fill
                        className="object-cover transition-transform duration-[2000ms] ease-out hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none" />
                  </div>
                  <div
                    className={`absolute -bottom-8 ${isEven ? '-right-8' : '-left-8'} text-8xl font-bold opacity-5 tracking-tighter hidden lg:block`}
                    style={{ color: primaryColor }}
                  >
                    0{index + 1}
                  </div>
                </div>

                <div className="flex-1 w-full text-left">
                  <div className="max-w-md">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-8 h-[1px]" style={{ background: secondaryColor }} />
                      <span
                        className="text-[10px] font-bold tracking-[0.3em] uppercase"
                        style={{ color: secondaryColor }}
                      >
                        Detail 0{index + 1}
                      </span>
                    </div>

                    {section.heading && (
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-900 mb-4 sm:mb-6 leading-snug">
                        {section.heading}
                      </h3>
                    )}

                    {section.description && (
                      <p className="text-slate-500 font-light leading-relaxed text-sm sm:text-base">
                        {section.description}
                      </p>
                    )}

                    <div className="mt-8 overflow-hidden group cursor-pointer inline-flex items-center gap-4">
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.3em] transition-colors"
                        style={{ color: `${secondaryColor}99` }}
                      >
                        Discover More
                      </span>
                      <div
                        className="w-12 h-px transition-all duration-500"
                        style={{ backgroundColor: `${secondaryColor}40` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 py-6" style={{ borderTop: `1px solid ${secondaryColor}20` }}>
        <div className="container mx-auto px-6 flex justify-between items-center opacity-30">
          <span className="text-[10px] uppercase tracking-[0.5em]" style={{ color: `${secondaryColor}60` }}>
            Precision Engineering
          </span>
          <span className="text-[10px] uppercase tracking-[0.5em]" style={{ color: `${secondaryColor}60` }}>
            Systematic Design
          </span>
        </div>
      </div>
    </section>
  );
}

export default CompanyDetailSection;
