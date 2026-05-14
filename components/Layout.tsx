import * as React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    currentLang?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentLang = 'en' }) => {
    return (
        <div className="relative min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors bg-[#fcfcfd]">
            <Header currentLang={currentLang} />
            <main className="flex-1 w-full pt-20">
                {children}
            </main>
            <Footer currentLang={currentLang} />
        </div>
    );
};
