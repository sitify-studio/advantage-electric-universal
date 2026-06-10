'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import type { ThemeColors } from '@/app/hooks/useTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { cn } from '@/app/lib/utils';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page;
  className?: string;
}

type DisplayService = {
  name: string;
  description: string;
  slug: string;
  href: string;
};

const MAX_FAN_CARDS = 5;
const SEMI_HEIGHT = 200;

type FanSlot = { rotate: number; x: number; bottom: number };

const FAN_PRESETS: Record<number, FanSlot[]> = {
  1: [{ rotate: 0, x: 0, bottom: 228 }],
  2: [
    { rotate: -30, x: -175, bottom: 210 },
    { rotate: 30, x: 175, bottom: 210 },
  ],
  3: [
    { rotate: -45, x: -235, bottom: 198 },
    { rotate: 0, x: 0, bottom: 248 },
    { rotate: 45, x: 235, bottom: 198 },
  ],
  4: [
    { rotate: -52, x: -295, bottom: 192 },
    { rotate: -18, x: -105, bottom: 228 },
    { rotate: 18, x: 105, bottom: 228 },
    { rotate: 52, x: 295, bottom: 192 },
  ],
  5: [
    { rotate: -58, x: -340, bottom: 186 },
    { rotate: -30, x: -175, bottom: 215 },
    { rotate: 0, x: 0, bottom: 252 },
    { rotate: 30, x: 175, bottom: 215 },
    { rotate: 58, x: 340, bottom: 186 },
  ],
};

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

function getFanSlot(index: number, total: number): FanSlot {
  const preset = FAN_PRESETS[Math.min(total, MAX_FAN_CARDS)];
  if (preset?.[index]) return preset[index];

  const center = (total - 1) / 2;
  const offset = index - center;
  const maxAngle = 58;
  const step = total > 1 ? (maxAngle * 2) / (total - 1) : 0;

  return {
    rotate: -maxAngle + index * step,
    x: offset * 120,
    bottom: 220 - Math.abs(offset) * 12,
  };
}

function ServicePillLink({
  href,
  label,
  colors,
  fonts,
}: {
  href: string;
  label: string;
  colors: ThemeColors;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
}) {
  return (
    <Link
      href={href}
      className="mt-auto inline-flex w-full items-center justify-between gap-3 rounded-full border px-4 py-2.5 text-xs font-semibold transition-opacity hover:opacity-80"
      style={{
        borderColor: colors.darkPrimaryText,
        color: colors.darkPrimaryText,
        fontFamily: fonts.body,
      }}
    >
      <span>{label}</span>
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: colors.darkPrimaryText }}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

function RadialServiceCard({
  service,
  index,
  total,
  visible,
  isActive,
  onActivate,
  colors,
  fonts,
}: {
  service: DisplayService;
  index: number;
  total: number;
  visible: boolean;
  isActive: boolean;
  onActivate: () => void;
  colors: ThemeColors;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
}) {
  const { rotate, x, bottom } = getFanSlot(index, total);

  const delay = index * 140 + 80;

  return (
    <div
      className={cn('absolute left-1/2', isActive ? 'z-30' : 'z-10')}
      style={{
        bottom,
        opacity: visible ? 1 : 0,
        transform: visible
          ? `translateX(calc(-50% + ${x}px)) translateY(0) scale(1)`
          : `translateX(calc(-50% + 0px)) translateY(72px) scale(0.9)`,
        transition: `transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity 0.65s ease ${delay}ms`,
      }}
    >
      <article
        onMouseEnter={onActivate}
        onFocus={onActivate}
        className="flex min-h-[360px] w-[248px] flex-col rounded-[1.75rem] p-5 shadow-lg"
        style={{
          transform: `rotate(${visible ? rotate : 0}deg) scale(${isActive ? 1.03 : 1})`,
          transformOrigin: 'bottom center',
          backgroundColor: colors.primaryButton,
          transition: `transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${delay + 60}ms`,
        }}
      >
        <h3
          className="mb-3 text-lg font-bold leading-tight"
          style={{ fontFamily: fonts.heading, color: colors.darkPrimaryText }}
        >
          {service.name}
        </h3>

        {service.description && (
          <p
            className="mb-5 flex-1 text-[11px] leading-relaxed"
            style={{ color: colors.darkPrimaryText, fontFamily: fonts.body }}
          >
            {service.description}
          </p>
        )}

        <ServicePillLink
          href={service.href}
          label="Learn more"
          colors={colors}
          fonts={fonts}
        />
      </article>
    </div>
  );
}

