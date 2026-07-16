'use client';

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  variant?: 'text' | 'rectangular' | 'circular';
  height?: string;
}

/** No-op: skeleton UI removed for instant renders. */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = () => null;

export const PageLoader: React.FC = () => null;

export const CardLoader: React.FC<{ className?: string }> = () => null;

export default SkeletonLoader;
