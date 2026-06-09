'use client';

import React from 'react';
import type { Page } from '@/app/lib/types';
import { CompanyDetailSection } from '@/app/components/sections/CompanyDetailSection';

interface ServiceDetailsProps {
  details: unknown;
  className?: string;
}

type CompanyDetailSectionData = NonNullable<Page['companyDetailSection']>;

function pushDetailBlock(
  blocks: NonNullable<CompanyDetailSectionData['details']>,
  title: unknown,
  description: unknown
) {
  if (!title && !description) return;
  blocks.push({ title, description });
}

function normalizeCompanyDetailSection(details: unknown): CompanyDetailSectionData | null {
  if (!details || typeof details !== 'object') return null;

  const data = details as Record<string, unknown>;
  if (data.enabled === false) return null;

  const blocks: NonNullable<CompanyDetailSectionData['details']> = [];

  const features = (data.features ?? []) as Array<Record<string, unknown>>;
  for (const feature of features) {
    pushDetailBlock(
      blocks,
      feature.title,
      feature.fullDescription ?? feature.shortDescription ?? feature.description
    );
  }

  const process = (data.process ?? []) as Array<Record<string, unknown>>;
  for (const step of process) {
    pushDetailBlock(blocks, step.title, step.description);
  }

  const benefits = (data.benefits ?? []) as Array<Record<string, unknown>>;
  for (const benefit of benefits) {
    pushDetailBlock(blocks, benefit.title, benefit.description);
  }

  const title = data.title;
  const description = data.description ?? data.subtitle;

  if (!title && !description && blocks.length === 0) return null;

  return {
    enabled: true,
    title: title as CompanyDetailSectionData['title'],
    description: description as CompanyDetailSectionData['description'],
    details: blocks,
  };
}

/** Service area details — same layout as site CompanyDetailSection. */
export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ details, className }) => {
  const companyDetailSection = normalizeCompanyDetailSection(details);
  if (!companyDetailSection) return null;

  return <CompanyDetailSection companyDetailSection={companyDetailSection} className={className} />;
};

export default ServiceDetails;
