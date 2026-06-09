'use client';

import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { TestimonialsSection } from '@/app/components/sections/TestimonialsSection';
import { findTestimonialsPage } from '@/app/lib/siteContent';

export default function TestimonialsPage() {
  const { pages, loading } = useWebBuilder();

  const testimonialsPage = useMemo(() => findTestimonialsPage(pages), [pages]);
  const homePage = useMemo(() => pages.find((p) => p.pageType === 'home'), [pages]);
  const testimonialsSection = useMemo(
    () => testimonialsPage?.testimonialsSection ?? homePage?.testimonialsSection,
    [testimonialsPage, homePage]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {!loading && (
          <>
            {testimonialsPage?.hero && (
              <HeroSection hero={testimonialsPage.hero} />
            )}
            <TestimonialsSection testimonialsSection={testimonialsSection} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
