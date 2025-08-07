import { Toaster } from "@/components/ui/sonner";
import SkipLink from "@/components/SkipLink";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { DomainProvider } from "@/contexts/DomainContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import ContentGenerator from "./pages/ContentGenerator";
import ContentHistory from "./pages/ContentHistory";
import ContentAnalysis from "./pages/ContentAnalysis";
import ContentOptimizer from "./pages/ContentOptimizer";
import Resources from "./pages/Resources";
import SEOAnalysisSimple from "./pages/SEOAnalysisSimple";
import DomainAnalysis from "./pages/DomainAnalysis";
import SchemaAnalysis from "./pages/SchemaAnalysis";
import CitationChecker from "./pages/CitationChecker";
import AISitemap from "./pages/AISitemap";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import SchemaMarkupGuide from "./pages/SchemaMarkupGuide";
import Analysis from "./pages/Analysis";

// TSO Dashboard and Components
import TSODashboard from "./pages/TSODashboard";
import AIVisibilityTracker from "./components/TSO/AIVisibilityTracker";
import ZeroClickOptimizer from "./components/TSO/ZeroClickOptimizer";
import TechnicalAIReadiness from "./components/TSO/TechnicalAIReadiness";
import IntentDrivenResearch from "./components/TSO/IntentDrivenResearch";
import SemanticAnalyzer from "./components/TSO/SemanticAnalyzer";
import VoiceSearchOptimizer from "./components/TSO/VoiceSearchOptimizer";
import AuthorityTracker from "./components/TSO/AuthorityTracker";
import CompetitiveAIAnalysis from "./components/TSO/CompetitiveAIAnalysis";
import BusinessTypeTemplates from "./components/TSO/BusinessTypeTemplates";
import TSOOnboarding from "./pages/TSOOnboarding";
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
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/upgrade" element={<Upgrade />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/schema-markup-guide" element={<SchemaMarkupGuide />} />
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
                              <SEOAnalysisSimple />
                            </ProtectedRoute>} />
                        <Route path="/domain-analysis" element={<ProtectedRoute>
                              <DomainAnalysis />
                            </ProtectedRoute>} />
                        <Route path="/schema-analysis" element={<ProtectedRoute>
                              <SchemaAnalysis />
                            </ProtectedRoute>} />
                        <Route path="/citation-checker" element={<ProtectedRoute>
                              <CitationChecker />
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