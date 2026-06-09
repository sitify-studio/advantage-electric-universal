import { Metadata } from 'next'
import { generateMetadata as generatePageMetadata, getPageSeoData } from '@/app/lib/metadata'
import { Site } from '@/app/lib/types'
import api from '@/app/lib/fetch-api'
import ServiceAreaClient from './ServiceAreaClient'

interface ServiceAreaPageProps {
  params: Promise<{ serviceSlug: string; citySlug: string }>
}

export async function generateMetadata({ params }: ServiceAreaPageProps): Promise<Metadata> {
  const { serviceSlug, citySlug } = await params
  
  try {
    // Fetch default site first
    const defaultSiteResponse = await api.get('/public/sites/default')
    
    if (defaultSiteResponse.success && defaultSiteResponse.data) {
      const site: Site = defaultSiteResponse.data
      
      // Fetch service area page by service and city
      const serviceAreaResponse = await api.get(`/public/sites/${site.slug}/service-areas/by-service/${serviceSlug}/${citySlug}`)
      
      if (serviceAreaResponse.success && serviceAreaResponse.data) {
        const serviceAreaPage = serviceAreaResponse.data
        return generatePageMetadata(getPageSeoData(serviceAreaPage), site)
      }
    }
  } catch (error: any) {
    // Suppress 'Service not found' errors - they're expected when page doesn't exist
    if (!error?.message?.includes('Service not found')) {
      console.error('Error generating service area metadata:', error)
    }
  }
  
  // Fallback metadata
  return {
    title: 'Service Area Not Found',
    description: 'The requested service area page could not be found.',
  }
}

export default async function ServiceAreaPage({ params }: ServiceAreaPageProps) {
  const { serviceSlug, citySlug } = await params
  return <ServiceAreaClient serviceSlug={serviceSlug} citySlug={citySlug} />
}
