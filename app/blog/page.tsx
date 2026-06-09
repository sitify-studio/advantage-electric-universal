'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { BlogSection } from '@/app/components/sections/BlogSection';

export default function BlogPage() {
  const { pages, loading } = useWebBuilder();
  const blogPage = pages.find((p: Page) => p.pageType === 'blog-list');

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {!loading && blogPage && (
          <>
            <HeroSection hero={blogPage.hero} />
            <BlogSection blogSection={blogPage.blogSection} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}