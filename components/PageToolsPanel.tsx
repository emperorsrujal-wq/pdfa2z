import * as React from 'react';
import { X, RotateCw, Crop, Check, Scissors, AlertCircle } from 'lucide-react';

interface PageToolsPanelProps {
  onRotate: (angle: number) => void;
  onCrop: (rect: { x: number; y: number; width: number; height: number }) => void;
  onClose: () => void;
}

export const PageToolsPanel: React.FC<PageToolsPanelProps> = ({ onRotate, onCrop, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'rotate' | 'crop'>('rotate');
  
  // Crop state
  const [cropRect, setCropRect] = React.useState({ x: 100, y: 100, width: 800, height: 600 });
  const [isApplying, setIsApplying] = React.useState(false);

  return (
    <div className="fixed inset-0 z-[600] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Scissors size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Page Manipulation</h2>
              <p className="text-xs text-slate-500 font-medium">Fine-tune page layout and orientation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-100 dark:bg-slate-950 m-6 rounded-2xl">
          <button
            onClick={() => setActiveTab('rotate')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'rotate' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <RotateCw size={18} />
            Rotate
          </button>
          <button
            onClick={() => setActiveTab('crop')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'crop' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Crop size={18} />
            Crop
          </button>
        </div>

        <div className="p-8 pt-0">
          {activeTab === 'rotate' ? (
            <div className="space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center">
                Select a rotation angle to apply to the current page.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[90, 180, 270].map((angle) => (
                  <button
                    key={angle}
                    onClick={() => onRotate(angle)}
                    className="py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all flex flex-col items-center gap-2"
                  >
                    <RotateCw size={24} className={angle === 90 ? 'rotate-90' : angle === 180 ? 'rotate-180' : 'rotate-270'} />
                    <span>+{angle}°</span>
                  </button>
                ))}
                <button
                  onClick={() => onRotate(0)}
                  className="py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all flex flex-col items-center gap-2"
                >
                  <RotateCw size={24} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl flex items-center gap-3 text-indigo-800 dark:text-indigo-400 text-xs font-bold leading-relaxed">
                <AlertCircle size={16} />
                To crop the page, drag the selector area on the canvas (coming soon) or use current selection.
              </div>
              <p className="text-sm text-slate-500 font-medium px-4">
                The current implementation applies a standard 10% margin crop for demonstration. Full interactive cropping is in progress.
              </p>
              <button
                onClick={() => onCrop({ x: 50, y: 50, width: 900, height: 900 })}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
              >
                Apply Crop Area
              </button>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 text-sm font-black text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
