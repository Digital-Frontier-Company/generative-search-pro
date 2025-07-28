// Bundle Optimization Utilities
// Comprehensive asset loading, compression, and performance monitoring

// Asset loading optimization
interface AssetLoadOptions {
  priority?: 'high' | 'medium' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  timeout?: number;
  retries?: number;
}

interface AssetMetrics {
  url: string;
  type: 'script' | 'style' | 'image' | 'font';
  loadTime: number;
  size?: number;
  cached: boolean;
  success: boolean;
  timestamp: number;
}

class AssetLoadMonitor {
  private metrics: AssetMetrics[] = [];
  private maxMetrics = 1000;

  recordLoad(metrics: AssetMetrics): void {
    this.metrics.push(metrics);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(type?: string): AssetMetrics[] {
    return type 
      ? this.metrics.filter(m => m.type === type)
      : this.metrics;
  }

  getAverageLoadTime(type?: string): number {
    const relevantMetrics = this.getMetrics(type).filter(m => m.success);
    if (relevantMetrics.length === 0) return 0;
    
    return relevantMetrics.reduce((sum, m) => sum + m.loadTime, 0) / relevantMetrics.length;
  }

  getTotalSize(type?: string): number {
    return this.getMetrics(type)
      .filter(m => m.success && m.size)
      .reduce((sum, m) => sum + (m.size || 0), 0);
  }

  getCacheHitRate(type?: string): number {
    const relevantMetrics = this.getMetrics(type).filter(m => m.success);
    if (relevantMetrics.length === 0) return 0;
    
    const cachedCount = relevantMetrics.filter(m => m.cached).length;
    return (cachedCount / relevantMetrics.length) * 100;
  }
}

const assetLoadMonitor = new AssetLoadMonitor();

// Optimized script loading
export function loadScript(
  src: string, 
  options: AssetLoadOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const {
      priority = 'medium',
      crossOrigin,
      integrity,
      timeout = 10000,
      retries = 2
    } = options;

    let retryCount = 0;

    const attemptLoad = () => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      // Set priority hint if supported
      if ('importance' in script) {
        (script as any).importance = priority;
      }
      
      if (crossOrigin) {
        script.crossOrigin = crossOrigin;
      }
      
      if (integrity) {
        script.integrity = integrity;
      }

      const cleanup = () => {
        clearTimeout(timeoutId);
        script.remove();
      };

      const timeoutId = setTimeout(() => {
        cleanup();
        
        if (retryCount < retries) {
          retryCount++;
          setTimeout(attemptLoad, 1000 * retryCount);
        } else {
          const loadTime = performance.now() - startTime;
          assetLoadMonitor.recordLoad({
            url: src,
            type: 'script',
            loadTime,
            cached: false,
            success: false,
            timestamp: Date.now()
          });
          reject(new Error(`Script load timeout: ${src}`));
        }
      }, timeout);

      script.onload = () => {
        cleanup();
        const loadTime = performance.now() - startTime;
        
        assetLoadMonitor.recordLoad({
          url: src,
          type: 'script',
          loadTime,
          cached: loadTime < 50, // Assume cached if very fast
          success: true,
          timestamp: Date.now()
        });
        
        resolve();
      };

      script.onerror = () => {
        cleanup();
        
        if (retryCount < retries) {
          retryCount++;
          setTimeout(attemptLoad, 1000 * retryCount);
        } else {
          const loadTime = performance.now() - startTime;
          assetLoadMonitor.recordLoad({
            url: src,
            type: 'script',
            loadTime,
            cached: false,
            success: false,
            timestamp: Date.now()
          });
          reject(new Error(`Script load error: ${src}`));
        }
      };

      document.head.appendChild(script);
    };

    attemptLoad();
  });
}

// Optimized stylesheet loading
export function loadStylesheet(
  href: string, 
  options: AssetLoadOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const {
      priority = 'medium',
      crossOrigin,
      integrity,
      timeout = 10000
    } = options;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    
    if (crossOrigin) {
      link.crossOrigin = crossOrigin;
    }
    
    if (integrity) {
      link.integrity = integrity;
    }

    const cleanup = () => {
      clearTimeout(timeoutId);
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      const loadTime = performance.now() - startTime;
      assetLoadMonitor.recordLoad({
        url: href,
        type: 'style',
        loadTime,
        cached: false,
        success: false,
        timestamp: Date.now()
      });
      reject(new Error(`Stylesheet load timeout: ${href}`));
    }, timeout);

    link.onload = () => {
      cleanup();
      const loadTime = performance.now() - startTime;
      
      assetLoadMonitor.recordLoad({
        url: href,
        type: 'style',
        loadTime,
        cached: loadTime < 50,
        success: true,
        timestamp: Date.now()
      });
      
      resolve();
    };

    link.onerror = () => {
      cleanup();
      const loadTime = performance.now() - startTime;
      assetLoadMonitor.recordLoad({
        url: href,
        type: 'style',
        loadTime,
        cached: false,
        success: false,
        timestamp: Date.now()
      });
      reject(new Error(`Stylesheet load error: ${href}`));
    };

    document.head.appendChild(link);
  });
}

