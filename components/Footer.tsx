import * as React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Twitter, Github, Linkedin, ShieldCheck } from 'lucide-react';
import { TOOLS_REGISTRY } from '../utils/seoData';

interface FooterProps {
    currentLang?: string;
}

export const Footer: React.FC<FooterProps> = ({ currentLang = 'en' }) => {
    // Helper to generate localized paths
    const getLocalizedPath = (path: string) => {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        if (currentLang === 'en') return `/${cleanPath}`;
        return `/${currentLang}/${cleanPath}`;
    };

    // Get tools by category from TOOLS_REGISTRY
    const pdfTools = Object.values(TOOLS_REGISTRY)
        .filter((t: any) => t.type === 'PDF_SUITE' && t.unique !== false)
        .slice(0, 8);
    
    const imageTools = Object.values(TOOLS_REGISTRY)
        .filter((t: any) => t.type === 'IMAGE_TOOLKIT' && t.unique !== false)
        .slice(0, 8);
    
    const aiTools = Object.values(TOOLS_REGISTRY)
        .filter((t: any) => ['IMAGE_GENERATOR', 'AI_WRITER'].includes(t.type))
        .slice(0, 3);

    return (
        <footer className="border-t border-slate-200 bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
                        <Link to={getLocalizedPath('/')} className="flex items-center gap-2 text-xl font-bold text-blue-600">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                <FileText className="h-5 w-5" />
                            </div>
                            <span>PDF A2Z</span>
                        </Link>
                        <p className="text-sm text-slate-500 max-w-xs">
                            Free online PDF, Image, and AI tools. No sign-up required. Built for students, professionals, and everyone in between.
                        </p>
                        <div className="flex space-x-3">
                            <a href="https://twitter.com/pdfa2z" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="https://github.com/pdfa2z" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Github className="h-4 w-4" />
                            </a>
                            <a href="https://linkedin.com/company/pdfa2z" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* PDF Tools */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-900">PDF Tools</h3>
                        <ul className="space-y-1.5 text-sm text-slate-600">
                            {pdfTools.map((tool: any) => (
                                <li key={tool.slug}>
                                    <Link to={getLocalizedPath(`/${tool.slug}`)} className="hover:text-blue-600 transition-colors line-clamp-1">
                                        {tool.h1 || tool.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Image Tools */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-900">Image Tools</h3>
                        <ul className="space-y-1.5 text-sm text-slate-600">
                            {imageTools.map((tool: any) => (
                                <li key={tool.slug}>
                                    <Link to={getLocalizedPath(`/${tool.slug}`)} className="hover:text-blue-600 transition-colors line-clamp-1">
                                        {tool.h1 || tool.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* AI Tools */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-900">AI Tools</h3>
                        <ul className="space-y-1.5 text-sm text-slate-600">
                            {aiTools.map((tool: any) => (
                                <li key={tool.slug}>
                                    <Link to={getLocalizedPath(`/${tool.slug}`)} className="hover:text-blue-600 transition-colors line-clamp-1">
                                        {tool.h1 || tool.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-900">Company</h3>
                        <ul className="space-y-1.5 text-sm text-slate-600">
                            <li><Link to={getLocalizedPath("/about")} className="hover:text-blue-600 transition-colors">About Us</Link></li>
                            <li><Link to={getLocalizedPath("/contact")} className="hover:text-blue-600 transition-colors">Contact</Link></li>
                            <li><Link to={getLocalizedPath("/blog")} className="hover:text-blue-600 transition-colors">Blog</Link></li>
                            <li><Link to={getLocalizedPath("/privacy")} className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link to={getLocalizedPath("/terms")} className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                            <li><Link to={getLocalizedPath("/notarize")} className="hover:text-blue-600 transition-colors flex items-center gap-1"><ShieldCheck size={12} /> Online Notary</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
                    &copy; {new Date().getFullYear()} PDF A2Z. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
