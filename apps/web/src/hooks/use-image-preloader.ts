import { useState, useEffect, useCallback, useRef } from 'react';

interface PreloadStatus {
  [url: string]: {
    status: 'loading' | 'loaded' | 'error';
    image?: HTMLImageElement;
    timestamp: number;
  };
}

interface UseImagePreloaderOptions {
  maxConcurrent?: number;
  preloadDistance?: number;
  cacheCleanupDistance?: number;
}

export function useImagePreloader(options: UseImagePreloaderOptions = {}) {
  const {
    maxConcurrent = 3,
    preloadDistance = 3,
    cacheCleanupDistance = 5,
  } = options;

  const [preloadStatus, setPreloadStatus] = useState<PreloadStatus>({});
  const preloadQueueRef = useRef<string[]>([]);
  const activeLoadsRef = useRef<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Preload a single image
  const preloadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (preloadStatus[url]?.status === 'loaded' && preloadStatus[url]?.image) {
        resolve(preloadStatus[url].image!);
        return;
      }

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllersRef.current.set(url, abortController);

      const img = new Image();
      
      img.onload = () => {
        setPreloadStatus(prev => ({
          ...prev,
          [url]: {
            status: 'loaded',
            image: img,
            timestamp: Date.now(),
          },
        }));
        activeLoadsRef.current.delete(url);
        abortControllersRef.current.delete(url);
        resolve(img);
        processQueue();
      };

      img.onerror = () => {
        setPreloadStatus(prev => ({
          ...prev,
          [url]: {
            status: 'error',
            timestamp: Date.now(),
          },
        }));
        activeLoadsRef.current.delete(url);
        abortControllersRef.current.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
        processQueue();
      };

      // Handle abort
      abortController.signal.addEventListener('abort', () => {
        img.src = '';
        activeLoadsRef.current.delete(url);
        abortControllersRef.current.delete(url);
        reject(new Error('Image loading aborted'));
        processQueue();
      });

      // Start loading
      setPreloadStatus(prev => ({
        ...prev,
        [url]: {
          status: 'loading',
          timestamp: Date.now(),
        },
      }));
      activeLoadsRef.current.add(url);
      img.src = url;
    });
  }, [preloadStatus]);

  // Process the preload queue
  const processQueue = useCallback(() => {
    const queue = preloadQueueRef.current;
    const activeLoads = activeLoadsRef.current;

    // Start new loads if we haven't reached the concurrent limit
    while (queue.length > 0 && activeLoads.size < maxConcurrent) {
      const url = queue.shift()!;
      
      // Skip if already loaded or loading
      if (preloadStatus[url]?.status === 'loaded' || activeLoads.has(url)) {
        continue;
      }

      preloadImage(url).catch(() => {
        // Error handled in preloadImage
      });
    }
  }, [maxConcurrent, preloadImage, preloadStatus]);

  // Add URLs to preload queue
  const queuePreload = useCallback((urls: string[]) => {
    const queue = preloadQueueRef.current;
    
    // Add new URLs that aren't already queued or loaded
    const newUrls = urls.filter(url => 
      !queue.includes(url) && 
      !preloadStatus[url] && 
      !activeLoadsRef.current.has(url)
    );
    
    queue.push(...newUrls);
    processQueue();
  }, [processQueue, preloadStatus]);

  // Preload pages around current page
  const preloadAroundPage = useCallback((
    currentPage: number,
    pages: string[],
    direction: 'forward' | 'backward' | 'both' = 'both'
  ) => {
    const urlsToPreload: string[] = [];

    if (direction === 'forward' || direction === 'both') {
      // Preload next pages
      for (let i = 1; i <= preloadDistance; i++) {
        const nextPageIndex = currentPage + i;
        if (nextPageIndex < pages.length) {
          urlsToPreload.push(pages[nextPageIndex]);
        }
      }
    }

    if (direction === 'backward' || direction === 'both') {
      // Preload previous pages
      for (let i = 1; i <= preloadDistance; i++) {
        const prevPageIndex = currentPage - i;
        if (prevPageIndex >= 0) {
          urlsToPreload.push(pages[prevPageIndex]);
        }
      }
    }

    queuePreload(urlsToPreload);
  }, [preloadDistance, queuePreload]);

  // Clean up old cached images
  const cleanupCache = useCallback((currentPage: number, pages: string[]) => {
    const cutoffTime = Date.now() - (5 * 60 * 1000); // 5 minutes ago
    
    setPreloadStatus(prev => {
      const newStatus = { ...prev };
      
      Object.keys(newStatus).forEach(url => {
        const pageIndex = pages.indexOf(url);
        const isOld = newStatus[url].timestamp < cutoffTime;
        const isFarFromCurrent = Math.abs(pageIndex - currentPage) > cacheCleanupDistance;
        
        if (isOld || isFarFromCurrent) {
          delete newStatus[url];
        }
      });
      
      return newStatus;
    });
  }, [cacheCleanupDistance]);

  // Cancel all pending loads
  const cancelAllLoads = useCallback(() => {
    // Abort all active requests
    abortControllersRef.current.forEach(controller => {
      controller.abort();
    });
    
    // Clear queues and active loads
    preloadQueueRef.current = [];
    activeLoadsRef.current.clear();
    abortControllersRef.current.clear();
  }, []);

  // Get preload statistics
  const getPreloadStats = useCallback(() => {
    const status = preloadStatus;
    const total = Object.keys(status).length;
    const loaded = Object.values(status).filter(s => s.status === 'loaded').length;
    const loading = Object.values(status).filter(s => s.status === 'loading').length;
    const errors = Object.values(status).filter(s => s.status === 'error').length;
    
    return {
      total,
      loaded,
      loading,
      errors,
      queueLength: preloadQueueRef.current.length,
      activeLoads: activeLoadsRef.current.size,
    };
  }, [preloadStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAllLoads();
    };
  }, [cancelAllLoads]);

  return {
    preloadStatus,
    preloadAroundPage,
    queuePreload,
    cleanupCache,
    cancelAllLoads,
    getPreloadStats,
    isImageLoaded: (url: string) => preloadStatus[url]?.status === 'loaded',
    isImageLoading: (url: string) => preloadStatus[url]?.status === 'loading',
    isImageError: (url: string) => preloadStatus[url]?.status === 'error',
    getLoadedImage: (url: string) => preloadStatus[url]?.image,
  };
} 