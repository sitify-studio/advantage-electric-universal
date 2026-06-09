'use client';

import React from 'react';
import type { Page } from '@/app/lib/types';
import { getImageSrc } from '@/app/lib/utils';
import { CTASection } from '@/app/components/sections/CTASection';

interface CTAProps {
  cta: unknown;
  className?: string;
}

type CtaSectionData = NonNullable<Page['ctaSection']>;
type NormalizedCta = CtaSectionData & { subtitle?: unknown };

function resolveBackgroundImage(cta: Record<string, unknown>): string | undefined {
  const raw =
    cta.backgroundImage ??
    cta.image ??
    (Array.isArray(cta.mediaItems) && (cta.mediaItems[0] as { url?: string })?.url);

  if (!raw) return undefined;
  if (typeof raw === 'string') return getImageSrc(raw);
  if (typeof raw === 'object' && raw !== null && 'url' in raw) {
    const url = (raw as { url?: string }).url;
    return url ? getImageSrc(url) : undefined;
  }
  return undefined;
}

function resolvePrimaryButton(cta: Record<string, unknown>): CtaSectionData['primaryButton'] | undefined {
  const primary = cta.primaryButton as { label?: string; href?: string } | undefined;
  if (primary?.label?.trim()) {
    return {
      label: primary.label.trim(),
      href: primary.href?.trim() || '/',
    };
  }

  const legacy = cta.ctaButton as { text?: string; url?: string; label?: string; href?: string } | undefined;
  const label = legacy?.text?.trim() || legacy?.label?.trim();
  if (label) {
    return {
      label,
      href: legacy?.url?.trim() || legacy?.href?.trim() || '/contact-us',
    };
  }

  return undefined;
}

function normalizeCtaSection(cta: unknown): NormalizedCta | null {
  if (!cta || typeof cta !== 'object') return null;

  const data = cta as Record<string, unknown>;
  if (data.enabled === false) return null;

  const primaryButton = resolvePrimaryButton(data);
  const backgroundImage = resolveBackgroundImage(data);
  const title = data.title;
  const description = data.description;
  const subtitle = data.subtitle ?? data.label;

  if (!title && !description && !primaryButton && !subtitle) return null;

  const section: NormalizedCta = {
    enabled: true,
    title: title as CtaSectionData['title'],
    description: description as CtaSectionData['description'],
    primaryButton,
    backgroundImage,
    backgroundColor:
      typeof data.backgroundColor === 'string' ? data.backgroundColor.trim() : undefined,
  };

  if (subtitle) section.subtitle = subtitle;

  return section;
}

/** Service area CTA — same cinematic layout as site CTASection. */
export const CTA: React.FC<CTAProps> = ({ cta, className }) => {
  const ctaSection = normalizeCtaSection(cta);
  if (!ctaSection) return null;

  return <CTASection ctaSection={ctaSection} className={className} />;
};

export default CTA;
