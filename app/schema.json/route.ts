import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch site data directly from backend API
    const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;
    if (!siteSlug) {
      throw new Error('Site slug not configured');
    }

    // Use the same API base URL as the template
    const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
      (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
    
    const isLocalRaw = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(rawBaseUrl);
    const API_BASE_URL = rawBaseUrl.startsWith('http://') && !isLocalRaw
      ? rawBaseUrl.replace(/^http:\/\//i, 'https://')
      : rawBaseUrl;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Fetch site data
    const siteResponse = await fetch(`${API_BASE_URL}/public/sites/${siteSlug}`);
    
    if (!siteResponse.ok) {
      throw new Error('Failed to fetch site data');
    }

    const siteData = await siteResponse.json();
    const site = siteData.data?.data ?? siteData.data;
    
    // Build schema from site data
    const schemaJson = [];

    // Organization schema
    if (site.business?.name) {
      const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": site.business.name,
        "url": baseUrl,
        ...(site.theme?.logoUrl && { "logo": `${baseUrl}${site.theme.logoUrl}` }),
        ...(site.business?.email && { 
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": site.business.phone || "+1-555-123-4567",
            "contactType": "customer service",
            "email": site.business.email
          }
        }),
        ...(site.business?.address && {
          "address": {
            "@type": "PostalAddress",
            "streetAddress": site.business.address.street,
            "addressLocality": site.business.address.city,
            "addressRegion": site.business.address.state,
            "postalCode": site.business.address.zipCode,
            "addressCountry": site.business.address.country || "US"
          }
        }),
        ...(site.socialLinks && site.socialLinks.length > 0 && {
          "sameAs": site.socialLinks.map((link: any) => link.url)
        })
      };
      schemaJson.push(organizationSchema);
    }

    // WebSite schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": site.name,
      "url": baseUrl,
      ...(site.seo?.description && { "description": site.seo.description }),
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
    schemaJson.push(websiteSchema);

    // Add custom schema from site files if available
    if (site.files?.schemaJson) {
      try {
        const customSchemas = JSON.parse(site.files.schemaJson);
        if (Array.isArray(customSchemas)) {
          schemaJson.push(...customSchemas);
        }
      } catch (error) {
        console.warn('Invalid custom schema JSON in site files:', error);
      }
    }

    return NextResponse.json(schemaJson, {
      headers: {
        'Content-Type': 'application/ld+json',
      },
    });
  } catch (error) {
    console.error('Error generating schema.json:', error);
    return NextResponse.json([], {
      status: 500,
      headers: {
        'Content-Type': 'application/ld+json',
      },
    });
  }
}
