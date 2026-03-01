import * as React from 'react';
import {  useState  } from 'react';
import { Terminal, X, Rocket } from 'lucide-react';

export const DevHelp = () => {
  const [isOpen, setIsOpen] = useState(true);

  // Safely check for development mode without using Vite-specific build tools
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isDev) return null;

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-slate-700"
      title="How to Publish"
    >
      <Rocket className="w-6 h-6" />
    </button>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-fade-in-up">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Rocket className="w-4 h-4" />
            <span>Go Live Control</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-300">
            You are in <strong>Editor Mode</strong>. To push your latest changes to the live internet instantly:
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Terminal className="w-3 h-3" />
              Easy Publish Command
            </div>
            <div className="bg-black/50 rounded-lg p-3 font-mono text-sm border border-slate-700 flex items-center justify-between group relative">
              <span className="text-green-400 font-bold">npm run publish</span>
              <span className="text-[10px] text-slate-500 italic">Type in Terminal & Enter</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-400 pt-3 border-t border-slate-700">
            <div className="mt-0.5 min-w-[4px] h-[4px] rounded-full bg-yellow-500" />
            <p>
              Note: If this is your very first time, type <code className="text-yellow-400">firebase login</code> in the terminal first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};