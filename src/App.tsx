import { Toaster } from "@/components/ui/sonner";
import SkipLink from "@/components/global/SkipLink";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { DomainProvider } from "@/contexts/DomainContext";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/global/AppSidebar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Index from "./pages/HomePage";
import Auth from "./features/auth/AuthPage";
import About from "./pages/About";
import Dashboard from "./features/dashboard/DashboardPage";
import ContentGenerator from "./features/content/generation/ContentGeneratorPage";
import ContentHistory from "./features/content/analysis/ContentHistoryPage";
import ContentAnalysis from "./features/content/analysis/ContentAnalysisPage";
import ContentOptimizer from "./features/content/optimization/ContentOptimizerPage";
import Resources from "./pages/Resources";
import SEOAnalysisSimple from "./features/seo/analysis/SEOAnalysisSimplePage";
import DomainAnalysis from "./features/domain/DomainAnalysisPage";
import SchemaAnalysis from "./features/schema/SchemaAnalysisPage";
import CitationChecker from "./features/citation/CitationCheckerPage";
import AISitemap from "./features/seo/sitemap/AISitemapPage";
import Settings from "./features/user/SettingsPage";
import Admin from "./features/admin/AdminPage";
import Upgrade from "./features/user/UpgradePage";
import NotFound from "./pages/NotFoundPage";
import SchemaMarkupGuide from "./features/schema/SchemaMarkupGuidePage";
import Analysis from "./features/seo/analysis/AnalysisPage";


// TSO Dashboard and Components
import TSODashboard from "./features/tso/TSODashboardPage";
import AIVisibilityTracker from "./features/tso/TSO/AIVisibilityTracker";
import ZeroClickOptimizer from "./features/tso/TSO/ZeroClickOptimizer";
import TechnicalAIReadiness from "./features/tso/TSO/TechnicalAIReadiness";
import IntentDrivenResearch from "./features/tso/TSO/IntentDrivenResearch";
import SemanticAnalyzer from "./features/tso/TSO/SemanticAnalyzer";
import VoiceSearchOptimizer from "./features/tso/TSO/VoiceSearchOptimizer";
import AuthorityTracker from "./features/tso/TSO/AuthorityTracker";
import CompetitiveAIAnalysis from "./features/tso/TSO/CompetitiveAIAnalysis";
import BusinessTypeTemplates from "./features/tso/TSO/BusinessTypeTemplates";
import TSOOnboarding from "./features/tso/TSOOnboardingPage";

// Marketplace Landing Pages (public)
import Brands from "./pages/Brands";
import Influencers from "./pages/Influencers";
const queryClient = new QueryClient();
function App() {
  return <QueryClientProvider client={queryClient}>
      <SkipLink />
      <AuthProvider>
        <SubscriptionProvider>
          <DomainProvider>
            <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <SidebarInset>
                    <header className="sticky top-0 z-40 flex h-12 items-center border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <SidebarTrigger className="ml-2" />
                      <h1 className="sr-only">Navigation</h1>
                    </header>
                    <div className="flex-1 bg-[#030013]/[0.97]">
                        <Suspense fallback={<div className="p-6"><Skeleton className="h-6 w-1/3 mb-4" /><Skeleton className="h-4 w-2/3" /></div>}>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/upgrade" element={<Upgrade />} />
                          <Route path="/resources" element={<Resources />} />
                          <Route path="/schema-markup-guide" element={<SchemaMarkupGuide />} />
                          {/* Public marketplace landing pages */}
                          <Route path="/brands" element={<Brands />} />
                          <Route path="/influencers" element={<Influencers />} />
                          <Route path="/analysis" element={<ProtectedRoute>
                                <Analysis />
                              </ProtectedRoute>} />
                          <Route path="/dashboard" element={<ProtectedRoute>
                                <Dashboard />
                              </ProtectedRoute>} />
                          <Route path="/generator" element={<ProtectedRoute>
                                <ContentGenerator />
                              </ProtectedRoute>} />
                          <Route path="/history" element={<ProtectedRoute>
                                <ContentHistory />
                              </ProtectedRoute>} />
                          <Route path="/content-analysis" element={<ProtectedRoute>
                                <ContentAnalysis />
                              </ProtectedRoute>} />
                          <Route path="/seo-analysis" element={<ProtectedRoute>
                                <Analysis />
                              </ProtectedRoute>} />
                          <Route path="/domain-analysis" element={<ProtectedRoute>
                                <Analysis />
                              </ProtectedRoute>} />
                          <Route path="/schema-analysis" element={<ProtectedRoute>
                                <Analysis />
                              </ProtectedRoute>} />
                          <Route path="/citation-checker" element={<ProtectedRoute>
                                <Analysis />
                              </ProtectedRoute>} />
                          <Route path="/ai-sitemap" element={<ProtectedRoute>
                                <AISitemap />
                              </ProtectedRoute>} />
                          <Route path="/settings" element={<ProtectedRoute>
                                <Settings />
                              </ProtectedRoute>} />
                          <Route path="/admin" element={<ProtectedRoute>
                                <Admin />
                              </ProtectedRoute>} />
                          {/* TSO Dashboard and Tools */}
                          <Route path="/tso-onboarding" element={<ProtectedRoute>
                                <TSOOnboarding />
                              </ProtectedRoute>} />
                          <Route path="/tso-dashboard" element={<ProtectedRoute>
                                <TSODashboard />
                              </ProtectedRoute>} />
                          <Route path="/ai-visibility-tracker" element={<ProtectedRoute>
                                <AIVisibilityTracker />
                              </ProtectedRoute>} />
                          <Route path="/zero-click-optimizer" element={<ProtectedRoute>
                                <ZeroClickOptimizer />
                              </ProtectedRoute>} />
                          <Route path="/technical-ai-readiness" element={<ProtectedRoute>
                                <TechnicalAIReadiness />
                              </ProtectedRoute>} />
                          <Route path="/intent-driven-research" element={<ProtectedRoute>
                                <IntentDrivenResearch />
                              </ProtectedRoute>} />
                          <Route path="/semantic-analyzer" element={<ProtectedRoute>
                                <SemanticAnalyzer />
                              </ProtectedRoute>} />
                          <Route path="/voice-search-optimizer" element={<ProtectedRoute>
                                <VoiceSearchOptimizer />
                              </ProtectedRoute>} />
                          <Route path="/authority-tracker" element={<ProtectedRoute>
                                <AuthorityTracker />
                              </ProtectedRoute>} />
                          <Route path="/competitive-ai-analysis" element={<ProtectedRoute>
                                <CompetitiveAIAnalysis />
                              </ProtectedRoute>} />
                          <Route path="/business-type-templates" element={<ProtectedRoute>
                                <BusinessTypeTemplates />
                              </ProtectedRoute>} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        </Suspense>
                    </div>
                  </SidebarInset>
                </div>
              </SidebarProvider>
            </BrowserRouter>
            </TooltipProvider>
          </DomainProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>;
}
export default App;