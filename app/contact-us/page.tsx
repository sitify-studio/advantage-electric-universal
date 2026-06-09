'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { ContactSection } from '@/app/components/sections/ContactSection';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { Footer } from '@/app/components/layout/Footer';

export default function ContactPage() {
  const { pages, loading } = useWebBuilder();
  const contactPage = pages.find((p: Page) => p.pageType === 'contact');

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {!loading && contactPage && (
          <>
            <HeroSection hero={contactPage.hero} />
            <ContactSection contactSection={contactPage.contactSection} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
