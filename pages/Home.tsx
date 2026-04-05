import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Layers, Zap, Edit3, Wand2, FileText, Image as LucideImage, Video, PenTool, Scissors, Sparkles, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { ToolCard } from '../components/ToolCard';
import { ToolType } from '../types';
import { SEO } from '../components/SEO';
import { TOOLS_REGISTRY } from '../utils/seoData';
import { useTranslation } from 'react-i18next';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');

    const navigateToTool = (tool: ToolType, subMode?: any) => {
        let slug = '';
        const entry = Object.values(TOOLS_REGISTRY).find(t => {
            if (t.type !== tool) return false;
            if (tool === ToolType.PDF_SUITE) return t.mode === (subMode || 'MENU');
            if (tool === ToolType.IMAGE_TOOLKIT) return t.mode === (subMode || 'MENU');
            if (tool === ToolType.VIDEO_SUITE) return t.mode === (subMode || 'DOWNLOAD');
            return true;
        }) || Object.values(TOOLS_REGISTRY).find(t => t.type === tool); // Fallback

        if (entry) {
            slug = entry.slug;
            const langPrefix = i18n.language && i18n.language !== 'en' ? `/${i18n.language.split('-')[0]}` : '';
            navigate(`${langPrefix}/${slug}`);
        } else {
            // Manual fallback for tools not fully in registry yet
            if (tool === ToolType.AI_WRITER) navigate(i18n.language === 'en' ? '/ai-writer' : `/${i18n.language}/ai-writer`);
        }
        window.scrollTo(0, 0);
    };

    const seoData = TOOLS_REGISTRY['home'];
    const localizedSeoData = i18n.language !== 'en' && seoData.translations?.[i18n.language]
        ? { ...seoData, ...seoData.translations[i18n.language] }
        : seoData;

    // Helper to get localized tool data
    const getLocalizedTool = (tool: any) => {
        return i18n.language !== 'en' && tool.translations?.[i18n.language]
            ? { ...tool, ...tool.translations[i18n.language] }
            : tool;
    };

    // Icon Mapping
    const getIcon = (slug: string) => {
        switch (slug) {
            case 'merge-pdf': return <Layers />;
            case 'split-pdf': return <Scissors />;
            case 'compress-pdf': return <Zap />;
            case 'pdf-to-word': case 'pdf-to-excel': case 'pdf-to-ppt': case 'pdf-to-text': return <FileText />;
            case 'pdf-chat': return <Sparkles />;
            case 'protect-pdf': case 'unlock-pdf': return <FileText />;
            case 'sign-pdf': return <PenTool />;
            case 'rotate-pdf': return <Layers />;
            case 'delete-pages': return <FileText />;
            case 'page-numbers': return <FileText />;
            case 'watermark-pdf': return <FileText />;
            case 'remove-bg': return <Edit3 />;
            case 'resize-image': return <LucideImage />;
            case 'compress-image': return <Zap />;
            case 'convert-image': return <Zap />;
            case 'crop-image': return <LucideImage />;
            case 'upscale-image': return <Wand2 />;
            case 'face-blur': return <LucideImage />;
            case 'round-image': return <Scissors />;
            case 'passport-photo': return <LucideImage />;
            case 'collage-maker': return <LucideImage />;
            case 'meme-maker': return <Edit3 />;
            case 'ai-writer': return <PenTool />;
            case 'ai-image-generator': return <Wand2 />;
            case 'magic-ai-editor': return <Wand2 />;
            default: return <Zap />;
        }
    };

    // Color Mapping
    const getColorClass = (slug: string) => {
        if (slug.includes('merge')) return "bg-blue-600 text-white";
        if (slug.includes('compress')) return "bg-green-600 text-white";
        if (slug.includes('remove-bg')) return "bg-purple-600 text-white";
        if (slug.includes('magic')) return "bg-indigo-600 text-white";
        if (slug.includes('image-generator')) return "bg-pink-600 text-white";
        if (slug.includes('split')) return "bg-orange-600 text-orange-600";
        if (slug.includes('chat')) return "bg-purple-600 text-purple-600";
        return "bg-slate-600 text-white";
    };

    // Filter Tools
    const allTools = Object.values(TOOLS_REGISTRY).filter(t => t.slug !== '' && t.slug !== 'home');
    const filteredTools = allTools.filter(tool => {
        const localTool = getLocalizedTool(tool);
        const term = searchQuery.toLowerCase();
        return localTool.title.toLowerCase().includes(term) ||
            localTool.description.toLowerCase().includes(term) ||
            localTool.h1.toLowerCase().includes(term);
    });

    const renderToolGrid = (tools: any[], limit?: number) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {tools.slice(0, limit || tools.length).map(tool => {
                const localTool = getLocalizedTool(tool);
                // Determine click handler args based on tool type/mode
                const handleClick = () => {
                    navigate(`${i18n.language !== 'en' ? `/${i18n.language}` : ''}/${tool.slug}`);
                    window.scrollTo(0, 0);
                };

                // Specific colors for specific tools to match old design
                let colorClass = "bg-blue-50 text-blue-600";
                if (tool.slug === 'merge-pdf') colorClass = "bg-blue-600 text-white";
                if (tool.slug === 'compress-pdf') colorClass = "bg-green-600 text-white";
                if (tool.slug === 'remove-bg') colorClass = "bg-purple-600 text-white";
                if (tool.slug === 'ai-image-generator') colorClass = "bg-pink-600 text-white";
                if (tool.slug === 'magic-ai-editor') colorClass = "bg-indigo-600 text-white";
                if (tool.slug === 'split-pdf') colorClass = "bg-orange-600 text-orange-600";

                return (
                    <ToolCard
                        key={tool.slug}
                        title={localTool.h1}
                        description={localTool.description}
                        icon={getIcon(tool.slug)}
                        colorClass={colorClass}
                        onClick={handleClick}
                        to={`${i18n.language !== 'en' ? `/${i18n.language}` : ''}/${tool.slug}`}
                        popular={['merge-pdf', 'compress-pdf', 'remove-bg', 'ai-image-generator'].includes(tool.slug)}
                    />
                );
            })}
        </div>
    );

    return (
        <div className="animate-fade-in pb-20">
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

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white pt-24 pb-16 px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    {t('home.heroTitle').split('PDF & AI Tools')[0]}
                    <span className="text-blue-600">PDF & AI Tools</span>
                </h1>
                <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
                    {t('home.heroSubtitle')}
                </p>

                <div className="max-w-xl mx-auto relative group mb-8">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-full text-lg shadow-xl shadow-blue-900/5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                        placeholder={t('home.searchPlaceholder') || "Search for tools..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.9/5 Rating</span>
                    <span>•</span>
                    <span>100% Secure</span>
                    <span>•</span>
                    <span>Cloud-based</span>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

                {searchQuery ? (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
                        </div>
                        {renderToolGrid(filteredTools)}
                        {filteredTools.length === 0 && (
                            <p className="text-center text-slate-500 text-lg py-10">No tools found matching "{searchQuery}"</p>
                        )}
                    </section>
                ) : (
                    <>
                        {/* Popular Tools */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <Star size={24} className="fill-orange-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">{t('home.popular')}</h2>
                            </div>
                            {renderToolGrid(allTools.filter(t => ['merge-pdf', 'compress-pdf', 'remove-bg', 'ai-image-generator', 'magic-ai-editor'].includes(t.slug)))}
                        </section>

                        {/* PDF Tools */}
                        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
                            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                                <FileText size={24} className="text-blue-600" />
                                <h2 className="text-2xl font-bold text-slate-900">{t('common.pdfTools')} {t('common.tools')}</h2>
                            </div>
                            {renderToolGrid(allTools.filter(t => t.type === ToolType.PDF_SUITE))}
                        </section>

                        {/* Image Tools */}
                        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
                            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                                <LucideImage size={24} className="text-purple-600" />
                                <h2 className="text-2xl font-bold text-slate-900">{t('common.imageTools')} {t('common.tools')}</h2>
                            </div>
                            {renderToolGrid(allTools.filter(t => t.type === ToolType.IMAGE_TOOLKIT))}
                        </section>

                        {/* AI Tools */}
                        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
                            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                                <Wand2 size={24} className="text-pink-600" />
                                <h2 className="text-2xl font-bold text-slate-900">{t('common.aiTools')} {t('common.tools')}</h2>
                            </div>
                            {renderToolGrid(allTools.filter(t => t.type === ToolType.AI_WRITER || t.type === ToolType.IMAGE_GENERATOR || t.slug === 'magic-ai-editor' || t.slug === 'video-generator'))}
                        </section>

                        {/* Notarization Tools */}
                        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
                            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                                <ShieldCheck size={24} className="text-[#185FA5]" />
                                <h2 className="text-2xl font-bold text-slate-900">Notarization Tools</h2>
                            </div>
                            {renderToolGrid(allTools.filter(t => t.type === ToolType.NOTARIZE))}
                        </section>
                    </>
                )}

                {/* Knowledge Hub / Blog Section */}
                <section className="mt-20 border-t border-slate-100 pt-20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-indigo-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Sparkles size={160} className="text-white" />
                        </div>
                        <div className="md:w-2/3 relative z-10 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-200 rounded-full text-sm font-bold mb-6 border border-indigo-500/30">
                                <BookOpen size={16} />
                                <span>NEW: KNOWLEDGE HUB</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                                Learn how to manage PDFs <br /><span className="text-indigo-400">like a professional.</span>
                            </h2>
                            <p className="text-lg text-indigo-100/70 font-medium mb-10 max-w-xl">
                                From compressing to 100kb to AI-powered document analysis, our experts share everything they know.
                            </p>
                            <button
                                onClick={() => navigate(i18n.language === 'en' ? '/blog' : `/${i18n.language}/blog`)}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-900 font-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1"
                            >
                                BROWSE GUIDES <ArrowRight size={20} />
                            </button>
                        </div>
                        <div className="md:w-1/3 flex justify-center relative z-10">
                            <div className="grid grid-cols-2 gap-4 opacity-50">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 aspect-square flex items-center justify-center">
                                    <FileText size={40} className="text-white" />
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 aspect-square flex items-center justify-center">
                                    <Sparkles size={40} className="text-white" />
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 aspect-square flex items-center justify-center">
                                    <Wand2 size={40} className="text-white" />
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 aspect-square flex items-center justify-center">
                                    <Layers size={40} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

