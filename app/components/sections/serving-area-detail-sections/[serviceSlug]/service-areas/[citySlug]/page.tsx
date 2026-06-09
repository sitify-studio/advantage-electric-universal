'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/serving-area-detail-sections/Hero';
import { About } from '@/app/components/sections/serving-area-detail-sections/About';
import { ServiceOverview } from '@/app/components/sections/serving-area-detail-sections/ServiceOverview';
import { ServiceDetails } from '@/app/components/sections/serving-area-detail-sections/ServiceDetails';
import { WhyChooseUs } from '@/app/components/sections/serving-area-detail-sections/WhyChooseUs';
import { Highlights } from '@/app/components/sections/serving-area-detail-sections/Highlights';
import { OurServices } from '@/app/components/sections/serving-area-detail-sections/OurServices';
import { FAQs } from '@/app/components/sections/serving-area-detail-sections/FAQs';
import { CTA } from '@/app/components/sections/serving-area-detail-sections/CTA';
import { ServingAreas } from '@/app/components/sections/serving-area-detail-sections/ServingAreas';
import api from '@/app/lib/fetch-api';
import { Metadata } from 'next'
import { generateMetadata, getPageSeoData } from '@/app/lib/metadata'
import { Site } from '@/app/lib/types'
import type { ServiceAreaPage } from '@/app/lib/types'
import ServiceAreaClient from './ServiceAreaClient'

interface ServiceAreaPageProps {
  params: { serviceSlug: string; citySlug: string }
}

export async function generateServiceAreaMetadata({ params }: ServiceAreaPageProps): Promise<Metadata> {
  const { serviceSlug, citySlug } = params
  
  try {
    // Fetch default site first
    const defaultSiteResponse = await api.get('/public/sites/default')
    
    if (defaultSiteResponse.success && defaultSiteResponse.data) {
      const site: Site = defaultSiteResponse.data
      
      // Fetch service area page by service and city
      const serviceAreaResponse = await api.get(`/public/sites/${site.slug}/service-areas/by-service/${serviceSlug}/${citySlug}`)
      
      if (serviceAreaResponse.success && serviceAreaResponse.data) {
        const serviceAreaPage: ServiceAreaPage = serviceAreaResponse.data
        return generateMetadata(getPageSeoData(serviceAreaPage), site)
      }
    }
  } catch (error) {
    console.error('Error generating service area metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: 'Service Area Not Found',
    description: 'The requested service area page could not be found.',
  }
}

export default function ServiceAreaPage() {
  const params = useParams();
  const serviceSlug = params.serviceSlug as string;
  const citySlug = params.citySlug as string;
  
  return <ServiceAreaClient serviceSlug={serviceSlug} citySlug={citySlug} />
}
