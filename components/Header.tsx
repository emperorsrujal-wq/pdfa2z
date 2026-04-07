import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Image, File, Zap, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { TOOLS_REGISTRY } from '../utils/seoData';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

interface HeaderProps {
    currentLang?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentLang = 'en' }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
    const { t } = useTranslation();
    const location = useLocation();
    const { user, openAuthModal, signOut } = useAuth();

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
        .filter((t: any) => (t.type === 'PDF_SUITE' || t.type === 'NOTARIZE' || t.type === 'JOURNEY_BUILDER') && t.unique !== false)
        .slice(0, 8);
    
    const imageTools = Object.values(TOOLS_REGISTRY)
        .filter((t: any) => t.type === 'IMAGE_TOOLKIT' && t.unique !== false)
        .slice(0, 7);
    
    const aiTools = Object.values(TOOLS_REGISTRY)
        .filter((t: any) => ['IMAGE_GENERATOR', 'AI_WRITER', 'AI_VISION'].includes(t.type));

    const navigation = [
        { name: t('common.onlineNotary'), href: '/notarize', icon: ShieldCheck, id: 'notarize', tools: [] },
        { name: t('common.aiTools'), href: '/ai-image-generator', icon: Zap, id: 'ai', tools: aiTools },
        { name: t('common.pdfTools'), href: '/merge-pdf', icon: FileText, id: 'pdf', tools: pdfTools },
        { name: t('common.imageTools'), href: '/remove-bg', icon: Image, id: 'image', tools: imageTools },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center">
                    <Link to={getLocalizedPath('/')} className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <FileText className="h-5 w-5" />
                        </div>
                        <span>PDF A2Z</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4">
                    {navigation.map((item) => (
                        <div key={item.id} className="relative group">
                            <Link
                                to={getLocalizedPath(item.href)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isPathActive(item.href)
                                        ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                                {item.tools.length > 0 && <ChevronDown className="h-3 w-3 opacity-60" />}
                            </Link>

                            {/* Dropdown Menu */}
                            {item.tools.length > 0 && (
                                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
                                    {item.tools.map((tool: any) => (
                                        <Link
                                            key={tool.slug}
                                            to={getLocalizedPath(`/${tool.slug}`)}
                                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors truncate"
                                        >
                                            {tool.h1 || tool.title}
                                        </Link>
                                    ))}
                                    <div className="border-t border-slate-100 py-2 px-4">
                                        <Link
                                            to={getLocalizedPath(item.href)}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            View all {item.name.toLowerCase()} →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Desktop Auth & Language */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageSelector />
                    
                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-semibold hover:bg-blue-100 transition-colors">
                                <UserIcon size={18} />
                                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                                <ChevronDown size={14} />
                            </button>
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2 overflow-hidden">
                                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                    <p className="text-xs text-slate-400">Signed in as</p>
                                    <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                                </div>
                                <Link 
                                    to={getLocalizedPath('/notarize/dashboard')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
                            className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-shadow hover:shadow-lg active:scale-95 transition-all"
                        >
                            {t('common.signIn')}
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-600 hover:text-blue-600"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('common.language')}</span>
                        <LanguageSelector />
                    </div>
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <div key={item.id}>
                                {item.tools.length > 0 ? (
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                                        className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                                            isPathActive(item.href)
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                                    </button>
                                ) : (
                                    <Link
                                        to={getLocalizedPath(item.href)}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                                            isPathActive(item.href)
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                )}

                                {/* Mobile Dropdown */}
                                {item.tools.length > 0 && openDropdown === item.id && (
                                    <div className="bg-slate-50 space-y-1 py-2">
                                        {item.tools.map((tool: any) => (
                                            <Link
                                                key={tool.slug}
                                                to={getLocalizedPath(`/${tool.slug}`)}
                                                className="block px-6 py-2 text-sm text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {tool.h1 || tool.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                                    to={getLocalizedPath('/notarize/dashboard')}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LayoutDashboard size={20} />
                                    Notary Dashboard
                                </Link>
                                <button
                                    onClick={() => { signOut(); setIsMenuOpen(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50"
                                >
                                    <LogOut size={20} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { openAuthModal('login'); setIsMenuOpen(false); }}
                                className="w-full py-4 px-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all text-center"
                            >
                                Sign In / Get Started
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
