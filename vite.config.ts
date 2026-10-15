/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { handlePdfRequest } from './proxy/pdfProxy.ts'

/** Serves the PDF proxy at /pdf/PMCxxxx during `npm run dev` and `npm run preview`. */
function pdfProxy(): Plugin {
  const middleware = async (req: { url?: string }, res: import('node:http').ServerResponse, next: () => void) => {
    if (!req.url?.startsWith('/pdf/')) return next()
    try {
      const r = await handlePdfRequest(new URL(req.url, 'http://x').pathname)
      res.statusCode = r.status
      r.headers.forEach((v, k) => res.setHeader(k, v))
      res.end(Buffer.from(await r.arrayBuffer()))
    } catch (e) {
      res.statusCode = 502
      res.end(String(e))
    }
  }
  return {
    name: 'pdf-proxy',
    configureServer: (s) => void s.middlewares.use(middleware),
    configurePreviewServer: (s) => void s.middlewares.use(middleware),
  }
}

export default defineConfig({
  // Relative base so the build works from any sub-path (e.g. GitHub Pages).
  base: './',
  plugins: [
    react(),
    pdfProxy(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'OMFS Reader',
        short_name: 'OMFS Reader',
        description: 'Rekindling the reading habit, one paper at a time. Free OMFS research from PubMed, Europe PMC and Crossref.',
        id: './',
        scope: './',
        categories: ['education', 'medical', 'books'],
        theme_color: '#0f3b5f',
        background_color: '#f4f7fa',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        // App shell plus the Latin font files, so the installed app looks the same offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}', 'assets/*-latin-*.woff2', 'assets/*-latin-ext-*.woff2'],
        runtimeCaching: [
          {
            // API responses: fresh when online, cached copy when offline.
            urlPattern: /^https:\/\/(eutils\.ncbi\.nlm\.nih\.gov|www\.ebi\.ac\.uk|api\.crossref\.org)\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 300, maxAgeSeconds: 7 * 86400 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
