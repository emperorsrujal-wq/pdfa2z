import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageEditor } from './components/ImageEditor';
import { PdfSuite } from './components/PdfSuite';
import { ImageToolkit } from './components/ImageToolkit';
import { AiWriter } from './components/AiWriter';
import { VideoSuite } from './components/VideoSuite';
import { ToolType, PdfToolMode, ImageToolMode, VideoToolMode } from './types';
import { SEO, generateToolSchema } from './components/SEO';
import { ToolSeoContent } from './components/ToolSeoContent';
import { TOOLS_REGISTRY } from './utils/seoData';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [activePdfMode, setActivePdfMode] = useState<PdfToolMode>('MENU');
  const [activeImageMode, setActiveImageMode] = useState<ImageToolMode>('MENU');
  const [activeVideoMode, setActiveVideoMode] = useState<VideoToolMode>('DOWNLOAD');

  // Sync state with URL path
  useEffect(() => {
    const slug = location.pathname.split('/')[1] || '';
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
      // Handle routes that might not be in registry yet explicitly if needed
      if (slug === 'ai-writer') setActiveTool(ToolType.AI_WRITER);
    }
  }, [location.pathname]);

  const seoData = useMemo(() => {
    const slug = location.pathname.split('/')[1] || '';
    return Object.values(TOOLS_REGISTRY).find(t => t.slug === slug) || TOOLS_REGISTRY['home'];
  }, [location.pathname]);

  const renderContent = () => {
    switch (activeTool) {
      case ToolType.DASHBOARD: return <Home />;
      case ToolType.IMAGE_GENERATOR: return <ImageGenerator />;
      case ToolType.IMAGE_EDITOR: return <ImageEditor />;
      case ToolType.PDF_SUITE: return <PdfSuite initialTab={activePdfMode === 'CHAT' ? 'CHAT' : 'TOOLS'} initialToolMode={activePdfMode} />;
      case ToolType.IMAGE_TOOLKIT: return <ImageToolkit initialMode={activeImageMode} />;
      case ToolType.VIDEO_SUITE: return <VideoSuite initialMode={activeVideoMode} />;
      case ToolType.AI_WRITER: return <AiWriter />;
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
        />
      )}

      <Layout>
        <div className={activeTool !== ToolType.DASHBOARD ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" : ""}>
          {renderContent()}

          {activeTool !== ToolType.DASHBOARD && seoData && (
            <ToolSeoContent tool={seoData} />
          )}
        </div>
      </Layout>
    </HelmetProvider>
  );
};

export default App;