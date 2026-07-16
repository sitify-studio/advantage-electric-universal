'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';
import { getThemeColors } from '@/app/lib/themeBuilder';

export default function ServicesPage() {
  const { site, pages, loading, error } = useWebBuilder();

  const themeColors = getThemeColors(site);
  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

  const displayPage = pages.find((p: Page) => p.pageType === 'service-list');

  if (loading && !displayPage) return null;

  if (error && !site && !loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <div
          className="p-6 rounded-lg max-w-lg text-center"
          style={{
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.inactive,
            borderWidth: '1px',
          }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{
              color: themeColors.secondary,
              fontFamily: themeFonts.heading,
            }}
          >
            Error
          </h2>
          <p
            style={{
              color: themeColors.secondary,
              fontFamily: themeFonts.body,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!displayPage) return null;

  return (
    <div
      className="min-h-screen selection:bg-black/10 selection:text-inherit"
      style={{
        backgroundColor: themeColors.pageBackground,
        fontFamily: themeFonts.body,
      }}
    >
      <main>
        <HeroSection hero={displayPage.hero} page={displayPage} />
        <ServicesSection servicesSection={displayPage.servicesSection} />
      </main>
      <Footer />
    </div>
  );
}
