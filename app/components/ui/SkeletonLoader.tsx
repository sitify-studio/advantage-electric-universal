import React from 'react';
import { cn } from '@/app/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  lines = 1,
  height = 'h-4',
  variant = 'text'
}) => {
  if (variant === 'circular') {
    return (
      <div className={cn('animate-pulse rounded-full bg-gray-200', className)}>
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </div>
    );
  }

  if (variant === 'rectangular') {
    return (
      <div className={cn('animate-pulse rounded bg-gray-200', className, height)}>
        <div className={cn('bg-gray-300 w-full h-full rounded', height)}></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse rounded bg-gray-200',
            height,
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        >
          <div className={cn('bg-gray-300 w-full h-full rounded', height)}></div>
        </div>
      ))}
    </div>
  );
};

export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export const CardLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white p-6 rounded-lg shadow-sm border border-gray-200', className)}>
    <SkeletonLoader variant="rectangular" height="h-6" className="mb-4 w-3/4" />
    <SkeletonLoader lines={3} className="mb-4" />
    <SkeletonLoader variant="rectangular" height="h-10" className="w-1/3" />
  </div>
);
