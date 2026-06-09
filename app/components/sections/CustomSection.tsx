'use client';

import React from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface CustomSectionProps {
    section: NonNullable<Page['customSections']>[number];
    className?: string;
}

export const CustomSection: React.FC<CustomSectionProps> = ({ section, className }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    return (
        <section className={cn('py-16', className)}>
            <div className="container mx-auto px-4">
                {section.title && (
                    <h2
                        className="text-3xl font-bold mb-8"
                        style={{ color: themeColors.mainText }}
                    >
                        <TiptapRenderer content={section.title} />
                    </h2>
                )}

                {section.type === 'text' && section.content && (
                    <div className="prose prose-lg max-w-none" style={{ color: themeColors.secondaryText }}>
                        <TiptapRenderer content={section.content} />
                    </div>
                )}

                {section.type === 'image' && section.images && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {section.images.map((image, index) => {
                            const imageUrl = typeof image === 'string' ? image : (image as any).url || (image as any).fileName || (image as any).filePath;
                            return (
                                <OptimizedImage
                                    key={index}
                                    src={getImageSrc(imageUrl)}
                                    alt={(image as any).altText || ''}
                                    width={900}
                                    height={600}
                                    sizes={IMAGE_SIZES.gridThird}
                                    className="w-full h-auto rounded-lg shadow-lg"
                                />
                            );
                        })}
                    </div>
                )}

                {section.type === 'video' && section.content && (
                    <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto">
                        <video
                            src={getImageSrc(section.content)}
                            className="w-full h-auto rounded-lg shadow-lg"
                            controls
                        />
                    </div>
                )}

                {section.type === 'html' && section.content && (
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                )}
            </div>
        </section>
    );
};
