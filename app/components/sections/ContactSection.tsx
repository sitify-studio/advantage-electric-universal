'use client';

import { useMemo, useState } from 'react';
import type { Page, BusinessHours } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

interface ContactSectionProps {
  contactSection?: Page['contactSection'];
  className?: string;
}

type DisplayHour = { day: string; label: string; value: string };

export function ContactSection({ contactSection, className }: ContactSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { site } = useWebBuilder();
  const theme = useSectionTheme();
  const { colors, fonts } = theme;

  const title = useMemo(() => tiptapToText(contactSection?.title), [contactSection?.title]);
  const description = useMemo(
    () => tiptapToText(contactSection?.description),
    [contactSection?.description]
  );

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
  });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });
  const { ref: lowerRef, isVisible: lowerVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const showForm = contactSection?.showForm !== false;
  const showMap = contactSection?.showMap !== false;
  const showContactInfo = contactSection?.showContactInfo !== false;

  const hoursRows = useMemo((): DisplayHour[] => {
    const formatTime = (time: string) => {
      if (!time) return '';
      if (businessHours?.displayFormat === '12h') {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      return time;
    };

    const formatDayHours = (dayHours: BusinessHours) => {
      if (!dayHours.isOpen) return 'Closed';
      if (dayHours.is24Hours) return 'Open 24 hours';
      if (dayHours.timeRanges?.length) {
        return dayHours.timeRanges
          .map((range) => `${formatTime(range.openTime)} – ${formatTime(range.closeTime)}`)
          .join(', ');
      }
      return '';
    };

    if (businessHours?.is24_7) {
      return DAY_ORDER.map((day) => ({
        day,
        label: DAY_LABELS[day],
        value: 'Open 24 hours',
      }));
    }

    if (businessHours?.hours?.length) {
      return [...businessHours.hours]
        .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
        .map((entry) => ({
          day: entry.day,
          label: DAY_LABELS[entry.day] || entry.day,
          value: formatDayHours(entry) || '—',
        }));
    }

    const legacy = business?.hours;
    if (Array.isArray(legacy) && legacy.length > 0) {
      return legacy
        .filter((h) => h?.day)
        .map((h) => ({
          day: h.day,
          label: DAY_LABELS[h.day.toLowerCase()] || h.day,
          value: h.isClosed ? 'Closed' : h.hours || '—',
        }));
    }

    return [];
  }, [business?.hours, businessHours]);

  if (!contactSection?.enabled) return null;

  const addressLine = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  const mapQuery = addressLine;
  const hasMap =
    showMap &&
    Boolean(
      (site?.business?.coordinates?.latitude != null &&
        site?.business?.coordinates?.longitude != null) ||
        mapQuery
    );
  const mapSrc =
    site?.business?.coordinates?.latitude != null &&
    site?.business?.coordinates?.longitude != null
      ? `https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`
      : mapQuery
        ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`
        : '';

  const accentColor = colors.primaryButton;
  const textColor = colors.mainText;
  const mutedColor = colors.secondaryText;
  const hoursSurface = `color-mix(in srgb, ${colors.sectionBackgroundLight || accentColor} 22%, ${colors.pageBackground})`;
  const hasHours = hoursRows.length > 0;
  const hasRightColumn =
    showContactInfo && Boolean(business?.email || business?.phone || addressLine);

  return (
    <section
      id="contact"
      className={cn('relative overflow-hidden py-16 lg:py-24', className)}
      style={{ backgroundColor: colors.pageBackground }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
          <div
            ref={headerRef}
            className={cn(
              'lg:col-span-6 transition-all duration-1000',
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <SectionHeading
              eyebrow="Contact"
              title={title || 'Get in touch'}
              description={description}
              descriptionClassName="max-w-md"
            />

            {showForm && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="group mt-10 inline-flex items-center gap-4"
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: textColor, fontFamily: fonts.body }}
                >
                  Send a Message
                </span>
                <div
                  className="h-px w-8 transition-all duration-500 group-hover:w-12"
                  style={{ backgroundColor: accentColor }}
                />
              </button>
            )}
          </div>

          {hasRightColumn && (
            <div
              ref={contentRef}
              className={cn(
                'lg:col-span-6 lg:pt-2 transition-all duration-1000 delay-150',
                contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <div className="space-y-4 lg:pt-14">
                {showContactInfo && business?.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="block text-sm font-light transition-opacity hover:opacity-70 sm:text-base"
                    style={{ color: mutedColor, fontFamily: fonts.body }}
                  >
                    {business.email}
                  </a>
                )}

                {showContactInfo && business?.phone && (
                  <a
                    href={`tel:${business.phone.replace(/\s/g, '')}`}
                    className="block text-sm font-light transition-opacity hover:opacity-70 sm:text-base"
                    style={{ color: mutedColor, fontFamily: fonts.body }}
                  >
                    {business.phone}
                  </a>
                )}

                {showContactInfo && addressLine && (
                  <p
                    className="text-sm font-light leading-relaxed sm:text-base"
                    style={{ color: mutedColor, fontFamily: fonts.body }}
                  >
                    {addressLine}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {(hasMap || hasHours) && (
          <div
            ref={lowerRef}
            className={cn(
              'mt-12 grid items-stretch gap-6 lg:mt-16 lg:gap-8 transition-all duration-1000',
              hasMap && hasHours ? 'lg:grid-cols-12' : 'grid-cols-1',
              lowerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            {hasMap && (
              <div
                className={cn(
                  'relative min-h-[260px] w-full overflow-hidden sm:min-h-[300px] lg:min-h-[340px]',
                  hasHours ? 'lg:col-span-7' : 'lg:col-span-12'
                )}
                style={{
                  border: `1px solid color-mix(in srgb, ${textColor} 12%, transparent)`,
                }}
              >
                <iframe
                  title="Office Location"
                  width="100%"
                  height="100%"
                  className="absolute inset-0 h-full w-full border-0"
                  src={mapSrc}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {hasHours && (
              <div
                className={cn(
                  'flex h-full flex-col p-6 sm:p-8',
                  hasMap ? 'lg:col-span-5' : 'lg:col-span-12 lg:max-w-xl'
                )}
                style={{ backgroundColor: hoursSurface }}
              >
                <span
                  className="mb-6 block text-[10px] font-bold uppercase tracking-[0.4em]"
                  style={{ color: accentColor, fontFamily: fonts.body }}
                >
                  Business Hours
                </span>

                <div className="flex flex-1 flex-col justify-center space-y-3.5">
                  {hoursRows.map((row) => (
                    <div
                      key={row.day}
                      className="flex items-baseline justify-between gap-6 border-b pb-3 last:border-b-0 last:pb-0"
                      style={{
                        borderColor: `color-mix(in srgb, ${textColor} 10%, transparent)`,
                      }}
                    >
                      <span
                        className="text-sm font-normal"
                        style={{ color: textColor, fontFamily: fonts.body }}
                      >
                        {row.label}
                      </span>
                      <span
                        className="text-sm font-light text-right"
                        style={{ color: mutedColor, fontFamily: fonts.body }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}

export default ContactSection;
