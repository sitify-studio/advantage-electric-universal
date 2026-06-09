import { Metadata } from 'next'
import { generateMetadata as buildMetadata, getPageSeoData } from '@/app/lib/metadata'
import { Page, ServiceAreaPage, Site } from '@/app/lib/types'
import api from '@/app/lib/fetch-api'
import PageSlugClient from './PageSlugClient'

interface PageSlugPageProps {
  params: { pageSlug: string }
}

export async function generateMetadata({ params }: PageSlugPageProps): Promise<Metadata> {
  const { pageSlug } = params
  
  try {
    // Try to fetch default site first
    const defaultSiteResponse = await api.get('/public/sites/default')
    
    if (defaultSiteResponse.success && defaultSiteResponse.data) {
      const site: Site = defaultSiteResponse.data
      
      // Try to fetch page data by slug
      const pageResponse = await api.get(`/public/sites/${site.slug}/pages/${pageSlug}`)
      
      if (pageResponse.success && pageResponse.data) {
        const page: Page = pageResponse.data
        return buildMetadata(getPageSeoData(page), site)
      }
      
      // Try to fetch service area page
      const serviceAreaResponse = await api.get(`/public/sites/${site.slug}/service-areas/${pageSlug}`)
      
      if (serviceAreaResponse.success && serviceAreaResponse.data) {
        const serviceAreaPage: ServiceAreaPage = serviceAreaResponse.data
        return buildMetadata(getPageSeoData(serviceAreaPage), site)
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: 'Page Not Found',
    description: 'The requested page could not be found.',
  }
}

export default function PageSlugPage({ params }: PageSlugPageProps) {
  return <PageSlugClient pageSlug={params.pageSlug} />
}
