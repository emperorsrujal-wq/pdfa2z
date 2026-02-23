import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { ToolType, PdfToolMode, ImageToolMode, VideoToolMode } from './types';
import { SEO, generateToolSchema } from './components/SEO';
import { TOOLS_REGISTRY } from './utils/seoData';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';

// ── Eagerly loaded pages (tiny, always needed) ────────────────────────────────
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';

// ── Lazy-loaded heavy tool components ─────────────────────────────────────────
const ImageGenerator = React.lazy(() =>
  import('./components/ImageGenerator').then(m => ({ default: m.ImageGenerator }))
);
const ImageEditor = React.lazy(() =>
  import('./components/ImageEditor').then(m => ({ default: m.ImageEditor }))
);
const PdfSuite = React.lazy(() =>
  import('./components/PdfSuite').then(m => ({ default: m.PdfSuite }))
);
const ImageToolkit = React.lazy(() =>
  import('./components/ImageToolkit').then(m => ({ default: m.ImageToolkit }))
);
const AiWriter = React.lazy(() =>
  import('./components/AiWriter').then(m => ({ default: m.AiWriter }))
);
const VideoSuite = React.lazy(() =>
  import('./components/VideoSuite').then(m => ({ default: m.VideoSuite }))
);

// ── Other lazy components ──────────────────────────────────────────────────────
const ToolSeoContent = React.lazy(() =>
  import('./components/ToolSeoContent').then(m => ({ default: m.ToolSeoContent }))
);
const Breadcrumbs = React.lazy(() =>
  import('./components/Breadcrumbs').then(m => ({ default: m.Breadcrumbs }))
);

const SUPPORTED_LANGS = ['es', 'fr', 'hi'];

// Shared loading skeleton used by all lazy tool components
const ToolLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
  </div>
);

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [activePdfMode, setActivePdfMode] = useState<PdfToolMode>('MENU');
  const [activeImageMode, setActiveImageMode] = useState<ImageToolMode>('MENU');
  const [activeVideoMode, setActiveVideoMode] = useState<VideoToolMode>('DOWNLOAD');

  const pathParts = useMemo(() => location.pathname.split('/').filter(Boolean), [location.pathname]);
  const lang = useMemo(() => SUPPORTED_LANGS.includes(pathParts[0]) ? pathParts[0] : 'en', [pathParts]);
  const slug = useMemo(() => SUPPORTED_LANGS.includes(pathParts[0]) ? (pathParts[1] || '') : (pathParts[0] || ''), [pathParts]);

  // Sync i18n with URL
  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Sync state with URL path
  useEffect(() => {
    if (slug === '') {
      setActiveTool(ToolType.DASHBOARD);
      return;
    }

    const toolEntry = Object.values(TOOLS_REGISTRY).find(t => t.slug === slug);

    if (toolEntry) {
      setActiveTool(toolEntry.type);
      if (toolEntry.type === ToolType.PDF_SUITE && toolEntry.mode) {
        setActivePdfMode(toolEntry.mode as PdfToolMode);
      } else if (toolEntry.type === ToolType.IMAGE_TOOLKIT && toolEntry.mode) {
        setActiveImageMode(toolEntry.mode as ImageToolMode);
      } else if (toolEntry.type === ToolType.VIDEO_SUITE && toolEntry.mode) {
        setActiveVideoMode(toolEntry.mode as VideoToolMode);
      }
    } else {
      if (slug === 'ai-writer') setActiveTool(ToolType.AI_WRITER);
    }
  }, [slug]);

  const seoData = useMemo(() => {
    const tool = Object.values(TOOLS_REGISTRY).find(t => t.slug === slug) || TOOLS_REGISTRY['home'];
    if (lang !== 'en' && tool.translations?.[lang]) {
      return { ...tool, ...tool.translations[lang] };
    }
    return tool;
  }, [slug, lang]);

  const renderContent = () => {
    switch (activeTool) {
      case ToolType.DASHBOARD: return <Home />;
      case ToolType.IMAGE_GENERATOR:
        return <Suspense fallback={<ToolLoader />}><ImageGenerator /></Suspense>;
      case ToolType.IMAGE_EDITOR:
        return <Suspense fallback={<ToolLoader />}><ImageEditor /></Suspense>;
      case ToolType.PDF_SUITE:
        return (
          <Suspense fallback={<ToolLoader />}>
            <PdfSuite initialTab={activePdfMode === 'CHAT' ? 'CHAT' : 'TOOLS'} initialToolMode={activePdfMode} />
          </Suspense>
        );
      case ToolType.IMAGE_TOOLKIT:
        return <Suspense fallback={<ToolLoader />}><ImageToolkit initialMode={activeImageMode} /></Suspense>;
      case ToolType.VIDEO_SUITE:
        return <Suspense fallback={<ToolLoader />}><VideoSuite initialMode={activeVideoMode} /></Suspense>;
      case ToolType.AI_WRITER:
        return <Suspense fallback={<ToolLoader />}><AiWriter /></Suspense>;
      case ToolType.INFO_PAGE:
        switch (slug) {
          case 'about': return <About />;
          case 'contact': return <Contact />;
          case 'privacy': return <Privacy />;
          case 'terms': return <Terms />;
          default: return <Home />;
        }
      default: return <Home />;
    }
  };

  return (
    <HelmetProvider>
      {activeTool !== ToolType.DASHBOARD && (
        <SEO
          title={seoData?.title || 'PDF A2Z'}
          description={seoData?.description || ''}
          canonical={seoData?.slug ? `/${seoData.slug}` : ''}
          schema={seoData ? generateToolSchema(seoData) : undefined}
          parentSlug={seoData?.parentSlug}
          currentLang={lang}
          tool={seoData}
        />
      )}

      {needRefresh && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-blue-600 text-white rounded-lg shadow-lg flex items-center gap-4">
          <span>New version available!</span>
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-3 py-1 bg-white text-blue-600 rounded hover:bg-blue-50 font-medium text-sm"
          >
            Update
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="ml-2 text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <Layout currentLang={lang}>
        <div className={activeTool !== ToolType.DASHBOARD ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" : ""}>
          {activeTool !== ToolType.DASHBOARD && seoData && seoData.slug !== '' && (
            <Suspense fallback={<div className="h-6 w-48 bg-slate-100 animate-pulse rounded mb-6" />}>
              <Breadcrumbs items={[{ label: seoData?.h1 || '' }]} />
            </Suspense>
          )}

          {renderContent()}

          {activeTool !== ToolType.DASHBOARD && seoData && seoData.slug !== '' && (
            <Suspense fallback={<div className="h-96 w-full bg-slate-50 animate-pulse rounded-3xl mt-12" />}>
              <ToolSeoContent tool={seoData} />
            </Suspense>
          )}
        </div>
      </Layout>
    </HelmetProvider>
  );
};

export default App;