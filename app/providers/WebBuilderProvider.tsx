'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Site, Page, Service, BlogPost, Project } from '@/app/lib/types';
import {
  siteApi,
  pageApi,
  serviceApi,
  blogApi,
  projectApi,
  testimonialApi,
  serviceAreaApi,
} from '@/app/lib/api';
import type { SiteBootstrapData } from '@/app/lib/siteBootstrap';

const SITE_SLUG = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;

function readPollIntervalMs(envKey: string, defaultMs: number): number {
  const raw = process.env[envKey];
  if (raw === undefined || raw === '') return defaultMs;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : defaultMs;
}

const isProdBuild = process.env.NODE_ENV === 'production';

const SITE_POLL_INTERVAL_MS = readPollIntervalMs(
  'NEXT_PUBLIC_WEBBUILDER_SITE_POLL_INTERVAL_MS',
  isProdBuild ? 0 : 15_000
);

const CONTENT_POLL_INTERVAL_MS = readPollIntervalMs(
  'NEXT_PUBLIC_WEBBUILDER_CONTENT_POLL_INTERVAL_MS',
  isProdBuild ? 0 : 60_000
);

const CACHE_KEY = SITE_SLUG ? `wb-bootstrap:${SITE_SLUG}` : '';

function readClientCache(): SiteBootstrapData | null {
  if (!CACHE_KEY || typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SiteBootstrapData;
  } catch {
    return null;
  }
}

