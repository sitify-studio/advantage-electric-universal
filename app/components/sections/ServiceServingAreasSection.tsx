'use client';

import { useMemo } from 'react';
import type { Page, Service } from '@/app/lib/types';
import { ServingAreasSection } from '@/app/components/sections/ServingAreasSection';
import { normalizeSlug, resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface ServiceServingAreasSectionProps {
  service: Service | null | undefined;
  className?: string;
}

/** Service detail serving areas — live list from builder API (polled services + service area pages). */
export const ServiceServingAreasSection: React.FC<ServiceServingAreasSectionProps> = ({
  service: serviceProp,
  className,
}) => {
  const { services } = useWebBuilder();

  const liveService = useMemo(() => {
    if (!serviceProp) return undefined;
    const slug = resolveServiceSlug(serviceProp);
    return (
      services.find((s) => resolveServiceSlug(s) === normalizeSlug(slug)) ?? serviceProp
    );
  }, [services, serviceProp]);

  const servingAreasSection = useMemo((): Page['servingAreasSection'] => {
    if (!liveService) return { enabled: true };

    return {
      enabled: true,
      serviceSlug: resolveServiceSlug(liveService),
      description: liveService.shortDescription,
    };
  }, [liveService]);

  return <ServingAreasSection servingAreasSection={servingAreasSection} className={className} />;
};

export default ServiceServingAreasSection;
