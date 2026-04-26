import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));
const workerPath = normalizePath(path.join(pdfjsDistPath, 'build', 'pdf.worker.min.js'));

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: cMapsDir, dest: 'assets' },
        { src: workerPath, dest: 'assets' }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Firebase (~520 kB)
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }
          // i18next locale helpers (~75 kB)
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n';
          }
          // Lucide icons (~250 kB)
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Google Gemini AI SDK
          if (id.includes('node_modules/@google/genai') || id.includes('node_modules/@google/generative-ai')) {
            return 'gemini';
          }
          // PDF processing libraries
          if (id.includes('node_modules/pdf-lib')) {
            return 'pdf-lib';
          }
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs';
          }
          // OCR
          if (id.includes('node_modules/tesseract.js') || id.includes('node_modules/tesseract-wasm')) {
            return 'ocr';
          }
          // Office document conversion
          if (
            id.includes('node_modules/docx') ||
            id.includes('node_modules/exceljs') ||
            id.includes('node_modules/pptxgenjs')
          ) {
            return 'office-convert';
          }
          // Compression / zip
          if (id.includes('node_modules/jszip') || id.includes('node_modules/fflate')) {
            return 'zip';
          }
          // Stripe
          if (id.includes('node_modules/@stripe')) {
            return 'stripe';
          }
          // React and router stay in the main bundle — splitting React causes useState binding issues
        },
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdf-lib']
  }
});