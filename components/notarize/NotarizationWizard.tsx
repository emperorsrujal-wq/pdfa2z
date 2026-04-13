import * as React from 'react';
import {
  Upload, FileText, CheckCircle2, CreditCard, Video, ArrowRight, ArrowLeft,
  Loader2, X, User, Mail, Phone, AlertCircle, Info, Gavel, Building, Home, ShieldCheck, AlertTriangle
} from 'lucide-react';
import {
  uploadDocument, createSession, createPaymentIntent,
  DocumentType, NotaryType, NotarizeDocument, NotarizationSession,
  DOCUMENT_TYPE_LABELS, formatFileSize
} from '../../services/notarizeService';
import { DEMO_MODE } from '../../config/firebase';

interface WizardProps {
  onComplete: (session: NotarizationSession) => void;
  onCancel: () => void;
}

const STEPS = [
  { num: 1, label: 'Upload',  icon: Upload },
  { num: 2, label: 'Details', icon: FileText },
  { num: 3, label: 'Payment', icon: CreditCard },
  { num: 4, label: 'Begin',   icon: Video },
];

const DOC_TYPES: { value: DocumentType; label: string; Icon: any }[] = [
  { value: 'power_of_attorney', label: 'Power of Attorney', Icon: FileText },
  { value: 'affidavit',         label: 'Affidavit',         Icon: Gavel },
  { value: 'mortgage',          label: 'Mortgage Document', Icon: Home },
  { value: 'contract',          label: 'Contract',          Icon: FileText },
  { value: 'id_document',       label: 'ID Document',       Icon: User },
  { value: 'other',             label: 'Other',             Icon: CheckCircle2 },
];

const NOTARY_TYPES: { value: NotaryType; label: string; desc: string }[] = [
  { value: 'acknowledgment', label: 'Acknowledgment', desc: 'Most common - confirms you signed the document voluntarily' },
  { value: 'jurat',          label: 'Jurat',          desc: 'You swear or affirm the document contents are true' },
  { value: 'witness',        label: 'Witness',        desc: 'The notary witnesses your signature' },
];

