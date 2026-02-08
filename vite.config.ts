import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
// const cMapsDir = path.join(pdfjsDistPath, 'cmaps');

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'PDFA2Z Suite',
        short_name: 'PDFA2Z',
        description: 'All-in-one PDF and Image tools powered by AI',
        theme_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    viteStaticCopy({
      targets: [
        // {
        //   src: cMapsDir,
        //   dest: ''
        // },
        // {
        //   src: path.join(pdfjsDistPath, 'legacy', 'build', 'pdf.worker.min.js'),
        //   dest: ''
        // }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});