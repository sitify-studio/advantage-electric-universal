'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { cn, getImageSrc } from '@/app/lib/utils';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page;
  className?: string;
}

const FALLBACK_SERVICE_IMAGE =
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg';

function resolveServiceImage(service: Service): string {
  const url = service.thumbnailImage?.url || service.galleryImages?.[0]?.url;
  return url ? getImageSrc(url) : FALLBACK_SERVICE_IMAGE;
}

function ServiceCard({
  service,
  index,
  visible,
  accentColor,
  fonts,
}: {
  service: { name: string; description: string; slug: string; imageUrl: string };
  index: number;
  visible: boolean;
  accentColor: string;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
}) {
  const href = `/service/${service.slug || service.name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <article
      className={cn(
        'group flex flex-col border-t border-slate-200/80 pt-8 transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link href={href} className="block no-underline">
        <div className="relative mb-6 sm:mb-7">
          <div
            className="absolute -bottom-3 -right-3 hidden h-full w-full border sm:block"
            style={{ borderColor: `${accentColor}30` }}
          />

          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              className={cn(
                'object-cover transition-all duration-[1.2s] ease-out',
                'grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.05]',
                visible ? 'scale-100' : 'scale-105'
              )}
            />
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background: `linear-gradient(160deg, transparent 35%, ${accentColor}22 100%)`,
              }}
            />
            <div
              className={cn(
                'absolute bottom-0 left-0 h-px w-full origin-left transition-transform duration-700 ease-out',
                visible ? 'scale-x-100' : 'scale-x-0'
              )}
              style={{ backgroundColor: accentColor, transitionDelay: `${index * 100 + 200}ms` }}
            />
          </div>
        </div>
      </Link>

      <div className="flex flex-grow flex-col">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.35em]"
              style={{ color: accentColor }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="h-px w-8" style={{ backgroundColor: `${accentColor}40` }} />
          </div>
        </div>

        <Link href={href} className="block no-underline">
          <h3
            className="mb-3 text-xl font-normal tracking-tight text-slate-900 transition-colors group-hover:text-slate-600 sm:text-2xl"
            style={{ fontFamily: fonts.heading }}
          >
            {service.name}
          </h3>
        </Link>

        {service.description && (
          <p className="mb-6 line-clamp-4 text-sm font-light leading-relaxed text-slate-600 sm:mb-8">
            {service.description}
          </p>
        )}

        <div className="mt-auto">
          <Link href={href} className="group/btn inline-flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900">
              View Service
            </span>
            <div
              className="h-px w-8 transition-all duration-500 group-hover/btn:w-12"
              style={{ backgroundColor: accentColor }}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ServicesSection({ servicesSection, className }: ServicesSectionProps) {
  const { services } = useWebBuilder();
  const theme = useSectionTheme();
  const { colors, fonts } = theme;

  const title = useMemo(() => tiptapToText(servicesSection?.title), [servicesSection?.title]);
  const description = useMemo(
    () => tiptapToText(servicesSection?.description),
    [servicesSection?.description]
  );
  const displayServices = useMemo(() => {
    const fromApi = (services ?? []).filter((service) =>
      servicesSection?.serviceIds?.length
        ? servicesSection.serviceIds.includes(service._id)
        : service.status === 'published'
    );

    return fromApi.map((service) => ({
      name: service.name,
      description: tiptapToText(service.shortDescription),
      slug: service.slug,
      imageUrl: resolveServiceImage(service),
    }));
  }, [services, servicesSection?.serviceIds]);

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(displayServices.length, 120);

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!title && !description && displayServices.length === 0) return null;

  const accentColor = colors.primaryButton;

  return (
    <section
      id="services"
      className={cn('relative overflow-hidden bg-[#fcfcfc] pt-10 pb-20 lg:pt-14 lg:pb-20', className)}
    >
      <div
        className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full blur-[100px] opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full blur-3xl opacity-15"
        style={{ backgroundColor: accentColor }}
      />

      <div
        className="absolute left-1/2 top-0 bottom-0 z-0 hidden w-px lg:block"
        style={{ backgroundColor: `${accentColor}18` }}
      />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div
          ref={titleRef}
          className={cn(
            'mb-12 max-w-4xl transition-all duration-1000 sm:mb-16',
            titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          )}
        >
          <SectionHeading eyebrow="Our Expertise" title={title} description={description} />
        </div>

        {displayServices.length > 0 && (
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-3 lg:gap-y-16"
          >
            {displayServices.map((service, index) => (
              <ServiceCard
                key={service.slug || index}
                service={service}
                index={index}
                visible={visibleItems.includes(index)}
                accentColor={accentColor}
                fonts={fonts}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesSection;
