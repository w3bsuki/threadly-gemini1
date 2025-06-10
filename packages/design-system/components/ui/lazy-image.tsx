'use client';

import { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@repo/design-system/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
  placeholderSrc?: string;
  placeholderBlur?: string;
  showLoader?: boolean;
  loaderClassName?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  className,
  placeholderSrc,
  placeholderBlur,
  showLoader = true,
  loaderClassName,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = imageRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Error state
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div ref={imageRef} className="relative">
      {/* Placeholder while not in view */}
      {!isInView && placeholderSrc && (
        <Image
          src={placeholderSrc}
          alt={alt}
          className={cn(className, 'blur-lg')}
          {...props}
        />
      )}

      {/* Loader */}
      {showLoader && isInView && !isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-50',
            loaderClassName
          )}
        >
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          className={cn(
            className,
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={placeholderBlur ? 'blur' : 'empty'}
          blurDataURL={placeholderBlur}
          {...props}
        />
      )}
    </div>
  );
}

// Optimized version for product images with common settings
export function ProductImage({
  src,
  alt,
  className,
  aspectRatio = '3/4',
  ...props
}: LazyImageProps & { aspectRatio?: string }) {
  return (
    <div className={cn('relative bg-gray-100', `aspect-[${aspectRatio}]`)}>
      <LazyImage
        src={src}
        alt={alt}
        fill
        className={cn('object-cover', className)}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        fallback={
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <svg
              width="60"
              height="60"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-300"
            >
              <path
                d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M25 28 L25 35 C25 37, 27 39, 29 39 L51 39 C53 39, 55 37, 55 35 L55 28"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="currentColor"
                fillOpacity="0.1"
              />
            </svg>
          </div>
        }
        {...props}
      />
    </div>
  );
}

// Avatar image with circular loading state
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  ...props
}: LazyImageProps & { size?: number }) {
  return (
    <div
      className={cn('relative rounded-full overflow-hidden bg-gray-200', className)}
      style={{ width: size, height: size }}
    >
      <LazyImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        showLoader={false}
        fallback={
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <svg
              width={size * 0.6}
              height={size * 0.6}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M16 16C16 14.3431 14.2091 13 12 13C9.79086 13 8 14.3431 8 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        }
        {...props}
      />
    </div>
  );
}