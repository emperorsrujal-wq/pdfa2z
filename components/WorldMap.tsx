import * as React from 'react';
import { JourneyLead } from '../services/leadService';
import { Globe, Users, TrendingUp } from 'lucide-react';

interface WorldMapProps {
  leads: JourneyLead[];
}

export const WorldMap: React.FC<WorldMapProps> = ({ leads }) => {
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="flex gap-4 w-full h-[300px]">
      {/* Map Container */}
      <div className="flex-1 relative bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden p-4">
        <svg
          viewBox="0 0 1000 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xl"
        >
          {/* Simple world map shapes */}
          <g className="opacity-10 stroke-slate-500 stroke-[0.5]">
             <path d="M150,150 Q200,100 250,150 T350,150" className="fill-slate-800" /> {/* Generic America */}
             <rect x="120" y="120" width="160" height="220" rx="40" />
             <rect x="420" y="80" width="90" height="120" rx="30" /> {/* Europe */}
             <rect x="420" y="220" width="110" height="150" rx="30" /> {/* Africa */}
             <rect x="580" y="100" width="220" height="180" rx="40" /> {/* Asia */}
             <rect x="760" y="320" width="90" height="70" rx="20" /> {/* Australia */}
          </g>

          {/* Points */}
          {leads.map((lead, i) => {
            if (!lead.geoData) return null;
            
            const country = lead.geoData.country;
            let x = 500; let y = 250;
            
            if (country === 'United States' || country === 'USA') { x = 200; y = 180; }
            else if (country === 'Canada') { x = 180; y = 120; }
            else if (country === 'United Kingdom' || country === 'UK') { x = 460; y = 140; }
            else if (country === 'Germany') { x = 480; y = 150; }
            else if (country === 'India') { x = 680; y = 240; }
            else if (country === 'Australia') { x = 820; y = 350; }
            else {
              const hash = (country || '').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
              x = 100 + (Math.abs(hash) % 800);
              y = 100 + (Math.abs(hash * 0.7) % 300);
            }

            return (
              <g key={lead.id || i} className="animate-in fade-in zoom-in duration-1000">
                <circle cx={x} cy={y} r="10" className="fill-amber-500/10 animate-ping" />
                <circle cx={x} cy={y} r="3" className="fill-amber-500" />
              </g>
            );
          })}
        </svg>
        
        {leads.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-[10px] uppercase font-black tracking-widest">
            Waiting for global activity...
          </div>
        )}
      </div>

      {/* Recent Activity Sidebar */}
      <div className="w-[180px] flex flex-col gap-2">
        <div style={{ fontSize: 9, fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <TrendingUp size={10} /> RECENT ACTIVITY
        </div>
        {recentLeads.length > 0 ? (
          recentLeads.map((lead, i) => (
            <div key={lead.id || i} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lead.data.full_name || 'Anonymous'}
              </div>
              <div style={{ fontSize: 8, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Globe size={8} /> {lead.geoData?.city || 'Unknown'}
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl opacity-30">
            <Users size={20} />
            <span style={{ fontSize: 8, marginTop: 8 }}>NO LEADS YET</span>
          </div>
        )}
      </div>
    </div>
  );
};
