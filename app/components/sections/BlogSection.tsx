'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import type { Page } from '@/app/lib/types';
import { getImageSrc, cn } from '@/app/lib/utils';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { CardLoader } from '@/app/components/ui/SkeletonLoader';
import { tiptapToText } from '@/app/lib/seo';

type BlogSectionInput = NonNullable<Page['blogSection']> & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: BlogSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function resolvePostImageRaw(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string | undefined {
  const img = post?.featuredImage;
  if (typeof img === 'string' && img.trim()) return img;
  if (img && typeof img === 'object' && (img as { url?: string }).url) {
    return (img as { url: string }).url;
  }
  if (post?.seo?.ogImageUrl) return post.seo.ogImageUrl;
  return undefined;
}

function getPostImageSrc(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string {
  const raw = resolvePostImageRaw(post);
  return raw ? getImageSrc(raw) : '';
}

function getPostImageAlt(post: { featuredImage?: unknown; title?: string }): string {
  const img = post?.featuredImage;
  if (img && typeof img === 'object' && (img as { altText?: string }).altText) {
    return (img as { altText: string }).altText;
  }
  return post?.title || '';
}

interface BlogSectionProps {
  blogSection?: Page['blogSection'];
  className?: string;
}

type BlogPostItem = {
  _id: string;
  slug: string;
  title?: string;
  excerpt?: unknown;
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
};

function BlogPostCard({
  post,
  showExcerpt,
}: {
  post: BlogPostItem;
  showExcerpt: boolean;
}) {
  const { fonts } = useSectionTheme();
  const imgSrc = getPostImageSrc(post);
  const excerpt = tiptapToText(post.excerpt);

  return (
    <article className="flex flex-col">
      <Link href={`/blog/${post.slug}`} className="group flex flex-col no-underline">
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
          {imgSrc ? (
            <OptimizedImage
              src={imgSrc}
              alt={getPostImageAlt(post)}
              fill
              sizes={IMAGE_SIZES.card}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          )}
        </div>

        <span className="mb-2 text-[10px] font-medium uppercase tracking-[0.32em] text-slate-400">
          Read
        </span>

        {post.title && (
          <h3
            className="mb-2 text-[clamp(1rem,1.6vw,1.2rem)] font-normal leading-snug text-slate-900 transition-colors group-hover:text-slate-600"
            style={{ fontFamily: fonts.heading }}
          >
            {post.title}
          </h3>
        )}

        {showExcerpt && excerpt && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{excerpt}</p>
        )}
      </Link>
    </article>
  );
}

export const BlogSection: React.FC<BlogSectionProps> = ({ blogSection, className }) => {
  const theme = useSectionTheme();
  const { colors, fonts } = theme;
  const { blogPosts, loading, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const fallback = pages.find((p) => p.pageType === 'blog-list')?.blogSection as
      | BlogSectionInput
      | undefined;
    const current = blogSection as BlogSectionInput | undefined;
    if (!current && !fallback) return undefined;

    return {
      enabled: current?.enabled ?? fallback?.enabled ?? false,
      postsToShow: current?.postsToShow ?? fallback?.postsToShow ?? 3,
      showExcerpt: current?.showExcerpt ?? fallback?.showExcerpt ?? true,
      title: pickSectionField(current, 'title') ?? pickSectionField(fallback, 'title'),
      description:
        pickSectionField(current, 'description') ?? pickSectionField(fallback, 'description'),
    };
  }, [blogSection, pages]);

  const title = useMemo(() => tiptapToText(sectionData?.title), [sectionData?.title]);
  const description = useMemo(
    () => tiptapToText(sectionData?.description),
    [sectionData?.description]
  );
  const hasTitle = hasTiptapContent(sectionData?.title);
  const hasDescription = hasTiptapContent(sectionData?.description);

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });

  if (!sectionData?.enabled) return null;

  const count = Math.min(Math.max(sectionData.postsToShow || 3, 1), 12);
  const displayPosts = blogPosts.slice(0, count);
  const showExcerpt = Boolean(sectionData.showExcerpt);

  if (loading && blogPosts.length === 0) {
    return (
      <section
        className={cn('relative pt-12 lg:pt-16 pb-8 lg:pb-10', className)}
        id="blog"
        style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-8 lg:mb-10 max-w-3xl space-y-4">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-2/3 max-w-md animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full max-w-sm animate-pulse rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] animate-pulse rounded-lg bg-slate-200" />
                <CardLoader />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayPosts.length === 0 && !hasTitle && !hasDescription) return null;

  return (
    <section
      id="blog"
      className={cn('relative pt-12 lg:pt-16 pb-8 lg:pb-10', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        {(hasTitle || hasDescription) && (
          <div
            ref={headerRef}
            className={cn(
              'mb-8 lg:mb-10 max-w-3xl transition-all duration-1000',
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <SectionHeading
              eyebrow="Blogs"
              title={title}
              description={description}
              descriptionClassName="max-w-2xl"
            />
          </div>
        )}

        {displayPosts.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            No published posts yet. Add posts in the builder to show them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {(displayPosts as BlogPostItem[]).map((post) => (
              <BlogPostCard key={post._id} post={post} showExcerpt={showExcerpt} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