function MobileServiceCard({
  service,
  index,
  visible,
  colors,
  fonts,
}: {
  service: DisplayService;
  index: number;
  visible: boolean;
  colors: ThemeColors;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
}) {
  return (
    <article
      className={cn(
        'flex min-h-[320px] w-[min(85vw,280px)] shrink-0 snap-center flex-col rounded-[1.75rem] p-5 shadow-lg',
        visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-95 opacity-0'
      )}
      style={{
        transitionDelay: `${index * 120}ms`,
        transitionDuration: '0.75s',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        backgroundColor: colors.primaryButton,
      }}
    >
      <h3
        className="mb-3 text-lg font-bold"
        style={{ fontFamily: fonts.heading, color: colors.darkPrimaryText }}
      >
        {service.name}
      </h3>
      {service.description && (
        <p
          className="mb-5 flex-1 text-xs leading-relaxed"
          style={{ color: colors.darkPrimaryText, fontFamily: fonts.body }}
        >
          {service.description}
        </p>
      )}
      <ServicePillLink
        href={service.href}
        label="Learn more"
        colors={colors}
        fonts={fonts}
      />
    </article>
  );
}

export function ServicesSection({ servicesSection, className }: ServicesSectionProps) {
  const { services } = useWebBuilder();
  const { colors, fonts } = useSectionTheme();
  const [activeIndex, setActiveIndex] = useState(0);

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
      href: resolveServiceHref(service),
    }));
  }, [services, servicesSection?.serviceIds]);

  const fanServices = displayServices.slice(0, MAX_FAN_CARDS);
  const extraServices = displayServices.slice(MAX_FAN_CARDS);
  const fanCount = fanServices.length;
  const defaultActive = Math.floor(fanCount / 2);

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: fanRef, visibleItems, isVisible: fanInView } = useStaggeredAnimation(
    displayServices.length,
    140
  );

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!title && !description && displayServices.length === 0) return null;

  const resolvedActive = activeIndex < fanCount ? activeIndex : defaultActive;

  return (
    <section
      id="services"
      className={cn('relative overflow-hidden py-12 lg:py-16', className)}
      style={{ backgroundColor: colors.pageBackground }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        {(title || description) && (
          <div
            ref={titleRef}
            className={cn(
              'mb-10 max-w-3xl transition-all duration-1000 lg:mb-12',
              titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            <SectionHeading
              eyebrow="Services"
              title={title}
              description={description}
              descriptionClassName="max-w-2xl"
            />
          </div>
        )}

        {fanServices.length > 0 && (
          <div ref={fanRef}>
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide lg:hidden">
              {displayServices.map((service, index) => (
                <MobileServiceCard
                  key={service.slug || index}
                  service={service}
                  index={index}
                  visible={visibleItems.includes(index)}
                  colors={colors}
                  fonts={fonts}
                />
              ))}
            </div>

            <div className="relative mx-auto hidden h-[600px] max-w-[900px] lg:block">
              {fanServices.map((service, index) => (
                <RadialServiceCard
                  key={service.slug || index}
                  service={service}
                  index={index}
                  total={fanCount}
                  visible={visibleItems.includes(index)}
                  isActive={resolvedActive === index}
                  onActivate={() => setActiveIndex(index)}
                  colors={colors}
                  fonts={fonts}
                />
              ))}

              <div
                className={cn(
                  'absolute bottom-0 left-1/2 w-[min(100%,560px)] -translate-x-1/2 transition-all duration-700',
                  fanInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                )}
                style={{
                  height: SEMI_HEIGHT,
                  transitionDelay: '200ms',
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div
                  className="relative flex h-full w-full flex-col items-center justify-end pb-9"
                  style={{
                    borderRadius: '560px 560px 0 0',
                    backgroundColor: colors.cardBackgroundDark,
                  }}
                >
                  <div className="absolute top-5 flex items-center gap-2.5">
                    {fanServices.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`View service ${i + 1}`}
                        onClick={() => setActiveIndex(i)}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: resolvedActive === i ? 10 : 6,
                          height: resolvedActive === i ? 10 : 6,
                          backgroundColor:
                            resolvedActive === i ? colors.darkPrimaryText : colors.inactiveDark,
                          opacity: resolvedActive === i ? 1 : 0.45,
                        }}
                      />
                    ))}
                  </div>

                  <h2
                    className="text-3xl font-bold tracking-tight"
                    style={{ fontFamily: fonts.heading, color: colors.darkPrimaryText }}
                  >
                    Services
                  </h2>
                </div>
              </div>
            </div>

            {extraServices.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:mt-10">
                {extraServices.map((service, index) => (
                  <MobileServiceCard
                    key={service.slug || index + MAX_FAN_CARDS}
                    service={service}
                    index={index + MAX_FAN_CARDS}
                    visible={visibleItems.includes(index + MAX_FAN_CARDS)}
                    colors={colors}
                    fonts={fonts}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesSection;
