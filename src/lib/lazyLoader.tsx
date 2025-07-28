// Comprehensive Lazy Loading System
// Advanced code splitting with error boundaries, loading states, and performance monitoring

import React, { Suspense, ComponentType, LazyExoticComponent, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorHandler, createNetworkError } from './errorHandler';

// Performance monitoring for lazy loading
interface LazyLoadMetrics {
  component: string;
  loadTime: number;
  success: boolean;
  retryCount: number;
  timestamp: number;
}

class LazyLoadMonitor {
  private metrics: LazyLoadMetrics[] = [];
  private maxMetrics = 500;

  recordLoad(component: string, loadTime: number, success: boolean, retryCount: number = 0): void {
    this.metrics.push({
      component,
      loadTime,
      success,
      retryCount,
      timestamp: Date.now()
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(component?: string): LazyLoadMetrics[] {
    return component 
      ? this.metrics.filter(m => m.component === component)
      : this.metrics;
  }

  getAverageLoadTime(component?: string): number {
    const relevantMetrics = this.getMetrics(component).filter(m => m.success);
    if (relevantMetrics.length === 0) return 0;
    
    return relevantMetrics.reduce((sum, m) => sum + m.loadTime, 0) / relevantMetrics.length;
  }

  getSuccessRate(component?: string): number {
    const relevantMetrics = this.getMetrics(component);
    if (relevantMetrics.length === 0) return 100;
    
    const successCount = relevantMetrics.filter(m => m.success).length;
    return (successCount / relevantMetrics.length) * 100;
  }
}

const lazyLoadMonitor = new LazyLoadMonitor();

// Loading component with skeleton
interface LoadingSkeletonProps {
  type?: 'page' | 'component' | 'card' | 'list';
  height?: string;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'component', 
  height = 'auto',
  className = ''
}) => {
  const getSkeletonContent = () => {
    switch (type) {
      case 'page':
        return (
          <div className={`animate-pulse space-y-6 p-6 ${className}`} style={{ height }}>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        );
      
      case 'card':
        return (
          <Card className={`animate-pulse ${className}`}>
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'list':
        return (
          <div className={`animate-pulse space-y-3 ${className}`} style={{ height }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`animate-pulse ${className}`} style={{ height }}>
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          </div>
        );
    }
  };

  return getSkeletonContent();
};

// Error fallback component
interface LazyErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentName: string;
}

const LazyErrorFallback: React.FC<LazyErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary, 
  componentName 
}) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    
    // Add delay to prevent rapid retries
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      resetErrorBoundary();
    } catch (retryError) {
      ErrorHandler.handle(retryError, {
        component: componentName,
        action: 'retry-lazy-load'
      });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Failed to load component
        </h3>
        <p className="text-red-700 mb-4">
          {componentName} couldn't be loaded. This might be due to a network issue.
        </p>
        <Button 
          onClick={handleRetry}
          disabled={retrying}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          {retrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Enhanced lazy loading options
export interface LazyLoadOptions {
  fallback?: React.ComponentType<LoadingSkeletonProps>;
  errorFallback?: React.ComponentType<LazyErrorFallbackProps>;
  skeletonType?: 'page' | 'component' | 'card' | 'list';
  skeletonHeight?: string;
  retryable?: boolean;
  preload?: boolean;
  timeout?: number;
  chunkName?: string;
}

// Create lazy component with enhanced features
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    fallback: CustomFallback,
    errorFallback: CustomErrorFallback,
    skeletonType = 'component',
    skeletonHeight,
    retryable = true,
    preload = false,
    timeout = 10000,
    chunkName
  } = options;

  // Enhanced import function with monitoring
  const monitoredImportFn = async (): Promise<{ default: T }> => {
    const startTime = performance.now();
    let retryCount = 0;
    const maxRetries = 3;

    const attemptLoad = async (): Promise<{ default: T }> => {
      try {
        // Add timeout to import
        const importPromise = importFn();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Component ${componentName} load timeout`)), timeout);
        });

        const result = await Promise.race([importPromise, timeoutPromise]);
        const loadTime = performance.now() - startTime;
        
        lazyLoadMonitor.recordLoad(componentName, loadTime, true, retryCount);
        
        return result;
      } catch (error) {
        retryCount++;
        
        if (retryCount <= maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptLoad();
        }

        const loadTime = performance.now() - startTime;
        lazyLoadMonitor.recordLoad(componentName, loadTime, false, retryCount);
        
        throw createNetworkError(`Failed to load ${componentName} after ${retryCount} attempts`, {
          component: componentName,
          action: 'lazy-load',
          metadata: { retryCount, loadTime }
        });
      }
    };

    return attemptLoad();
  };

  const LazyComponent = React.lazy(monitoredImportFn);

  // Preload if requested
  if (preload) {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      monitoredImportFn().catch(() => {
        // Ignore preload errors
      });
    }, 100);
  }

  return LazyComponent;
}

// HOC for wrapping lazy components with error boundaries and suspense
export function withLazyWrapper<T extends ComponentType<any>>(
  LazyComponent: LazyExoticComponent<T>,
  componentName: string,
  options: LazyLoadOptions = {}
): React.FC<React.ComponentProps<T>> {
  const {
    fallback: CustomFallback,
    errorFallback: CustomErrorFallback,
    skeletonType = 'component',
    skeletonHeight,
    retryable = true
  } = options;

  return (props: React.ComponentProps<T>) => {
    const FallbackComponent = CustomFallback || LoadingSkeleton;
    const ErrorComponent = CustomErrorFallback || LazyErrorFallback;

    return (
      <ErrorBoundary
        FallbackComponent={(errorProps) => (
          <ErrorComponent
            {...errorProps}
            componentName={componentName}
          />
        )}
        onError={(error, errorInfo) => {
          ErrorHandler.handle(error, {
            component: componentName,
            action: 'lazy-load-error',
            metadata: { errorInfo }
          });
        }}
      >
        <Suspense
          fallback={
            <FallbackComponent
              type={skeletonType}
              height={skeletonHeight}
            />
          }
        >
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Utility for creating lazy route components
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  routeName: string,
  options: LazyLoadOptions = {}
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = createLazyComponent(importFn, routeName, {
    skeletonType: 'page',
    preload: true,
    ...options
  });

  return withLazyWrapper(LazyComponent, routeName, {
    skeletonType: 'page',
    ...options
  });
}

// Hook for lazy loading performance metrics
export function useLazyLoadMetrics(componentName?: string) {
  const [metrics, setMetrics] = useState<LazyLoadMetrics[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(lazyLoadMonitor.getMetrics(componentName));
    };

    updateMetrics();
    
    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [componentName]);

  return {
    metrics,
    averageLoadTime: lazyLoadMonitor.getAverageLoadTime(componentName),
    successRate: lazyLoadMonitor.getSuccessRate(componentName),
    totalLoads: metrics.length
  };
}

// Preload utility for critical components
export function preloadComponent(importFn: () => Promise<any>): void {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 100);
    }
  };

  schedulePreload(() => {
    importFn().catch(() => {
      // Ignore preload errors
    });
  });
}

// Export monitoring utilities
export const lazyLoadUtils = {
  getMetrics: (component?: string) => lazyLoadMonitor.getMetrics(component),
  getAverageLoadTime: (component?: string) => lazyLoadMonitor.getAverageLoadTime(component),
  getSuccessRate: (component?: string) => lazyLoadMonitor.getSuccessRate(component),
  preloadComponent
};

export default {
  createLazyComponent,
  withLazyWrapper,
  createLazyRoute,
  LoadingSkeleton,
  LazyErrorFallback,
  useLazyLoadMetrics,
  preloadComponent,
  lazyLoadUtils
}; 