
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

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
