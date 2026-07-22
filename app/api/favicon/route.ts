import { NextResponse } from 'next/server';
import { fetchSiteBootstrap } from '@/app/lib/siteBootstrap';
import { getSiteFaviconUrl } from '@/app/lib/metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Same-origin favicon proxy so the browser tab icon always loads from this site. */
export async function GET() {
  try {
    const { site } = await fetchSiteBootstrap();
    const url = getSiteFaviconUrl(site);
    if (!url) {
      return new NextResponse('Favicon not configured', { status: 404 });
    }

    const upstream = await fetch(url, {
      headers: { Accept: 'image/*,*/*' },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream favicon failed: ${upstream.status}`, {
        status: 502,
      });
    }

    const contentType = upstream.headers.get('content-type') || guessMime(url);
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new NextResponse(`Favicon error: ${message}`, { status: 500 });
  }
}

function guessMime(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.png') || lower.includes('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.includes('.jpg')) {
    return 'image/jpeg';
  }
  if (lower.endsWith('.svg') || lower.includes('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.ico') || lower.includes('.ico')) return 'image/x-icon';
  if (lower.endsWith('.webp') || lower.includes('.webp')) return 'image/webp';
  return 'image/webp';
}
