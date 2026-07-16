'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import {
  getBrandName,
  buildHeaderNavEntries,
  getPageHref,
  type HomeHeaderNavEntry,
} from '@/app/lib/siteContent';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import { buildSectionPalette } from '@/app/lib/sectionPalette';
import { cn, getImageSrc } from '@/app/lib/utils';

type ServiceArea = { city: string; region: string };

type ServingAreaGroup = {
  label: string;
  href: string;
  serviceSlug: string;
  areas: ServiceArea[];
};

function isVisibleService(service: Service): boolean {
  return service.status === 'published';
}

function buildServingAreaGroups(
  services: Service[],
  serviceAreaPages: ServiceAreaPage[],
  siteAreas: string[] | undefined
): ServingAreaGroup[] {
  const visibleServices = services.filter(isVisibleService);
  const groups: ServingAreaGroup[] = [];

  const resolveSlugForPage = (page: ServiceAreaPage): string => {
    const fromPage = getServiceSlugFromAreaPage(page);
    if (fromPage) return fromPage;

    const serviceRef = page.serviceId as string | { slug?: string } | undefined;
    if (serviceRef && typeof serviceRef === 'object' && serviceRef.slug) {
      return resolveServiceSlug({ slug: serviceRef.slug });
    }
    if (typeof serviceRef === 'string') {
      const svc = services.find((s) => s._id === serviceRef);
      if (svc) return resolveServiceSlug(svc);
    }
    return '';
  };

  for (const service of visibleServices) {
    const serviceSlug = resolveServiceSlug(service);
    const seen = new Set<string>();
    const areas: ServiceArea[] = [];

    const addArea = (area: unknown) => {
      const city = getAreaCity(area);
      if (!city) return;
      const region = getAreaRegion(area);
      const key = `${city}|${region}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      areas.push({ city, region });
    };

    serviceAreaPages.forEach((page) => {
      if (page.status !== 'published' || !page.city?.trim()) return;
      const pageSlug = resolveSlugForPage(page);
      if (normalizeSlug(pageSlug) !== normalizeSlug(serviceSlug)) return;
      addArea({ city: page.city, region: page.region });
    });

    if (areas.length === 0) {
      (service.serviceAreas ?? []).forEach((area) => addArea(area));
    }

    if (areas.length > 0) {
      groups.push({
        label: service.name,
        href: `/service/${serviceSlug}`,
        serviceSlug,
        areas,
      });
    }
  }

  if (groups.length === 0 && siteAreas?.length) {
    const fallbackSlug = visibleServices[0] ? resolveServiceSlug(visibleServices[0]) : 'service';
    const areas: ServiceArea[] = [];
    const seen = new Set<string>();

    siteAreas.forEach((area) => {
      const city = getAreaCity(area);
      if (!city) return;
      const region = getAreaRegion(area);
      const key = `${city}|${region}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      areas.push({ city, region });
    });

    if (areas.length > 0) {
      groups.push({
        label: 'Serving Areas',
        href: `/service/${fallbackSlug}`,
        serviceSlug: fallbackSlug,
        areas,
      });
    }
  }

  return groups;
}

function NavLink({
  href,
  children,
  accentColor,
  textColor,
  fontFamily,
  onClick,
}: {
  href: string;
  children: ReactNode;
  accentColor: string;
  textColor: string;
  fontFamily?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative text-[10px] font-bold uppercase tracking-[0.4em] transition-opacity hover:opacity-70"
      style={{ color: textColor, fontFamily }}
    >
      {children}
      <span
        className="absolute -bottom-2 left-1/2 h-px w-0 -translate-x-1/2 transition-all duration-500 group-hover:w-full"
        style={{ backgroundColor: accentColor }}
      />
    </Link>
  );
}

