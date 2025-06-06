
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ContentGenerator from "./pages/ContentGenerator";
import ContentHistory from "./pages/ContentHistory";
import SEOAnalysis from "./pages/SEOAnalysis";
import DomainAnalysis from "./pages/DomainAnalysis";
import SchemaAnalysis from "./pages/SchemaAnalysis";
import CitationChecker from "./pages/CitationChecker";
import AISitemap from "./pages/AISitemap";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/upgrade" element={<Upgrade />} />
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
                  path="/seo-analysis"
                  element={
                    <ProtectedRoute>
                      <SEOAnalysis />
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
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
