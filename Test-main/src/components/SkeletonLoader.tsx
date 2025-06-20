import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'avatar' | 'text' | 'image' | 'wishlist';
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card', 
  className = '',
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'avatar':
        return (
          <div className={`w-10 h-10 bg-neutral-200 rounded-full animate-pulse ${className}`} />
        );
      
      case 'text':
        return (
          <div className={`h-4 bg-neutral-200 rounded animate-pulse ${className}`} />
        );
      
      case 'image':
        return (
          <div className={`w-full h-48 bg-neutral-200 rounded-lg animate-pulse ${className}`} />
        );
      
      case 'wishlist':
        return (
          <div className={`bg-white rounded-xl shadow-md overflow-hidden animate-pulse ${className}`}>
            {/* Header */}
            <div className="p-4 pb-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-24 mb-1" />
                  <div className="h-3 bg-neutral-200 rounded w-16" />
                </div>
              </div>
              <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-full mb-1" />
              <div className="h-4 bg-neutral-200 rounded w-2/3" />
            </div>
            
            {/* Images */}
            <div className="px-4 mb-3">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-neutral-200 rounded-lg" />
                ))}
              </div>
            </div>
            
            {/* Progress */}
            <div className="px-4 mb-3">
              <div className="flex justify-between mb-2">
                <div className="h-3 bg-neutral-200 rounded w-20" />
                <div className="h-3 bg-neutral-200 rounded w-8" />
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full" />
              <div className="flex justify-between mt-1">
                <div className="h-3 bg-neutral-200 rounded w-16" />
                <div className="h-3 bg-neutral-200 rounded w-20" />
              </div>
            </div>
            
            {/* Actions */}
            <div className="px-4 pb-4 pt-2 border-t border-neutral-100">
              <div className="flex justify-between">
                <div className="flex space-x-4">
                  <div className="h-4 bg-neutral-200 rounded w-8" />
                  <div className="h-4 bg-neutral-200 rounded w-8" />
                </div>
                <div className="h-4 bg-neutral-200 rounded w-4" />
              </div>
            </div>
          </div>
        );
      
      case 'card':
      default:
        return (
          <div className={`bg-white rounded-xl shadow-md overflow-hidden animate-pulse ${className}`}>
            <div className="w-full h-48 bg-neutral-200" />
            <div className="p-4">
              <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-full mb-1" />
              <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4" />
              <div className="h-2 bg-neutral-200 rounded-full w-full mb-2" />
              <div className="flex justify-between">
                <div className="h-3 bg-neutral-200 rounded w-16" />
                <div className="h-3 bg-neutral-200 rounded w-8" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};