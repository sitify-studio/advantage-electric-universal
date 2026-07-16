'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { GallerySection } from '@/app/components/sections/GallerySection';

export default function GalleryPage() {
  const { pages, loading } = useWebBuilder();

  const galleryPage =
    pages.find((p: Page) => p.gallerySection?.enabled && p.status === 'published') ||
    pages.find((p: Page) => /gallery/i.test(p.slug || '') && p.status === 'published');

  return (
    <div className="min-h-screen flex flex-col bg-[#030306]">
      <main className="flex-1">
        {galleryPage && (
          <>
            <HeroSection hero={galleryPage.hero} />
            <GallerySection gallerySection={galleryPage.gallerySection} />
          </>
        )}
        {!loading && !galleryPage && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center text-white/60">
            <p className="max-w-md text-sm uppercase tracking-[0.35em]">
              Publish a page with an enabled gallery section to populate this route.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
