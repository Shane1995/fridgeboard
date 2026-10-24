import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const ENAMEL = '#F4F6F3';
const TOMATO = '#E2462F';

const LOCAL_API = 'http://127.0.0.1:3001';

export default defineConfig({
  define: { __BUILD_SHA__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev') },
  server: process.env.DEV_LOCAL
    ? { proxy: { '/api': LOCAL_API, '/configuration.json': LOCAL_API } }
    : {},
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      generatedRouteTree: './src/app/router/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: { navigateFallbackDenylist: [/^\/api\//, /^\/configuration\.json$/] },
      manifest: {
        name: 'Fridgeboard',
        short_name: 'Fridgeboard',
        description: 'Shared shopping list and shifts for the household',
        theme_color: TOMATO,
        background_color: ENAMEL,
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
