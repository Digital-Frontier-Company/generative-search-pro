import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "gsp-logo.png", "robots.txt"],
      manifest: {
        name: "GenerativeSearch.pro",
        short_name: "GSP",
        description: "AI & SEO optimization platform",
        theme_color: "#0d1117",
        background_color: "#0d1117",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/gsp-logo.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/gsp-logo.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
