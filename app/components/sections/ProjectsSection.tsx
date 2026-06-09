'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import type { Page, Project } from '@/app/lib/types';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { tiptapToText } from '@/app/lib/seo';

interface ProjectsSectionProps {
  projectSection?: Page['projectSection'];
  projectsSection?: Page['projectsSection'];
  className?: string;
  showViewAllLink?: boolean;
  projectsLimit?: number;
}

type ManualProject = NonNullable<NonNullable<Page['projectsSection']>['projects']>[number];
type DisplayItem = Project | ManualProject;

type ProjectSectionInput = Page['projectSection'] & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: ProjectSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function isProjectEntity(p: DisplayItem): p is Project {
  return typeof (p as Project)._id === 'string' && typeof (p as Project).slug === 'string';
}

function projectHref(p: DisplayItem): string {
  if (isProjectEntity(p)) return `/project-detail/${p.slug}`;
  const href = (p as ManualProject).href;
  return typeof href === 'string' && href.length > 0 ? href : '';
}

function projectTitle(p: DisplayItem): string {
  if (isProjectEntity(p)) return p.title?.trim() || '';
  const t = (p as ManualProject).title;
  return tiptapToText(t);
}

function projectImageUrl(p: DisplayItem): string | null {
  if (isProjectEntity(p)) return getImageSrc(p.featuredImage?.url || p.featuredImage) || null;
  const img = (p as ManualProject).image;
  return img?.url ? getImageSrc(img.url) : null;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function ProjectGalleryItem({
  item,
  index,
}: {
  item: DisplayItem;
  index: number;
}) {
  const { fonts } = useSectionTheme();
  const imageUrl = projectImageUrl(item);
  const href = projectHref(item);
  const title = projectTitle(item);
  if (!imageUrl && !title) return null;

  const content = (
    <article className="group w-full">
      {imageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <OptimizedImage
            src={imageUrl}
            alt={title || 'Project'}
            fill
            sizes={IMAGE_SIZES.card}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-400">
          {String(index + 1).padStart(2, '0')}
        </span>
        {href && (
          <span
            className="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-900 transition-opacity group-hover:opacity-60"
            style={{ fontFamily: fonts.body }}
          >
            View
          </span>
        )}
      </div>

      {title && (
        <h3
          className="mt-2 text-sm font-normal leading-snug text-slate-900"
          style={{ fontFamily: fonts.heading }}
        >
          {title}
        </h3>
      )}
    </article>
  );

  if (!href) return <div>{content}</div>;

  return (
    <Link href={normalizeHref(href)} className="block no-underline">
      {content}
    </Link>
  );
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projectSection,
  projectsSection,
  className,
  showViewAllLink = true,
  projectsLimit,
}) => {
  const theme = useSectionTheme();
  const { colors, fonts } = theme;
  const { projects, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const projectDetailPage = pages.find((p) => p.pageType === 'project-detail');
    const metaSource =
      (projectSection as ProjectSectionInput | undefined) ??
      (projectDetailPage?.projectSection as ProjectSectionInput | undefined);
    const listingSource = projectsSection ?? projectDetailPage?.projectsSection;

    return {
      enabled: metaSource?.enabled ?? listingSource?.enabled ?? true,
      title:
        pickSectionField(metaSource, 'title') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'title'),
      description:
        pickSectionField(metaSource, 'description') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'description'),
      projectIds: listingSource?.projectIds,
      manualProjects: listingSource?.projects ?? [],
    };
  }, [projectSection, projectsSection, pages]);

  const sectionTitle = tiptapToText(sectionData.title);
  const sectionDescription = tiptapToText(sectionData.description);
  const hasContent = Boolean(sectionTitle || sectionDescription);

  const display = useMemo<DisplayItem[]>(() => {
    const manual = sectionData.manualProjects;
    const fromApi = (projects ?? []).filter((p) =>
      sectionData.projectIds?.length
        ? sectionData.projectIds.includes(p._id)
        : p.status === 'published'
    );

    const items = manual.length > 0 ? manual : fromApi;
    if (typeof projectsLimit === 'number' && projectsLimit > 0) {
      return items.slice(0, projectsLimit);
    }
    return items;
  }, [sectionData, projects, projectsLimit]);

  if (!sectionData.enabled) return null;
  if (display.length === 0 && !hasContent) return null;

  return (
    <section
      id="projects"
      className={cn('relative bg-white py-16 sm:py-20 lg:py-24', className)}
      style={{ fontFamily: fonts.body, color: colors.mainText }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sticky left content */}
          <div className="lg:col-span-5">
            <div className="flex flex-col lg:sticky lg:top-24 lg:min-h-[calc(100vh-7rem)]">
              {hasContent && (
                <SectionHeading
                  eyebrow="Projects"
                  title={sectionTitle}
                  description={sectionDescription}
                  descriptionClassName="max-w-2xl"
                />
              )}
            </div>
          </div>

          {/* Scrollable right gallery */}
          <div className="lg:col-span-7">
            {display.length > 0 ? (
              <div className="flex flex-col gap-14 sm:gap-16 lg:gap-20">
                {display.map((item, index) => (
                  <ProjectGalleryItem key={isProjectEntity(item) ? item._id : index} item={item} index={index} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No published projects yet. Add projects in the builder to show them here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
