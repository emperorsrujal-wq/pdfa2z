import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TOOLS_REGISTRY } from '../utils/seoData.ts';
import { ArrowRight } from 'lucide-react';

interface RelatedToolsProps {
    currentSlug: string;
    category?: 'PDF' | 'IMAGE' | 'VIDEO' | 'AI';
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentSlug, category }) => {
    const location = useLocation();
    const SUPPORTED_LANGS = ['es', 'fr', 'hi'];
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentLang = SUPPORTED_LANGS.includes(pathParts[0]) ? pathParts[0] : 'en';

    // Helper to generate localized paths
    const getLocalizedPath = (path: string) => {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        if (currentLang === 'en') return `/${cleanPath}`;
        return `/${currentLang}/${cleanPath}`;
    };

    // Filter tools: same category, not current tool, limit 4
    const tools = Object.values(TOOLS_REGISTRY)
        .filter(t => t.slug !== currentSlug && (!category || t.slug.includes(category.toLowerCase()) || (category === 'PDF' && t.slug.includes('pdf'))))
        .slice(0, 4);

    if (tools.length === 0) return null;

    return (
        <div className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">People also use</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools.map((tool) => (
                    <Link
                        key={tool.slug}
                        to={getLocalizedPath(`/${tool.slug}`)}
                        className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-rose-500 hover:shadow-lg transition-all"
                    >
                        <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-2">
                            {tool.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                            {tool.description}
                        </p>
                        <div className="flex items-center text-xs font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                            OPEN TOOL <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
