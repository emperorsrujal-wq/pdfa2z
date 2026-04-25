import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, Layers, Zap, Edit3, Wand2, FileText,
  Image as LucideImage, Video, PenTool, Scissors, Sparkles,
  BookOpen, ArrowRight, ShieldCheck, Lock, Clock, Globe2,
  ChevronRight, TrendingUp
} from 'lucide-react';
import { ToolCard } from '../components/ToolCard';
import { ToolType } from '../types';
import { SEO } from '../components/SEO';
import { TOOLS_REGISTRY } from '../utils/seoData';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from '../App';

// ── Floating stat badge ──────────────────────────────────
const StatBadge: React.FC<{ icon: React.ReactNode; label: string; delay?: number }> = ({ icon, label, delay = 0 }) => (
  <div
    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-full text-xs font-semibold text-slate-600 shadow-sm animate-float"
    style={{ animationDelay: `${delay}s` }}
  >
    {icon}
    {label}
  </div>
);

// ── Section header ───────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; accent: string }> = ({ icon, title, accent }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className={`w-1 h-8 ${accent} rounded-full`} />
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">{icon}</div>
      <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
  </div>
);

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);

  const navigateToTool = (tool: ToolType, subMode?: any) => {
    const entry = Object.values(TOOLS_REGISTRY).find(t => {
      if (t.type !== tool) return false;
      if (tool === ToolType.PDF_SUITE) return t.mode === (subMode || 'MENU');
      if (tool === ToolType.IMAGE_TOOLKIT) return t.mode === (subMode || 'MENU');
      if (tool === ToolType.VIDEO_SUITE) return t.mode === (subMode || 'DOWNLOAD');
      return true;
    }) || Object.values(TOOLS_REGISTRY).find(t => t.type === tool);

    if (entry) {
      const currentLang = i18n.language.split('-')[0];
      const langPrefix = SUPPORTED_LANGS.includes(currentLang) ? `/${currentLang}` : '';
      navigate(`${langPrefix}/${entry.slug}`);
    } else if (tool === ToolType.AI_WRITER) {
      const currentLang = i18n.language.split('-')[0];
      const langPrefix = SUPPORTED_LANGS.includes(currentLang) ? `/${currentLang}` : '';
      navigate(`${langPrefix}/ai-writer`);
    }
    window.scrollTo(0, 0);
  };

  const seoData = TOOLS_REGISTRY['home'];
  const localizedSeoData = i18n.language !== 'en' && seoData.translations?.[i18n.language]
    ? { ...seoData, ...seoData.translations[i18n.language] }
    : seoData;

  const getLocalizedTool = (tool: any) =>
    i18n.language !== 'en' && tool.translations?.[i18n.language]
      ? { ...tool, ...tool.translations[i18n.language] }
      : tool;

  const getIcon = (slug: string) => {
    const map: Record<string, React.ReactNode> = {
      'merge-pdf': <Layers size={20} />,
      'split-pdf': <Scissors size={20} />,
      'compress-pdf': <Zap size={20} />,
      'pdf-to-word': <FileText size={20} />,
      'pdf-to-excel': <FileText size={20} />,
      'pdf-to-ppt': <FileText size={20} />,
      'pdf-to-text': <FileText size={20} />,
      'pdf-chat': <Sparkles size={20} />,
      'protect-pdf': <Lock size={20} />,
      'unlock-pdf': <Lock size={20} />,
      'sign-pdf': <PenTool size={20} />,
      'rotate-pdf': <Layers size={20} />,
      'delete-pages': <FileText size={20} />,
      'page-numbers': <FileText size={20} />,
      'watermark-pdf': <FileText size={20} />,
      'remove-bg': <Edit3 size={20} />,
      'resize-image': <LucideImage size={20} />,
      'compress-image': <Zap size={20} />,
      'convert-image': <Zap size={20} />,
      'crop-image': <LucideImage size={20} />,
      'upscale-image': <Wand2 size={20} />,
      'face-blur': <LucideImage size={20} />,
      'round-image': <Scissors size={20} />,
      'passport-photo': <LucideImage size={20} />,
      'collage-maker': <LucideImage size={20} />,
      'meme-maker': <Edit3 size={20} />,
      'ai-writer': <PenTool size={20} />,
      'ai-image-generator': <Wand2 size={20} />,
      'magic-ai-editor': <Sparkles size={20} />,
      'notarize': <ShieldCheck size={20} />,
      'journey-builder': <Sparkles size={20} />,
      'video-downloader': <Video size={20} />,
    };
    return map[slug] || <Zap size={20} />;
  };

  const getColorClass = (slug: string) => {
    if (slug === 'merge-pdf') return 'bg-blue-600 text-white';
    if (slug === 'compress-pdf') return 'bg-emerald-600 text-white';
    if (slug === 'remove-bg') return 'bg-purple-600 text-white';
    if (slug === 'ai-image-generator') return 'bg-pink-600 text-white';
    if (slug === 'magic-ai-editor') return 'bg-violet-600 text-white';
    if (slug === 'split-pdf') return 'bg-orange-500 text-white';
    if (slug === 'pdf-chat') return 'bg-purple-500 text-white';
    if (slug === 'notarize') return 'bg-[#185FA5] text-white';
    if (slug === 'sign-pdf') return 'bg-blue-700 text-white';
    if (slug === 'journey-builder') return 'bg-indigo-600 text-white';
    if (slug === 'ai-writer') return 'bg-rose-600 text-white';
    if (slug.includes('pdf')) return 'bg-blue-500 text-white';
    if (slug.includes('image')) return 'bg-violet-500 text-white';
    return 'bg-slate-600 text-white';
  };

  const allTools = Object.values(TOOLS_REGISTRY).filter(t => t.slug !== '' && t.slug !== 'home');
  const filteredTools = allTools.filter(tool => {
    const localTool = getLocalizedTool(tool);
    const term = searchQuery.toLowerCase();
    return (
      localTool.title.toLowerCase().includes(term) ||
      localTool.description.toLowerCase().includes(term) ||
      (localTool.h1 || '').toLowerCase().includes(term)
    );
  });

  const renderToolGrid = (tools: any[], limit?: number) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {tools.slice(0, limit || tools.length).map(tool => {
        const localTool = getLocalizedTool(tool);
        const handleClick = () => {
          const currentLang = i18n.language.split('-')[0];
          const langPrefix = SUPPORTED_LANGS.includes(currentLang) ? `/${currentLang}` : '';
          navigate(`${langPrefix}/${tool.slug}`);
          window.scrollTo(0, 0);
        };
        return (
          <ToolCard
            key={tool.slug}
            title={localTool.h1 || localTool.title}
            description={localTool.description}
            icon={getIcon(tool.slug)}
            colorClass={getColorClass(tool.slug)}
            onClick={handleClick}
            to={`/${tool.slug}`}
            popular={['merge-pdf', 'compress-pdf', 'remove-bg', 'ai-image-generator', 'notarize'].includes(tool.slug)}
          />
        );
      })}
    </div>
  );

  return (
    <div className="animate-fade-in pb-24">
      <SEO
        title={localizedSeoData.title}
        description={localizedSeoData.description}
        canonical="/"
        currentLang={i18n.language}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "PDF A2Z",
            "url": "https://pdfa2z.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://pdfa2z.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="relative pt-36 pb-28 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="mesh-blob bg-blue-400" style={{ top: '-10%', left: '-8%' }} />
          <div className="mesh-blob bg-indigo-400" style={{ top: '30%', right: '-5%', animationDelay: '-7s' }} />
          <div className="mesh-blob bg-violet-300" style={{ bottom: '-10%', left: '30%', width: '30%', animationDelay: '-12s', opacity: 0.12 }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-[0.15em] mb-10 animate-float backdrop-blur-sm shadow-sm">
            <Sparkles size={13} />
            Next-Gen Document Workstation
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-6 tracking-[-0.03em] leading-[0.92]">
            <span className="hero-gradient-text">Automated.</span>
            <br />
            <span className="text-gradient-blue">Compliant Journeys.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            The specialized PDF platform for <span className="text-indigo-600 font-bold">Mortgage Agents, Lawyers, and Banks</span>. Turn complex onboarding into automated, legally binding journeys.
          </p>

          {/* Industry Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 max-w-4xl mx-auto">
            <button 
              onClick={() => navigate('/journey-builder?template=mortgage')}
              className="group p-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">Mortgage Agents</h3>
              <p className="text-xs text-slate-500 font-medium">Auto-fill loan apps & lawyer instructions.</p>
            </button>
            
            <button 
              onClick={() => navigate('/journey-builder?template=legal')}
              className="group p-6 bg-white border border-slate-200 rounded-3xl hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/10 transition-all text-left"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">Legal Teams</h3>
              <p className="text-xs text-slate-500 font-medium">Automate intakes, NDAs, and wills.</p>
            </button>

            <button 
              onClick={() => navigate('/journey-builder?template=real-estate')}
              className="group p-6 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all text-left"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <LucideImage size={24} />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">Real Estate</h3>
              <p className="text-xs text-slate-500 font-medium">Listing agreements & mobile e-signs.</p>
            </button>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative group mb-10">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur transition-all duration-700 ${searchFocused ? 'opacity-60' : 'opacity-10 group-hover:opacity-30'}`} />
            <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100">
              <div className="pl-5 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                className="block w-full pl-4 pr-4 py-4 bg-transparent text-lg outline-none placeholder:text-slate-400 font-medium"
                placeholder={t('home.searchPlaceholder') || 'Search any tool — merge, compress, sign...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <button className="mr-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300/50 active:scale-95 transition-all text-sm">
                Search
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <StatBadge icon={<Star size={12} className="text-amber-400 fill-amber-400" />} label="4.9/5 Rating" delay={0} />
            <StatBadge icon={<Lock size={12} className="text-emerald-500" />} label="100% Secure" delay={0.5} />
            <StatBadge icon={<Globe2 size={12} className="text-blue-500" />} label="Cloud-based" delay={1} />
            <StatBadge icon={<TrendingUp size={12} className="text-violet-500" />} label="2M+ Users" delay={1.5} />
            <StatBadge icon={<Clock size={12} className="text-slate-400" />} label="Instant Processing" delay={2} />
          </div>
        </div>
      </div>

      {/* ── Notarize Elite Banner ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-px shadow-2xl shadow-blue-900/20">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[23px] p-8 md:p-10">
            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center text-white shadow-2xl shrink-0">
                  <ShieldCheck size={30} />
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">✦ Exclusive Feature</p>
                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">Elite Online Notarization</h3>
                  <p className="text-blue-200/80 text-sm mt-1.5">Legally compliant e-signatures from any device, 24/7.</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="hidden md:flex items-center gap-3 mr-2">
                  <div className="flex -space-x-2.5">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-blue-600 bg-slate-200 overflow-hidden shadow-lg">
                        <img src={`https://i.pravatar.cc/80?u=${i + 30}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <span className="text-blue-100/70 text-xs font-medium">5k+ Professionals</span>
                </div>
                <button
                  onClick={() => {
                    const currentLang = i18n.language.split('-')[0];
                    const langPrefix = SUPPORTED_LANGS.includes(currentLang) ? `/${currentLang}` : '';
                    navigate(`${langPrefix}/notarize`);
                  }}
                  className="flex items-center gap-2 px-7 py-3.5 bg-white text-blue-700 font-black rounded-2xl shadow-2xl hover:shadow-white/20 hover:bg-blue-50 active:scale-95 transition-all text-sm"
                >
                  Get Started <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tools Content ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

        {searchQuery ? (
          <section>
            <SectionHeader
              icon={<Search size={18} className="text-blue-600" />}
              title={`Results for "${searchQuery}"`}
              accent="bg-blue-600"
            />
            {filteredTools.length > 0 ? renderToolGrid(filteredTools) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No tools found for <span className="font-bold text-slate-700">"{searchQuery}"</span></p>
                <button onClick={() => setSearchQuery('')} className="mt-3 text-sm text-blue-600 hover:underline">Clear search</button>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Popular */}
            <section>
              <SectionHeader
                icon={<Star size={18} className="text-amber-500 fill-amber-500" />}
                title={t('home.popular') || 'Most Popular Tools'}
                accent="bg-amber-400"
              />
              {renderToolGrid(allTools.filter(t =>
                ['merge-pdf', 'compress-pdf', 'remove-bg', 'ai-image-generator', 'magic-ai-editor', 'notarize', 'journey-builder'].includes(t.slug)
              ))}
            </section>

            {/* PDF Tools */}
            <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
              <SectionHeader
                icon={<FileText size={18} className="text-blue-600" />}
                title={`${t('common.pdfTools') || 'PDF'} Tools`}
                accent="bg-blue-600"
              />
              {renderToolGrid(allTools.filter(t => t.type === ToolType.PDF_SUITE || t.type === ToolType.JOURNEY_BUILDER))}
            </section>

            {/* Image Tools */}
            <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
              <SectionHeader
                icon={<LucideImage size={18} className="text-violet-600" />}
                title={`${t('common.imageTools') || 'Image'} Tools`}
                accent="bg-violet-500"
              />
              {renderToolGrid(allTools.filter(t => t.type === ToolType.IMAGE_TOOLKIT))}
            </section>

            {/* AI Tools */}
            <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
              <SectionHeader
                icon={<Wand2 size={18} className="text-pink-600" />}
                title={`${t('common.aiTools') || 'AI'} Tools`}
                accent="bg-pink-500"
              />
              {renderToolGrid(allTools.filter(t =>
                t.type === ToolType.AI_WRITER ||
                t.type === ToolType.IMAGE_GENERATOR ||
                t.slug === 'magic-ai-editor' ||
                t.slug === 'video-generator'
              ))}
            </section>

            {/* Notarize */}
            <section style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
              <SectionHeader
                icon={<ShieldCheck size={18} className="text-[#185FA5]" />}
                title="Notarization Tools"
                accent="bg-[#185FA5]"
              />
              {renderToolGrid(allTools.filter(t => t.type === ToolType.NOTARIZE))}
            </section>
          </>
        )}

        {/* ── Knowledge Hub ─────────────────────────────── */}
        <section className="border-t border-slate-100 pt-20">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 md:p-16">
            {/* Decorative */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <Sparkles size={180} className="absolute right-8 top-8 text-white opacity-[0.03]" />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-3/5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold mb-6 backdrop-blur-sm">
                  <BookOpen size={12} />
                  NEW: KNOWLEDGE HUB
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-5">
                  Master PDFs like<br />
                  <span className="text-indigo-400">a professional.</span>
                </h2>
                <p className="text-indigo-100/60 text-base font-medium mb-8 max-w-xl leading-relaxed">
                  From compressing to 100kb to AI-powered document analysis — our experts share everything they know.
                </p>
                <button
                  onClick={() => navigate(i18n.language === 'en' ? '/blog' : `/${i18n.language}/blog`)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-900 font-black rounded-2xl shadow-xl hover:bg-indigo-50 transition-all active:scale-95 hover:-translate-y-0.5 text-sm uppercase tracking-widest"
                >
                  Browse Guides <ArrowRight size={18} />
                </button>
              </div>

              <div className="md:w-2/5 flex justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <FileText size={28} />, label: 'PDF Guides' },
                    { icon: <Sparkles size={28} />, label: 'AI Tips' },
                    { icon: <Wand2 size={28} />, label: 'Automation' },
                    { icon: <Layers size={28} />, label: 'Workflows' },
                  ].map((item, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="group-hover:scale-110 transition-transform">{item.icon}</div>
                      <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
