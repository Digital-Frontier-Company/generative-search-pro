// Lazy-loaded Route Components
// Optimized code splitting for all major routes

import { createLazyRoute, preloadComponent } from '@/lib/lazyLoader';

// Main pages with lazy loading
export const LazyIndex = createLazyRoute(
  () => import('@/pages/Index'),
  'Index',
  { preload: true, chunkName: 'index' }
);

export const LazyDashboard = createLazyRoute(
  () => import('@/pages/Dashboard'),
  'Dashboard',
  { preload: true, chunkName: 'dashboard' }
);

export const LazyAuth = createLazyRoute(
  () => import('@/pages/Auth'),
  'Auth',
  { preload: false, chunkName: 'auth' }
);

export const LazySettings = createLazyRoute(
  () => import('@/pages/Settings'),
  'Settings',
  { preload: false, chunkName: 'settings' }
);

export const LazyUpgrade = createLazyRoute(
  () => import('@/pages/Upgrade'),
  'Upgrade',
  { preload: false, chunkName: 'upgrade' }
);

// SEO Analysis pages
export const LazySEOAnalysis = createLazyRoute(
  () => import('@/pages/SEOAnalysis'),
  'SEOAnalysis',
  { preload: false, chunkName: 'seo-analysis' }
);

export const LazySEOAnalysisSimple = createLazyRoute(
  () => import('@/pages/SEOAnalysisSimple'),
  'SEOAnalysisSimple',
  { preload: false, chunkName: 'seo-simple' }
);

export const LazySchemaAnalysis = createLazyRoute(
  () => import('@/pages/SchemaAnalysis'),
  'SchemaAnalysis',
  { preload: false, chunkName: 'schema-analysis' }
);

export const LazyDomainAnalysis = createLazyRoute(
  () => import('@/pages/DomainAnalysis'),
  'DomainAnalysis',
  { preload: false, chunkName: 'domain-analysis' }
);

// Content pages
export const LazyContentAnalysis = createLazyRoute(
  () => import('@/pages/ContentAnalysis'),
  'ContentAnalysis',
  { preload: false, chunkName: 'content-analysis' }
);

export const LazyContentGenerator = createLazyRoute(
  () => import('@/pages/ContentGenerator'),
  'ContentGenerator',
  { preload: false, chunkName: 'content-generator' }
);

export const LazyContentOptimizer = createLazyRoute(
  () => import('@/pages/ContentOptimizer'),
  'ContentOptimizer',
  { preload: false, chunkName: 'content-optimizer' }
);

export const LazyContentHistory = createLazyRoute(
  () => import('@/pages/ContentHistory'),
  'ContentHistory',
  { preload: false, chunkName: 'content-history' }
);

// Citation and SERP pages
export const LazyCitationChecker = createLazyRoute(
  () => import('@/pages/CitationChecker'),
  'CitationChecker',
  { preload: false, chunkName: 'citation-checker' }
);

export const LazyBrandSERPanalysis = createLazyRoute(
  () => import('@/pages/BrandSERPanalysis'),
  'BrandSERPanalysis',
  { preload: false, chunkName: 'brand-serp' }
);

// AI and Sitemap pages
export const LazyAISitemap = createLazyRoute(
  () => import('@/pages/AISitemap'),
  'AISitemap',
  { preload: false, chunkName: 'ai-sitemap' }
);

// Static pages
export const LazyAbout = createLazyRoute(
  () => import('@/pages/About'),
  'About',
  { preload: false, chunkName: 'about' }
);

export const LazyResources = createLazyRoute(
  () => import('@/pages/Resources'),
  'Resources',
  { preload: false, chunkName: 'resources' }
);

export const LazyAdmin = createLazyRoute(
  () => import('@/pages/Admin'),
  'Admin',
  { preload: false, chunkName: 'admin' }
);

export const LazyNotFound = createLazyRoute(
  () => import('@/pages/NotFound'),
  'NotFound',
  { preload: false, chunkName: 'not-found' }
);

// Preload critical components based on user behavior
export function preloadCriticalRoutes(): void {
  // Preload dashboard for authenticated users
  if (localStorage.getItem('supabase.auth.token')) {
    preloadComponent(() => import('@/pages/Dashboard'));
    preloadComponent(() => import('@/pages/Settings'));
  }
  
  // Preload SEO analysis for likely next navigation
  preloadComponent(() => import('@/pages/SEOAnalysis'));
}

// Preload routes based on current route
export function preloadRelatedRoutes(currentPath: string): void {
  const preloadMap: Record<string, (() => Promise<any>)[]> = {
    '/': [
      () => import('@/pages/Dashboard'),
      () => import('@/pages/SEOAnalysis')
    ],
    '/dashboard': [
      () => import('@/pages/SEOAnalysis'),
      () => import('@/pages/CitationChecker'),
      () => import('@/pages/ContentAnalysis')
    ],
    '/seo-analysis': [
      () => import('@/pages/SchemaAnalysis'),
      () => import('@/pages/DomainAnalysis')
    ],
    '/content-analysis': [
      () => import('@/pages/ContentGenerator'),
      () => import('@/pages/ContentOptimizer')
    ],
    '/citation-checker': [
      () => import('@/pages/BrandSERPanalysis')
    ]
  };

  const preloadFunctions = preloadMap[currentPath];
  if (preloadFunctions) {
    preloadFunctions.forEach(preloadFn => {
      preloadComponent(preloadFn);
    });
  }
}

// Route metadata for optimization
export const routeMetadata = {
  '/': { priority: 'high', preload: true },
  '/dashboard': { priority: 'high', preload: true },
  '/auth': { priority: 'medium', preload: false },
  '/seo-analysis': { priority: 'high', preload: false },
  '/citation-checker': { priority: 'medium', preload: false },
  '/content-analysis': { priority: 'medium', preload: false },
  '/settings': { priority: 'low', preload: false },
  '/upgrade': { priority: 'low', preload: false },
  '/about': { priority: 'low', preload: false },
  '/resources': { priority: 'low', preload: false },
  '/admin': { priority: 'low', preload: false }
};

export default {
  LazyIndex,
  LazyDashboard,
  LazyAuth,
  LazySettings,
  LazyUpgrade,
  LazySEOAnalysis,
  LazySEOAnalysisSimple,
  LazySchemaAnalysis,
  LazyDomainAnalysis,
  LazyContentAnalysis,
  LazyContentGenerator,
  LazyContentOptimizer,
  LazyContentHistory,
  LazyCitationChecker,
  LazyBrandSERPanalysis,
  LazyAISitemap,
  LazyAbout,
  LazyResources,
  LazyAdmin,
  LazyNotFound,
  preloadCriticalRoutes,
  preloadRelatedRoutes,
  routeMetadata
}; 