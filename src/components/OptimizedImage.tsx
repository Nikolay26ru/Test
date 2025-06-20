import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { handleImageError, getPlaceholderImage } from '../utils/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  category?: string;
  showLoader?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  category,
  showLoader = true,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    handleImageError(event, fallbackSrc, category);
    onError?.();
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 rounded-lg">
          <LoadingSpinner size="sm" />
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};