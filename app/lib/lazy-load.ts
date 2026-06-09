// Lazy loading utilities for code splitting and performance

import dynamic from 'next/dynamic';
import React from 'react';

// Generic dynamic import wrapper with loading state
export function createLazyComponent(importFunc: () => Promise<{ default: any }>) {
  return dynamic(importFunc, {
    loading: () => React.createElement('div', { 
      className: "flex items-center justify-center p-8" 
    }, 
      React.createElement('div', { 
        className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" 
      })
    ),
    ssr: false, // Client-side only for better performance
  });
}

// Preload specific components
export function preloadComponent(importFunc: () => Promise<{ default: any }>) {
  importFunc();
}

// Intersection Observer for lazy loading components
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

// Simple lazy image component
export function LazyImage({
  src,
  alt,
  className,
  placeholder = '/images/placeholder.jpg',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { placeholder?: string }) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (isInView && typeof src === 'string') {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, src]);

  return React.createElement('div', { ref: imgRef, className },
    React.createElement('img', {
      ...props,
      src: (isInView && isLoaded && typeof src === 'string') ? src : placeholder,
      alt: alt,
      className: `transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-75'
      } ${className || ''}`
    })
  );
}
