import type { Metadata } from 'next';
import './globals.css';
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider';
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary';
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { LenisProvider } from '@/app/components/cinematic/LenisProvider';
import { AmbientFoundation } from '@/app/components/cinematic/AmbientFoundation';
import { HeroIntroProvider } from '@/app/providers/HeroIntroProvider';
import { Header } from '@/app/components/layout/Header';
import { fetchSiteBootstrap } from '@/app/lib/siteBootstrap';
import { getSiteFaviconUrl } from '@/app/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchSiteBootstrap();
  const site = data.site;
  const faviconUrl = getSiteFaviconUrl(site);
  const title = site?.seo?.title || site?.business?.name || site?.name || 'Web Builder Site';
  const description =
    site?.seo?.description || site?.business?.description || 'Generated site using Web Builder';

  return {
    title,
    description,
    ...(faviconUrl
      ? {
          icons: {
            icon: [{ url: faviconUrl }],
            shortcut: [{ url: faviconUrl }],
            apple: [{ url: faviconUrl }],
          },
        }
      : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialData = await fetchSiteBootstrap();

  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <ErrorBoundary>
          <WebBuilderProvider initialData={initialData}>
            <LanguageProvider>
              <LenisProvider>
                <AmbientFoundation />
                <HeroIntroProvider>
                  <ThemeFontWrapper>
                    <Header />
                    <main className="relative z-10 min-h-screen pt-[6.5rem]">{children}</main>
                  </ThemeFontWrapper>
                </HeroIntroProvider>
              </LenisProvider>
            </LanguageProvider>
          </WebBuilderProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
