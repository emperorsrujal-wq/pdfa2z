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
            className="relative min-h-screen flex flex-col font-sans text-slate-900 overflow-x-hidden"
        >
            <div className="mesh-bg">
                <div className="mesh-blob bg-blue-100/50 -top-20 -left-20" />
                <div className="mesh-blob bg-indigo-100/50 top-40 right-0" style={{ animationDelay: '-5s' }} />
                <div className="mesh-blob bg-teal-100/30 bottom-0 left-1/4" style={{ animationDelay: '-10s' }} />
            </div>

            <Header currentLang={currentLang} />
            <main className="flex-1 w-full pt-20">
                {children}
            </main>
            <Footer currentLang={currentLang} />
        </div>
    );
};
