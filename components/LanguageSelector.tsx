import * as React from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export const LanguageSelector: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const currentLangCode = i18n.language || 'en';
    const currentLang = LANGUAGES.find(l => l.code === (currentLangCode.split('-')[0])) || LANGUAGES[0];

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (code: string) => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        const SUPPORTED_LANGS = ['es', 'fr', 'hi'];

        // Remove current lang prefix if exists
        if (SUPPORTED_LANGS.includes(pathParts[0])) {
            pathParts.shift();
        }

        // Add new lang prefix if not English
        if (code !== 'en') {
            pathParts.unshift(code);
        }

        const newPath = '/' + pathParts.join('/');
        setIsOpen(false);
        navigate(newPath);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
            >
                <Languages size={18} className="text-blue-600" />
                <span className="hidden sm:inline">{currentLang.label}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${currentLang.code === lang.code
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className="font-medium">{lang.label}</span>
                                </div>
                                {currentLang.code === lang.code && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
