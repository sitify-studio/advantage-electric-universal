'use client';

import NextImage from 'next/image';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { cn, getImageSrc } from '@/app/lib/utils';

interface GallerySectionProps {
  gallerySection?: Page['gallerySection'];
  className?: string;
}

type GalleryImage = {
  id: string;
  imageUrl: string;
  altText: string;
};

const IMAGES_PER_PAGE = 3;

function GalleryNavButton({
  direction,
  onClick,
  disabled,
  accentColor,
  className,
}: {
  direction: 'prev' | 'next';
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  accentColor: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous images' : 'Next images'}
      className={cn(
        'group flex h-10 w-10 items-center justify-center rounded-full border transition-all',
        'hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-30',
        className
      )}
      style={{ borderColor: `${accentColor}40` }}
    >
      <svg
        className={cn(
          'h-4 w-4 text-slate-600 transition-transform group-hover:text-slate-900',
          direction === 'prev' ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5',
          disabled && 'group-hover:translate-x-0'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {direction === 'prev' ? (
          <path d="M15 19l-7-7 7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function GalleryItem({
  image,
  index,
  accentColor,
  onSelect,
}: {
  image: GalleryImage;
  index: number;
  accentColor: string;
  onSelect: (image: GalleryImage) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(image)}
      className="group relative w-full cursor-pointer border-t border-slate-200/80 pt-6 text-left"
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.35em]"
          style={{ color: accentColor }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="h-px w-10" style={{ backgroundColor: `${accentColor}40` }} />
        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
          View
        </span>
      </div>

      <div className="relative">
        <div
          className="absolute -bottom-3 -right-3 hidden h-full w-full border sm:block"
          style={{ borderColor: `${accentColor}30` }}
        />

        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
          <NextImage
            src={image.imageUrl}
            alt={image.altText}
            fill
            className="object-cover transition-all duration-[1.2s] ease-out grayscale-[15%] group-hover:scale-[1.04] group-hover:grayscale-0"
          />
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{
              background: `linear-gradient(160deg, transparent 40%, ${accentColor}25 100%)`,
            }}
          />
        </div>
      </div>
    </button>
  );
}

export function GallerySection({ gallerySection, className }: GallerySectionProps) {
  const theme = useSectionTheme();
  const { colors } = theme;

  const title = useMemo(() => tiptapToText(gallerySection?.title), [gallerySection?.title]);
  const description = useMemo(
    () => tiptapToText(gallerySection?.description),
    [gallerySection?.description]
  );
  const galleryImages = useMemo<GalleryImage[]>(() => {
    return (gallerySection?.images ?? [])
      .map((image, index) => {
        const url = image.url ? getImageSrc(image.url) : '';
        if (!url) return null;
        return {
          id: `gallery-${index}`,
          imageUrl: url,
          altText: image.altText?.trim() || tiptapToText(image.caption) || `Gallery image ${index + 1}`,
        };
      })
      .filter((image): image is GalleryImage => image !== null);
  }, [gallerySection?.images]);

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const [page, setPage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(galleryImages.length / IMAGES_PER_PAGE));
  const canPaginate = galleryImages.length > IMAGES_PER_PAGE;

  const pageImages = useMemo(() => {
    const start = page * IMAGES_PER_PAGE;
    return galleryImages.slice(start, start + IMAGES_PER_PAGE);
  }, [galleryImages, page]);

  const selectedImage = selectedIndex !== null ? galleryImages[selectedIndex] ?? null : null;

  useEffect(() => {
    if (page >= totalPages) setPage(0);
  }, [page, totalPages]);

  const goToPrevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const goToNextPage = () => setPage((p) => (p + 1) % totalPages);

  const goToPrevImage = () => {
    if (selectedIndex === null || galleryImages.length <= 1) return;
    setSelectedIndex((selectedIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToNextImage = () => {
    if (selectedIndex === null || galleryImages.length <= 1) return;
    setSelectedIndex((selectedIndex + 1) % galleryImages.length);
  };

  if (!gallerySection || gallerySection.enabled === false) return null;
  if (!title && !description && galleryImages.length === 0) return null;

  const accentColor = colors.primaryButton;

  return (
    <section
      id="gallery"
      className={cn('relative overflow-hidden bg-[#fcfcfc] pt-12 pb-8 lg:pt-16 lg:pb-10', className)}
    >
      <div
        className="pointer-events-none absolute -left-16 top-1/3 h-72 w-72 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full blur-[100px] opacity-15"
        style={{ backgroundColor: accentColor }}
      />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div
          ref={headerRef}
          className={cn(
            'mb-8 max-w-4xl transition-all duration-1000 lg:mb-10',
            headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          )}
        >
          <SectionHeading
            eyebrow="Our Gallery"
            title={title}
            description={description}
            descriptionClassName="max-w-2xl"
          />
        </div>

        {galleryImages.length > 0 && (
          <div>
            <div
              key={page}
              className="grid grid-cols-1 gap-x-6 gap-y-10 transition-opacity duration-500 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-y-12"
            >
              {pageImages.map((image, index) => (
                <GalleryItem
                  key={image.id}
                  image={image}
                  index={page * IMAGES_PER_PAGE + index}
                  accentColor={accentColor}
                  onSelect={(img) => {
                    const idx = galleryImages.findIndex((g) => g.id === img.id);
                    setSelectedIndex(idx >= 0 ? idx : null);
                  }}
                />
              ))}
            </div>

            {canPaginate && (
              <div className="mt-8 flex items-center justify-end gap-4 sm:mt-10">
                <span className="text-[10px] font-mono font-medium text-slate-600">
                  {String(page + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                </span>
                <GalleryNavButton
                  direction="prev"
                  onClick={() => goToPrevPage()}
                  accentColor={accentColor}
                />
                <GalleryNavButton
                  direction="next"
                  onClick={() => goToNextPage()}
                  accentColor={accentColor}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-6 backdrop-blur-sm md:p-12"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
        >
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="group absolute right-6 top-6 flex items-center gap-3 md:right-10 md:top-10"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70 transition-colors group-hover:text-white">
              Close
            </span>
            <div className="h-px w-8 bg-white/50 transition-all group-hover:w-12 group-hover:bg-white" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <GalleryNavButton
                direction="prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                accentColor="#ffffff"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 border-white/30 hover:border-white md:left-8 [&_svg]:text-white/80 [&_svg]:group-hover:text-white"
              />
              <GalleryNavButton
                direction="next"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                accentColor="#ffffff"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 border-white/30 hover:border-white md:right-8 [&_svg]:text-white/80 [&_svg]:group-hover:text-white"
              />
            </>
          )}

          <div
            className="relative h-[70vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NextImage
              key={selectedImage.id}
              src={selectedImage.imageUrl}
              alt={selectedImage.altText}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {galleryImages.length > 1 && (
            <span className="absolute bottom-6 rounded-full bg-neutral-950/80 px-4 py-2 text-[10px] font-mono font-medium text-white md:bottom-10">
              {String(selectedIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

export default GallerySection;
