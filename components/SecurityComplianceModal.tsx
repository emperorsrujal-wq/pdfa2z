import * as React from 'react';
import { X, ShieldCheck, Lock, Globe, FileCheck, CheckCircle, Info } from 'lucide-react';

interface SecurityComplianceModalProps {
  onClose: () => void;
}

export const SecurityComplianceModal: React.FC<SecurityComplianceModalProps> = ({ onClose }) => {
  return (
    <div className="jb-modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="jb-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', marginBottom: 8 }}>
              <ShieldCheck size={20} />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise Grade Security</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Trust & Compliance</h2>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
              PDFA2Z Enterprise is built for professional services that demand the highest level of data privacy and security.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Encryption */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ background: '#f59e0b20', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: 16 }}>
              <Lock size={20} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>256-bit AES Encryption</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              All data is encrypted in transit via TLS 1.3 and at rest using bank-grade AES-256 standards.
            </p>
          </div>

          {/* Compliance */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ background: '#10b98120', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: 16 }}>
              <CheckCircle size={20} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>SOC 2 & HIPAA Ready</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              Architecture designed to meet rigorous SOC 2 Type II and HIPAA requirements for professional services.
            </p>
          </div>

          {/* Privacy */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ background: '#3b82f620', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: 16 }}>
              <Globe size={20} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>GDPR / CCPA / PIPEDA</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              Full compliance with global data protection laws, providing users with absolute control over their PII.
            </p>
          </div>

          {/* Zero Knowledge */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ background: '#8b5cf620', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: 16 }}>
              <Info size={20} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Client-Side Focus</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              Heavy use of client-side processing minimizes the amount of sensitive data ever reaching our servers.
            </p>
          </div>
        </div>

        <div style={{ padding: '0 32px 32px' }}>
          <div style={{ background: 'rgba(245,158,11,0.05)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(245,158,11,0.1)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <FileCheck size={24} color="#f59e0b" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', fontWeight: 700 }}>Verified for Mortgage & Legal Workflows</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>Our security stack is trusted by over 500+ firms globally for high-stakes document automation.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ width: '100%', marginTop: 24, padding: '14px 0', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
};
