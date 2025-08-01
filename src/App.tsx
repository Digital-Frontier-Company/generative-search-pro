
import { Toaster } from "@/components/ui/sonner";
import SkipLink from "@/components/SkipLink";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { DomainProvider } from "@/contexts/DomainContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import AEOGuide from "./pages/AEOGuide";
import SchemaMarkupGuide from "./pages/SchemaMarkupGuide";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SkipLink />
      <AuthProvider>
        <SubscriptionProvider>
          <DomainProvider>
            <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/aeo-guide" element={<AEOGuide />} />
                <Route path="/schema-markup-guide" element={<SchemaMarkupGuide />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generator"
                  element={
                    <ProtectedRoute>
                      <ContentGenerator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <ContentHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/content-analysis"
                  element={
                    <ProtectedRoute>
                      <ContentAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seo-analysis"
                  element={
                    <ProtectedRoute>
                      <SEOAnalysisSimple />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/domain-analysis"
                  element={
                    <ProtectedRoute>
                      <DomainAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schema-analysis"
                  element={
                    <ProtectedRoute>
                      <SchemaAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citation-checker"
                  element={
                    <ProtectedRoute>
                      <CitationChecker />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-sitemap"
                  element={
                    <ProtectedRoute>
                      <AISitemap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </DomainProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
