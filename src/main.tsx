
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

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
