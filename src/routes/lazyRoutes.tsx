import { lazy } from 'react';

// Existing routes
export const Index = lazy(() => import('@/pages/Index'));
export const Auth = lazy(() => import('@/pages/Auth'));
export const Dashboard = lazy(() => import('@/pages/Dashboard'));
export const SEOAnalysis = lazy(() => import('@/pages/SEOAnalysis'));
export const SEOAnalysisSimple = lazy(() => import('@/pages/SEOAnalysisSimple'));
export const SchemaAnalysis = lazy(() => import('@/pages/SchemaAnalysis'));
export const DomainAnalysis = lazy(() => import('@/pages/DomainAnalysis'));
export const ContentAnalysis = lazy(() => import('@/pages/ContentAnalysis'));
export const ContentOptimizer = lazy(() => import('@/pages/ContentOptimizer'));
export const ContentGenerator = lazy(() => import('@/pages/ContentGenerator'));
export const ContentHistory = lazy(() => import('@/pages/ContentHistory'));
export const Settings = lazy(() => import('@/pages/Settings'));
export const Upgrade = lazy(() => import('@/pages/Upgrade'));
export const Admin = lazy(() => import('@/pages/Admin'));
export const About = lazy(() => import('@/pages/About'));
export const Resources = lazy(() => import('@/pages/Resources'));
export const NotFound = lazy(() => import('@/pages/NotFound'));
export const BrandSERPanalysis = lazy(() => import('@/pages/BrandSERPanalysis'));
export const CitationChecker = lazy(() => import('@/pages/CitationChecker'));
export const AISitemap = lazy(() => import('@/pages/AISitemap'));

// TSO Dashboard and Components - Build Fix
export const TSODashboard = lazy(() => import('@/pages/TSODashboard'));
export const TSOOnboarding = lazy(() => import('@/pages/TSOOnboarding'));
export const AIVisibilityTracker = lazy(() => import('@/components/TSO/AIVisibilityTracker'));
export const ZeroClickOptimizer = lazy(() => import('@/components/TSO/ZeroClickOptimizer'));
export const TechnicalAIReadiness = lazy(() => import('@/components/TSO/TechnicalAIReadiness'));
export const IntentDrivenResearch = lazy(() => import('@/components/TSO/IntentDrivenResearch'));
export const SemanticAnalyzer = lazy(() => import('@/components/TSO/SemanticAnalyzer'));
export const VoiceSearchOptimizer = lazy(() => import('@/components/TSO/VoiceSearchOptimizer'));
export const AuthorityTracker = lazy(() => import('@/components/TSO/AuthorityTracker'));
export const CompetitiveAIAnalysis = lazy(() => import('@/components/TSO/CompetitiveAIAnalysis'));
export const BusinessTypeTemplates = lazy(() => import('@/components/TSO/BusinessTypeTemplates'));