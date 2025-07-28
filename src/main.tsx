
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandlers } from "./lib/errorHandler";
import { setupCSP } from "./lib/security";
import { preloadCriticalRoutes } from "./routes/lazyRoutes";
import { bundleOptimizer } from "./lib/bundleOptimizer";

// Initialize security features
setupGlobalErrorHandlers();
setupCSP();

// Initialize performance optimizations
preloadCriticalRoutes();

// Preconnect to external domains
bundleOptimizer.preconnectDomains([
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://api.openai.com',
  'https://serpapi.com'
]);

// Optimize cache
bundleOptimizer.optimizeCache();

// Register service worker for PWA
// @ts-expect-error virtual module provided by vite-plugin-pwa
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

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
