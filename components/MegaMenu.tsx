import * as React from 'react';
import { Link } from 'react-router-dom';
import { X, Search, Zap, FileText, Image, ShieldCheck, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
    category: 'pdf' | 'image' | 'ai' | null;
    tools: any[];
    currentLang: string;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, category, tools, currentLang }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Grouping logic for PDF tools
    const getGroupedTools = () => {
        if (category !== 'pdf') return { 'All Tools': filteredTools };

        const groups: Record<string, any[]> = {
            'Convert from PDF': filteredTools.filter(t => ['pdf-to-word', 'pdf-to-excel', 'pdf-to-ppt', 'pdf-to-jpg', 'pdf-to-html', 'pdf-to-text'].includes(t.slug)),
            'Convert to PDF': filteredTools.filter(t => ['pdf-to-word', 'word-to-pdf', 'jpg-to-pdf', 'html-to-pdf', 'url-to-pdf', 'epub-to-pdf', 'mobi-to-pdf'].includes(t.slug)),
            'Edit & Organize': filteredTools.filter(t => ['edit-pdf', 'merge-pdf', 'split-pdf', 'rotate-pdf', 'delete-pages', 'organize-pdf', 'compress-pdf', 'pdf-page-numbers-online'].includes(t.slug)),
            'Security & Sign': filteredTools.filter(t => ['sign-pdf', 'protect-pdf', 'unlock-pdf', 'redact-pdf', 'sanitize-pdf', 'verified-notary'].includes(t.slug))
        };

        // Any remaining tools go to 'Other'
        const groupedSlugs = Object.values(groups).flat().map(t => t.slug);
        const other = filteredTools.filter(t => !groupedSlugs.includes(t.slug));
        if (other.length > 0) groups['General & AI'] = other;

        return groups;
    };

    const filteredTools = tools.filter(tool => 
        (tool.h1 || tool.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = getGroupedTools();

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const getLocalizedPath = (slug: string) => {
        if (currentLang === 'en') return `/${slug}`;
        return `/${currentLang}/${slug}`;
    };

    const getCategoryTitle = () => {
        switch (category) {
            case 'pdf': return t('common.pdfTools');
            case 'image': return t('common.imageTools');
            case 'ai': return t('common.aiTools');
            default: return 'All Tools';
        }
    };

    const getCategoryIcon = () => {
        switch (category) {
            case 'pdf': return <FileText className="text-blue-600" size={32} />;
            case 'image': return <Image className="text-purple-600" size={32} />;
            case 'ai': return <Zap className="text-pink-600" size={32} />;
            default: return <Star className="text-blue-600" size={32} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in transition-all duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" 
                onClick={onClose}
            />

            {/* Content Container */}
            <div 
                ref={menuRef}
                className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-white/40"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-200">
                            {getCategoryIcon()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{getCategoryTitle()}</h2>
                            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest opacity-70">List Access Layout</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="relative group hidden md:block">
                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-600">
                                <Search size={18} />
                            </div>
                            <input 
                                type="text"
                                placeholder="..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2.5 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-900"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
                        {Object.entries(grouped).map(([groupName, groupTools]) => (
                            <div key={groupName} className="flex flex-col">
                                <h3 className="text-[10px] font-black text-blue-600 border-b border-blue-100 pb-2 mb-4 uppercase tracking-[0.2em]">{groupName}</h3>
                                <div className="flex flex-col gap-1">
                                    {groupTools.map((tool) => (
                                        <Link 
                                            key={tool.slug}
                                            to={getLocalizedPath(tool.slug)}
                                            onClick={onClose}
                                            className="group flex items-center gap-3 px-3 py-2 -mx-3 rounded-lg hover:bg-slate-50 transition-all"
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {tool.icon ? <tool.icon size={16} /> : <FileText size={16} />}
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                                                {tool.h1 || tool.title}
                                            </span>
                                            <ChevronRight size={14} className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all text-slate-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTools.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-400 text-lg font-medium tracking-tight">No tools found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 px-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-blue-500" /> SECURE HANDLER</span>
                        <span className="flex items-center gap-2"><Star size={14} className="text-blue-500" /> TOP-RATED WORKSPACE</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        Back to Home <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
