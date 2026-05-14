import * as React from 'react';

export const EliteBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-x-hidden isolate bg-[#fcfcfd]">
      {/* Very subtle static background accents */}
      <div className="mesh-bg pointer-events-none">
        <div className="mesh-blob bg-blue-400/10 -top-20 -left-20" style={{ animation: 'none' }} />
        <div className="mesh-blob bg-indigo-500/10 top-40 right-0" style={{ animation: 'none' }} />
        <div className="mesh-blob bg-violet-400/10 bottom-0 left-1/4" style={{ animation: 'none' }} />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