// Image optimization and lazy loading
interface ImageLoadOptions extends AssetLoadOptions {
  lazy?: boolean;
  placeholder?: string;
  sizes?: string;
  srcSet?: string;
}

export function loadImage(
  src: string, 
  options: ImageLoadOptions = {}
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const {
      lazy = true,
      placeholder,
      sizes,
      srcSet,
      timeout = 15000
    } = options;

    const img = new Image();
    
    if (crossOrigin) {
      img.crossOrigin = options.crossOrigin!;
    }
    
    if (sizes) {
      img.sizes = sizes;
    }
    
    if (srcSet) {
      img.srcset = srcSet;
    }

    // Add loading attribute for native lazy loading
    if (lazy && 'loading' in img) {
      img.loading = 'lazy';
    }

    const cleanup = () => {
      clearTimeout(timeoutId);
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      const loadTime = performance.now() - startTime;
      assetLoadMonitor.recordLoad({
        url: src,
        type: 'image',
        loadTime,
        cached: false,
        success: false,
        timestamp: Date.now()
      });
      reject(new Error(`Image load timeout: ${src}`));
    }, timeout);

    img.onload = () => {
      cleanup();
      const loadTime = performance.now() - startTime;
      
      // Estimate size based on dimensions (rough approximation)
      const estimatedSize = img.naturalWidth * img.naturalHeight * 3; // RGB estimate
      
      assetLoadMonitor.recordLoad({
        url: src,
        type: 'image',
        loadTime,
        size: estimatedSize,
        cached: loadTime < 100,
        success: true,
        timestamp: Date.now()
      });
      
      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      const loadTime = performance.now() - startTime;
      assetLoadMonitor.recordLoad({
        url: src,
        type: 'image',
        loadTime,
        cached: false,
        success: false,
        timestamp: Date.now()
      });
      reject(new Error(`Image load error: ${src}`));
    };

    // Set placeholder first if provided
    if (placeholder) {
      img.src = placeholder;
      // Load actual image after a short delay
      setTimeout(() => {
        img.src = src;
      }, 100);
    } else {
      img.src = src;
    }
  });
}

// Font loading optimization
export function loadFont(
  fontFamily: string,
  fontUrl: string,
  options: AssetLoadOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('FontFace' in window)) {
      // Fallback for older browsers
      return loadStylesheet(fontUrl, options).then(resolve).catch(reject);
    }

    const startTime = performance.now();
    const { timeout = 5000 } = options;

    const font = new FontFace(fontFamily, `url(${fontUrl})`);
    
    const timeoutId = setTimeout(() => {
      const loadTime = performance.now() - startTime;
      assetLoadMonitor.recordLoad({
        url: fontUrl,
        type: 'font',
        loadTime,
        cached: false,
        success: false,
        timestamp: Date.now()
      });
      reject(new Error(`Font load timeout: ${fontFamily}`));
    }, timeout);

    font.load().then(() => {
      clearTimeout(timeoutId);
      document.fonts.add(font);
      
      const loadTime = performance.now() - startTime;
      assetLoadMonitor.recordLoad({
        url: fontUrl,
        type: 'font',
        loadTime,
        cached: loadTime < 100,
        success: true,
        timestamp: Date.now()
      });
      
      resolve();
    }).catch(() => {
      clearTimeout(timeoutId);
      const loadTime = performance.now() - startTime;
      assetLoadMonitor.recordLoad({
        url: fontUrl,
        type: 'font',
        loadTime,
        cached: false,
        success: false,
        timestamp: Date.now()
      });
      reject(new Error(`Font load error: ${fontFamily}`));
    });
  });
}

// Resource hints for optimization
export function addResourceHint(
  url: string, 
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch',
  as?: string,
  crossOrigin?: string
): void {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = url;
  
  if (as) {
    link.as = as;
  }
  
  if (crossOrigin) {
    link.crossOrigin = crossOrigin;
  }
  
  document.head.appendChild(link);
}

