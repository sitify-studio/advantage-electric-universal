'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { projectApi } from '@/app/lib/api';
import { Project } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { SeoHead } from '@/app/components/ui/SeoHead';
import { normalizeSeoImage, tiptapToText, truncate } from '@/app/lib/seo';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;
  const { site, projects, loading: siteLoading } = useWebBuilder();
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const otherProjects = useMemo(() => {
    const published = (projects || []).filter(p => p.status === 'published');
    return published.filter(p => p.slug !== projectSlug).slice(0, 3);
  }, [projects, projectSlug]);

  useEffect(() => {
    async function loadProjectPage() {
      if (!site) return;
      try {
        setLoading(true);
        const projectData = await projectApi.getProjectBySlug(site.slug, projectSlug);
        setProject(projectData);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load project';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (!siteLoading) loadProjectPage();
  }, [site, siteLoading, projectSlug]);

  if (siteLoading || loading) return null;

  if (error || !project) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 uppercase tracking-widest">Project Not Found</div>;
  }

  const siteName = site?.business?.name || site?.name || 'Perspective';
  const seoTitle = `${project.seo?.title || project.title} | ${siteName}`;
  const seoDescription = truncate(project.seo?.description || tiptapToText(project.shortDescription) || tiptapToText(project.description), 160);
  const ogImage = normalizeSeoImage(project.seo?.ogImageUrl || project.featuredImage?.url, project.title);

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.pageBackground }}>
      <SeoHead title={seoTitle} description={seoDescription} canonicalPath={`/project-detail/${project.slug}`} ogType="article" ogImage={ogImage} />

      <main className="relative pt-0">
        {/* HERO SECTION - HIGH IMPACT */}
        <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden flex items-end">
          {project.featuredImage?.url && (
            <div className="absolute inset-0 z-0">
              <OptimizedImage
                src={getImageSrc(project.featuredImage.url)}
                alt={project.featuredImage.altText || project.title}
                fill
                quality={IMAGE_QUALITY_HIGH}
                sizes={IMAGE_SIZES.fullWidth}
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
          )}

          <div className="container mx-auto px-6 lg:px-12 relative z-10 pb-16 lg:pb-24">
            <div className="max-w-4xl">
              {project.category && (
                <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/80 mb-6 block font-medium">
                  {project.category}
                </span>
              )}
              <h1
                className="text-4xl md:text-6xl lg:text-7xl text-white font-extralight uppercase leading-[1.1] tracking-tight text-balance"
                style={{ fontFamily: themeFonts.heading }}
              >
                {project.title}
              </h1>
            </div>
          </div>
        </div>

        {/* METADATA BAR */}
        <div className="border-y" style={{ borderColor: `rgba(0, 0, 0, 0.1)`, backgroundColor: themeColors.pageBackground }}>
          <div className="container mx-auto px-6 lg:px-12 py-8 flex flex-wrap gap-8 md:gap-16 items-center">
            {project.clientName && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-[0.3em] block" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Client</span>
                <span className="text-xs uppercase tracking-widest font-medium text-black">{project.clientName}</span>
              </div>
            )}
            {project.location && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-[0.3em] block" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Location</span>
                <span className="text-xs uppercase tracking-widest font-medium text-black">{project.location}</span>
              </div>
            )}
            <Link
              href="/project-detail"
              className="ml-auto flex items-center gap-2 group text-[10px] uppercase tracking-[0.4em] text-black"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
            </Link>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="container mx-auto px-6 lg:px-12 py-4 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <article className="lg:col-span-8 lg:col-start-3">
              {/* Descriptions */}
              <div
                className="prose prose-lg md:prose-xl max-w-none prose-headings:uppercase prose-headings:font-light prose-headings:tracking-widest !text-black mb-16"
                style={{ fontFamily: themeFonts.body }}
              >
                {project.shortDescription && <TiptapRenderer content={project.shortDescription} />}
                <TiptapRenderer content={project.description} />
              </div>

              {/* Gallery - Maintaining the grid but with the new aesthetic */}
              {project.galleryImages && project.galleryImages.length > 0 && (
                <div className="space-y-4 lg:space-y-8">
                   <h3 className="text-[11px] uppercase tracking-[0.6em] opacity-40 text-black">Gallery</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {project.galleryImages.map((img, idx) => (
                      <div key={idx} className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
                        <OptimizedImage
                          src={getImageSrc(img.url)}
                          alt={img.altText || project.title}
                          fill
                          sizes={IMAGE_SIZES.sectionHalf}
                          className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Tags */}
              {project.servicesUsed && project.servicesUsed.length > 0 && (
                <div className="mt-16 pt-8 flex flex-wrap gap-4" style={{ borderTop: `1px solid rgba(0, 0, 0, 0.1)` }}>
                  {project.servicesUsed.map(service => (
                    <span
                      key={service}
                      className="text-[10px] uppercase tracking-[0.3em] px-4 py-2 bg-black/5 text-black"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>

        {/* RELATED PROJECTS */}
        {otherProjects.length > 0 && (
          <section className="py-24 lg:py-32" style={{ backgroundColor: `rgba(0, 0, 0, 0.02)` }}>
            <div className="container mx-auto px-6 lg:px-12">
              <h3 className="text-[11px] uppercase tracking-[0.6em] text-center mb-16 opacity-40 text-black">
                Related Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/10">
                {otherProjects.map(other => (
                  <Link
                    key={other._id}
                    href={`/project-detail/${other.slug}`}
                    className="group p-8 lg:p-12 transition-colors flex flex-col h-full bg-white"
                    style={{ backgroundColor: themeColors.pageBackground }}
                  >
                    <span className="text-[9px] uppercase tracking-[0.4em] mb-4 opacity-40 block text-black">Next Project</span>
                    <h4 className="text-xl uppercase font-light tracking-wide mb-8 group-hover:opacity-60 transition-opacity flex-grow text-black">
                      {other.title}
                    </h4>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold flex items-center gap-4 text-black">
                      View Project <ArrowUpRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
