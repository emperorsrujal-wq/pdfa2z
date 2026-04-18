import * as React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    currentLang?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentLang = 'en' }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 40; // Max 20px shift
        const y = (clientY / window.innerHeight - 0.5) * 40;
        
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors"
        >

            <Header currentLang={currentLang} />
            <main className="flex-1 w-full pt-20">
                {children}
            </main>
            <Footer currentLang={currentLang} />
        </div>
    );
};
