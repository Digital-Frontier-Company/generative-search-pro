
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ContentGenerator from "./pages/ContentGenerator";
import ContentHistory from "./pages/ContentHistory";
import Admin from "./pages/Admin";
import { initializeOpenAIKey } from "./services/initializeOpenAI";
import { supabase } from '@/integrations/supabase/client';

// Configure the Supabase auth settings to handle redirects properly
supabase.auth.setSession({
  refresh_token: "",
  access_token: "",
  expires_in: -1,
  expires_at: -1,
  provider_token: null,
  provider_refresh_token: null,
});

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize OpenAI key for database functions
    initializeOpenAIKey()
      .then((success) => {
        if (success) {
          console.log('OpenAI API integration initialized successfully');
        }
      })
      .catch(error => {
        console.error('Failed to initialize OpenAI API:', error);
      });
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
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
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
