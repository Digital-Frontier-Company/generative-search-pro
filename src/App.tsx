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
import * as LazyRoutes from "@/routes/lazyRoutes";
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
                          <Route path="/" element={<LazyRoutes.Index />} />
                          <Route path="/auth" element={<LazyRoutes.Auth />} />
                          <Route path="/about" element={<LazyRoutes.About />} />
                          <Route path="/upgrade" element={<LazyRoutes.Upgrade />} />
                          <Route path="/resources" element={<LazyRoutes.Resources />} />
                          {/* Public marketplace landing pages */}
                          <Route path="/brands" element={<LazyRoutes.Brands />} />
                          <Route path="/influencers" element={<LazyRoutes.Influencers />} />
                          <Route path="/analysis" element={<ProtectedRoute>
                                <LazyRoutes.SEOAnalysis />
                              </ProtectedRoute>} />
                          <Route path="/dashboard" element={<ProtectedRoute>
                                <LazyRoutes.Dashboard />
                              </ProtectedRoute>} />
                          <Route path="/generator" element={<ProtectedRoute>
                                <LazyRoutes.ContentGenerator />
                              </ProtectedRoute>} />
                          <Route path="/history" element={<ProtectedRoute>
                                <LazyRoutes.ContentHistory />
                              </ProtectedRoute>} />
                          <Route path="/content-analysis" element={<ProtectedRoute>
                                <LazyRoutes.ContentAnalysis />
                              </ProtectedRoute>} />
                          <Route path="/seo-analysis" element={<ProtectedRoute>
                                <LazyRoutes.SEOAnalysis />
                              </ProtectedRoute>} />
                          <Route path="/domain-analysis" element={<ProtectedRoute>
                                <LazyRoutes.DomainAnalysis />
                              </ProtectedRoute>} />
                          <Route path="/schema-analysis" element={<ProtectedRoute>
                                <LazyRoutes.SchemaAnalysis />
                              </ProtectedRoute>} />
                          <Route path="/citation-checker" element={<ProtectedRoute>
                                <LazyRoutes.CitationChecker />
                              </ProtectedRoute>} />
                          <Route path="/ai-sitemap" element={<ProtectedRoute>
                                <LazyRoutes.AISitemap />
                              </ProtectedRoute>} />
                          <Route path="/settings" element={<ProtectedRoute>
                                <LazyRoutes.Settings />
                              </ProtectedRoute>} />
                          <Route path="/admin" element={<ProtectedRoute>
                                <LazyRoutes.Admin />
                              </ProtectedRoute>} />
                          {/* TSO Dashboard and Tools */}
                          <Route path="/tso-onboarding" element={<ProtectedRoute>
                                <LazyRoutes.TSOOnboarding />
                              </ProtectedRoute>} />
                          <Route path="/tso-dashboard" element={<ProtectedRoute>
                                <LazyRoutes.TSODashboard />
                              </ProtectedRoute>} />
                          <Route path="/ai-visibility-tracker" element={<ProtectedRoute>
                                <LazyRoutes.AIVisibilityTracker />
                              </ProtectedRoute>} />
                          <Route path="/zero-click-optimizer" element={<ProtectedRoute>
                                <LazyRoutes.ZeroClickOptimizer />
                              </ProtectedRoute>} />
                          <Route path="/technical-ai-readiness" element={<ProtectedRoute>
                                <LazyRoutes.TechnicalAIReadiness />
                              </ProtectedRoute>} />
                          <Route path="/intent-driven-research" element={<ProtectedRoute>
                                <LazyRoutes.IntentDrivenResearch />
                              </ProtectedRoute>} />
                          <Route path="/semantic-analyzer" element={<ProtectedRoute>
                                <LazyRoutes.SemanticAnalyzer />
                              </ProtectedRoute>} />
                          <Route path="/voice-search-optimizer" element={<ProtectedRoute>
                                <LazyRoutes.VoiceSearchOptimizer />
                              </ProtectedRoute>} />
                          <Route path="/authority-tracker" element={<ProtectedRoute>
                                <LazyRoutes.AuthorityTracker />
                              </ProtectedRoute>} />
                          <Route path="/competitive-ai-analysis" element={<ProtectedRoute>
                                <LazyRoutes.CompetitiveAIAnalysis />
                              </ProtectedRoute>} />
                          <Route path="/business-type-templates" element={<ProtectedRoute>
                                <LazyRoutes.BusinessTypeTemplates />
                              </ProtectedRoute>} />
                          <Route path="*" element={<LazyRoutes.NotFound />} />
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