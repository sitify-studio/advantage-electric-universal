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

export function ServicesSection({ servicesSection, className }: ServicesSectionProps) {
  const { services } = useWebBuilder();
  const theme = useSectionTheme();
  const { colors } = theme;

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
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(displayServices.length, 150);

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!title && !description && displayServices.length === 0) return null;

  const primaryColor = colors.mainText;
  const secondaryColor = colors.primaryButton;

  return (
    <section id="services" className={cn('relative bg-[#fcfcfc] pt-10 lg:pt-14 pb-20 lg:pb-20 overflow-hidden', className)}>
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block z-0"
        style={{ backgroundColor: `${secondaryColor}20` }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div
          ref={titleRef}
          className={`max-w-4xl mb-12 sm:mb-16 transition-all duration-1000 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
          }`}
        >
          <SectionHeading
            eyebrow="Our Expertise"
            title={title}
            description={description}
          />
        </div>

        {displayServices.length > 0 && (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-12 sm:gap-y-16"
          >
            {displayServices.map((service, index) => (
              <div
                key={service.slug || index}
                className={`group flex flex-col transition-all duration-700 ${
                  visibleItems.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
                }`}
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden mb-6 sm:mb-8 rounded-sm"
                  style={{ backgroundColor: `${secondaryColor}20` }}
                >
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-2xl font-light tracking-tight text-slate-900">{service.name}</h3>
                    <span className="text-xs font-bold tracking-widest" style={{ color: `${secondaryColor}60` }}>
                      0{index + 1}
                    </span>
                  </div>

                  {service.description && (
                    <p className="text-slate-600 font-light leading-relaxed text-sm mb-6 sm:mb-8 line-clamp-4">
                      {service.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <Link
                      href={`/service/${service.slug || service.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-4 group/btn"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900">
                        View Project
                      </span>
                      <div
                        className="relative w-8 h-px transition-all duration-500"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesSection;
