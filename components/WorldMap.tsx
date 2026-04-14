import * as React from 'react';
import { JourneyLead } from '../services/leadService';

interface WorldMapProps {
  leads: JourneyLead[];
}

export const WorldMap: React.FC<WorldMapProps> = ({ leads }) => {
  // Extract unique countries from leads
  const activeCountries = React.useMemo(() => {
    const countries = new Set<string>();
    leads.forEach(lead => {
      if (lead.geoData?.country) {
        countries.add(lead.geoData.country);
      }
    });
    return countries;
  }, [leads]);

  return (
    <div className="w-full max-w-2xl relative">
      <svg
        viewBox="0 0 1000 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        {/* Very simplified world map paths for demo/lightweight feel */}
        <g className="opacity-10 stroke-slate-400 stroke-[0.5]">
           <rect x="100" y="100" width="150" height="250" rx="20" /> {/* Americas placeholder */}
           <rect x="400" y="80" width="100" height="150" rx="10" />  {/* Europe placeholder */}
           <rect x="400" y="230" width="120" height="180" rx="10" /> {/* Africa placeholder */}
           <rect x="550" y="100" width="250" height="200" rx="20" /> {/* Asia placeholder */}
           <rect x="750" y="320" width="100" height="80" rx="10" />  {/* Australia placeholder */}
        </g>

        {/* Dynamic Lead Indicators */}
        {leads.map((lead, i) => {
          if (!lead.geoData) return null;
          
          // Pseudo-random but consistent position based on country name for demo
          const country = lead.geoData.country;
          let x = 500;
          let y = 250;
          
          if (country === 'United States' || country === 'USA') { x = 200; y = 180; }
          else if (country === 'Canada') { x = 180; y = 120; }
          else if (country === 'United Kingdom' || country === 'UK') { x = 460; y = 140; }
          else if (country === 'Germany') { x = 480; y = 150; }
          else if (country === 'France') { x = 470; y = 155; }
          else if (country === 'India') { x = 680; y = 240; }
          else if (country === 'Australia') { x = 820; y = 350; }
          else if (country === 'Brazil') { x = 280; y = 320; }
          else {
            // Hash country string to fixed pos
            const hash = country.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
            x = 100 + (Math.abs(hash) % 800);
            y = 100 + (Math.abs(hash * 0.7) % 300);
          }

          return (
            <g key={lead.id || i} className="animate-in fade-in zoom-in duration-1000" style={{ animationDelay: `${i * 100}ms` }}>
              <circle cx={x} cy={y} r="8" className="fill-blue-600/20 animate-ping" />
              <circle cx={x} cy={y} r="4" className="fill-blue-600" />
              <g className="opacity-0 hover:opacity-100 transition-opacity">
                 <rect x={x + 10} y={y - 15} width="100" height="30" rx="8" className="fill-slate-900" />
                 <text x={x + 20} y={y + 5} className="fill-white text-[10px] font-black">{lead.geoData.city}</text>
              </g>
            </g>
          );
        })}
      </svg>
      {leads.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">
          Searching for global leads...
        </div>
      )}
    </div>
  );
};
