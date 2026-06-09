'use client';

import type { ComponentProps } from 'react';
import { HomeSection } from '@/app/components/ui/made';

/** Section shell using site builder page background. */
export function FluidSection(props: Omit<ComponentProps<typeof HomeSection>, 'surface'>) {
  return <HomeSection {...props} surface="page" />;
}
