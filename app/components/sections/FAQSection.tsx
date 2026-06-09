'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import { cn } from '@/app/lib/utils';

interface FAQSectionProps {
  faqSection?: Page['faqSection'];
  className?: string;
}

export function FAQSection({ faqSection, className }: FAQSectionProps) {
  const theme = useSectionTheme();
  const { colors } = theme;

  const title = useMemo(() => tiptapToText(faqSection?.title), [faqSection?.title]);
  const description = useMemo(() => tiptapToText(faqSection?.description), [faqSection?.description]);
  const questions = useMemo(
    () =>
      faqSection?.items
        ?.map((item) => ({
          question: tiptapToText(item.question),
          answer: tiptapToText(item.answer),
        }))
        .filter((item) => item.question || item.answer) ?? [],
    [faqSection?.items]
  );

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: faqRef, visibleItems: faqVisible } = useStaggeredAnimation(questions.length, 80);

  if (!faqSection || faqSection.enabled === false) return null;
  if (!title && !description && questions.length === 0) return null;

  const primaryColor = colors.mainText;
  const secondaryColor = colors.primaryButton;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className={cn('relative py-16 sm:py-20 md:py-24 lg:py-40 overflow-hidden', className)}
      style={{ backgroundColor: primaryColor }}
    >
      <div className="absolute top-0 right-0 w-1/2 h-full border-l border-white/[0.03] hidden lg:block" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div
            ref={titleRef}
            className={`lg:col-span-4 transition-all duration-1000 ${
              titleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <SectionHeading
              eyebrow="Information"
              title={title}
              description={description}
              variant="dark"
              descriptionClassName="max-w-xs text-sm font-normal"
            />

            <div className="mt-16 hidden lg:flex items-end gap-1 opacity-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-px bg-white" style={{ height: i % 4 === 0 ? '20px' : '10px' }} />
              ))}
            </div>
          </div>

          {questions.length > 0 && (
            <div ref={faqRef} className="lg:col-span-8">
              <div className="divide-y divide-white/10">
                {questions.map((faq, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-1000 ${
                      faqVisible.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`}
                  >
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full py-8 flex items-start gap-6 text-left group"
                    >
                      <span className="text-xs font-mono mt-1 opacity-40 text-white">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="flex-grow">
                        {faq.question && (
                          <h3
                            className={`text-lg sm:text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 ${
                              openIndex === index ? 'text-white' : 'text-white group-hover:text-white'
                            }`}
                          >
                            {faq.question}
                          </h3>
                        )}

                        {faq.answer && (
                          <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                              openIndex === index ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <p className="text-white font-light leading-relaxed text-sm sm:text-base max-w-2xl">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </span>

                      <div className="relative w-6 h-6 mt-1 flex-shrink-0">
                        <div
                          className="absolute top-1/2 left-0 w-full h-px bg-current transition-transform duration-500"
                          style={{
                            backgroundColor: openIndex === index ? secondaryColor : 'rgba(255,255,255,0.3)',
                          }}
                        />
                        <div
                          className={`absolute top-0 left-1/2 w-px h-full bg-current transition-transform duration-500 ${
                            openIndex === index ? 'rotate-90 scale-0' : 'rotate-0'
                          }`}
                          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 p-12 opacity-[0.02] pointer-events-none select-none">
        <h2 className="text-[15vw] font-black text-white leading-none">FAQS</h2>
      </div>
    </section>
  );
}

export default FAQSection;
