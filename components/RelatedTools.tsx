import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { ToolSEO, TOOLS_REGISTRY } from '../utils/seoData.ts';

interface RelatedToolsProps {
    currentTool: ToolSEO;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentTool }) => {
    const relatedTools = useMemo(() => {
        // Get all tools except current one and home
        const allTools = Object.values(TOOLS_REGISTRY).filter(t => t.slug !== currentTool.slug && t.slug !== '' && t.slug !== 'pdf-tools' && t.slug !== 'image-tools' && t.slug !== 'ai-tools');

        // Filter by same type first (e.g. PDF tools)
        const sameType = allTools.filter(t => t.type === currentTool.type);
        const otherTypes = allTools.filter(t => t.type !== currentTool.type);

        // Shuffle and pick 4
        const shuffledSame = sameType.sort(() => 0.5 - Math.random());
        const shuffledOther = otherTypes.sort(() => 0.5 - Math.random());

        // Mix: 3 same type, 1 other (or just 4 same if enough)
        let selection = [];
        if (shuffledSame.length >= 4) {
            selection = shuffledSame.slice(0, 4);
        } else {
            selection = [...shuffledSame, ...shuffledOther].slice(0, 4);
        }

        return selection;
    }, [currentTool]);

    return (
        <div className="py-12 border-t border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" />
                Explore More Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedTools.map((tool) => (
                    <Link
                        key={tool.slug}
                        to={`/${tool.slug}`}
                        className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all"
                    >
                        <h4 className="font-bold text-slate-900 mb-2 chat-title group-hover:text-indigo-600 transition-colors">
                            {tool.h1}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                            {tool.description}
                        </p>
                        <div className="flex items-center text-indigo-600 font-bold text-sm">
                            Try Tool <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
