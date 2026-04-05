import * as React from 'react';
import {
  Upload, FileText, CheckCircle2, CreditCard, Video, ArrowRight, ArrowLeft,
  Loader2, X, User, Mail, Phone, AlertCircle, Info
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

const DOC_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'power_of_attorney', label: 'Power of Attorney', icon: '📋' },
  { value: 'affidavit',         label: 'Affidavit',         icon: '🏛️' },
  { value: 'mortgage',          label: 'Mortgage Document', icon: '🏠' },
  { value: 'contract',          label: 'Contract',          icon: '📄' },
  { value: 'id_document',       label: 'ID Document',       icon: '🪪' },
  { value: 'other',             label: 'Other',             icon: '✅' },
];

const NOTARY_TYPES: { value: NotaryType; label: string; desc: string }[] = [
  { value: 'acknowledgment', label: 'Acknowledgment', desc: 'Most common — confirms you signed the document voluntarily' },
  { value: 'jurat',          label: 'Jurat',          desc: 'You swear or affirm the document\'s contents are true' },
  { value: 'witness',        label: 'Witness',        desc: 'The notary witnesses your signature' },
];

// ── Step 1: Upload ────────────────────────────────────────────────────────────
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
        <p className="text-slate-500 text-sm">PDF only · max 10 MB · your file is encrypted immediately</p>
      </div>

      {/* Drag-drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-[#185FA5] bg-blue-50' : file ? 'border-[#639922] bg-green-50' : 'border-slate-200 hover:border-[#185FA5]/50 hover:bg-slate-50'}`}
      >
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 size={40} className="text-[#639922]" />
            <p className="font-bold text-slate-800">{file.name}</p>
            <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
            <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Upload size={28} className="text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-700">Click or drag your PDF here</p>
              <p className="text-xs text-slate-400 mt-1">PDF · max 10 MB · AES-256 encrypted</p>
            </div>
          </div>
        )}
        {uploading && (
          <div className="mt-4">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#185FA5] transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1">Uploading... {progress}%</p>
          </div>
        )}
      </div>

      {/* Document type */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">Document Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {DOC_TYPES.map(dt => (
            <button
              key={dt.value}
              onClick={() => setDocType(dt.value)}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-left border-2 text-sm font-medium transition-all ${docType === dt.value ? 'border-[#185FA5] bg-blue-50 text-[#185FA5]' : 'border-slate-100 hover:border-slate-200 text-slate-700 bg-slate-50'}`}
            >
              <span className="text-lg">{dt.icon}</span>
              <span className="leading-tight text-xs font-semibold">{dt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm flex items-center gap-2"><AlertCircle size={15} /> {error}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || !docType || uploading}
        className="w-full py-3.5 bg-[#185FA5] hover:bg-[#144e8a] text-white font-black rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
      >
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
        {uploading ? 'Uploading...' : 'Continue to Details'}
      </button>
    </div>
  );
};

// ── Step 2: Details ────────────────────────────────────────────────────────────
const DetailsStep: React.FC<{
  document: NotarizeDocument;
  onNext: (notaryType: NotaryType, signers: number, email: string, phone: string) => void;
  onBack: () => void;
}> = ({ document, onNext, onBack }) => {
  const [notaryType, setNotaryType] = React.useState<NotaryType>('acknowledgment');
  const [signers, setSigners]       = React.useState(1);
  const [email, setEmail]           = React.useState('');
  const [phone, setPhone]           = React.useState('');

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#185FA5] focus:bg-white outline-none transition-all';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 mb-1">Notarization Details</h3>
        <p className="text-slate-500 text-sm">Configure your session</p>
      </div>

      {/* Document preview */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="w-10 h-10 bg-[#185FA5]/10 rounded-lg flex items-center justify-center">
          <FileText size={20} className="text-[#185FA5]" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">{document.file_name}</p>
          <p className="text-xs text-slate-500">{formatFileSize(document.file_size)} · {DOCUMENT_TYPE_LABELS[document.document_type]}</p>
        </div>
        <CheckCircle2 size={18} className="text-[#639922] shrink-0 ml-auto" />
      </div>

      {/* Notary type */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">Notarization Type *</label>
        <div className="space-y-2">
          {NOTARY_TYPES.map(nt => (
            <button
              key={nt.value}
              onClick={() => setNotaryType(nt.value)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${notaryType === nt.value ? 'border-[#185FA5] bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${notaryType === nt.value ? 'border-[#185FA5] bg-[#185FA5]' : 'border-slate-300'}`}>
                {notaryType === nt.value && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{nt.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{nt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Number of signers */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Number of Signers</label>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setSigners(n)}
              className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all ${signers === n ? 'border-[#185FA5] bg-[#185FA5] text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {n}
            </button>
          ))}
        </div>
        {signers > 1 && <p className="text-xs text-slate-500 mt-2"><Info size={12} className="inline mr-1" />Additional signers are $35 each</p>}
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Email *</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={`${inputCls} pl-9`} placeholder="you@example.com" required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={`${inputCls} pl-9`} placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => email && onNext(notaryType, signers, email, phone)}
          disabled={!email}
          className="flex-1 py-3 bg-[#185FA5] hover:bg-[#144e8a] text-white font-black rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
        >
          Continue to Payment <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// ── Step 3: Payment ────────────────────────────────────────────────────────────
