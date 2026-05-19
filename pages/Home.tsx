import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, FileText, Sparkles, Layers,
  Image as LucideImage, Wand2,
  BookOpen, ArrowRight, ShieldCheck, Lock, Globe2,
  TrendingUp, Shield
} from 'lucide-react';
import { ToolCard } from '../components/ToolCard';
import { getToolIcon } from '../components/ToolIcons';
import { ToolType } from '../types';
import { SEO } from '../components/SEO';
import { TOOLS_REGISTRY } from '../utils/seoData';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from '../App';

// ── Section header ───────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; accent: string; count?: number }> = ({ icon, title, accent, count }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className={`w-1 h-7 ${accent} rounded-full`} />
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">{icon}</div>
      <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  </div>
);

// ── Category quick link ──────────────────────────────────
const CategoryLink: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
  >
    {icon}
    {label}
  </button>
);

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const toolsRef = React.useRef<HTMLDivElement>(null);

  const seoData = TOOLS_REGISTRY['home'];
  const localizedSeoData = i18n.language !== 'en' && seoData.translations?.[i18n.language]
    ? { ...seoData, ...seoData.translations[i18n.language] }
    : seoData;

  const getLocalizedTool = (tool: any) =>
    i18n.language !== 'en' && tool.translations?.[i18n.language]
      ? { ...tool, ...tool.translations[i18n.language] }
      : tool;

  const getIcon = (slug: string) => getToolIcon(slug, 24) || <FileText size={24} />;

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

  const pdfTools = allTools.filter(t => t.type === ToolType.PDF_SUITE || t.type === ToolType.JOURNEY_BUILDER);
  const imageTools = allTools.filter(t => t.type === ToolType.IMAGE_TOOLKIT);
  const aiTools = allTools.filter(t =>
    t.type === ToolType.AI_WRITER ||
    t.type === ToolType.IMAGE_GENERATOR ||
    t.slug === 'magic-ai-editor' ||
    t.slug === 'video-generator'
  );
  const notaryTools = allTools.filter(t => t.type === ToolType.NOTARIZE);

  const [activeCategory, setActiveCategory] = React.useState<'all' | 'pdf' | 'image' | 'ai' | 'notary'>('all');

  const getToolsForCategory = (cat: typeof activeCategory) => {
    if (cat === 'pdf') return pdfTools;
    if (cat === 'image') return imageTools;
    if (cat === 'ai') return aiTools;
    if (cat === 'notary') return notaryTools;
    return allTools;
  };

  const renderToolGrid = (tools: any[], limit?: number) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            popular={['merge-pdf', 'compress-pdf', 'remove-bg', 'ai-image-generator'].includes(tool.slug)}
          />
        );
      })}
    </div>
  );

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      <div className="relative pt-32 pb-16 px-4">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-8">
            <Sparkles size={12} />
            100+ Free Tools · No Signup Required
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-5 tracking-tight leading-[1.1]">
            Free PDF &amp; Image Tools
          </h1>

          <p className="text-base md:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Merge, compress, convert, edit, and sign PDFs. Remove backgrounds, resize images, and more. 
            <span className="text-slate-700 font-medium"> Completely free.</span>
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative mb-8">
            <div className="relative flex items-center bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-100/50 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <div className="pl-4 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                className="block w-full pl-3 pr-3 py-3.5 bg-transparent text-base outline-none placeholder:text-slate-400 font-medium"
                placeholder={t('home.searchPlaceholder') || 'Search any tool — merge, compress, sign...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mr-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <span className="sr-only">Clear</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* Quick category links */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <CategoryLink icon={<FileText size={14} />} label="PDF Tools" onClick={scrollToTools} />
            <CategoryLink icon={<LucideImage size={14} />} label="Image Tools" onClick={scrollToTools} />
            <CategoryLink icon={<Wand2 size={14} />} label="AI Tools" onClick={scrollToTools} />
            <CategoryLink icon={<ShieldCheck size={14} />} label="Notarize" onClick={() => {
              const currentLang = i18n.language.split('-')[0];
              const langPrefix = SUPPORTED_LANGS.includes(currentLang) ? `/${currentLang}` : '';
              navigate(`${langPrefix}/notarize`);
            }} />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-400 fill-amber-400" /> 4.9/5 Rating</span>
            <span className="flex items-center gap-1.5"><Lock size={12} className="text-emerald-500" /> 100% Secure</span>
            <span className="flex items-center gap-1.5"><Globe2 size={12} className="text-blue-500" /> Cloud-based</span>
            <span className="flex items-center gap-1.5"><TrendingUp size={12} className="text-violet-500" /> 2M+ Users</span>
          </div>
        </div>
      </div>

      {/* ── Sticky Category Tabs ─────────────────────────── */}
      {!searchQuery && (
        <div className="sticky top-20 z-40 bg-[#fcfcfd]/95 backdrop-blur-sm border-b border-slate-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {([
                { id: 'all', label: 'All Tools', count: allTools.length },
                { id: 'pdf', label: 'PDF Tools', count: pdfTools.length },
                { id: 'image', label: 'Image Tools', count: imageTools.length },
                { id: 'ai', label: 'AI Tools', count: aiTools.length },
                { id: 'notary', label: 'Notary', count: notaryTools.length },
              ] as const).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {cat.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tools Content ─────────────────────────────────── */}
      <div ref={toolsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-8">

        {searchQuery ? (
          <section>
            <SectionHeader
              icon={<Search size={16} className="text-blue-600" />}
              title={`Results for "${searchQuery}"`}
              accent="bg-blue-600"
              count={filteredTools.length}
            />
            {filteredTools.length > 0 ? renderToolGrid(filteredTools) : (
              <div className="text-center py-20">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No tools found for <span className="font-semibold text-slate-700">"{searchQuery}"</span></p>
                <button onClick={() => setSearchQuery('')} className="mt-3 text-sm text-blue-600 hover:underline">Clear search</button>
              </div>
            )}
          </section>
        ) : (
          <>
            {activeCategory === 'all' && (
              <section>
                <SectionHeader
                  icon={<Star size={16} className="text-amber-500 fill-amber-500" />}
                  title={t('home.popular') || 'Most Popular Tools'}
                  accent="bg-amber-400"
                />
                {renderToolGrid(allTools.filter(t =>
                  ['merge-pdf', 'compress-pdf', 'remove-bg', 'ai-image-generator', 'magic-ai-editor', 'journey-builder'].includes(t.slug)
                ))}
              </section>
            )}

            <section>
              <SectionHeader
                icon={activeCategory === 'image' ? <LucideImage size={16} className="text-violet-600" /> :
                      activeCategory === 'ai' ? <Wand2 size={16} className="text-pink-600" /> :
                      activeCategory === 'notary' ? <ShieldCheck size={16} className="text-[#185FA5]" /> :
                      <FileText size={16} className="text-blue-600" />}
                title={activeCategory === 'all' ? 'All Tools' :
                       activeCategory === 'pdf' ? 'PDF Tools' :
                       activeCategory === 'image' ? 'Image Tools' :
                       activeCategory === 'ai' ? 'AI Tools' : 'Notarization'}
                accent={activeCategory === 'image' ? 'bg-violet-500' :
                        activeCategory === 'ai' ? 'bg-pink-500' :
                        activeCategory === 'notary' ? 'bg-[#185FA5]' : 'bg-blue-600'}
                count={getToolsForCategory(activeCategory).length}
              />
              {renderToolGrid(getToolsForCategory(activeCategory))}
            </section>
          </>
        )}

        {/* ── Knowledge Hub ─────────────────────────────── */}
        <section className="border-t border-slate-100 pt-16">
          <div className="rounded-2xl bg-slate-900 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-2/3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-300 text-xs font-medium mb-4">
                  <BookOpen size={12} />
                  Knowledge Hub
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight mb-3">
                  Master PDFs like a professional
                </h2>
                <p className="text-slate-400 text-sm mb-6 max-w-lg leading-relaxed">
                  From compressing to 100kb to AI-powered document analysis — our experts share everything they know.
                </p>
                <button
                  onClick={() => navigate(i18n.language === 'en' ? '/blog' : `/${i18n.language}/blog`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm"
                >
                  Browse Guides <ArrowRight size={16} />
                </button>
              </div>

              <div className="md:w-1/3 flex justify-center">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <FileText size={22} />, label: 'PDF Guides' },
                    { icon: <Sparkles size={22} />, label: 'AI Tips' },
                    { icon: <Wand2 size={22} />, label: 'Automation' },
                    { icon: <Layers size={22} />, label: 'Workflows' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="group-hover:scale-110 transition-transform">{item.icon}</div>
                      <span className="text-[11px] font-semibold">{item.label}</span>
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
