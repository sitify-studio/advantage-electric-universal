'use client';

import NextImage from 'next/image';
import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
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
      .filter((image): image is GalleryImage => image !== null)
      .slice(0, 3);
  }, [gallerySection?.images]);

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(galleryImages.length, 200);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  if (!gallerySection || gallerySection.enabled === false) return null;
  if (!title && !description && galleryImages.length === 0) return null;

  const primaryColor = colors.mainText;
  const secondaryColor = colors.secondaryText;
  const accentColor = colors.primaryButton;

  return (
    <section id="gallery" className={cn('relative pt-12 lg:pt-16 pb-8 lg:pb-10 bg-white', className)}>
      <div className="absolute top-0 left-1/4 w-px h-full bg-slate-50 hidden lg:block" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div
          ref={headerRef}
          className={`max-w-4xl mb-8 lg:mb-10 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}
        >
          <SectionHeading
            eyebrow="Our Gallery"
            title={title}
            description={description}
            descriptionClassName="max-w-2xl"
          />
        </div>

        {galleryImages.length > 0 && (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
            {galleryImages.map((image, index) => {
              const isLarge = index === 0;
              const gridClass = isLarge ? 'md:col-span-8 md:row-span-2' : 'md:col-span-4';

              return (
                <div
                  key={image.id}
                  className={`group relative overflow-hidden transition-all duration-1000 ${
                    visibleItems.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                  } ${gridClass}`}
                >
                  <div
                    className="relative overflow-hidden cursor-pointer aspect-[4/5] md:aspect-auto"
                    style={{ height: isLarge ? '700px' : '330px' }}
                    onClick={() => setSelectedImage(image)}
                  >
                    <NextImage
                      src={image.imageUrl}
                      alt={image.altText}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-white/98 z-50 flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-10 right-10 group p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest mr-4 group-hover:opacity-50 transition-opacity">
              Close
            </span>
            <div className="inline-block w-6 h-px bg-current rotate-45 translate-y-px absolute" />
            <div className="inline-block w-6 h-px bg-current -rotate-45 translate-y-px absolute" />
          </button>

          <div className="relative w-full h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <NextImage src={selectedImage.imageUrl} alt={selectedImage.altText} fill className="object-contain" />
          </div>
        </div>
      )}
    </section>
  );
}

export default GallerySection;
