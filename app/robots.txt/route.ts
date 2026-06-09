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
    
    // Use custom robots.txt from site files if available, otherwise use default
    let robotsTxt = site.files?.robotsTxt || `User-agent: *
Disallow:
Sitemap: ${baseUrl}/sitemap.xml`;

    // Replace placeholder sitemap URL with actual base URL
    robotsTxt = robotsTxt.replace(/Sitemap:.*sitemap\.xml/, `Sitemap: ${baseUrl}/sitemap.xml`);

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return new NextResponse(`User-agent: *\nDisallow:\nSitemap: ${baseUrl}/sitemap.xml`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
