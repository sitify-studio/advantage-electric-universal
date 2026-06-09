'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page, Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBusinessTagline } from '@/app/lib/siteContent';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { SectionHeading } from '@/app/components/ui/SectionHeading';

interface ServingAreasSectionProps {
  servingAreasSection?: Page['servingAreasSection'];
  className?: string;
}

type DisplayArea = {
  city: string;
  region: string;
  label: string;
  href?: string;
};

function resolveAreaCity(area: unknown): string {
  const fromHelper = getAreaCity(area);
  if (fromHelper) return fromHelper;

  if (area && typeof area === 'object') {
    const record = area as Record<string, unknown>;
    for (const key of ['area', 'location', 'label', 'title', 'name']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }

  return '';
}

function formatAreaLabel(city: string, region: string): string {
  if (!region) return city;
  if (city.toLowerCase().includes(region.toLowerCase())) return city;
  return `${city}, ${region}`;
}

function normalizeServiceArea(area: unknown): Omit<DisplayArea, 'href' | 'label'> | null {
  const city = resolveAreaCity(area);
  if (!city) return null;

  const region = getAreaRegion(area);
  return { city, region };
}

function isVisibleService(service: Service): boolean {
  return service.status !== 'draft' && service.status !== 'archived';
}

function areaKey(area: Pick<DisplayArea, 'city' | 'region'>): string {
  return `${area.city.toLowerCase()}|${area.region.toLowerCase()}`;
}

function enrichArea(
  area: Omit<DisplayArea, 'href' | 'label'>,
  serviceSlug: string,
  serviceAreaPages: ServiceAreaPage[] | undefined
): DisplayArea {
  const href = getServiceAreaPageHref(serviceSlug, area, serviceAreaPages);
  return {
    ...area,
    label: formatAreaLabel(area.city, area.region),
    href: href || undefined,
  };
}

function AreaItem({
  area,
  index,
  accentColor,
  fonts,
  visible,
}: {
  area: DisplayArea;
  index: number;
  accentColor: string;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
  visible: boolean;
}) {
  const content = (
    <div
      className={cn(
        'border-t border-slate-200 pt-6 transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        area.href && 'group'
      )}
    >
      <div className="flex items-baseline gap-4 mb-4">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.35em]"
          style={{ color: accentColor }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="h-px flex-1 max-w-12" style={{ backgroundColor: `${accentColor}40` }} />
      </div>

      <p
        className={cn(
          'text-base sm:text-lg font-normal tracking-tight text-slate-900',
          area.href && 'transition-colors group-hover:text-slate-600'
        )}
        style={{ fontFamily: fonts.heading }}
      >
        {area.label}
      </p>
    </div>
  );

  if (area.href) {
    return (
      <Link
        href={area.href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function ServingAreasSection({ servingAreasSection, className }: ServingAreasSectionProps) {
  const theme = useSectionTheme();
  const { colors, fonts } = theme;
  const { site, services, serviceAreaPages } = useWebBuilder();

  const serviceAreas = useMemo<DisplayArea[]>(() => {
    const result: DisplayArea[] = [];
    const seen = new Set<string>();

    const addArea = (area: unknown, serviceSlug: string) => {
      const normalized = normalizeServiceArea(area);
      if (!normalized) return;
      const key = areaKey(normalized);
      if (seen.has(key)) return;
      seen.add(key);
      result.push(enrichArea(normalized, serviceSlug, serviceAreaPages));
    };

    const resolveSlugForPage = (page: ServiceAreaPage): string => {
      const serviceRef = page.serviceId as string | { slug?: string } | undefined;
      if (serviceRef && typeof serviceRef === 'object' && serviceRef.slug) {
        return resolveServiceSlug({ slug: serviceRef.slug });
      }
      if (typeof serviceRef === 'string') {
        const svc = services.find((s) => s._id === serviceRef);
        if (svc) return resolveServiceSlug(svc);
      }
      return 'service';
    };

    const addAreasFromServiceAreaPages = (filterPublished = true) => {
      serviceAreaPages.forEach((page) => {
        if (filterPublished && page.status !== 'published') return;
        if (!page.city?.trim()) return;
        addArea({ city: page.city, region: page.region }, resolveSlugForPage(page));
      });
    };

    const addAreasFromServiceAreaPagesForSlug = (slug: string, filterPublished = true) => {
      const normSlug = normalizeSlug(slug);
      serviceAreaPages.forEach((page) => {
        if (filterPublished && page.status !== 'published') return;
        if (!page.city?.trim()) return;
        const pageSlug = getServiceSlugFromAreaPage(page) || resolveSlugForPage(page);
        if (normalizeSlug(pageSlug) !== normSlug) return;
        addArea({ city: page.city, region: page.region }, normSlug);
      });
    };

    const sectionSlug = servingAreasSection?.serviceSlug?.trim();
    if (sectionSlug) {
      const normSectionSlug = normalizeSlug(sectionSlug);
      const match = services.find((s: Service) => resolveServiceSlug(s) === normSectionSlug);
      const slug = match ? resolveServiceSlug(match) : normSectionSlug;

      addAreasFromServiceAreaPagesForSlug(slug, true);
      if (result.length === 0) {
        addAreasFromServiceAreaPagesForSlug(slug, false);
      }
      if (result.length === 0) {
        (match?.serviceAreas ?? []).forEach((area) => addArea(area, slug));
      }
      return result;
    }

    addAreasFromServiceAreaPages(true);
    if (result.length > 0) return result;

    const visibleServices = services.filter(isVisibleService);
    for (const service of visibleServices) {
      const slug = resolveServiceSlug(service);
      (service.serviceAreas ?? []).forEach((area) => addArea(area, slug));
    }
    if (result.length > 0) return result;

    const defaultSlug = visibleServices[0]
      ? resolveServiceSlug(visibleServices[0])
      : services[0]
        ? resolveServiceSlug(services[0])
        : 'service';
    (site?.serviceAreas ?? []).forEach((area) => addArea(area, defaultSlug));
    if (result.length > 0) return result;

    addAreasFromServiceAreaPages(false);

    return result;
  }, [servingAreasSection?.serviceSlug, services, site?.serviceAreas, serviceAreaPages]);

  const sectionTitle = useMemo(() => {
    const text = tiptapToText(servingAreasSection?.title);
    return text || 'Our Service Areas';
  }, [servingAreasSection?.title]);

  const sectionDescription = useMemo(() => {
    const text = tiptapToText(servingAreasSection?.description);
    return text || getBusinessTagline(site) || '';
  }, [servingAreasSection?.description, site]);

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(serviceAreas.length, 80);

  if (servingAreasSection?.enabled === false) return null;
  if (serviceAreas.length === 0) return null;

  const accentColor = colors.primaryButton;

  return (
    <section
      id="serving-areas"
      className={cn('relative overflow-hidden bg-[#fcfcfc] pt-12 lg:pt-16 pb-10 lg:pb-12', className)}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div
          ref={titleRef}
          className={cn(
            'mb-8 lg:mb-10 max-w-3xl transition-all duration-1000',
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <SectionHeading
            eyebrow="Locations"
            title={sectionTitle}
            description={sectionDescription || undefined}
            descriptionClassName="max-w-2xl"
          />
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-8"
        >
          {serviceAreas.map((area, index) => (
            <AreaItem
              key={areaKey(area)}
              area={area}
              index={index}
              accentColor={accentColor}
              fonts={fonts}
              visible={visibleItems.includes(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServingAreasSection;