// -- Step 1: Upload ------------------------------------------------------------
const UploadStep: React.FC<{ onNext: (doc: NotarizeDocument, type: DocumentType) => void }> = ({ onNext }) => {
  const [docType, setDocType] = React.useState<DocumentType | ''>('');
  const [file, setFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return; }
    setFile(f);
    setError('');
  };

  const handleUpload = async () => {
    if (!file || !docType) return;
    setUploading(true);
    setError('');
    try {
      const uploaded = await uploadDocument(file, docType as DocumentType, setProgress);
      onNext(uploaded, docType as DocumentType);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 mb-1">Upload Your Document</h3>
        <p className="text-slate-500 text-sm">PDF only (max 10 MB) - your file is encrypted immediately</p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-[#f59e0b] bg-amber-50/10' : file ? 'border-[#10b981] bg-emerald-50/10' : 'border-slate-800 hover:border-[#f59e0b]/50 hover:bg-white/5'}`}
      >
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 size={40} className="text-[#10b981]" />
            <p className="font-bold text-white">{file.name}</p>
            <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
            <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-400 hover:underline">Remove</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
              <Upload size={28} className="text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-300">Click or drag your PDF here</p>
              <p className="text-sm text-slate-500 mt-1">Encrypted & Secure</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Document Type</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DOC_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setDocType(t.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${docType === t.value ? 'border-[#f59e0b] bg-amber-50/5' : 'border-white/5 hover:border-white/10'}`}
            >
              <t.Icon size={18} className={docType === t.value ? 'text-[#f59e0b]' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${docType === t.value ? 'text-white' : 'text-slate-400'}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!file || !docType || uploading}
        onClick={handleUpload}
        className="nw-btn-gold w-full h-14 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Uploading... {progress}%</span>
          </>
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight size={20} />
          </>
        )}
      </button>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
        <AlertCircle size={18} className="text-red-400" />
        <p className="text-sm text-red-400 font-medium">{error}</p>
      </div>}
    </div>
  );
};

// -- Step 2: Details -----------------------------------------------------------
const DetailsStep: React.FC<{ document: NotarizeDocument, onNext: (t: NotaryType, s: number, e: string, p: string) => void, onBack: () => void }> = ({ document, onNext, onBack }) => {
  const [notaryType, setNotaryType] = React.useState<NotaryType | ''>('');
  const [numSigners, setNumSigners] = React.useState(1);
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="w-12 h-12 bg-[#f59e0b]/10 rounded-xl flex items-center justify-center">
          <FileText size={24} className="text-[#f59e0b]" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Selected Document</p>
          <p className="font-bold text-white truncate max-w-[200px]">{document.file_name}</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Notarization Type</label>
        <div className="space-y-3">
          {NOTARY_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setNotaryType(t.value)}
              className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${notaryType === t.value ? 'border-[#f59e0b] bg-amber-50/5' : 'border-white/5 hover:border-white/10'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold ${notaryType === t.value ? 'text-white' : 'text-slate-400'}`}>{t.label}</span>
                {notaryType === t.value && <CheckCircle2 size={18} className="text-[#f59e0b]" />}
              </div>
              <p className="text-sm text-slate-500">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Number of Signers</label>
          <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1">
            <button onClick={() => setNumSigners(Math.max(1, numSigners - 1))} className="p-3 text-slate-400 hover:text-white"><ArrowLeft size={16} /></button>
            <span className="flex-1 text-center font-bold text-white">{numSigners}</span>
            <button onClick={() => setNumSigners(numSigners + 1)} className="p-3 text-slate-400 hover:text-white"><ArrowRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Contact Information</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-500" size={18} />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="brand-input pl-12 mb-0" />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-4 text-slate-500" size={18} />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="brand-input pl-12 mb-0" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onBack} className="nw-btn-ghost px-8 h-14">Back</button>
        <button
          disabled={!notaryType || !email || !phone}
          onClick={() => onNext(notaryType as NotaryType, numSigners, email, phone)}
          className="nw-btn-gold flex-1 h-14 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>Continue to Payment</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// -- Step 3: Payment -----------------------------------------------------------
const PaymentStep: React.FC<{ document: NotarizeDocument, numSigners: number, session: NotarizationSession | null, onPaid: () => void, onBack: () => void }> = ({ document, numSigners, session, onPaid, onBack }) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const price = 25 + (numSigners > 1 ? (numSigners - 1) * 10 : 0);

  const handlePay = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      onPaid();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-black text-white mb-2">Secure Payment</h3>
        <p className="text-slate-500">Pay securely using Stripe. All transactions are encrypted.</p>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Electronic Notarization (1 Doc)</span>
          <span className="text-white font-bold">$25.00</span>
        </div>
        {numSigners > 1 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Additional Signers ({numSigners - 1})</span>
            <span className="text-white font-bold">${((numSigners - 1) * 10).toFixed(2)}</span>
          </div>
        )}
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-white">Total Amount</span>
          <span className="text-2xl font-black text-[#f59e0b]">${price.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-xl">
          <ShieldCheck size={20} className="text-[#f59e0b]" />
          <p className="text-sm text-slate-300">Your notarization will be stored securely for 10 years.</p>
        </div>

        <div className="flex gap-4">
          <button onClick={onBack} className="nw-btn-ghost px-8 h-14">Back</button>
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="nw-btn-gold flex-1 h-14 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard size={20} />
                <span>Pay and Begin Notarization</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// -- Step 4: Launch ------------------------------------------------------------
const LaunchStep: React.FC<{ session: NotarizationSession, onGoToDashboard: () => void }> = ({ session, onGoToDashboard }) => {
  return (
    <div className="text-center py-10 space-y-8">
      <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
        <CheckCircle2 size={48} />
      </div>
      <div>
        <h3 className="text-2xl font-black text-white mb-2">Session Ready!</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Your remote online notarization (RON) session is prepared. You can join now or later from your dashboard.</p>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-left max-w-sm mx-auto">
        <p className="text-xs font-black text-slate-500 uppercase mb-4">Session Details</p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Session ID</span>
            <span className="text-white font-mono">{session.id.slice(0, 12)}...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className="text-[#f59e0b] font-bold uppercase">{session.status}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4">
        <a 
          href={`/notarize/session/${session.id}`} 
          className="nw-btn-gold h-14 flex items-center justify-center gap-2 text-decoration-none"
        >
          <Video size={20} />
          Join Notary Session Now
        </a>
        <button onClick={onGoToDashboard} className="nw-btn-ghost h-14">Return to Dashboard</button>
      </div>
    </div>
  );
};

// -- Main Component -------------------------------------------------------------
export const NotarizationWizard: React.FC<WizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = React.useState(1);
  const [uploadedDoc, setUploadedDoc] = React.useState<NotarizeDocument | null>(null);
  const [docType, setDocType] = React.useState<DocumentType | null>(null);
  const [notaryType, setNotaryType] = React.useState<NotaryType | null>(null);
  const [numSigners, setNumSigners] = React.useState(1);
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  
  const [creatingSession, setCreatingSession] = React.useState(false);
  const [sessionError, setSessionError] = React.useState('');
  const [session, setSession] = React.useState<NotarizationSession | null>(null);

  const CSS = `
    .nw-root {
      background: #05080f; min-height: 100vh; color: #fff;
      display: flex; flex-direction: column; overflow: hidden; position: relative;
    }
    .nw-glow-tl {
      position: fixed; top: -300px; left: -300px; width: 700px; height: 700px;
      background: radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 65%);
      pointer-events: none; z-index: 0;
    }
    .nw-card {
      background: rgba(10, 15, 28, 0.8); backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .nw-btn-gold {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000;
      font-weight: 800; border: none; border-radius: 12px; cursor: pointer;
      transition: all 0.2s;
    }
    .nw-btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(245,158,11,0.3); }
    .nw-btn-ghost {
      background: transparent; color: #94a3b8; border: 1.5px solid rgba(255,255,255,0.1);
      font-weight: 600; border-radius: 12px; cursor: pointer; transition: all 0.2s;
    }
    .nw-btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.02); }
    .nw-pill { height: 4px; border-radius: 2px; flex: 1; background: rgba(255,255,255,0.05); transition: background 0.35s; }
    .nw-pill.active { background: #f59e0b; box-shadow: 0 0 10px rgba(245,158,11,0.3); }
    .nw-pill.done { background: #10b981; }
    
    input, select, textarea {
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
      color: #fff !important; border-radius: 12px !important; outline: none !important;
      transition: all 0.2s !important;
    }
    input:focus, select:focus {
      border-color: #f59e0b !important;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1) !important;
      background: rgba(255, 255, 255, 0.05) !important;
    }
  `;

  const handleUploadDone = (doc: NotarizeDocument, type: DocumentType) => {
    setUploadedDoc(doc);
    setDocType(type);
    setStep(2);
  };

  const handleDetailsDone = async (nType: NotaryType, signers: number, email: string, phone: string) => {
    setNotaryType(nType);
    setNumSigners(signers);
    setContactEmail(email);
    setContactPhone(phone);
    setCreatingSession(true);
    setSessionError('');
    try {
      const sess = await createSession({
        document: uploadedDoc!,
        notaryType: nType,
        numSigners: signers,
        contactEmail: email,
        contactPhone: phone,
      });
      setSession(sess);
      setStep(3);
    } catch (err: any) {
      setSessionError(err.message || 'Failed to create session.');
    } finally {
      setCreatingSession(false);
    }
  };

  const handlePaid = () => {
    setStep(4);
    if (session) onComplete(session);
  };

  return (
    <div className="nw-root">
      <style>{CSS}</style>
      <div className="nw-glow-tl" />

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', zIndex: 10 }}>
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} color="#000" strokeWidth={3} />
            </div>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 800, color: '#fff' }}>
              New Notarization
            </span>
          </div>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: 8, borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-5 py-10 z-10">
        <div className="flex items-center gap-3 mb-10">
          {STEPS.map((s) => (
            <div key={s.num} className={`nw-pill ${step > s.num ? 'done' : step === s.num ? 'active' : ''}`} />
          ))}
        </div>

        <div className="nw-card p-8 md:p-10 flex-1">
          {step === 1 && <UploadStep onNext={handleUploadDone} />}
          {step === 2 && uploadedDoc && (
            <>
              {creatingSession ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={40} className="animate-spin text-[#f59e0b]" />
                  <p style={{ fontWeight: 700, color: '#94a3b8' }}>Establishing secure connection...</p>
                </div>
              ) : (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  {sessionError && (
                    <div style={{ padding: 16, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, marginBottom: 20, display: 'flex', gap: 12 }}>
                      <AlertTriangle size={18} className="text-[#f87171]" />
                      <p style={{ color: '#f87171', fontSize: 13, fontWeight: 600, margin: 0 }}>{sessionError}</p>
                    </div>
                  )}
                  <DetailsStep document={uploadedDoc} onNext={handleDetailsDone} onBack={() => setStep(1)} />
                </div>
              )}
            </>
          )}
          {step === 3 && uploadedDoc && (
            <PaymentStep
              document={uploadedDoc}
              numSigners={numSigners}
              session={session}
              onPaid={handlePaid}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && session && (
            <LaunchStep session={session} onGoToDashboard={onCancel} />
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ShieldCheck size={14} className="text-[#10b981]" /> End-to-End Encryption Active (AES-256)
          </p>
        </div>
      </div>
    </div>
  );
};