// Preload critical resources
export function preloadCriticalResources(resources: Array<{
  url: string;
  type: 'script' | 'style' | 'image' | 'font';
  crossOrigin?: string;
}>): void {
  resources.forEach(({ url, type, crossOrigin }) => {
    addResourceHint(url, 'preload', type, crossOrigin);
  });
}

// Prefetch non-critical resources
export function prefetchResources(urls: string[]): void {
  urls.forEach(url => {
    addResourceHint(url, 'prefetch');
  });
}

// Preconnect to external domains
export function preconnectDomains(domains: string[]): void {
  domains.forEach(domain => {
    addResourceHint(domain, 'preconnect');
  });
}

// Bundle analysis utilities
interface BundleInfo {
  totalSize: number;
  gzippedSize?: number;
  chunkCount: number;
  loadTime: number;
  cacheHitRate: number;
}

export function analyzeBundlePerformance(): BundleInfo {
  const allMetrics = assetLoadMonitor.getMetrics();
  const scriptMetrics = assetLoadMonitor.getMetrics('script');
  
  return {
    totalSize: assetLoadMonitor.getTotalSize(),
    chunkCount: scriptMetrics.length,
    loadTime: assetLoadMonitor.getAverageLoadTime(),
    cacheHitRate: assetLoadMonitor.getCacheHitRate()
  };
}

// Performance monitoring
export function getAssetMetrics() {
  return {
    scripts: {
      count: assetLoadMonitor.getMetrics('script').length,
      averageLoadTime: assetLoadMonitor.getAverageLoadTime('script'),
      totalSize: assetLoadMonitor.getTotalSize('script'),
      cacheHitRate: assetLoadMonitor.getCacheHitRate('script')
    },
    styles: {
      count: assetLoadMonitor.getMetrics('style').length,
      averageLoadTime: assetLoadMonitor.getAverageLoadTime('style'),
      totalSize: assetLoadMonitor.getTotalSize('style'),
      cacheHitRate: assetLoadMonitor.getCacheHitRate('style')
    },
    images: {
      count: assetLoadMonitor.getMetrics('image').length,
      averageLoadTime: assetLoadMonitor.getAverageLoadTime('image'),
      totalSize: assetLoadMonitor.getTotalSize('image'),
      cacheHitRate: assetLoadMonitor.getCacheHitRate('image')
    },
    fonts: {
      count: assetLoadMonitor.getMetrics('font').length,
      averageLoadTime: assetLoadMonitor.getAverageLoadTime('font'),
      totalSize: assetLoadMonitor.getTotalSize('font'),
      cacheHitRate: assetLoadMonitor.getCacheHitRate('font')
    }
  };
}

// Critical resource loading strategy
export function loadCriticalResources(): Promise<void[]> {
  const criticalResources = [
    // Add your critical CSS/JS here
    // Example: loadStylesheet('/assets/critical.css', { priority: 'high' })
  ];

  return Promise.all(criticalResources);
}

// Optimize images with modern formats
export function getOptimizedImageSrc(
  originalSrc: string,
  width?: number,
  quality: number = 80
): string {
  // Check for WebP support
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  // Check for AVIF support
  const supportsAVIF = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  })();

  // Return optimized format based on browser support
  if (supportsAVIF) {
    return `${originalSrc}?format=avif&quality=${quality}${width ? `&width=${width}` : ''}`;
  } else if (supportsWebP) {
    return `${originalSrc}?format=webp&quality=${quality}${width ? `&width=${width}` : ''}`;
  }
  
  return originalSrc;
}

// Service Worker utilities for caching
export function registerServiceWorker(swPath: string = '/sw.js'): Promise<ServiceWorkerRegistration> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.register(swPath);
  }
  return Promise.reject(new Error('Service Worker not supported'));
}

// Cache optimization
export function optimizeCache(): void {
  if ('caches' in window) {
    // Clean up old caches
    caches.keys().then(cacheNames => {
      const oldCaches = cacheNames.filter(name => 
        name.includes('old') || name.includes('v1') // Adjust based on your naming
      );
      
      return Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
      );
    });
  }
}

// Memory usage monitoring
export function getMemoryUsage(): MemoryInfo | null {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
}

// Export utilities
export const bundleOptimizer = {
  loadScript,
  loadStylesheet,
  loadImage,
  loadFont,
  addResourceHint,
  preloadCriticalResources,
  prefetchResources,
  preconnectDomains,
  analyzeBundlePerformance,
  getAssetMetrics,
  loadCriticalResources,
  getOptimizedImageSrc,
  registerServiceWorker,
  optimizeCache,
  getMemoryUsage
};

export default bundleOptimizer; 