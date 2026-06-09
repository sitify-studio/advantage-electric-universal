'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

type Crumb = {
  href: string;
  label: string;
  isCurrent?: boolean;
};

function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const { pages, blogPosts, projects, services } = useWebBuilder();

  const crumbs = useMemo<Crumb[]>(() => {
    const cleanPath = (pathname || '/').split('?')[0].split('#')[0];
    const segments = cleanPath.split('/').filter(Boolean);

    const base: Crumb[] = [{ href: '/', label: 'Home', isCurrent: segments.length === 0 }];

    if (segments.length === 0) return base;

    const first = segments[0];

    // Blog
    if (first === 'blog') {
      base.push({ href: '/blog', label: 'Blog', isCurrent: segments.length === 1 });
      if (segments[1]) {
        const post = blogPosts?.find((p) => p.slug === segments[1]);
        base.push({ href: `/blog/${segments[1]}`, label: post?.title || humanizeSlug(segments[1]), isCurrent: true });
      }
      return base;
    }

    // Projects
    if (first === 'projects') {
      base.push({ href: '/projects', label: 'Projects', isCurrent: segments.length === 1 });
      if (segments[1]) {
        const project = projects?.find((p) => p.slug === segments[1]);
        base.push({ href: `/projects/${segments[1]}`, label: project?.title || humanizeSlug(segments[1]), isCurrent: true });
      }
      return base;
    }

    // Services
    if (first === 'services') {
      base.push({ href: '/services', label: 'Services', isCurrent: true });
      return base;
    }

    // Single service pages live under /service/[serviceSlug]
    if (first === 'service') {
      base.push({ href: '/services', label: 'Services', isCurrent: false });

      const serviceSlug = segments[1];
      if (serviceSlug) {
        const svc = services?.find((s: any) => s.slug === serviceSlug);
        base.push({
          href: `/service/${serviceSlug}`,
          label: (svc as any)?.name || humanizeSlug(serviceSlug),
          isCurrent: segments.length === 2,
        });
      }

      if (segments[2] === 'service-areas') {
        base.push({ href: `/service/${segments[1]}/service-areas`, label: 'Service Areas', isCurrent: segments.length === 3 });
        if (segments[3]) {
          base.push({ href: `/service/${segments[1]}/service-areas/${segments[3]}`, label: humanizeSlug(segments[3]), isCurrent: true });
        }
      }

      return base;
    }

    // Default: dynamic pages /[pageSlug]
    if (segments.length === 1) {
      const page = pages?.find((p) => p.slug === segments[0]);
      base.push({ href: `/${segments[0]}`, label: (page as any)?.name || humanizeSlug(segments[0]), isCurrent: true });
      return base;
    }

    // Fallback for any other nested route
    let acc = '';
    for (let i = 0; i < segments.length; i++) {
      acc += `/${segments[i]}`;
      base.push({ href: acc, label: humanizeSlug(segments[i]), isCurrent: i === segments.length - 1 });
    }
    return base;
  }, [pathname, pages, blogPosts, projects, services]);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {crumbs.map((c, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={`${c.href}-${idx}`} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-gray-400">/</span>}
              {isLast || c.isCurrent ? (
                <span className="font-medium text-gray-700" aria-current="page">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="text-gray-600 hover:text-gray-900 transition-colors">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
