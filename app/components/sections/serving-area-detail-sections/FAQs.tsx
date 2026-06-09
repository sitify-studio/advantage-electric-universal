'use client';

import React from 'react';
import type { Page } from '@/app/lib/types';
import { FAQSection } from '@/app/components/sections/FAQSection';

interface FAQsProps {
  faqs: unknown;
  className?: string;
}

type FaqSectionData = NonNullable<Page['faqSection']>;

function normalizeFaqSection(faqs: unknown): FaqSectionData | null {
  if (!faqs) return null;

  if (Array.isArray(faqs)) {
    const items = faqs.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        ((item as { question?: unknown }).question || (item as { answer?: unknown }).answer)
    ) as FaqSectionData['items'];
    if (items.length === 0) return null;
    return { enabled: true, items };
  }

  if (typeof faqs !== 'object') return null;

  const data = faqs as {
    enabled?: boolean;
    title?: FaqSectionData['title'];
    description?: FaqSectionData['description'];
    items?: FaqSectionData['items'];
  };

  const items =
    data.items?.filter((item) => item?.question || item?.answer) ??
    [];

  if (data.enabled === false) return null;
  if (!data.title && !data.description && items.length === 0) return null;

  return {
    enabled: true,
    title: data.title,
    description: data.description,
    items,
  };
}

/** Service area FAQs — same layout as site FAQSection. */
export const FAQs: React.FC<FAQsProps> = ({ faqs, className }) => {
  const faqSection = normalizeFaqSection(faqs);
  if (!faqSection) return null;

  return <FAQSection faqSection={faqSection} className={className} />;
};

export default FAQs;
