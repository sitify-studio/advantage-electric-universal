'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { buildSectionPalette } from '@/app/lib/sectionPalette';
import { cn, getImageSrc } from '@/app/lib/utils';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  className?: string;
}

type DisplayService = {
  name: string;
  description: string;
  slug: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
};

function resolveServiceImage(service: Service): { url: string; alt: string } {
  const candidates = [
    service.thumbnailImage,
    service.galleryImages?.[0],
    service.banner?.backgroundImage,
    service.cta?.image,
  ];

  for (const candidate of candidates) {
    const url = candidate?.url ? getImageSrc(candidate.url) : '';
    if (url) {
      return {
        url,
        alt: candidate?.altText?.trim() || service.name,
      };
    }
  }

  return { url: '', alt: service.name };
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function serviceHref(slug: string, name: string): string {
  return `/service/${slug || name.toLowerCase().replace(/\s+/g, '-')}`;
}

function resolveServiceHref(service: Service): string {
  const defaultHref = serviceHref(service.slug, service.name);
  const customUrl = service.cta?.buttonUrl?.trim();
  return customUrl ? normalizeHref(customUrl) : defaultHref;
}

function ServiceCard({
  service,
  index,
  visible,
  accent,
  text,
  subtext,
  surface,
  fonts,
}: {
  service: DisplayService;
  index: number;
  visible: boolean;
  accent: string;
  text: string;
  subtext: string;
  surface: string;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
}) {
  return (
    <article
      className={cn(
        'group flex min-h-[280px] flex-col overflow-hidden border transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      style={{
        transitionDelay: `${index * 90}ms`,
        borderColor: `color-mix(in srgb, ${text} 12%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${surface} 96%, white)`,
      }}
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, ${surface})` }}
      >
        {service.imageUrl ? (
          <OptimizedImage
            src={service.imageUrl}
            alt={service.imageAlt}
            fill
            sizes={IMAGE_SIZES.card}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : null}
        <span
          className="absolute left-4 top-4 text-[10px] font-bold uppercase tracking-[0.35em]"
          style={{
            color: service.imageUrl ? '#fff' : accent,
            fontFamily: fonts.body,
            textShadow: service.imageUrl ? '0 1px 8px rgba(0,0,0,0.45)' : undefined,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3
          className="text-[clamp(1.35rem,2vw,1.75rem)] font-normal leading-tight tracking-tight"
          style={{ fontFamily: fonts.heading, color: text }}
        >
          {service.name}
        </h3>

        {service.description && (
          <p
            className="mt-4 flex-1 text-sm leading-relaxed"
            style={{ color: subtext, fontFamily: fonts.body }}
          >
            {service.description}
          </p>
        )}

        <Link
          href={service.href}
          className="mt-8 inline-flex items-center justify-between gap-4 border-t pt-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-75"
          style={{
            color: text,
            borderColor: `color-mix(in srgb, ${text} 12%, transparent)`,
            fontFamily: fonts.body,
          }}
        >
          <span>Learn More</span>
          <span style={{ color: accent }}>+</span>
        </Link>
      </div>
    </article>
  );
}

export function ServicesSection({ servicesSection, className }: ServicesSectionProps) {
  const { services, site } = useWebBuilder();
  const { fonts } = useSectionTheme();
  const palette = useMemo(() => buildSectionPalette(site), [site]);

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

    return fromApi.map((service) => {
      const image = resolveServiceImage(service);
      return {
        name: service.name,
        description: tiptapToText(service.shortDescription),
        slug: service.slug,
        href: resolveServiceHref(service),
        imageUrl: image.url,
        imageAlt: image.alt,
      };
    });
  }, [services, servicesSection?.serviceIds]);

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(
    displayServices.length,
    110
  );

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!title && !description && displayServices.length === 0) return null;

  return (
    <section
      id="services"
      className={cn('relative overflow-hidden py-16 lg:py-24', className)}
      style={{ backgroundColor: palette.bgTop }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${palette.primaryButton} 10%, transparent) 0%, transparent 100%)`,
        }}
      />

      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-12 lg:px-16 xl:px-20">
        {(title || description) && (
          <div
            ref={titleRef}
            className={cn(
              'mx-auto mb-12 max-w-3xl text-center transition-all duration-1000 lg:mb-16',
              titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            <SectionHeading
              eyebrow="Services"
              title={title}
              description={description}
              align="center"
              className="items-center"
              descriptionClassName="max-w-2xl"
            />
          </div>
        )}

        {displayServices.length > 0 && (
          <div
            ref={gridRef}
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {displayServices.map((service, index) => (
              <ServiceCard
                key={service.slug || index}
                service={service}
                index={index}
                visible={visibleItems.includes(index)}
                accent={palette.primaryButton}
                text={palette.text}
                subtext={palette.subtext}
                surface={palette.bgTop}
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
