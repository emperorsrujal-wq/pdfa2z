import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './i18n';
import { ThemeProvider } from './components/ThemeContext.tsx';

// --- Polyfills and Guards (Replaced manual HTML scripts) ---
try {
  if (typeof window.global === 'undefined') {
    (window as any).global = window;
  }

  if (typeof window.process === 'undefined') {
    (window as any).process = {
      env: { API_KEY: "" },
      browser: true,
      version: '',
      nextTick: (cb: any) => setTimeout(cb, 0)
    };
  }

  if (typeof window.Buffer === 'undefined') {
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
  }
} catch (e) {
  console.warn("Global polyfills failed to initialize (possibly due to SES lockdown):", e);
}

if (typeof (window as any).aistudio === 'undefined') {
  (window as any).aistudio = {
    hasSelectedApiKey: async () => false,
    openSelectKey: async () => {
      alert("In a production environment, this would open the Google AI Studio key selection dialog.");
    }
  };
}
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

  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    const root = createRoot(container);
    root.render(app);
  }
}