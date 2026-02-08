import React, { useState } from 'react';
import { FileText, Settings, Bot } from 'lucide-react';
import { PdfAnalyzer } from './PdfAnalyzer.tsx';
import { PdfToolkit } from './PdfToolkit.tsx';
import { PdfToolMode } from '../types.ts';

interface PdfSuiteProps {
  initialTab?: 'CHAT' | 'TOOLS';
  initialToolMode?: PdfToolMode;
}

export const PdfSuite: React.FC<PdfSuiteProps> = ({ initialTab = 'CHAT', initialToolMode = 'MENU' }) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'TOOLS'>(initialTab);

  // If initial props change (e.g. from dashboard navigation), update state
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4">
           <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg">
             <FileText className="w-8 h-8" />
           </div>
           PDF Workspace
        </h2>
        
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner w-fit">
           <button
             onClick={() => setActiveTab('CHAT')}
             className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
               activeTab === 'CHAT' 
                 ? 'bg-indigo-600 text-white shadow-xl' 
                 : 'text-slate-400 hover:text-slate-900'
             }`}
           >
             <Bot className="w-4 h-4" />
             AI Chat
           </button>
           <button
             onClick={() => setActiveTab('TOOLS')}
             className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
               activeTab === 'TOOLS' 
                 ? 'bg-indigo-600 text-white shadow-xl' 
                 : 'text-slate-400 hover:text-slate-900'
             }`}
           >
             <Settings className="w-4 h-4" />
             Toolkit
           </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-1">
        {activeTab === 'CHAT' ? (
            <PdfAnalyzer /> 
        ) : (
            <PdfToolkit initialMode={initialToolMode} />
        )}
      </div>
    </div>
  );
};