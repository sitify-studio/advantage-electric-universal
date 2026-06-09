'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { ProjectsSection } from '@/app/components/sections/ProjectsSection';

export default function ProjectDetailPage() {
  const { pages, loading } = useWebBuilder();
  const projectPage = pages.find((p: Page) => p.pageType === 'project-detail');

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {!loading && projectPage && (
          <>
            <HeroSection hero={projectPage.hero} page={projectPage} />
            <ProjectsSection
              projectSection={projectPage.projectSection}
              projectsSection={projectPage.projectsSection}
              showViewAllLink={false}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
