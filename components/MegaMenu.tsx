import * as React from 'react';
import { Link } from 'react-router-dom';
import { X, Search, Zap, FileText, Image, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getToolIcon } from './ToolIcons';

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
            'Convert to PDF': filteredTools.filter(t => ['word-to-pdf', 'jpg-to-pdf', 'html-to-pdf', 'url-to-pdf', 'epub-to-pdf', 'mobi-to-pdf'].includes(t.slug)),
            'Edit & Organize': filteredTools.filter(t => ['edit-pdf', 'merge-pdf', 'split-pdf', 'rotate-pdf', 'delete-pages', 'organize-pdf', 'compress-pdf', 'page-numbers'].includes(t.slug)),
            'Security & Sign': filteredTools.filter(t => ['sign-pdf', 'protect-pdf', 'unlock-pdf', 'redact-pdf', 'sanitize-pdf'].includes(t.slug))
        };

        // Any remaining tools go to 'Other'
        const groupedSlugs = Object.values(groups).flat().map(t => t.slug);
        const other = filteredTools.filter(t => !groupedSlugs.includes(t.slug));
        if (other.length > 0) groups['General & AI'] = other;

        return groups;
    };

    const filteredTools = tools.filter(tool => 
        (tool.translations?.[currentLang]?.h1 || tool.translations?.[currentLang]?.title || tool.h1 || tool.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.translations?.[currentLang]?.description || tool.description || '').toLowerCase().includes(searchQuery.toLowerCase())
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
            case 'pdf': return <FileText className="text-blue-600" size={24} />;
            case 'image': return <Image className="text-purple-600" size={24} />;
            case 'ai': return <Zap className="text-pink-600" size={24} />;
            default: return <Star className="text-blue-600" size={24} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in transition-all duration-200">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
                onClick={onClose}
            />

            {/* Content Container */}
            <div 
                ref={menuRef}
                className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-100"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            {getCategoryIcon()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{getCategoryTitle()}</h2>
                            <p className="text-slate-400 text-xs mt-0.5">{filteredTools.length} tools available</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative group hidden md:block">
                            <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-blue-600">
                                <Search size={16} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search tools..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm w-56"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Card Grid Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white">
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([groupName, groupTools]) => (
                            <div key={groupName}>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{groupName}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {groupTools.map((tool) => {
                                        const title = tool.translations?.[currentLang]?.h1 || tool.translations?.[currentLang]?.title || tool.h1 || tool.title;
                                        const desc = tool.translations?.[currentLang]?.description || tool.description;
                                        return (
                                            <Link
                                                key={tool.slug}
                                                to={getLocalizedPath(tool.slug)}
                                                onClick={onClose}
                                                className="group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {getToolIcon(tool.slug, 22) || <FileText size={18} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors truncate">{title}</p>
                                                    <p className="text-[11px] text-slate-400 line-clamp-1">{desc}</p>
                                                </div>
                                                <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-all shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTools.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-slate-400 text-base font-medium">No tools found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Esc</kbd> to close</span>
                    <button 
                        onClick={onClose}
                        className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                    >
                        Close menu
                    </button>
                </div>
            </div>
        </div>
    );
};
