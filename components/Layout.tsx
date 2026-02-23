import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    currentLang?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentLang = 'en' }) => {
    return (
        <div className="flex min-h-screen flex-col font-sans text-slate-900 bg-slate-50">
            <Header currentLang={currentLang} />
            <main className="flex-1 w-full">
                {children}
            </main>
            <Footer currentLang={currentLang} />
        </div>
    );
};
