import * as React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface SmartRedactButtonProps {
  onScan: () => void;
  isScanning: boolean;
  disabled?: boolean;
}

export const SmartRedactButton: React.FC<SmartRedactButtonProps> = ({
  onScan,
  isScanning,
  disabled
}) => {
  return (
    <button
      onClick={onScan}
      disabled={isScanning || disabled}
      className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl overflow-hidden ${
        isScanning 
          ? 'bg-indigo-100 text-indigo-400 cursor-wait' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-95'
      }`}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {isScanning ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <ShieldCheck className="group-hover:rotate-12 transition-transform" size={18} />
      )}
      
      <div className="flex flex-col items-start leading-tight">
        <span>Smart Redact</span>
        {isScanning ? (
          <span className="text-[8px] opacity-50 font-mono">Scanning...</span>
        ) : (
          <span className="text-[8px] opacity-70 font-mono">AI Privacy Scan</span>
        )}
      </div>

      {/* Pulsing Light */}
      {!isScanning && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full m-1 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
      )}
    </button>
  );
};
