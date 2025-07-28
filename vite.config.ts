import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Optimize vendor chunk splitting
    splitVendorChunkPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "gsp-logo.png", "robots.txt"],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
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
  build: {
    // Optimize build output
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form'],
          'date-vendor': ['date-fns'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Feature chunks based on actual components
          'seo-tools': [
            './src/components/SEOAnalyzer',
            './src/components/AIAudit',
            './src/components/AIVisibilityScore'
          ],
          'citation-tools': [
            './src/components/CitationChecker',
            './src/components/CitationMonitoringDashboard'
          ],
          'content-tools': [
            './src/components/ContentQualityAnalyzer',
            './src/components/ContentSearch'
          ],
          'auth-security': [
            './src/lib/security',
            './src/lib/secureApiClient',
            './src/lib/errorHandler'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable source maps for better debugging (only in dev)
    sourcemap: mode === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: command === 'build',
        drop_debugger: command === 'build',
        pure_funcs: command === 'build' ? ['console.log', 'console.debug'] : [],
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      '@supabase/supabase-js'
    ],
    exclude: [
      // Exclude large libraries that should be loaded dynamically
      'recharts'
    ]
  },
  // Performance hints
  esbuild: {
    // Remove console.log in production
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
}));
