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

function FaqItem({
  question,
  answer,
  index,
  isOpen,
  visible,
  accentColor,
  fonts,
  onToggle,
}: {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  visible: boolean;
  accentColor: string;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'border-t border-slate-200 transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      )}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-start gap-5 py-6 text-left sm:gap-6 sm:py-7"
        aria-expanded={isOpen}
      >
        <div className="mt-1 flex shrink-0 items-center gap-3">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.35em]"
            style={{ color: accentColor }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="hidden h-px w-6 sm:block" style={{ backgroundColor: `${accentColor}40` }} />
        </div>

        <span className="min-w-0 flex-grow">
          {question && (
            <h3
              className={cn(
                'text-base font-normal tracking-tight text-slate-900 transition-colors sm:text-lg',
                'group-hover:text-slate-600',
                isOpen && 'text-slate-900'
              )}
              style={{ fontFamily: fonts.heading }}
            >
              {question}
            </h3>
          )}

          {answer && (
            <div
              className={cn(
                'overflow-hidden transition-all duration-500 ease-in-out',
                isOpen ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <p className="max-w-2xl text-sm font-light leading-relaxed text-slate-600 sm:text-base">
                {answer}
              </p>
            </div>
          )}
        </span>

        <span
          className="mt-1 shrink-0 text-lg font-light leading-none text-slate-400 transition-colors duration-300 group-hover:text-slate-900"
          style={{ color: isOpen ? accentColor : undefined }}
          aria-hidden
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>
    </div>
  );
}

export function FAQSection({ faqSection, className }: FAQSectionProps) {
  const theme = useSectionTheme();
  const { colors, fonts } = theme;

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

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: faqRef, visibleItems: faqVisible } = useStaggeredAnimation(questions.length, 80);

  if (!faqSection || faqSection.enabled === false) return null;
  if (!title && !description && questions.length === 0) return null;

  const accentColor = colors.primaryButton;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className={cn('relative overflow-hidden bg-[#fcfcfc] pt-12 pb-8 lg:pt-16 lg:pb-10', className)}
    >
      <div
        className="pointer-events-none absolute -right-16 top-1/4 h-72 w-72 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full blur-[100px] opacity-15"
        style={{ backgroundColor: accentColor }}
      />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div
            ref={titleRef}
            className={cn(
              'lg:col-span-4 lg:sticky lg:top-24 lg:self-start transition-all duration-1000',
              titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            <SectionHeading
              eyebrow="Information"
              title={title}
              description={description}
              descriptionClassName="max-w-sm"
            />
          </div>

          {questions.length > 0 && (
            <div ref={faqRef} className="lg:col-span-8">
              <div className="border-b border-slate-200">
                {questions.map((faq, index) => (
                  <FaqItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    index={index}
                    isOpen={openIndex === index}
                    visible={faqVisible.includes(index)}
                    accentColor={accentColor}
                    fonts={fonts}
                    onToggle={() => toggleQuestion(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
