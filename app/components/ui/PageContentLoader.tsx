'use client';

interface PageContentLoaderProps {
  className?: string;
}

/** Lightweight in-page loader (does not cover the full viewport like SiteLoadingScreen). */
export function PageContentLoader({ className = '' }: PageContentLoaderProps) {
  return (
    <div
      className={`flex min-h-[50vh] items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[#7A9A5C]/20 border-t-[#7A9A5C]"
        style={{ borderTopColor: 'var(--wb-primary, #7A9A5C)' }}
      />
    </div>
  );
}
