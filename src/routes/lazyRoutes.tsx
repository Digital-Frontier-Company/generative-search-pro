import { lazy } from 'react';

// Existing routes
export const Index = lazy(() => import('@/pages/HomePage'));
export const Auth = lazy(() => import('@/features/auth/AuthPage'));
export const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'));
export const SEOAnalysis = lazy(() => import('@/features/seo/analysis/SEOAnalysisPage'));
export const SEOAnalysisSimple = lazy(() => import('@/features/seo/analysis/SEOAnalysisSimplePage'));
export const SchemaAnalysis = lazy(() => import('@/features/schema/SchemaAnalysisPage'));
export const DomainAnalysis = lazy(() => import('@/features/domain/DomainAnalysisPage'));
export const ContentAnalysis = lazy(() => import('@/features/content/analysis/ContentAnalysisPage'));
export const ContentOptimizer = lazy(() => import('@/features/content/optimization/ContentOptimizerPage'));
export const ContentGenerator = lazy(() => import('@/features/content/generation/ContentGeneratorPage'));
export const ContentHistory = lazy(() => import('@/features/content/analysis/ContentHistoryPage'));
export const Settings = lazy(() => import('@/features/user/SettingsPage'));
export const Upgrade = lazy(() => import('@/features/user/UpgradePage'));
export const Admin = lazy(() => import('@/features/admin/AdminPage'));
export const About = lazy(() => import('@/pages/About'));
export const Resources = lazy(() => import('@/pages/Resources'));
export const NotFound = lazy(() => import('@/pages/NotFoundPage'));
export const BrandSERPanalysis = lazy(() => import('@/features/seo/monitoring/BrandSERPanalysisPage'));
export const CitationChecker = lazy(() => import('@/features/citation/CitationCheckerPage'));
export const AISitemap = lazy(() => import('@/features/seo/sitemap/AISitemapPage'));

// TSO Dashboard and Components - Build Fix
export const TSODashboard = lazy(() => import('@/features/tso/TSODashboardPage'));
export const TSOOnboarding = lazy(() => import('@/features/tso/TSOOnboardingPage'));
export const AIVisibilityTracker = lazy(() => import('@/features/tso/AIVisibilityTracker'));
export const ZeroClickOptimizer = lazy(() => import('@/features/tso/ZeroClickOptimizer'));
export const TechnicalAIReadiness = lazy(() => import('@/features/tso/TechnicalAIReadiness'));
export const IntentDrivenResearch = lazy(() => import('@/features/tso/IntentDrivenResearch'));
export const SemanticAnalyzer = lazy(() => import('@/features/tso/SemanticAnalyzer'));
export const VoiceSearchOptimizer = lazy(() => import('@/features/tso/VoiceSearchOptimizer'));
export const AuthorityTracker = lazy(() => import('@/features/tso/AuthorityTracker'));
export const CompetitiveAIAnalysis = lazy(() => import('@/features/tso/CompetitiveAIAnalysis'));
export const BusinessTypeTemplates = lazy(() => import('@/features/tso/BusinessTypeTemplates'));