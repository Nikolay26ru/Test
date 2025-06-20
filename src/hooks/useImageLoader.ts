import { useState, useCallback } from 'react';

interface UseImageLoaderReturn {
  isLoading: boolean;
  hasError: boolean;
  handleLoad: () => void;
  handleError: () => void;
  reset: () => void;
}

export const useImageLoader = (): UseImageLoaderReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  return {
    isLoading,
    hasError,
    handleLoad,
    handleError,
    reset
  };
};