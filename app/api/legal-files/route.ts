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

    // Direct fetch to avoid circular dependency
    const response = await fetch(`${API_BASE_URL}/public/sites/${siteSlug}`);
    const responseData = await response.json();
    const site = responseData.data?.data ?? responseData.data;
    
    return NextResponse.json({
      success: true,
      data: {
        legal: site.legal || {}
      }
    });
  } catch (error) {
    console.error('Error fetching legal files:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch legal files' } },
      { status: 500 }
    );
  }
}
