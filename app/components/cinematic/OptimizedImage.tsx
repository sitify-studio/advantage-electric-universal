import { ImgHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
}

export function OptimizedImage({ src, alt, className, fill, ...props }: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={cn(
        "object-cover",
        fill ? "absolute inset-0 w-full h-full" : "w-full h-auto",
        className
      )}
      {...props}
    />
  );
}