function writeClientCache(data: SiteBootstrapData) {
  if (!CACHE_KEY || typeof window === 'undefined' || !data.site) return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

interface WebBuilderContextType {
  site: Site | null;
  pages: Page[];
  services: Service[];
  blogPosts: BlogPost[];
  projects: Project[];
  testimonials: { title?: string; description?: string; testimonials: any[] } | null;
  serviceAreaPages: any[];
  currentPage: Page | null;
  setCurrentPage: (page: Page | null) => void;
  loading: boolean;
  error: string | null;
  loadPage: (siteSlug: string, pageSlug: string) => Promise<void>;
}

const WebBuilderContext = createContext<WebBuilderContextType | undefined>(undefined);

export const useWebBuilder = () => {
  const context = useContext(WebBuilderContext);
  if (context === undefined) {
    throw new Error('useWebBuilder must be used within a WebBuilderProvider');
  }
  return context;
};

interface WebBuilderProviderProps {
  children: ReactNode;
  initialData?: SiteBootstrapData | null;
}

export const WebBuilderProvider: React.FC<WebBuilderProviderProps> = ({
  children,
  initialData = null,
}) => {
  const hasBootstrap = Boolean(initialData?.site);
  const [site, setSite] = useState<Site | null>(initialData?.site ?? null);
  const [pages, setPages] = useState<Page[]>(initialData?.pages ?? []);
  const [services, setServices] = useState<Service[]>(initialData?.services ?? []);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialData?.blogPosts ?? []);
  const [projects, setProjects] = useState<Project[]>(initialData?.projects ?? []);
  const [testimonials, setTestimonials] = useState<{
    title?: string;
    description?: string;
    testimonials: any[];
  } | null>((initialData?.testimonials as WebBuilderContextType['testimonials']) ?? null);
  const [serviceAreaPages, setServiceAreaPages] = useState<any[]>(
    initialData?.serviceAreaPages ?? []
  );
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(!hasBootstrap);
  const [error, setError] = useState<string | null>(null);
  const bootstrapped = useRef(hasBootstrap);

  const persistSnapshot = (
    next: Partial<SiteBootstrapData> & { site?: Site | null }
  ) => {
    writeClientCache({
      site: next.site ?? site,
      pages: next.pages ?? pages,
      services: next.services ?? services,
      blogPosts: next.blogPosts ?? blogPosts,
      projects: next.projects ?? projects,
      testimonials: (next.testimonials ?? testimonials) as SiteBootstrapData['testimonials'],
      serviceAreaPages: next.serviceAreaPages ?? serviceAreaPages,
    });
  };

  const loadPages = async (siteSlug: string) => {
    try {
      const pagesData = await pageApi.getPagesBySite(siteSlug);
      setPages(pagesData);
      return pagesData;
    } catch (err) {
      console.warn('Failed to load pages:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const loadServicesBySiteSlug = async (siteSlug: string) => {
    try {
      const servicesData = await serviceApi.getServicesBySite(siteSlug);
      setServices(servicesData);
      return servicesData;
    } catch (err) {
      console.warn('Failed to load services:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const loadBlogPosts = async (siteSlug: string, limit?: number) => {
    try {
      const postsData = await blogApi.getPostsBySite(siteSlug, limit);
      setBlogPosts(postsData);
      return postsData;
    } catch (err) {
      console.warn('Failed to load blog posts:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const loadProjects = async (siteSlug: string, limit?: number) => {
    try {
      const projectsData = await projectApi.getProjectsBySite(siteSlug, limit);
      setProjects(projectsData);
      return projectsData;
    } catch (err) {
      console.warn('Failed to load projects:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const loadTestimonials = async (siteSlug: string) => {
    try {
      const testimonialsData = await testimonialApi.getTestimonialsBySite(siteSlug);
      setTestimonials(testimonialsData);
      return testimonialsData;
    } catch (err) {
      console.warn(
        '[WebBuilderProvider] Failed to load testimonials:',
        err instanceof Error ? err.message : err
      );
      return null;
    }
  };

  const loadServiceAreaPages = async (siteSlug: string) => {
    try {
      const serviceAreaPagesData = await serviceAreaApi.getServiceAreaPagesBySite(siteSlug);
      setServiceAreaPages(serviceAreaPagesData);
      return serviceAreaPagesData;
    } catch (err) {
      console.warn(
        'Failed to load service area pages:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      return null;
    }
  };

  const loadSite = async (slug: string, opts?: { background?: boolean }) => {
    const background = Boolean(opts?.background);
    try {
      if (!background) setLoading(true);
      setError(null);

      const siteData = await siteApi.getSiteBySlug(slug);
      setSite(siteData);

      const [pagesData, servicesData, blogData, projectsData, testimonialsData, areasData] =
        await Promise.all([
          loadPages(siteData.slug),
          loadServicesBySiteSlug(siteData.slug),
          loadBlogPosts(siteData.slug),
          loadProjects(siteData.slug),
          loadTestimonials(siteData.slug),
          loadServiceAreaPages(siteData.slug),
        ]);

      persistSnapshot({
        site: siteData,
        pages: pagesData ?? pages,
        services: servicesData ?? services,
        blogPosts: blogData ?? blogPosts,
        projects: projectsData ?? projects,
        testimonials: testimonialsData ?? testimonials,
        serviceAreaPages: areasData ?? serviceAreaPages,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load site';
      if (!background) {
        setError(
          msg.includes('500')
            ? 'The site builder API is temporarily unavailable. Refresh the page or try again shortly.'
            : msg
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (siteSlug: string, pageSlug: string) => {
    try {
      setError(null);
      const pageData = await pageApi.getPageBySlug(siteSlug, pageSlug);
      setCurrentPage(pageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    }
  };

  // Hydrate from session cache before paint when SSR bootstrap was empty
  useEffect(() => {
    if (bootstrapped.current) return;
    const cached = readClientCache();
    if (!cached?.site) return;
    bootstrapped.current = true;
    setSite(cached.site);
    setPages(cached.pages ?? []);
    setServices(cached.services ?? []);
    setBlogPosts(cached.blogPosts ?? []);
    setProjects(cached.projects ?? []);
    setTestimonials(
      (cached.testimonials as WebBuilderContextType['testimonials']) ?? null
    );
    setServiceAreaPages(cached.serviceAreaPages ?? []);
    setLoading(false);
  }, []);

  // Initial load / silent revalidate
  useEffect(() => {
    if (!SITE_SLUG) {
      setError(
        'NEXT_PUBLIC_WEBBUILDER_SITE_SLUG environment variable is not defined. Please check your .env file.'
      );
      setLoading(false);
      return;
    }

    if (hasBootstrap) {
      writeClientCache(initialData as SiteBootstrapData);
      void loadSite(SITE_SLUG, { background: true });
      return;
    }

    const cached = readClientCache();
    void loadSite(SITE_SLUG, { background: Boolean(cached?.site) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!site?.slug || SITE_POLL_INTERVAL_MS <= 0) return;

    const siteFingerprint = (s: Site) =>
      JSON.stringify({
        theme: s.theme,
        serviceAreas: s.serviceAreas,
        business: s.business,
        footer: s.footer,
        socialLinks: s.socialLinks,
      });

    const intervalId = setInterval(async () => {
      try {
        const siteData = await siteApi.getSiteBySlug(site.slug, { silent: true });
        setSite((prevSite) => {
          if (!prevSite) return siteData;
          return siteFingerprint(prevSite) !== siteFingerprint(siteData) ? siteData : prevSite;
        });
      } catch {
        /* ignore polling errors */
      }
    }, SITE_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const projectsData = await projectApi.getProjectsBySite(site.slug, undefined, {
          silent: true,
        });
        setProjects((prevProjects) =>
          JSON.stringify(prevProjects) !== JSON.stringify(projectsData)
            ? projectsData
            : prevProjects
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const pagesData = await pageApi.getPagesBySite(site.slug, { silent: true });
        setPages((prevPages) =>
          JSON.stringify(prevPages) !== JSON.stringify(pagesData) ? pagesData : prevPages
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const servicesData = await serviceApi.getServicesBySite(site.slug, { silent: true });
        setServices((prevServices) =>
          JSON.stringify(prevServices) !== JSON.stringify(servicesData)
            ? servicesData
            : prevServices
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const data = await serviceAreaApi.getServiceAreaPagesBySite(site.slug, {
          silent: true,
        });
        setServiceAreaPages((prev) =>
          JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  const contextValue: WebBuilderContextType = {
    site,
    pages,
    services,
    blogPosts,
    projects,
    testimonials,
    serviceAreaPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    loadPage,
  };

  return (
    <WebBuilderContext.Provider value={contextValue}>{children}</WebBuilderContext.Provider>
  );
};
