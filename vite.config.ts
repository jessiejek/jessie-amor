import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.png",
          "apple-touch-icon.png",
          "icon-192.png",
          "icon-512.png",
          "day12-kl-skyline.png",
          "day13-batu-caves.png",
          "day13-saloma-bridge.png",
        ],
        workbox: {
          globPatterns: ["**/*.{js,css,html,woff2,ico}"],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*tabler.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "tabler-icons",
                expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "map-tiles",
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
          ],
        },
        manifest: {
          name: "Jessie & Amor's Malaysia Singapore",
          short_name: "Jessie & Amor",
          description: "Travel itinerary, budget, map, and checklist for Jessie and Amor's Malaysia and Singapore trip.",
          theme_color: "#0B3530",
          background_color: "#F8FAFC",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
