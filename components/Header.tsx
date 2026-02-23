import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, FileText, Image, Video, File, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
    currentLang?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentLang = 'en' }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();

    // Helper to generate localized paths
    const getLocalizedPath = (path: string) => {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        if (currentLang === 'en') return `/${cleanPath}`;
        return `/${currentLang}/${cleanPath}`;
    };

    const navigation = [
        { name: t('common.aiTools'), href: '/ai-tools', icon: Zap },
        { name: t('common.pdfTools'), href: '/pdf-tools', icon: FileText },
        { name: t('common.imageTools'), href: '/image-tools', icon: Image },
        { name: t('common.fileTools'), href: '/file-tools', icon: File },
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
                <nav className="hidden md:flex items-center gap-8">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={getLocalizedPath(item.href)}
                            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Search & Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageSelector />
                    <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors">
                        <Search className="h-5 w-5" />
                    </button>
                    <Link
                        to={getLocalizedPath('/login')}
                        className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        {t('common.signIn')}
                    </Link>
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
                            <Link
                                key={item.name}
                                to={getLocalizedPath(item.href)}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};
