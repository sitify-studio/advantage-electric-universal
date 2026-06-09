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

    // Fetch site data and all content in parallel
    const [siteResponse, pagesResponse, servicesResponse, blogResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/public/sites/${siteSlug}`),
      fetch(`${API_BASE_URL}/public/sites/${siteSlug}/pages`),
      fetch(`${API_BASE_URL}/public/sites/${siteSlug}/services`),
      fetch(`${API_BASE_URL}/public/sites/${siteSlug}/blog`).catch(() => null) // Blog might not be available
    ]);

    if (!siteResponse.ok) {
      throw new Error('Failed to fetch site data');
    }

    const siteData = await siteResponse.json();
    const site = siteData.data?.data ?? siteData.data;

    // Parse other responses
    const pages = pagesResponse.ok ? (await pagesResponse.json()).data?.data ?? (await pagesResponse.json()).data ?? [] : [];
    const services = servicesResponse.ok ? (await servicesResponse.json()).data?.data ?? (await servicesResponse.json()).data ?? [] : [];
    const blogPosts = blogResponse?.ok ? (await blogResponse.json()).data?.data ?? (await blogResponse.json()).data ?? [] : [];

    // Build sitemap entries
    const sitemapEntries = [];

    // Homepage
    sitemapEntries.push({
      loc: baseUrl,
      lastmod: site.updatedAt ? new Date(site.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '1.0'
    });

    // Published pages
    pages.filter((p: any) => p.status === 'published').forEach((page: any) => {
      sitemapEntries.push({
        loc: `${baseUrl}/${page.slug === 'home' ? '' : page.slug}`,
        lastmod: page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: page.slug === 'home' ? 'weekly' : 'monthly',
        priority: page.slug === 'home' ? '1.0' : '0.8'
      });
    });

    // Published services
    services.filter((s: any) => s.status === 'published').forEach((service: any) => {
      sitemapEntries.push({
        loc: `${baseUrl}/service/${service.slug}`,
        lastmod: service.updatedAt ? new Date(service.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7'
      });
    });

    // Published blog posts
    blogPosts.filter((p: any) => p.status === 'published').forEach((post: any) => {
      sitemapEntries.push({
        loc: `${baseUrl}/blog/${post.slug}`,
        lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.6'
      });
    });

    // Legal pages (always include if they exist)
    if (site.legal?.termsOfService) {
      sitemapEntries.push({
        loc: `${baseUrl}/terms-of-service`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.5'
      });
    }

    if (site.legal?.privacyPolicy) {
      sitemapEntries.push({
        loc: `${baseUrl}/privacy-policy`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.5'
      });
    }

    // Use custom sitemap from site files if available
    if (site.files?.sitemap) {
      // Return the custom sitemap as-is
      return new NextResponse(site.files.sitemap, {
        headers: {
          'Content-Type': 'application/xml',
        },
      });
    }

    // Generate XML sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap.xml:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
