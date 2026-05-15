import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Image, Zap, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { TOOLS_REGISTRY } from '../utils/seoData';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { ToolType } from '../types';

interface HeaderProps {
    currentLang?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentLang = 'en' }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
    const { t } = useTranslation();
    const location = useLocation();
    const { user, openAuthModal, signOut } = useAuth();
    const [megaMenuInfo, setMegaMenuInfo] = React.useState<{ category: 'pdf' | 'image' | 'ai' | null; isOpen: boolean }>({
        category: null,
        isOpen: false
    });

    const openMegaMenu = (cat: 'pdf' | 'image' | 'ai') => {
        setMegaMenuInfo({ category: cat, isOpen: true });
    };

    const closeMegaMenu = () => setMegaMenuInfo({ ...megaMenuInfo, isOpen: false });

    // Helper to generate localized paths
    const getLocalizedPath = (path: string) => {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        if (currentLang === 'en') return `/${cleanPath}`;
        return `/${currentLang}/${cleanPath}`;
    };

    // Check if a path is active
    const isPathActive = (href: string) => {
        const currentPath = location.pathname.replace(`/${currentLang}`, '').replace('/en', '') || '/';
        const cleanHref = href.startsWith('/') ? href : `/${href}`;
        return currentPath.startsWith(cleanHref) || currentPath === cleanHref;
    };

    // Get tools by category
    const pdfTools = Object.values(TOOLS_REGISTRY)
        .filter((t: any) => t.type === 'PDF_SUITE' && t.unique !== false);
    
    const imageTools = Object.values(TOOLS_REGISTRY)
        .filter((t: any) => t.type === 'IMAGE_TOOLKIT' && t.unique !== false);
    
    const aiTools = Object.values(TOOLS_REGISTRY)
        .filter((t: any) => ['IMAGE_GENERATOR', 'AI_WRITER', 'AI_VISION'].includes(t.type));

    const navGroups = [
        { name: t('common.pdfTools') || 'PDF Tools', href: '/merge-pdf', icon: FileText, id: 'pdf', tools: pdfTools },
        { name: t('common.imageTools') || 'Image Tools', href: '/remove-bg', icon: Image, id: 'image', tools: imageTools },
        { name: t('common.aiTools') || 'AI Tools', href: '/ai-image-generator', icon: Zap, id: 'ai', tools: aiTools },
    ];

    const navLinks = [
        { name: t('common.onlineNotary') || 'Notary', href: '/notarize', icon: FileText },
    ];

    return (
        <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
            <div className="glass-panel dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-full px-5 h-12 md:h-14 flex items-center justify-between w-full max-w-6xl">
                {/* Logo */}
                <div className="flex items-center">
                    <Link to={getLocalizedPath('/')} className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 text-white shadow-sm group-hover:scale-105 transition-transform">
                            <FileText className="h-5 w-5" />
                        </div>
                        <span className="leading-none text-slate-900 dark:text-slate-100 tracking-tight">PDF <span className="text-blue-600 dark:text-blue-400">A2Z</span></span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navGroups.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => openMegaMenu(item.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                megaMenuInfo.isOpen && megaMenuInfo.category === item.id
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                            <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${megaMenuInfo.isOpen && megaMenuInfo.category === item.id ? 'rotate-180' : ''}`} />
                        </button>
                    ))}
                    {navLinks.map((item) => (
                        <Link
                            key={item.href}
                            to={getLocalizedPath(item.href)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                isPathActive(item.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-2">
                    <LanguageSelector />
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    
                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-100 transition-colors">
                                <UserIcon size={16} />
                                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                                <ChevronDown size={14} />
                            </button>
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2 overflow-hidden">
                                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                    <p className="text-xs text-slate-400">Signed in as</p>
                                    <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                                </div>
                                <Link 
                                    to={getLocalizedPath('/dashboard')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                >
                                    <LayoutDashboard size={16} />
                                    {t('common.dashboard')}
                                </Link>
                                <button 
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    {t('common.signOut')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => openAuthModal('login')}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            {t('common.signIn')}
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-600 hover:text-blue-600"
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl border border-slate-100 shadow-lg p-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('common.language')}</span>
                        <LanguageSelector />
                    </div>
                    <div className="space-y-1">
                        {navGroups.map((item) => (
                            <div key={item.id}>
                                <button
                                    onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                        isPathActive(item.href)
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                                </button>
                                {openDropdown === item.id && (
                                    <div className="bg-slate-50 space-y-1 py-2 rounded-xl mt-1">
                                        {item.tools.map((tool: any) => (
                                            <Link
                                                key={tool.slug}
                                                to={getLocalizedPath(`/${tool.slug}`)}
                                                className="block px-6 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {tool.translations?.[currentLang]?.h1 || tool.translations?.[currentLang]?.title || tool.h1 || tool.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {navLinks.map((item) => (
                            <Link
                                key={item.href}
                                to={getLocalizedPath(item.href)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                    isPathActive(item.href)
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    {/* Mobile Auth */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        {user ? (
                            <div className="space-y-2">
                                <div className="px-4 py-2">
                                    <p className="text-xs text-slate-400">Signed in as</p>
                                    <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                                </div>
                                <Link
                                    to={getLocalizedPath('/dashboard')}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LayoutDashboard size={18} />
                                    {t('common.dashboard')}
                                </Link>
                                <button
                                    onClick={() => { signOut(); setIsMenuOpen(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 text-sm"
                                >
                                    <LogOut size={18} />
                                    {t('common.signOut')}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { openAuthModal('login'); setIsMenuOpen(false); }}
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors text-center"
                            >
                                Sign In / Get Started
                            </button>
                        )}
                    </div>
                </div>
            )}
            {/* Mega Menu Overlay */}
            <MegaMenu 
                isOpen={megaMenuInfo.isOpen}
                onClose={closeMegaMenu}
                category={megaMenuInfo.category}
                tools={
                    megaMenuInfo.category === 'pdf' ? pdfTools :
                    megaMenuInfo.category === 'image' ? imageTools :
                    megaMenuInfo.category === 'ai' ? aiTools : []
                }
                currentLang={currentLang}
            />
        </header>
    );
};
