import * as React from 'react';

import { FileText, Settings, Bot } from 'lucide-react';
import { PdfAnalyzer } from './PdfAnalyzer.tsx';
import { PdfToolkit } from './PdfToolkit.tsx';
import { PdfToolMode } from '../types.ts';

interface PdfSuiteProps {
  initialTab?: 'CHAT' | 'TOOLS';
  initialToolMode?: PdfToolMode;
}

export const PdfSuite: React.FC<PdfSuiteProps> = ({ initialTab = 'CHAT', initialToolMode = 'MENU' }) => {
  const [activeTab, setActiveTab] = React.useState<'CHAT' | 'TOOLS'>(initialTab);

  // If initial props change (e.g. from dashboard navigation), update state
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-14rem)] flex flex-col animate-fade-in px-4">
      {initialToolMode !== 'EDIT' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            PDF Workspace
          </h2>

          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'CHAT'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Bot className="w-4 h-4" />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('TOOLS')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'TOOLS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Settings className="w-4 h-4" />
              Toolkit
            </button>
          </div>
        </div>
      )}

      <div className={`flex-1 min-h-0 bg-white ${initialToolMode === 'EDIT' ? '' : 'rounded-2xl border border-slate-100 shadow-sm'} overflow-hidden`}>
        {activeTab === 'CHAT' ? (
          <PdfAnalyzer />
        ) : (
          <PdfToolkit initialMode={initialToolMode} />
        )}
      </div>
    </div>
  );
};
