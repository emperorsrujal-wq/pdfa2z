import * as React from 'react';
import { Link } from 'react-router-dom';
import { X, Search, Zap, FileText, Image, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolCard } from './ToolCard';

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

    // Filter tools based on search
    const filteredTools = tools.filter(tool => 
        (tool.h1 || tool.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle ESC key
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xl" 
                onClick={onClose}
            />

            {/* Content Container */}
            <div 
                ref={menuRef}
                className="relative w-full max-w-7xl max-h-[90vh] glass-panel rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/50"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-200/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            {getCategoryIcon()}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{getCategoryTitle()}</h2>
                            <p className="text-slate-500 font-medium text-sm">Explore all features and automation tools</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="relative group hidden md:block">
                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-600">
                                <Search size={18} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search tools..."
                                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-slate-900"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredTools.map((tool) => (
                            <Link 
                                key={tool.slug}
                                to={getLocalizedPath(tool.slug)}
                                onClick={onClose}
                                className="group block"
                            >
                                <div className="premium-card p-6 h-full flex flex-col hover:border-blue-200 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                                            {/* Generic icon if none provided */}
                                            <FileText className="text-blue-600" size={20} />
                                        </div>
                                        <ArrowRight className="text-slate-200 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" size={16} />
                                    </div>
                                    <h3 className="font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">{tool.h1 || tool.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{tool.description || 'Advanced automation tool'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredTools.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-400 text-lg font-medium">No tools found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> SECURE</span>
                        <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500" /> TOP-RATED</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};
