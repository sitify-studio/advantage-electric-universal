'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useThemeColors } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

const Preloader: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const previousBodyOverflowRef = useRef<string>('');
  const previousHtmlOverflowRef = useRef<string>('');
  const previousHtmlOverflowYRef = useRef<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const themeColors = useThemeColors();
  const { site } = useWebBuilder();

  useEffect(() => {
    // Keep scrollbar gutter space during preloader to avoid final-frame layout shift.
    previousBodyOverflowRef.current = document.body.style.overflow;
    previousHtmlOverflowRef.current = document.documentElement.style.overflow;
    previousHtmlOverflowYRef.current = document.documentElement.style.overflowY;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overflowY = 'scroll';
    document.documentElement.classList.add('preloader-active');

    const ctx = gsap.context(() => {
      // 1. Branded Logo Reveal
      gsap.fromTo(logoRef.current,
        { 
          opacity: 0, 
          letterSpacing: '0.1em', 
          y: 40, 
          filter: 'blur(10px)', 
          scale: 0.95 
        },
        { 
          opacity: 1, 
          letterSpacing: '0.4em', 
          y: 0, 
          filter: 'blur(0px)', 
          scale: 1, 
          duration: 2.2, 
          ease: 'power4.out',
          delay: 0.5
        }
      );

      // 2. Dynamic Progress Simulation
      // In a real app this would hook into NProgress or similar, but for premium feel we animate it elegantly
      const tl = gsap.timeline({
        onComplete: () => {
          // 3. Premium Exit Animation
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.1,
            filter: 'blur(30px)',
            duration: 1.5,
            ease: 'expo.inOut',
            onComplete: () => {
              setIsVisible(false);
              // Restore scroll after unmount to avoid scrollbar flicker during fade-out.
              requestAnimationFrame(() => {
                document.documentElement.classList.remove('preloader-active');
                document.body.style.overflow = previousBodyOverflowRef.current;
                document.documentElement.style.overflow = previousHtmlOverflowRef.current;
                document.documentElement.style.overflowY = previousHtmlOverflowYRef.current;
              });
            }
          });
        }
      });

      tl.to({}, { 
        duration: 1.2,
        onUpdate: function() {
          const p = Math.floor(this.progress() * 100);
          setProgress(p);
        }
      });

    }, containerRef);

    return () => {
      ctx.revert();
      document.documentElement.classList.remove('preloader-active');
      document.body.style.overflow = previousBodyOverflowRef.current;
      document.documentElement.style.overflow = previousHtmlOverflowRef.current;
      document.documentElement.style.overflowY = previousHtmlOverflowYRef.current;
    };
  }, []);

  if (!isVisible) return null;

  const brandBg = themeColors.sectionBackgroundDark;
  const brandText = themeColors.darkPrimaryText;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
      style={{ backgroundColor: brandBg }}
      aria-busy="true"
      aria-label="Loading site"
    >
      <div className="relative flex flex-col items-center w-full max-w-screen-sm px-6 overflow-hidden">
        <h1
          ref={logoRef}
          className="text-white text-4xl md:text-6xl lg:text-4xl font-sans font-extralight uppercase text-center max-w-full flex flex-wrap"
          style={{ 
            color: brandText,
            willChange: 'transform, opacity, filter, letter-spacing'
          }}
        >
          {site?.business?.name || site?.name || ''}
        </h1>

        {/* Minimal Animated Line */}
        <div className="mt-16 w-32 md:w-48 h-[1px] bg-white/10 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-white origin-left"
            style={{ 
              width: `${progress}%`,
              backgroundColor: brandText,
              transition: 'width 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
