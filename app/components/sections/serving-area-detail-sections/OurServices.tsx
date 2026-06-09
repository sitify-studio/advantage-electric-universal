'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import type { Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { normalizeSlug, resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';

interface OurServicesProps {
  /** CMS `ourServices` from builder (title, description, linked service refs) */
  services?: unknown;
  /** Service area page parent service — auto-included per builder */
  pageServiceId?: string;
  className?: string;
}

type SectionConfig = {
  title?: unknown;
  description?: unknown;
  label?: string;
};

type DisplayService = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
};

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/6195895/pexels-photo-6195895.jpeg';

function formatServicePrice(service: Service): string {
  if (service.price?.trim()) return service.price.trim();
  if (service.priceType === 'quote') return 'Quote';
  if (service.priceType === 'range') return 'Custom';
  return '';
}

function mapLiveService(service: Service): DisplayService {
  const imageUrl = service.thumbnailImage?.url
    ? getImageSrc(service.thumbnailImage.url)
    : service.galleryImages?.[0]?.url
      ? getImageSrc(service.galleryImages[0].url)
      : FALLBACK_IMAGE;

  return {
    id: service._id,
    name: service.name,
    description: tiptapToText(service.shortDescription) || '',
    price: formatServicePrice(service),
    imageUrl,
    imageAlt:
      service.thumbnailImage?.altText ||
      service.galleryImages?.[0]?.altText ||
      service.name,
    href: `/service/${resolveServiceSlug(service)}`,
  };
}

function isVisibleService(service: Service): boolean {
  return service.status !== 'draft' && service.status !== 'archived';
}

function orderServicesForPage(
  services: Service[],
  pageServiceId?: string,
  serviceSlugFromUrl?: string
): Service[] {
  const normSlug = serviceSlugFromUrl ? normalizeSlug(serviceSlugFromUrl) : '';
  const primary =
    (pageServiceId && services.find((s) => s._id === pageServiceId)) ||
    (normSlug && services.find((s) => resolveServiceSlug(s) === normSlug));

  if (!primary) return services;
  return [primary, ...services.filter((s) => s._id !== primary._id)];
}

function buildDisplayServices(
  liveServices: Service[],
  pageServiceId?: string,
  serviceSlugFromUrl?: string
): DisplayService[] {
  const visible = liveServices.filter(isVisibleService);
  return orderServicesForPage(visible, pageServiceId, serviceSlugFromUrl).map(mapLiveService);
}

function normalizeSectionConfig(services: unknown): SectionConfig | null {
  if (!services || typeof services !== 'object') return { title: undefined, description: undefined };

  const data = services as Record<string, unknown>;
  if (data.enabled === false) return null;

  return {
    title: data.title ?? data.label,
    description: data.description ?? data.subtitle,
    label: typeof data.label === 'string' ? data.label : undefined,
  };
}

function hasRichContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

export const OurServices: React.FC<OurServicesProps> = ({
  services,
  pageServiceId,
  className,
}) => {
  const theme = useSectionTheme();
  const { colors, fonts } = theme;
  const { services: liveServices } = useWebBuilder();
  const params = useParams();
  const serviceSlugFromUrl =
    typeof params?.serviceSlug === 'string' ? params.serviceSlug : '';

  const config = useMemo(() => normalizeSectionConfig(services), [services]);

  const displayServices = useMemo(
    () => buildDisplayServices(liveServices, pageServiceId, serviceSlugFromUrl),
    [liveServices, pageServiceId, serviceSlugFromUrl]
  );

  const titleText = useMemo(() => tiptapToText(config?.title), [config?.title]);
  const descriptionText = useMemo(
    () => tiptapToText(config?.description),
    [config?.description]
  );

  if (!config) return null;
  if (!titleText && !descriptionText && !hasRichContent(config.title) && displayServices.length === 0) {
    return null;
  }

  const showTitle = hasRichContent(config.title) || Boolean(titleText);
  const showDescription = hasRichContent(config.description) || Boolean(descriptionText);
  const borderColor = `color-mix(in srgb, ${colors.mainText} 12%, transparent)`;
  const eyebrow = config.label?.trim() || 'Services';

  return (
    <section
      className={cn('relative border-t', className)}
      style={{
        backgroundColor: colors.pageBackground,
        borderColor,
        fontFamily: fonts.body,
      }}
    >
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-12 lg:px-16 xl:px-20 py-16 sm:py-20 lg:py-24">
        <header className="max-w-3xl mb-12 sm:mb-14 lg:mb-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] mb-6" style={{ fontFamily: fonts.body }}>
            <span style={{ color: colors.secondaryText }}>[ </span>
            <span style={{ color: colors.mainText }}>{eyebrow}</span>
            <span style={{ color: colors.secondaryText }}> ]</span>
          </p>

          {showTitle && (
            <h2
              className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-normal leading-[1.12] tracking-tight"
              style={{ fontFamily: fonts.heading, color: colors.mainText }}
            >
              {hasRichContent(config.title) ? (
                <TiptapRenderer content={config.title} as="inline" />
              ) : (
                titleText
              )}
            </h2>
          )}

          {showDescription && hasRichContent(config.description) && (
            <div
              className={cn('mt-5 text-base sm:text-lg font-light leading-relaxed', !showTitle && 'mt-0')}
              style={{ color: colors.secondaryText }}
            >
              <TiptapRenderer content={config.description} />
            </div>
          )}

          {showDescription && !hasRichContent(config.description) && descriptionText && (
            <p
              className={cn('mt-5 text-base sm:text-lg font-light leading-relaxed', !showTitle && 'mt-0')}
              style={{ color: colors.secondaryText }}
            >
              {descriptionText}
            </p>
          )}
        </header>

        {displayServices.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayServices.map((service, index) => {
              const number = String(index + 1).padStart(2, '0');
              const isExternal =
                service.href.startsWith('http') ||
                service.href.startsWith('mailto:') ||
                service.href.startsWith('tel:');

              const card = (
                <article
                  className="flex h-full flex-col overflow-hidden rounded-sm border bg-white transition-shadow hover:shadow-md"
                  style={{ borderColor }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <OptimizedImage
                      src={service.imageUrl}
                      alt={service.imageAlt}
                      fill
                      sizes={IMAGE_SIZES.card}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {service.price && (
                      <span
                        className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: colors.pageBackground,
                          color: colors.mainText,
                          fontFamily: fonts.body,
                        }}
                      >
                        {service.price}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <span
                      className="text-xs tabular-nums mb-2"
                      style={{ color: colors.secondaryText, opacity: 0.55 }}
                    >
                      {number}
                    </span>
                    <h3
                      className="text-lg sm:text-xl leading-snug"
                      style={{ fontFamily: fonts.heading, color: colors.mainText }}
                    >
                      {service.name}
                    </h3>
                    {service.description && (
                      <p
                        className="mt-2 text-sm sm:text-base leading-relaxed flex-1"
                        style={{ color: colors.secondaryText }}
                      >
                        {service.description}
                      </p>
                    )}
                    <span
                      className="mt-4 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.15em]"
                      style={{ color: colors.mainText }}
                    >
                      View service
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </article>
              );

              return (
                <li key={service.id} className="group">
                  {isExternal ? (
                    <a href={service.href} className="block h-full">
                      {card}
                    </a>
                  ) : (
                    <Link href={service.href} className="block h-full">
                      {card}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default OurServices;
