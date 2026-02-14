import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Layers, Zap, Edit3, Wand2, FileText, Image as LucideImage, Video, PenTool, Scissors, Sparkles } from 'lucide-react';
import { ToolCard } from '../components/ToolCard';
import { ToolType } from '../types';
import { SEO } from '../components/SEO';
import { TOOLS_REGISTRY } from '../utils/seoData';
import { useTranslation } from 'react-i18next';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

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

                {/* Popular Tools */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Star size={24} className="fill-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{t('home.popular')}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <ToolCard title={t('merge-pdf.h1') || "Merge PDF"} description="Combine PDFs." icon={<Layers />} colorClass="bg-blue-600 text-white" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'MERGE')} popular />
                        <ToolCard title={t('compress-pdf.h1') || "Compress PDF"} description="Reduce size." icon={<Zap />} colorClass="bg-green-600 text-white" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'COMPRESS')} popular />
                        <ToolCard title={t('remove-bg.h1') || "Remove BG"} description="Transparent BG." icon={<Edit3 />} colorClass="bg-purple-600 text-white" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'REMOVE_BG')} popular />
                        <ToolCard title={t('ai-image-generator.h1') || "AI Image Gen"} description="Text to Image." icon={<Wand2 />} colorClass="bg-pink-600 text-white" onClick={() => navigateToTool(ToolType.IMAGE_GENERATOR)} />
                    </div>
                </section>


                {/* PDF Tools */}
                <section>
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                        <FileText size={24} className="text-blue-600" />
                        <h2 className="text-2xl font-bold text-slate-900">{t('common.pdfTools')} {t('common.tools')}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <ToolCard title={t('merge-pdf.h1') || "Merge PDF"} description="Combine PDFs." icon={<Layers />} colorClass="bg-indigo-600 text-indigo-600" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'MERGE')} />
                        <ToolCard title={t('split-pdf.h1') || "Split PDF"} description="Extract pages." icon={<Scissors />} colorClass="bg-orange-600 text-orange-600" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'SPLIT')} />
                        <ToolCard title={t('compress-pdf.h1') || "Compress PDF"} description="Reduce size." icon={<Zap />} colorClass="bg-green-600 text-green-600" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'COMPRESS')} />
                        <ToolCard title={t('pdf-to-word.h1') || "PDF to Word"} description="Convert to DOC." icon={<FileText />} colorClass="bg-blue-600 text-blue-600" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'TO_WORD')} />
                        <ToolCard title={t('pdf-to-excel.h1') || "PDF to Excel"} description="Convert to XLS." icon={<FileText />} colorClass="bg-green-700 text-green-700" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'TO_EXCEL')} />
                        <ToolCard title={t('pdf-chat.h1') || "Use AI Chat"} description="Chat with PDF." icon={<Sparkles />} colorClass="bg-purple-600 text-purple-600" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'CHAT')} />
                        <ToolCard title={t('protect-pdf.h1') || "Protect PDF"} description="Add Password." icon={<FileText />} colorClass="bg-slate-800 text-slate-800" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'PROTECT')} />
                        <ToolCard title={t('unlock-pdf.h1') || "Unlock PDF"} description="Remove Password." icon={<FileText />} colorClass="bg-sky-500 text-sky-500" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'UNLOCK')} />
                        <ToolCard title={t('sign-pdf.h1') || "Sign PDF"} description="E-Sign document." icon={<PenTool />} colorClass="bg-green-600 text-green-600" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'SIGN')} />
                        <ToolCard title={t('rotate-pdf.h1') || "Rotate PDF"} description="Fix orientation." icon={<Layers />} colorClass="bg-amber-600 text-amber-600" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'ROTATE')} />
                        <ToolCard title={t('delete-pages.h1') || "Delete Pages"} description="Remove pages." icon={<FileText />} colorClass="bg-red-500 text-red-500" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'DELETE_PAGES')} />
                        <ToolCard title={t('page-numbers.h1') || "Add Page Numbers"} description="Number pages." icon={<FileText />} colorClass="bg-cyan-600 text-cyan-600" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'PAGE_NUMBERS')} />
                        <ToolCard title={t('watermark-pdf.h1') || "Watermark"} description="Stamp text." icon={<FileText />} colorClass="bg-blue-500 text-blue-500" onClick={() => navigateToTool(ToolType.PDF_SUITE, 'WATERMARK')} />
                    </div>
                </section>

                {/* Image Tools */}
                <section>
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                        <LucideImage size={24} className="text-purple-600" />
                        <h2 className="text-2xl font-bold text-slate-900">{t('common.imageTools')} {t('common.tools')}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <ToolCard title={t('remove-bg.h1') || "Remove BG"} description="Transparent BG." icon={<Edit3 />} colorClass="bg-purple-600 text-purple-600" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'REMOVE_BG')} />
                        <ToolCard title={t('resize-image.h1') || "Resize Image"} description="Change size." icon={<LucideImage />} colorClass="bg-amber-600 text-amber-600" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'RESIZE')} />
                        <ToolCard title={t('compress-image.h1') || "Compress Image"} description="Reduce KB/MB." icon={<Zap />} colorClass="bg-pink-600 text-pink-600" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'COMPRESS')} />
                        <ToolCard title={t('convert-image.h1') || "Convert Image"} description="JPG to PNG..." icon={<Zap />} colorClass="bg-orange-600 text-orange-600" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'CONVERT')} />
                        <ToolCard title={t('crop-image.h1') || "Crop Image"} description="Trim edges." icon={<LucideImage />} colorClass="bg-green-600 text-green-600" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'CROP')} />
                        <ToolCard title={t('upscale-image.h1') || "Upscale"} description="AI Enhance." icon={<Wand2 />} colorClass="bg-purple-600 text-purple-600" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'UPSCALE')} />
                        <ToolCard title={t('face-blur.h1') || "Blur Faces"} description="Hide faces." icon={<LucideImage />} colorClass="bg-gray-700 text-gray-700" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'FACE_BLUR')} />
                        <ToolCard title={t('round-image.h1') || "Round Image"} description="Circle crop." icon={<Scissors />} colorClass="bg-pink-500 text-pink-500" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'ROUND')} />
                        <ToolCard title={t('passport-photo.h1') || "Passport Photo"} description="ID Photo Maker." icon={<LucideImage />} colorClass="bg-blue-600 text-blue-600" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'PASSPORT')} />
                        <ToolCard title={t('collage-maker.h1') || "Collage Maker"} description="Grid photos." icon={<LucideImage />} colorClass="bg-fuchsia-600 text-fuchsia-600" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'COLLAGE')} />
                        <ToolCard title={t('meme-maker.h1') || "Meme Maker"} description="Funny captions." icon={<Edit3 />} colorClass="bg-yellow-500 text-yellow-500" onClick={() => navigateToTool(ToolType.IMAGE_TOOLKIT, 'MEME')} />
                    </div>
                </section>

                {/* AI Tools */}
                <section>
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                        <Wand2 size={24} className="text-pink-600" />
                        <h2 className="text-2xl font-bold text-slate-900">{t('common.aiTools')} {t('common.tools')}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <ToolCard title={t('ai-writer.h1') || "AI Writer"} description="Write content." icon={<PenTool />} colorClass="bg-pink-50 text-pink-600" onClick={() => navigateToTool(ToolType.AI_WRITER)} />
                        <ToolCard title={t('ai-image-generator.h1') || "AI Image Gen"} description="Text to Art." icon={<Wand2 />} colorClass="bg-purple-600 text-purple-600" onClick={() => navigateToTool(ToolType.IMAGE_GENERATOR)} />
                    </div>
                </section>

            </div>
        </div>
    );
};


