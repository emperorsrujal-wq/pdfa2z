import React, { useState } from 'react';
import { Video, Bot, Film, Download } from 'lucide-react';
import { VideoGenerator } from './VideoGenerator.tsx';
import { VideoAnalyzer } from './VideoAnalyzer.tsx';
import { VideoDownloader } from './VideoDownloader.tsx';
import { VideoToolMode } from '../types.ts';

interface VideoSuiteProps {
  initialMode?: VideoToolMode;
}

export const VideoSuite: React.FC<VideoSuiteProps> = ({ initialMode = 'GENERATE' }) => {
  const [activeTab, setActiveTab] = useState<VideoToolMode>(
      (initialMode === 'MENU') ? 'GENERATE' : initialMode
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4">
           <div className="p-2.5 bg-rose-600 rounded-2xl text-white shadow-lg">
             <Video className="w-8 h-8" />
           </div>
           Video Studio
        </h2>
        
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner w-fit overflow-x-auto max-w-full">
           <button
             onClick={() => setActiveTab('GENERATE')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
               activeTab === 'GENERATE' 
                 ? 'bg-rose-600 text-white shadow-xl' 
                 : 'text-slate-400 hover:text-slate-900'
             }`}
           >
             <Film className="w-4 h-4" />
             Generator
           </button>
           <button
             onClick={() => setActiveTab('CHAT')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
               activeTab === 'CHAT' 
                 ? 'bg-rose-600 text-white shadow-xl' 
                 : 'text-slate-400 hover:text-slate-900'
             }`}
           >
             <Bot className="w-4 h-4" />
             AI Chat
           </button>
           <button
             onClick={() => setActiveTab('DOWNLOAD')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
               activeTab === 'DOWNLOAD' 
                 ? 'bg-rose-600 text-white shadow-xl' 
                 : 'text-slate-400 hover:text-slate-900'
             }`}
           >
             <Download className="w-4 h-4" />
             Downloader
           </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-1">
        <div className="h-full overflow-y-auto custom-scrollbar p-6">
            {activeTab === 'GENERATE' && <VideoGenerator />}
            {activeTab === 'CHAT' && <VideoAnalyzer />}
            {activeTab === 'DOWNLOAD' && <VideoDownloader />}
        </div>
      </div>
    </div>
  );
};