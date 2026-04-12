import * as React from 'react';
import { History, User, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
}

interface AuditLogProps {
  entries: AuditEntry[];
  onClose: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ entries, onClose }) => {
  return (
    <div className="w-80 border-l border-white/5 bg-[#0f172a]/80 backdrop-blur-2xl flex flex-col h-full animate-slide-left shadow-2xl z-[200]">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <History size={16} className="text-indigo-400" />
          Audit Log
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {entries.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
            <Clock size={32} className="mb-4 opacity-20" />
            <p className="text-xs font-bold">No activity recorded yet.</p>
          </div>
        )}

        {entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((entry) => (
          <div key={entry.id} className="relative pl-6 pb-6 border-l border-white/10 last:pb-0">
            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">
                  {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/10 rounded text-[9px] font-bold text-indigo-400 border border-indigo-500/20">
                  <User size={8} /> {entry.user}
                </div>
              </div>
              
              <p className="text-xs font-bold text-slate-200">{entry.action}</p>
              {entry.details && (
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                  {entry.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white/5 border-t border-white/5">
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle2 size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Verified</span>
        </div>
      </div>
    </div>
  );
};
