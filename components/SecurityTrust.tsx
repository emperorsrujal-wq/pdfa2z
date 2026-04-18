import * as React from 'react';
import { useState } from 'react';
import { ShieldCheck, Lock, Globe, FileCheck, Info } from 'lucide-react';
import { SecurityComplianceModal } from './SecurityComplianceModal';

interface SecurityTrustProps {
  className?: string;
  horizontal?: boolean;
  enabledBadges?: ('encryption' | 'soc2' | 'hipaa' | 'gdpr')[];
}

export const SecurityTrust: React.FC<SecurityTrustProps> = ({ 
  className = '', 
  horizontal = false,
  enabledBadges = ['encryption', 'soc2', 'hipaa', 'gdpr']
}) => {
  const [showModal, setShowModal] = useState(false);

  const allItems = [
    { id: 'encryption', icon: <Lock size={12} />, label: '256-bit Encryption' },
    { id: 'soc2', icon: <ShieldCheck size={12} />, label: 'SOC 2 Compliant' },
    { id: 'hipaa', icon: <FileCheck size={12} />, label: 'HIPAA Ready' },
    { id: 'gdpr', icon: <Globe size={12} />, label: 'GDPR / CCPA' },
  ];

  const items = allItems.filter(item => enabledBadges.includes(item.id as any));

  return (
    <>
      <div className={`flex ${horizontal ? 'flex-row justify-center gap-6' : 'flex-col gap-3'} ${className}`}>
        {items.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer group"
          >
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
              {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'text-slate-400 group-hover:text-blue-400' })}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-200">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {showModal && <SecurityComplianceModal onClose={() => setShowModal(false)} />}
    </>
  );
};
