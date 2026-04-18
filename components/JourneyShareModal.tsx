import * as React from 'react';
import { X, Copy, Check, ExternalLink, Code, QrCode, Download } from 'lucide-react';
import { generateJourneyQR, downloadJourneyQR } from '../utils/journeyQR';

interface JourneyShareModalProps {
  fileName: string;
  journeyTitle: string;
  onClose: () => void;
}

export const JourneyShareModal: React.FC<JourneyShareModalProps> = ({ fileName, journeyTitle, onClose }) => {
  const [copied, setCopied] = React.useState<'link' | 'embed' | null>(null);
  const [qrColor, setQrColor] = React.useState('#000000');
  
  // Simulation of a public URL
  const publicId = btoa(fileName).substring(0, 8);
  const publicUrl = `https://pdfa2z.com/j/${publicId}`;
  
  // Responsive Embed Snippet
  const embedCode = `<!-- PDFA2Z Responsive Embed -->
<div id="pdfa2z-container-${publicId}" style="width:100%; min-height:600px; position:relative;">
  <iframe src="${publicUrl}" style="width:1px; min-width:100%; height:600px; border:none;" scrolling="no" id="pdfa2z-iframe-${publicId}"></iframe>
  <script src="https://pdfa2z.com/scripts/iframeResizer.min.js"></script>
  <script>iFrameResize({ log: false, checkOrigin: false }, '#pdfa2z-iframe-${publicId}')</script>
</div>`.trim();

  const qrUrl = generateJourneyQR(publicUrl, 250, qrColor);

  const handleCopy = (text: string, type: 'link' | 'embed') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="jb-modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="jb-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Distribute Journey</h2>
            <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Share your workflow with clients and partners</p>
          </div>
          <X size={24} style={{ cursor: 'pointer', color: '#64748b' }} onClick={onClose} />
        </div>

        <div style={{ padding: 24, display: 'grid', gap: 24 }}>
          {/* Public Link */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Public Smart Link</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {publicUrl}
              </div>
              <button 
                onClick={() => handleCopy(publicUrl, 'link')}
                style={{ padding: '0 16px', background: copied === 'link' ? '#10b981' : '#f59e0b', color: '#000', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
              >
                {copied === 'link' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'link' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Iframe Embed */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Website Embed (Responsive iFrame)</label>
            <div style={{ display: 'flex', gap: 8 }}>
               <textarea 
                readOnly
                className="brand-textarea"
                style={{ flex: 1, margin: 0, fontSize: 10, color: '#f59e0b', background: 'rgba(0,0,0,0.3)', height: 80 }}
                value={embedCode}
              />
              <button 
                onClick={() => handleCopy(embedCode, 'embed')}
                style={{ padding: '0 16px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', borderRadius: 10, cursor: 'pointer' }}
              >
                {copied === 'embed' ? <Check size={14} /> : <Code size={14} />}
              </button>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 10, color: '#64748b' }}>Includes <strong>iFrameResizer</strong> for automatic height adjustment.</p>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20 }}>
             <div style={{ background: '#fff', padding: 8, borderRadius: 12 }}>
                <img src={qrUrl} alt="QR Code" style={{ width: '100%', height: 'auto' }} />
             </div>
             <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Professional QR Code</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input 
                    type="color" 
                    value={qrColor} 
                    onChange={e => setQrColor(e.target.value)} 
                    style={{ width: 24, height: 24, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} 
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Branding Color</span>
                </div>
                <button 
                  onClick={() => downloadJourneyQR(publicUrl, fileName, qrColor)}
                  style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                >
                  <Download size={14} /> Download PNG
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
