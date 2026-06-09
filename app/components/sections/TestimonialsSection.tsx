'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { cn } from '@/app/lib/utils';

interface TestimonialsSectionProps {
  testimonialsSection?: Page['testimonialsSection'];
  className?: string;
}

type DisplayTestimonial = {
  name: string;
  role: string;
  text: string;
  company: string;
  rating: number;
};

export function TestimonialsSection({ testimonialsSection, className }: TestimonialsSectionProps) {
  const { testimonials: globalTestimonials } = useWebBuilder();
  const theme = useSectionTheme();
  const { colors } = theme;

  const title = useMemo(() => {
    const pageTitle = tiptapToText(testimonialsSection?.title);
    return pageTitle || tiptapToText(globalTestimonials?.title) || '';
  }, [testimonialsSection?.title, globalTestimonials?.title]);

  const description = useMemo(() => {
    const pageDescription = tiptapToText(testimonialsSection?.description);
    return pageDescription || tiptapToText(globalTestimonials?.description) || '';
  }, [testimonialsSection?.description, globalTestimonials?.description]);

  const testimonials = useMemo<DisplayTestimonial[]>(() => {
    const pageItems = (testimonialsSection?.testimonials ?? [])
      .map((item) => ({
        name: item.name?.trim() || '',
        role: item.role?.trim() || '',
        text: tiptapToText(item.text),
        company: item.company?.trim() || '',
        rating: item.rating ?? 5,
      }))
      .filter((item) => item.name || item.text);

    if (pageItems.length > 0) return pageItems;

    return (globalTestimonials?.testimonials ?? [])
      .map((item: Record<string, unknown>) => ({
        name: String(item.name ?? '').trim(),
        role: String(item.role ?? '').trim(),
        text: tiptapToText(item.text ?? item.content),
        company: String(item.company ?? '').trim(),
        rating: typeof item.rating === 'number' ? item.rating : 5,
      }))
      .filter((item) => item.name || item.text);
  }, [testimonialsSection?.testimonials, globalTestimonials?.testimonials]);

  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const [active, setActive] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const goToPrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setProgressKey((k) => k + 1);
  };

  const goToNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
    setProgressKey((k) => k + 1);
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
      setProgressKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length, active]);

  useEffect(() => {
    if (active >= testimonials.length) setActive(0);
  }, [active, testimonials.length]);

  if (testimonialsSection?.enabled === false) return null;
  if (!title && !description && testimonials.length === 0) return null;

  const secondaryColor = colors.primaryButton;
  const current = testimonials[active] ?? testimonials[0];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className={cn('relative pt-12 lg:pt-16 pb-8 lg:pb-10 bg-[#fcfcfc] overflow-hidden', className)}
    >
      <div
        className="absolute left-[15%] top-0 bottom-0 w-px hidden lg:block"
        style={{ backgroundColor: `${secondaryColor}20` }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Client Voices"
              title={title}
              description={description}
              descriptionClassName="max-w-sm"
            />
          </div>

          {testimonials.length > 0 && current && (
            <div className="lg:col-span-7 relative">
              <div
                className="p-6 sm:p-8 lg:p-10 rounded-sm relative overflow-hidden"
                style={{ backgroundColor: `${secondaryColor}10` }}
              >
                <span className="absolute top-0 right-0 text-[200px] font-serif leading-none opacity-[0.03] select-none translate-x-1/4 -translate-y-1/4">
                  &ldquo;
                </span>

                <div className="relative flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: i < (current.rating || 5) ? secondaryColor : `${secondaryColor}30`,
                          }}
                        />
                      ))}
                    </div>

                    <blockquote className="text-xl sm:text-2xl font-light leading-snug text-slate-800 mb-6">
                      &ldquo;{current.text}&rdquo;
                    </blockquote>
                  </div>

                  <div
                    className="flex flex-col sm:flex-row sm:items-end justify-between pt-5"
                    style={{ borderTop: `1px solid ${secondaryColor}20` }}
                  >
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-900 mb-1">
                        {current.name}
                      </h4>
                      <p className="text-xs uppercase tracking-[0.3em]" style={{ color: `${secondaryColor}99` }}>
                        {current.role}
                        {(current.role || current.company) && <span className="mx-2 opacity-30">/</span>}
                        {current.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-5 mt-4 sm:mt-0">
                      {testimonials.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={goToPrev}
                            aria-label="Previous testimonial"
                            className="group flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:border-slate-900"
                            style={{ borderColor: `${secondaryColor}40` }}
                          >
                            <svg
                              className="h-4 w-4 text-slate-600 transition-transform group-hover:-translate-x-0.5 group-hover:text-slate-900"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M15 19l-7-7 7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={goToNext}
                            aria-label="Next testimonial"
                            className="group flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:border-slate-900"
                            style={{ borderColor: `${secondaryColor}40` }}
                          >
                            <svg
                              className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-900"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <span className="text-[10px] font-mono" style={{ color: `${secondaryColor}60` }}>
                        {String(active + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute bottom-0 left-0 h-[2px] w-full"
                  style={{ backgroundColor: `${secondaryColor}30` }}
                >
                  <div
                    key={`${active}-${progressKey}`}
                    className="h-full transition-all duration-[6000ms] ease-linear"
                    style={{
                      backgroundColor: secondaryColor,
                      width: sectionVisible ? '100%' : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
