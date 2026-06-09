'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import {
  getBrandName,
  getBusinessTagline,
  getHeaderNavItems,
  getHomeHeaderNavEntries,
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
  onClick,
}: {
  href: string;
  children: ReactNode;
  accentColor: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 transition-colors hover:text-slate-900"
    >
      {children}
      <span
        className="absolute -bottom-2 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
        style={{ backgroundColor: accentColor }}
      />
    </Link>
  );
}

export function Header() {
  const { site, pages, services, serviceAreaPages } = useWebBuilder();
  const theme = useSectionTheme();
  const { colors, fonts } = theme;

  const [isOpen, setIsOpen] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(0);
  const [mobileAreasOpen, setMobileAreasOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const businessName = useMemo(() => getBrandName(site), [site]);
  const tagline = useMemo(() => getBusinessTagline(site) || '', [site]);
  const phoneNumber = site?.business?.phone?.trim() || site?.business?.emergencyPhone?.trim() || '';
  const logoImage = useMemo(() => {
    const url = site?.theme?.logoUrl || site?.footer?.logo?.url;
    return url ? getImageSrc(url) : '/logo.png';
  }, [site?.theme?.logoUrl, site?.footer?.logo?.url]);

  const homeNavEntries = useMemo<HomeHeaderNavEntry[]>(() => {
    const homePage = pages.find((p) => p.pageType === 'home');
    const fromHome = getHomeHeaderNavEntries(homePage);
    if (fromHome.length > 0) return fromHome;

    return getHeaderNavItems(pages).map((item) => ({
      kind: 'anchor' as const,
      id: item.id,
      name: item.name,
      href: item.href,
    }));
  }, [pages]);

  const servingAreaGroups = useMemo(
    () => buildServingAreaGroups(services, serviceAreaPages, site?.serviceAreas),
    [services, serviceAreaPages, site?.serviceAreas]
  );

  const accentColor = colors.primaryButton;

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
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 transition-colors group-hover:text-slate-900"
        >
          Areas
          <svg
            className="h-2.5 w-2.5 opacity-50 transition-transform duration-300 group-hover:rotate-180"
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        <div className="invisible absolute left-1/2 top-full z-50 w-[min(100vw-3rem,640px)] -translate-x-1/2 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex overflow-hidden border border-slate-200 bg-white">
            <div className="w-[36%] shrink-0 border-r border-slate-200 py-2">
              {servingAreaGroups.map((group, idx) => (
                <button
                  key={group.serviceSlug}
                  type="button"
                  onMouseEnter={() => setActiveServiceIndex(idx)}
                  className={cn(
                    'w-full px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.26em] transition-colors',
                    activeServiceIndex === idx
                      ? 'text-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                  style={{
                    borderLeft:
                      activeServiceIndex === idx
                        ? `2px solid ${accentColor}`
                        : '2px solid transparent',
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
                      className="group/area inline-flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-slate-900"
                    >
                      <span className="text-[10px] text-slate-300 transition-colors group-hover/area:text-slate-900">
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
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-all duration-500',
          scrolled
            ? 'border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_-20px_rgba(0,0,0,0.15)]'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
            <Link href="/" className="flex min-w-0 items-center gap-3 group">
              <Image
                src={logoImage}
                alt={businessName || 'Logo'}
                width={64}
                height={64}
                className="h-7 w-7 shrink-0 object-contain lg:h-8 lg:w-8"
              />
              <div className="min-w-0 border-l border-slate-200/80 pl-3">
                <span
                  className="block truncate text-[10px] font-bold uppercase tracking-[0.28em] text-slate-900"
                  style={{ fontFamily: fonts.heading }}
                >
                  {businessName || 'Brand'}
                </span>
                {tagline && (
                  <span className="mt-0.5 hidden truncate text-[8px] font-medium uppercase tracking-[0.34em] text-slate-500 sm:block">
                    {tagline}
                  </span>
                )}
              </div>
            </Link>

            <nav className="hidden items-center justify-center gap-8 lg:flex">
              {homeNavEntries.map((entry) =>
                entry.kind === 'anchor' ? (
                  <NavLink key={entry.id} href={entry.href} accentColor={accentColor}>
                    {entry.name}
                  </NavLink>
                ) : (
                  <div key="serving-areas">{servingAreasDropdown()}</div>
                )
              )}
            </nav>

            <div className="flex items-center justify-end gap-4">
              {phoneNumber && (
                <Link
                  href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                  className="group hidden items-center gap-3 lg:inline-flex"
                >
                  <div className="text-right">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.28em] text-slate-400">
                      Direct Line
                    </span>
                    <span className="text-[10px] font-medium tracking-[0.12em] text-slate-700">
                      {phoneNumber}
                    </span>
                  </div>
                  <div
                    className="h-px w-6 transition-all duration-500 group-hover:w-10"
                    style={{ backgroundColor: accentColor }}
                  />
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
                      'block h-px w-7 bg-slate-900 transition-all duration-500',
                      isOpen && 'translate-y-[5px] rotate-45'
                    )}
                  />
                  <span
                    className={cn(
                      'block h-px bg-slate-900 transition-all duration-500',
                      isOpen ? 'w-0 opacity-0' : 'w-5'
                    )}
                  />
                  <span
                    className={cn(
                      'block h-px bg-slate-900 transition-all duration-500',
                      isOpen ? 'w-7 -translate-y-[5px] -rotate-45' : 'w-3'
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-[105] bg-white transition-all duration-500 lg:hidden',
          isOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
        )}
      >
        <div className="flex h-full flex-col px-6 pb-10 pt-20">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-8" style={{ backgroundColor: accentColor }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.4em]"
              style={{ color: accentColor }}
            >
              Menu
            </span>
          </div>

          <nav className="flex flex-1 flex-col gap-6">
            {homeNavEntries.map((entry) =>
              entry.kind === 'anchor' ? (
                <Link
                  key={entry.id}
                  href={entry.href}
                  onClick={closeMenu}
                  className="text-2xl font-light tracking-tight text-slate-900"
                  style={{ fontFamily: fonts.heading }}
                >
                  {entry.name}
                </Link>
              ) : (
                servingAreaGroups.length > 0 && (
                  <div key="serving-areas">
                    <button
                      type="button"
                      onClick={() => setMobileAreasOpen((open) => !open)}
                      className="flex w-full items-center justify-between text-2xl font-light tracking-tight text-slate-900"
                      style={{ fontFamily: fonts.heading }}
                    >
                      Areas
                      <span className="text-sm text-slate-400">{mobileAreasOpen ? '−' : '+'}</span>
                    </button>

                    {mobileAreasOpen && (
                      <div className="mt-4 space-y-6 border-t border-slate-200 pt-4">
                        {servingAreaGroups.map((group) => (
                          <div key={group.serviceSlug}>
                            <Link
                              href={group.href}
                              onClick={closeMenu}
                              className="mb-3 block text-[10px] font-bold uppercase tracking-[0.28em] text-slate-900"
                            >
                              {group.label}
                            </Link>
                            <div className="grid grid-cols-2 gap-2">
                              {group.areas.map((area, idx) => (
                                <Link
                                  key={idx}
                                  href={getServiceAreaPageHref(group.serviceSlug, area, serviceAreaPages)}
                                  onClick={closeMenu}
                                  className="text-[10px] uppercase tracking-[0.18em] text-slate-500"
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

          {phoneNumber && (
            <div className="border-t border-slate-200 pt-6">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
                Direct Line
              </span>
              <a
                href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                className="text-lg font-light tracking-tight text-slate-900"
                style={{ fontFamily: fonts.heading }}
              >
                {phoneNumber}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
