'use client';

import React, { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { Plus, Minus } from 'lucide-react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';

interface ServiceFAQSectionProps {
    service: any;
}

export const ServiceFAQSection: React.FC<ServiceFAQSectionProps> = ({ service }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const brandColor = themeColors.primaryButton;

    // Service FAQ items
    const serviceFaqs = service.faqs || [];
    const hasFaqs = serviceFaqs.length > 0;

    if (!hasFaqs) return null;

    return (
        <section
            className="py-24 md:py-32 lg:py-48"
            style={{ backgroundColor: themeColors.pageBackground, fontFamily: themeFonts.body }}
        >
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-20 lg:gap-24 items-start">

                    {/* Left Column: Architectural Section Header */}
                    <div className="lg:col-span-4 lg:sticky lg:top-36 space-y-10">
                        <div className="space-y-6">
                            <span
                                className="text-[10px] tracking-[0.4em] uppercase font-bold opacity-30"
                                style={{ color: themeColors.mainText }}
                            >
                                Frequently Asked Questions
                            </span>

                            <h2
                                className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[0.1em] uppercase leading-[1.1] text-balance"
                                style={{
                                    color: themeColors.mainText,
                                    fontFamily: themeFonts.heading
                                }}
                            >
                                Common Questions
                            </h2>
                        </div>

                        <div
                            className="max-w-xs text-xs md:text-sm font-light leading-relaxed tracking-wider opacity-60 uppercase"
                            style={{ color: themeColors.secondaryText }}
                        >
                            Get answers to common questions about our {service.name} service.
                        </div>

                        {/* Signature Brand Detail */}
                        <div className="pt-8">
                            <div className="w-16 h-[2px]" style={{ backgroundColor: brandColor }} />
                        </div>
                    </div>

                    {/* Right Column: Premium Minimalist Accordion */}
                    <div className="lg:col-span-8">
                        <div>
                            {serviceFaqs.map((faq: any, index: number) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className="overflow-hidden transition-all duration-700"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggle(index)}
                                            className="w-full flex items-center justify-between py-10 lg:py-14 text-left group transition-all duration-300"
                                        >
                                            <div className="flex items-start gap-8 md:gap-12 lg:gap-16">
                                                <span
                                                    className={cn(
                                                        "text-[10px] mt-2.5 font-bold tracking-[0.2em] transition-all duration-500",
                                                        isOpen ? "opacity-100" : "opacity-20"
                                                    )}
                                                    style={{ color: isOpen ? brandColor : themeColors.mainText }}
                                                >
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                                <h3
                                                    className={cn(
                                                        "text-xl md:text-2xl lg:text-4xl font-extralight tracking-[0.05em] uppercase transition-all duration-500",
                                                        isOpen ? "italic scale-[1.01]" : "group-hover:opacity-50"
                                                    )}
                                                    style={{
                                                        color: themeColors.mainText,
                                                        fontFamily: themeFonts.heading
                                                    }}
                                                >
                                                    {typeof faq.question === 'string' 
                                                        ? faq.question 
                                                        : <TiptapRenderer content={faq.question} as="inline" />
                                                    }
                                                </h3>
                                            </div>

                                            <div
                                                className={cn(
                                                    "shrink-0 ml-4 transition-all duration-500 rounded-full w-10 md:w-12 h-10 md:h-12 flex items-center justify-center border",
                                                    isOpen ? "rotate-180 border-transparent shadow-lg text-white" : "border-black/10 group-hover:border-black/30"
                                                )}
                                                style={{
                                                    color: isOpen ? '#FFFFFF' : themeColors.mainText,
                                                    backgroundColor: isOpen ? brandColor : 'transparent',
                                                    borderColor: isOpen ? brandColor : undefined
                                                }}
                                            >
                                                {isOpen ? <Minus strokeWidth={1} size={18} /> : <Plus strokeWidth={1} size={18} />}
                                            </div>
                                        </button>

                                        <div
                                            className={cn(
                                                "grid transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)]",
                                                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            )}
                                        >
                                            <div className="overflow-hidden">
                                                <div
                                                    className="pl-12 md:pl-32 lg:pl-44 pb-14 text-sm md:text-base lg:text-lg font-light leading-relaxed tracking-wide opacity-70 max-w-2xl"
                                                    style={{ color: themeColors.secondaryText }}
                                                >
                                                    {typeof faq.answer === 'string'
                                                        ? faq.answer
                                                        : <TiptapRenderer content={faq.answer} />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
