'use client';

import Link from 'next/link';
import React from 'react';
import { cn } from '@/app/lib/utils';
import { useHomeTheme } from '@/app/components/ui/made';

export function EditorialBracket({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { colors } = useHomeTheme();
  return (
    <span
      className={cn(
        'text-[10px] font-normal uppercase tracking-[0.28em] sm:text-[11px]',
        className,
      )}
      style={{ color: colors.secondaryText }}
    >
      [ {children} ]
    </span>
  );
}

export function EditorialSection({
  children,
  className,
  id,
  bordered = true,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bordered?: boolean;
}) {
  const { colors, fonts } = useHomeTheme();
  return (
    <section
      id={id}
      className={cn(
        'relative z-10 w-full overflow-hidden py-20 lg:py-28',
        bordered && 'border-t',
        className,
      )}
      style={{
        backgroundColor: colors.pageBackground,
        borderColor: `color-mix(in srgb, ${colors.mainText} 12%, transparent)`,
        color: colors.mainText,
        fontFamily: fonts.body,
      }}
    >
      {children}
    </section>
  );
}

export function EditorialContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[90rem] px-6 md:px-12 lg:px-16 xl:px-20', className)}>
      {children}
    </div>
  );
}

export function EditorialSectionHeader({
  eyebrow,
  title,
  description,
  count,
  action,
  className,
}: {
  eyebrow: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  count?: string | number;
  action?: { label: string; href: string };
  className?: string;
}) {
  const { colors, fonts } = useHomeTheme();
  const countLabel =
    count !== undefined ? String(count).padStart(2, '0') : undefined;

  return (
    <div className={cn('mb-14 flex flex-col gap-8 lg:mb-20 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <h2
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: colors.mainText, fontFamily: fonts.body }}
          >
            {eyebrow}
          </h2>
          {countLabel && <EditorialBracket>{countLabel}</EditorialBracket>}
        </div>
        {title && (
          <div
            className="max-w-3xl text-[clamp(1.75rem,3.5vw,3rem)] font-normal leading-[1.15] tracking-tight"
            style={{ color: colors.mainText, fontFamily: fonts.heading }}
          >
            {title}
          </div>
        )}
        {description && (
          <div
            className="max-w-xl text-base font-light leading-relaxed"
            style={{ color: colors.secondaryText, fontFamily: fonts.body }}
          >
            {description}
          </div>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] transition-opacity hover:opacity-60"
          style={{ color: colors.mainText, fontFamily: fonts.body }}
        >
          {action.label}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}

export function EditorialPrimaryButton({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const { colors, fonts } = useHomeTheme();
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-85',
        className,
      )}
      style={{
        backgroundColor: colors.mainText,
        color: colors.pageBackground,
        fontFamily: fonts.body,
      }}
    >
      {label}
    </Link>
  );
}

export function EditorialOutlineButton({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const { colors, fonts } = useHomeTheme();
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-full border px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-70',
        className,
      )}
      style={{
        borderColor: `color-mix(in srgb, ${colors.mainText} 25%, transparent)`,
        color: colors.mainText,
        fontFamily: fonts.body,
      }}
    >
      {label}
    </Link>
  );
}

export function EditorialDivider({ className }: { className?: string }) {
  const { colors } = useHomeTheme();
  return (
    <div
      className={cn('h-px w-full', className)}
      style={{ backgroundColor: `color-mix(in srgb, ${colors.mainText} 14%, transparent)` }}
    />
  );
}

export function EditorialMarquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const { colors, fonts } = useHomeTheme();
  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div
      className={cn('editorial-marquee overflow-hidden border-y py-6', className)}
      style={{ borderColor: `color-mix(in srgb, ${colors.mainText} 12%, transparent)` }}
    >
      <div className="editorial-marquee-track flex w-max gap-12">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="whitespace-nowrap text-[clamp(2rem,5vw,4.5rem)] font-normal uppercase tracking-tight"
            style={{ color: colors.mainText, fontFamily: fonts.heading }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
