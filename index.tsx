import * as React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './i18n';
import { ThemeProvider } from './components/ThemeContext.tsx';

// --- Polyfills and Guards (Replaced manual HTML scripts) ---
/**
 * Hardened polyfill attempts to handle restricted environments like SES.
 */
const initPolyfills = () => {
  try {
    // Check if we are in a locked-down environment
    const isLockedDown = typeof (window as any).lockdown === 'function';
    if (isLockedDown) {
      console.log("PDFA2Z: Environment is locked down via SES. Using restricted polyfill mode.");
    }

    if (typeof window.global === 'undefined') {
      try {
        (window as any).global = window;
      } catch (e) {
        console.warn("Could not set window.global");
      }
    }

    if (typeof window.process === 'undefined') {
      try {
        (window as any).process = {
          env: { API_KEY: "" },
          browser: true,
          version: '',
          nextTick: (cb: any) => setTimeout(cb, 0)
        };
      } catch (e) {
        console.warn("Could not set window.process");
      }
    }

    if (typeof window.Buffer === 'undefined') {
      try {
        (window as any).Buffer = {
          isBuffer: (obj: any) => obj instanceof Uint8Array || (obj && obj._isBuffer),
          from: (data: any) => {
            if (typeof data === 'string') return new TextEncoder().encode(data);
            if (data instanceof ArrayBuffer) return new Uint8Array(data);
            return new Uint8Array(data);
          },
          alloc: (size: number) => new Uint8Array(size),
          byteLength: (s: any) => (typeof s === 'string' ? new TextEncoder().encode(s).length : s.length)
        };
      } catch (e) {
        console.warn("Could not set window.Buffer");
      }
    }

    if (typeof (window as any).aistudio === 'undefined') {
      try {
        (window as any).aistudio = {
          hasSelectedApiKey: async () => false,
          openSelectKey: async () => {
            alert("In a production environment, this would open the Google AI Studio key selection dialog.");
          }
        };
      } catch (e) {
        console.warn("Could not set window.aistudio");
      }
    }
  } catch (err) {
    console.error("PDFA2Z: Critical error during polyfill initialization:", err);
  }
};

initPolyfills();
// -----------------------------------------------------------

const container = document.getElementById('root');
if (container) {
  const app = (
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );

  const root = createRoot(container);
  root.render(app);
}