export function Header() {
  const { site, pages, services, serviceAreaPages } = useWebBuilder();
  const theme = useSectionTheme();
  const { fonts } = theme;
  const palette = useMemo(() => buildSectionPalette(site), [site]);

  const [isOpen, setIsOpen] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(0);
  const [mobileAreasOpen, setMobileAreasOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const businessName = useMemo(() => getBrandName(site), [site]);
  const phoneNumber = site?.business?.phone?.trim() || site?.business?.emergencyPhone?.trim() || '';
  const logoImage = useMemo(() => {
    const url = site?.theme?.logoUrl || site?.footer?.logo?.url;
    return url ? getImageSrc(url) : '/logo.png';
  }, [site?.theme?.logoUrl, site?.footer?.logo?.url]);

  const servingAreaGroups = useMemo(
    () => buildServingAreaGroups(services, serviceAreaPages, site?.serviceAreas),
    [services, serviceAreaPages, site?.serviceAreas]
  );

  const homeNavEntries = useMemo<HomeHeaderNavEntry[]>(
    () =>
      buildHeaderNavEntries(pages, {
        includeServingAreas: servingAreaGroups.length > 0,
      }),
    [pages, servingAreaGroups.length]
  );

  const contactHref = useMemo(() => {
    const contactPage = pages.find((p) => p.status === 'published' && p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : null;
  }, [pages]);

  const accent = palette.primaryButton;
  const text = palette.text;
  const subtext = palette.subtext;

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (servingAreaGroups.length === 0) {
      setActiveServiceIndex(null);
      return;
    }
    setActiveServiceIndex((prev) =>
      prev === null || prev >= servingAreaGroups.length ? 0 : prev
    );
  }, [servingAreaGroups.length]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setMobileAreasOpen(false);
  };

  const servingAreasDropdown = (className?: string) =>
    servingAreaGroups.length > 0 ? (
      <div className={cn('group relative py-3', className)}>
        <button
          type="button"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] transition-opacity group-hover:opacity-70"
          style={{ color: text, fontFamily: fonts.body }}
        >
          Areas
          <svg
            className="h-2.5 w-2.5 opacity-40 transition-transform duration-300 group-hover:rotate-180"
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        <div className="invisible absolute left-1/2 top-full z-50 w-[min(100vw-3rem,640px)] -translate-x-1/2 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          <div
            className="flex overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${palette.bgTop} 0%, ${palette.bgBottom} 100%)`,
              border: `1px solid color-mix(in srgb, ${text} 10%, transparent)`,
            }}
          >
            <div
              className="w-[36%] shrink-0 py-2"
              style={{ borderRight: `1px solid color-mix(in srgb, ${text} 10%, transparent)` }}
            >
              {servingAreaGroups.map((group, idx) => (
                <button
                  key={group.serviceSlug}
                  type="button"
                  onMouseEnter={() => setActiveServiceIndex(idx)}
                  className="w-full px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.28em] transition-opacity"
                  style={{
                    color: activeServiceIndex === idx ? text : subtext,
                    opacity: activeServiceIndex === idx ? 1 : 0.7,
                    borderLeft:
                      activeServiceIndex === idx
                        ? `2px solid ${accent}`
                        : '2px solid transparent',
                    fontFamily: fonts.body,
                  }}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="flex-1 px-5 py-4">
              {isMounted && activeServiceIndex !== null && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {servingAreaGroups[activeServiceIndex]?.areas.map((area, idx) => (
                    <Link
                      key={idx}
                      href={getServiceAreaPageHref(
                        servingAreaGroups[activeServiceIndex].serviceSlug,
                        area,
                        serviceAreaPages
                      )}
                      className="group/area inline-flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
                      style={{ color: subtext, fontFamily: fonts.body }}
                    >
                      <span className="opacity-40 transition-opacity group-hover/area:opacity-100" style={{ color: accent }}>
                        +
                      </span>
                      {area.city}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[100] transition-all duration-500"
        style={{
          background: scrolled
            ? `color-mix(in srgb, ${palette.bgTop} 92%, transparent)`
            : `linear-gradient(180deg, ${palette.bgTop} 0%, color-mix(in srgb, ${palette.bgTop} 55%, transparent) 100%)`,
          backdropFilter: scrolled ? 'blur(12px)' : undefined,
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : undefined,
          borderBottom: scrolled
            ? `1px solid color-mix(in srgb, ${text} 8%, transparent)`
            : '1px solid transparent',
        }}
      >
        <div className="mx-auto w-full max-w-[90rem] px-6 md:px-12 lg:px-16 xl:px-20">
          <div className="grid h-[5.75rem] grid-cols-[auto_1fr_auto] items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
            <Link href="/" className="inline-flex min-w-0 shrink-0 items-center">
              <Image
                src={logoImage}
                alt={businessName || 'Logo'}
                width={160}
                height={160}
                className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                priority
              />
            </Link>

            <nav className="hidden items-center justify-center gap-8 lg:flex">
              {homeNavEntries.map((entry) =>
                entry.kind === 'anchor' ? (
                  <NavLink
                    key={entry.id}
                    href={entry.href}
                    accentColor={accent}
                    textColor={text}
                    fontFamily={fonts.body}
                  >
                    {entry.name}
                  </NavLink>
                ) : (
                  <div key="serving-areas">{servingAreasDropdown()}</div>
                )
              )}
            </nav>

            <div className="flex items-center justify-end gap-3">
              {phoneNumber && (
                <Link
                  href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                  className="hidden px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-90 lg:inline-block"
                  style={{
                    backgroundColor: accent,
                    color: palette.textOnDark,
                    fontFamily: fonts.body,
                  }}
                >
                  {phoneNumber}
                </Link>
              )}

              {!phoneNumber && contactHref && (
                <Link
                  href={contactHref}
                  className="hidden px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-90 lg:inline-block"
                  style={{
                    backgroundColor: accent,
                    color: palette.textOnDark,
                    fontFamily: fonts.body,
                  }}
                >
                  Contact
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                className="relative z-[110] p-2 lg:hidden"
              >
                <div className="flex w-7 flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      'block h-px w-7 transition-all duration-500',
                      isOpen && 'translate-y-[5px] rotate-45'
                    )}
                    style={{ backgroundColor: text }}
                  />
                  <span
                    className={cn(
                      'block h-px transition-all duration-500',
                      isOpen ? 'w-0 opacity-0' : 'w-5'
                    )}
                    style={{ backgroundColor: text }}
                  />
                  <span
                    className={cn(
                      'block h-px transition-all duration-500',
                      isOpen ? 'w-7 -translate-y-[5px] -rotate-45' : 'w-3'
                    )}
                    style={{ backgroundColor: text }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-[105] transition-all duration-500 lg:hidden',
          isOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        )}
        style={{
          background: `linear-gradient(180deg, ${palette.bgTop} 0%, ${palette.bgBottom} 100%)`,
        }}
      >
        <div className="flex h-full flex-col px-6 pb-10 pt-24">
          <div className="mb-10 flex items-center gap-3">
            <div className="h-px w-10" style={{ backgroundColor: accent }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.5em]"
              style={{ color: accent, fontFamily: fonts.body }}
            >
              Menu
            </span>
          </div>

          <nav className="flex flex-1 flex-col gap-7">
            {homeNavEntries.map((entry) =>
              entry.kind === 'anchor' ? (
                <Link
                  key={entry.id}
                  href={entry.href}
                  onClick={closeMenu}
                  className="text-[clamp(1.65rem,5vw,2.25rem)] font-normal tracking-tight"
                  style={{ fontFamily: fonts.heading, color: text }}
                >
                  {entry.name}
                </Link>
              ) : (
                servingAreaGroups.length > 0 && (
                  <div key="serving-areas">
                    <button
                      type="button"
                      onClick={() => setMobileAreasOpen((open) => !open)}
                      className="flex w-full items-center justify-between text-[clamp(1.65rem,5vw,2.25rem)] font-normal tracking-tight"
                      style={{ fontFamily: fonts.heading, color: text }}
                    >
                      Areas
                      <span className="text-sm" style={{ color: subtext }}>
                        {mobileAreasOpen ? '−' : '+'}
                      </span>
                    </button>

                    {mobileAreasOpen && (
                      <div
                        className="mt-5 space-y-6 pt-5"
                        style={{ borderTop: `1px solid color-mix(in srgb, ${text} 12%, transparent)` }}
                      >
                        {servingAreaGroups.map((group) => (
                          <div key={group.serviceSlug}>
                            <Link
                              href={group.href}
                              onClick={closeMenu}
                              className="mb-3 block text-[10px] font-bold uppercase tracking-[0.28em]"
                              style={{ color: text, fontFamily: fonts.body }}
                            >
                              {group.label}
                            </Link>
                            <div className="grid grid-cols-2 gap-2">
                              {group.areas.map((area, idx) => (
                                <Link
                                  key={idx}
                                  href={getServiceAreaPageHref(
                                    group.serviceSlug,
                                    area,
                                    serviceAreaPages
                                  )}
                                  onClick={closeMenu}
                                  className="text-[10px] uppercase tracking-[0.18em]"
                                  style={{ color: subtext, fontFamily: fonts.body }}
                                >
                                  {area.city}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )
            )}
          </nav>

          {(phoneNumber || contactHref) && (
            <div
              className="pt-6"
              style={{ borderTop: `1px solid color-mix(in srgb, ${text} 12%, transparent)` }}
            >
              <Link
                href={phoneNumber ? `tel:${phoneNumber.replace(/\s/g, '')}` : contactHref!}
                onClick={closeMenu}
                className="inline-block px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: accent,
                  color: palette.textOnDark,
                  fontFamily: fonts.body,
                }}
              >
                {phoneNumber || 'Contact'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