const PaymentStep: React.FC<{
  document: NotarizeDocument;
  numSigners: number;
  session: NotarizationSession | null;
  onPaid: () => void;
  onBack: () => void;
}> = ({ document, numSigners, session, onPaid, onBack }) => {
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState('');

  const firstDocCost = 4500;
  const additionalCost = (numSigners - 1) * 3500;
  const total = firstDocCost + additionalCost;

  const handlePay = async () => {
    if (!session) return;
    setProcessing(true);
    setError('');
    try {
      const { clientSecret } = await createPaymentIntent(session.id);

      if (DEMO_MODE || clientSecret.startsWith('demo_')) {
        // Demo: simulate payment success
        await new Promise(r => setTimeout(r, 1500));
        onPaid();
      } else {
        // Real Stripe — would need @stripe/stripe-js loaded
        // const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        // await stripe.confirmCardPayment(clientSecret, { payment_method: { card: elements.getElement('card') } });
        onPaid();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 mb-1">Review & Pay</h3>
        <p className="text-slate-500 text-sm">Secure payment via Stripe. Only charged after successful notarization.</p>
      </div>

      {/* Order summary */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Order Summary</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 flex items-center gap-2"><FileText size={14} /> {document.file_name}</span>
            <span className="font-bold text-slate-900">$45.00</span>
          </div>
          {numSigners > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">+{numSigners - 1} additional signer{numSigners > 2 ? 's' : ''} × $35</span>
              <span className="font-bold text-slate-900">${((numSigners - 1) * 35).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-slate-200 pt-3 flex justify-between">
            <span className="font-black text-slate-900">Total</span>
            <span className="text-xl font-black text-[#185FA5]">${(total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment form placeholder */}
      {DEMO_MODE ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-bold text-amber-800 mb-2 text-sm">🚀 Demo Mode — No Real Payment</p>
          <p className="text-xs text-amber-700">In production, a Stripe card form appears here. Click below to simulate a successful payment.</p>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Card Details</label>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-400">
            Stripe card element loads here (requires VITE_STRIPE_PUBLISHABLE_KEY)
          </div>
        </div>
      )}

      <div className="bg-[#639922]/10 border border-[#639922]/30 rounded-xl p-4 flex gap-3">
        <CheckCircle2 size={18} className="text-[#639922] shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Money-Back Guarantee:</strong> If your notarization can't be completed for any reason, you won't be charged. We only bill after successful notarization.
        </p>
      </div>

      {error && <p className="text-red-500 text-sm flex items-center gap-2"><AlertCircle size={15} /> {error}</p>}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handlePay}
          disabled={processing}
          className="flex-1 py-3.5 bg-[#185FA5] hover:bg-[#144e8a] text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-blue-500/20"
        >
          {processing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
          {processing ? 'Processing...' : `Pay $${(total / 100).toFixed(2)} & Start Notarization`}
        </button>
      </div>
    </div>
  );
};

// ── Step 4: Launch ────────────────────────────────────────────────────────────
const LaunchStep: React.FC<{ session: NotarizationSession; onGoToDashboard: () => void }> = ({ session, onGoToDashboard }) => {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 bg-[#639922]/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={40} className="text-[#639922]" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">You're all set!</h3>
        <p className="text-slate-500">Your notarization session has been created. A licensed notary is ready to connect.</p>
      </div>

      {session.meeting_link && (
        <a
          href={session.meeting_link}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 bg-[#185FA5] hover:bg-[#144e8a] text-white font-black rounded-xl shadow-xl shadow-blue-500/20 text-[15px] transition-all hover:-translate-y-0.5"
        >
          <Video size={20} /> Join Notary Video Call <ArrowRight size={20} />
        </a>
      )}

      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 text-left space-y-3">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">What to have ready:</p>
        {['Government-issued ID (driver\'s license or passport)', 'Working camera and microphone', 'The document you need to sign', 'A quiet, well-lit space'].map(item => (
          <div key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
            <CheckCircle2 size={15} className="text-[#639922] shrink-0" /> {item}
          </div>
        ))}
      </div>

      <button onClick={onGoToDashboard} className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
        View in Dashboard
      </button>
    </div>
  );
};

// ── Main Wizard ───────────────────────────────────────────────────────────────
export const NotarizationWizard: React.FC<WizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = React.useState(1);
  const [uploadedDoc, setUploadedDoc]   = React.useState<NotarizeDocument | null>(null);
  const [docType, setDocType]           = React.useState<DocumentType>('other');
  const [notaryType, setNotaryType]     = React.useState<NotaryType>('acknowledgment');
  const [numSigners, setNumSigners]     = React.useState(1);
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [session, setSession]           = React.useState<NotarizationSession | null>(null);
  const [creatingSession, setCreatingSession] = React.useState(false);
  const [sessionError, setSessionError] = React.useState('');

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
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#185FA5] rounded-lg flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <span className="font-black text-sm text-slate-900">New Notarization</span>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-5 py-8">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const done = step > s.num;
            const active = step === s.num;
            const Icon = s.icon;
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${done ? 'bg-[#639922]' : active ? 'bg-[#185FA5]' : 'bg-slate-200'}`}>
                    {done ? <CheckCircle2 size={18} className="text-white" /> : <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />}
                  </div>
                  <span className={`text-[10px] font-bold ${active ? 'text-[#185FA5]' : done ? 'text-[#639922]' : 'text-slate-400'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 transition-all ${step > s.num ? 'bg-[#639922]' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 flex-1">
          {step === 1 && <UploadStep onNext={handleUploadDone} />}
          {step === 2 && uploadedDoc && (
            <>
              {creatingSession ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 size={36} className="animate-spin text-[#185FA5]" />
                  <p className="font-bold text-slate-700">Setting up your session...</p>
                </div>
              ) : (
                <>
                  {sessionError && <p className="text-red-500 text-sm mb-4 flex items-center gap-2"><AlertCircle size={14} /> {sessionError}</p>}
                  <DetailsStep document={uploadedDoc} onNext={handleDetailsDone} onBack={() => setStep(1)} />
                </>
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
      </div>
    </div>
  );
};
