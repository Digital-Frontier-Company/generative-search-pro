
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandlers } from "./lib/errorHandler";
import { setupCSP } from "./lib/security";
// Performance optimizations removed for simplicity
import { bundleOptimizer } from "./lib/bundleOptimizer";

// Initialize security features
setupGlobalErrorHandlers();
setupCSP();

// Performance optimizations - lazy loading handled by React.lazy

// Preconnect to external domains
bundleOptimizer.preconnectDomains([
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://api.openai.com',
  'https://serpapi.com',
  'https://*.supabase.co'
]);

// Optimize cache
bundleOptimizer.optimizeCache();

// Register service worker for PWA (optional in dev)
// Avoid top-level await for es2020 target
// @ts-expect-error virtual module provided by vite-plugin-pwa
import('virtual:pwa-register')
  .then(({ registerSW }) => {
    try {
      registerSW({ immediate: true });
    } catch {}
  })
  .catch(() => {
    // ignore when plugin not active
  });

// Initialize analytics
import { useAnalytics } from "./hooks/useAnalytics";

function AppWithAnalytics() {
  useAnalytics();
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <AppWithAnalytics />
    </HelmetProvider>
  </StrictMode>
);
