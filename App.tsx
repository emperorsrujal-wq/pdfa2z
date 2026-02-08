import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Layers, Scissors, Zap, Image as ImageIcon, 
  Menu, X, Search, ArrowLeft, Sparkles, PenTool, Edit3, Wand2,
  FileText, Star, LayoutGrid, Download, Video
} from 'lucide-react';
import { ImageGenerator } from './components/ImageGenerator.tsx';
import { ImageEditor } from './components/ImageEditor.tsx';
import { PdfSuite } from './components/PdfSuite.tsx';
import { ImageToolkit } from './components/ImageToolkit.tsx';
import { AiWriter } from './components/AiWriter.tsx';
import { VideoSuite } from './components/VideoSuite.tsx';
import { ToolType, PdfToolMode, ImageToolMode, VideoToolMode } from './types.ts';
import { ToolCard } from './components/ToolCard.tsx';
import { SEO, generateToolSchema } from './components/SEO.tsx';
import { ToolSeoContent } from './components/ToolSeoContent.tsx';
import { TOOLS_REGISTRY } from './utils/seoData.ts';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [activePdfMode, setActivePdfMode] = useState<PdfToolMode>('MENU');
  const [activeImageMode, setActiveImageMode] = useState<ImageToolMode>('MENU');
  const [activeVideoMode, setActiveVideoMode] = useState<VideoToolMode>('DOWNLOAD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    }
  }, [location.pathname]);

  const navigateToTool = (tool: ToolType, subMode?: any) => {
    let slug = '';
    if (tool === ToolType.DASHBOARD) {
      slug = '';
    } else {
      const entry = Object.values(TOOLS_REGISTRY).find(t => {
        if (t.type !== tool) return false;
        if (tool === ToolType.PDF_SUITE) return t.mode === (subMode || 'MENU');
        if (tool === ToolType.IMAGE_TOOLKIT) return t.mode === (subMode || 'MENU');
        if (tool === ToolType.VIDEO_SUITE) return t.mode === (subMode || 'DOWNLOAD');
        return true;
      });
      slug = entry?.slug || '';
    }

    navigate(`/${slug}`);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const seoData = useMemo(() => {
    const slug = location.pathname.split('/')[1] || '';
    return Object.values(TOOLS_REGISTRY).find(t => t.slug === slug) || TOOLS_REGISTRY['home'];
  }, [location.pathname]);

  const renderContent = () => {
    switch (activeTool) {
      case ToolType.IMAGE_GENERATOR: return <ImageGenerator />;
      case ToolType.IMAGE_EDITOR: return <ImageEditor />;
      case ToolType.PDF_SUITE: return <PdfSuite initialTab={activePdfMode === 'CHAT' ? 'CHAT' : 'TOOLS'} initialToolMode={activePdfMode} />;
      case ToolType.IMAGE_TOOLKIT: return <ImageToolkit initialMode={activeImageMode} />;
      case ToolType.VIDEO_SUITE: return <VideoSuite initialMode={activeVideoMode} />;
      case ToolType.AI_WRITER: return <AiWriter />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="animate-fade-in pb-20">
      <div className="bg-gradient-to-b from-indigo-50/50 to-white pt-20 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Everything for <span className="text-indigo-600">PDF & Media</span>.
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          All the tools you need to be more productive. Free. No Sign-up. No Limits.
        </p>
        <div className="max-w-xl mx-auto relative group mb-12">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search size={22} />
          </div>
          <input 
            type="text" 
            className="block w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-full text-lg shadow-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
            placeholder="Search for tools..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="text-yellow-500 fill-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-slate-900">Popular Tools</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <ToolCard title="Video Downloader" description="Save videos from YT, FB, TikTok." icon={<Download />} colorClass="bg-rose-600 text-white" onClick={() => navigateToTool(ToolType.VIDEO_SUITE, 'DOWNLOAD')} popular />
            <ToolCard title="Merge PDF" description="Combine multiple PDFs into one document." icon={<Layers />} colorClass="bg-indigo-600 text-white" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'MERGE')} />
            <ToolCard title="Remove BG" description="Remove image backgrounds with AI." icon={<Edit3 />} colorClass="bg-teal-600 text-white" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'REMOVE_BG')} />
            <ToolCard title="Compress PDF" description="Reduce PDF file size efficiently." icon={<Zap />} colorClass="bg-indigo-600 text-white" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'COMPRESS')} />
            <ToolCard title="AI Image Gen" description="Create stunning images from text." icon={<Wand2 />} colorClass="bg-purple-600 text-white" onClick={() => navigateToTool(ToolType.IMAGE_GENERATOR)} />
          </div>
        </section>
      </div>
    </div>
  );

  const menuItems = [
    { id: ToolType.DASHBOARD, label: 'Home', icon: <LayoutGrid size={20} /> },
    { id: ToolType.PDF_SUITE, label: 'PDF Tools', icon: <FileText size={20} /> },
    { id: ToolType.IMAGE_TOOLKIT, label: 'Image Tools', icon: <ImageIcon size={20} /> },
    { id: ToolType.VIDEO_SUITE, label: 'Video Studio', icon: <Video size={20} /> },
    { id: ToolType.AI_WRITER, label: 'AI Writer', icon: <PenTool size={20} /> },
  ];

  return (
    <>
      <SEO 
        title={seoData.title} 
        description={seoData.description} 
        canonical={seoData.slug ? `/${seoData.slug}` : ''}
        schema={generateToolSchema(seoData)}
      />
      <div className="flex h-screen bg-white font-sans overflow-hidden">
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="bg-white border-b border-slate-100 h-16 px-4 flex items-center justify-between z-10">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToTool(ToolType.DASHBOARD)}>
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm"><Sparkles size={16} /></div>
               <span className="text-xl font-black text-slate-900 tracking-tight">PDFA2Z</span>
             </div>
             <div className="hidden md:flex items-center gap-6">
               {menuItems.map(item => (
                 <button 
                   key={item.id} 
                   onClick={() => navigateToTool(item.id)}
                   className={`text-sm font-bold transition-colors ${activeTool === item.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                 >
                   {item.label}
                 </button>
               ))}
             </div>
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-900 md:hidden"><Menu size={24} /></button>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar">
             <div className={activeTool !== ToolType.DASHBOARD ? "max-w-6xl mx-auto p-4 md:p-8" : ""}>
               {activeTool !== ToolType.DASHBOARD && (
                 <button onClick={() => navigateToTool(ToolType.DASHBOARD)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back home
                 </button>
               )}
               {renderContent()}
               <ToolSeoContent tool={seoData} />
             </div>
          </main>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-[100] p-6 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2"><Sparkles size={24} className="text-indigo-600" /><span className="text-xl font-black">PDFA2Z</span></div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X size={24} /></button>
            </div>
            <nav className="space-y-4">
              {menuItems.map(item => (
                <button key={item.id} onClick={() => navigateToTool(item.id)} className="w-full text-left p-4 bg-slate-50 rounded-xl font-bold flex items-center gap-3">
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

export default App;