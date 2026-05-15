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
          if (id.includes('node_modules')) {
            if (/react|react-dom|react-router|react-helmet|react-i18next/.test(id)) return 'vendor-react';
            if (/pdf-lib|pdfjs-dist/.test(id)) return 'vendor-pdf';
            if (/firebase/.test(id)) return 'vendor-firebase';
            if (/docx|exceljs|pptxgenjs|jszip/.test(id)) return 'vendor-office';
            if (/@google\/genai/.test(id)) return 'vendor-ai';
            if (/tesseract/.test(id)) return 'vendor-ocr';
            if (/lucide-react/.test(id)) return 'vendor-icons';
            if (/i18next/.test(id)) return 'vendor-i18n';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdf-lib']
  }
});