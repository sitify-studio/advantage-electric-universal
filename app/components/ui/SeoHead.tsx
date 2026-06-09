'use client';

import Head from 'next/head';
import { buildCanonicalUrl, SeoImage, toHttpsExceptLocal } from '@/app/lib/seo';

type SeoHeadProps = {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: SeoImage | null;
  noIndex?: boolean;
};

export function SeoHead({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage,
  noIndex,
}: SeoHeadProps) {
  const canonical = canonicalPath ? buildCanonicalUrl(canonicalPath) : undefined;
  const safeTitle = title?.trim();
  const safeDescription = description?.trim();
  const imageUrl = ogImage?.url ? toHttpsExceptLocal(ogImage.url) : undefined;

  return (
    <Head>
      {safeTitle ? <title>{safeTitle}</title> : null}
      {safeDescription ? <meta name="description" content={safeDescription} /> : null}

      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}

      {safeTitle ? <meta property="og:title" content={safeTitle} /> : null}
      {safeDescription ? <meta property="og:description" content={safeDescription} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:type" content={ogType} />
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      {ogImage?.alt ? <meta property="og:image:alt" content={ogImage.alt} /> : null}

      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      {safeTitle ? <meta name="twitter:title" content={safeTitle} /> : null}
      {safeDescription ? <meta name="twitter:description" content={safeDescription} /> : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
    </Head>
  );
}

export default SeoHead;
