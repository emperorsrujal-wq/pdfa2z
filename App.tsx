import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { ToolType, PdfToolMode, ImageToolMode, VideoToolMode } from './types';
import { SEO, generateToolSchema } from './components/SEO';
import { TOOLS_REGISTRY } from './utils/seoData';
import { useTranslation } from 'react-i18next';

// ── Imports (Non-lazy for emergency stability) ───────────────────────────────
import { Home } from './pages/Home';
import { ToolSeoContent } from './components/ToolSeoContent';

const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Privacy = React.lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = React.lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const ImageGenerator = React.lazy(() => import('./components/ImageGenerator').then(m => ({ default: m.ImageGenerator })));
const ImageEditor = React.lazy(() => import('./components/ImageEditor').then(m => ({ default: m.ImageEditor })));
const PdfSuite = React.lazy(() => import('./components/PdfSuite').then(m => ({ default: m.PdfSuite })));
const ImageToolkit = React.lazy(() => import('./components/ImageToolkit').then(m => ({ default: m.ImageToolkit })));
const AiWriter = React.lazy(() => import('./components/AiWriter').then(m => ({ default: m.AiWriter })));
const VideoSuite = React.lazy(() => import('./components/VideoSuite').then(m => ({ default: m.VideoSuite })));
const Blog = React.lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogPost = React.lazy(() => import('./pages/BlogPost').then(m => ({ default: m.BlogPost })));
import { Breadcrumbs } from './components/Breadcrumbs';
import { ErrorBoundary } from './components/ErrorBoundary';
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const NotarizeApp = React.lazy(() => import('./pages/NotarizeApp').then(m => ({ default: m.NotarizeApp })));

export const SUPPORTED_LANGS = ['es', 'fr', 'hi'];

const ToolLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [activeTool, setActiveTool] = React.useState<ToolType>(ToolType.DASHBOARD);
  const [activePdfMode, setActivePdfMode] = React.useState<PdfToolMode>('MENU');
  const [activeImageMode, setActiveImageMode] = React.useState<ImageToolMode>('MENU');
  const [activeVideoMode, setActiveVideoMode] = React.useState<VideoToolMode>('DOWNLOAD');

  const pathParts = React.useMemo(() => location.pathname.split('/').filter(Boolean), [location.pathname]);
  
  const lang = React.useMemo(() => {
    const firstPart = pathParts[0];
    if (SUPPORTED_LANGS.includes(firstPart)) return firstPart;
    return 'en';
  }, [pathParts]);

  const slug = React.useMemo(() => {
    if (pathParts.length === 0) return '';
    const firstPart = pathParts[0];
    
    // If first part is a supported lang, the second part is the slug
    if (SUPPORTED_LANGS.includes(firstPart)) {
      return pathParts[1] || '';
    }
    
    // If first part is 'en' or 'en-US', strip it and look at second part
    if (['en', 'en-US'].includes(firstPart)) {
      return pathParts[1] || '';
    }
    
    // Otherwise, the first part is the slug
    return firstPart || '';
  }, [pathParts]);

  const blogSlug = React.useMemo(() => {
    const startIdx = SUPPORTED_LANGS.includes(pathParts[0]) ? 1 : 0;
    if (pathParts[startIdx] === 'blog') {
      return pathParts[startIdx + 1] || 'MENU';
    }
    return null;
  }, [pathParts]);

  const notarizeSubPath = React.useMemo(() => {
    const startIdx = SUPPORTED_LANGS.includes(pathParts[0]) ? 1 : 0;
    if (pathParts[startIdx] === 'notarize') {
      return pathParts.slice(startIdx + 1).join('/');
    }
    return '';
  }, [pathParts]);

  React.useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  React.useEffect(() => {
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
      return;
    }

    if (slug === 'ai-writer') {
      setActiveTool(ToolType.AI_WRITER);
      return;
    }

    if (slug === 'blog') {
      setActiveTool(ToolType.INFO_PAGE);
      return;
    }

    // Notarize landing page
    if (slug === 'notarize') {
      setActiveTool(ToolType.NOTARIZE);
      return;
    }

    // Known info pages
    if (['about', 'contact', 'privacy', 'terms'].includes(slug)) {
      setActiveTool(ToolType.INFO_PAGE);
      return;
    }

    // Unknown route - show 404
    if (slug !== '') {
      setActiveTool('NOT_FOUND' as ToolType);
    }
  }, [slug]);

  const seoData = React.useMemo(() => {
    const tool = Object.values(TOOLS_REGISTRY).find(t => t.slug === slug) || TOOLS_REGISTRY['home'];
    if (lang !== 'en' && tool.translations?.[lang]) {
      return { ...tool, ...tool.translations[lang] };
    }
    return tool;
  }, [slug, lang]);

  const breadcrumbItems = React.useMemo(() => {
    const items = [];
    if (slug) {
      items.push({ label: seoData.title, path: location.pathname });
    }
    return items;
  }, [slug, seoData, location.pathname]);

  const renderContent = () => {
    switch (activeTool) {
      case ToolType.NOTARIZE: return <NotarizeApp subPath={notarizeSubPath} />;
      case ToolType.DASHBOARD: return <Home />;
      case ToolType.IMAGE_GENERATOR: return <ImageGenerator />;
      case ToolType.IMAGE_EDITOR: return <ImageEditor />;
      case ToolType.PDF_SUITE:
        return <PdfSuite initialTab={activePdfMode === 'CHAT' ? 'CHAT' : 'TOOLS'} initialToolMode={activePdfMode} />;
      case ToolType.IMAGE_TOOLKIT:
        return <ImageToolkit initialMode={activeImageMode} />;
      case ToolType.VIDEO_SUITE:
        return <VideoSuite initialMode={activeVideoMode} />;
      case ToolType.AI_WRITER:
        return <AiWriter />;
      case ToolType.INFO_PAGE:
        if (slug === 'about') return <About />;
        if (slug === 'contact') return <Contact />;
        if (slug === 'privacy') return <Privacy />;
        if (slug === 'terms') return <Terms />;
        if (slug === 'blog') {
          if (blogSlug === 'MENU') return <Blog />;
          return <BlogPost />;
        }
        return <NotFound />;
      default: return <NotFound />;
    }
  };

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        canonical={location.pathname}
        schema={generateToolSchema(seoData)}
      />

      {/* Notarize page has its own full-page layout — render outside site shell */}
      {activeTool === ToolType.NOTARIZE ? (
        <React.Suspense fallback={<ToolLoader />}>
          <NotarizeApp subPath={notarizeSubPath} />
        </React.Suspense>
      ) : (
        <Layout currentLang={lang}>
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Breadcrumbs items={breadcrumbItems} />
              <div className="mt-8">
                <ErrorBoundary>
                  <React.Suspense fallback={<ToolLoader />}>
                    {renderContent()}
                  </React.Suspense>
                </ErrorBoundary>
              </div>
              <ToolSeoContent tool={seoData} />
            </div>
          </div>
        </Layout>
      )}

      {isAuthModalOpen && (
        <AuthModal
          defaultTab={authModalTab}
          onClose={closeAuthModal}
          onSuccess={closeAuthModal}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;