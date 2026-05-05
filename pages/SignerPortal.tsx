import * as React from 'react';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, PenLine, Keyboard,
  RotateCcw, ChevronDown, Send
} from 'lucide-react';
import {
  SignDocument, SignerConfig, SignField,
  getDocumentByToken, recordSignerViewed,
  submitSignedFields, declineSigning,
} from '../utils/remoteSign';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_W = 794;

// ── Signature Canvas ──────────────────────────────────────────────────────────

interface SigCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  mode: 'signature' | 'initials';
}

const SignatureCanvas: React.FC<SigCanvasProps> = ({ onSave, onCancel, mode }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = React.useState(false);
  const [hasStrokes, setHasStrokes] = React.useState(false);
  const [tab, setTab] = React.useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = React.useState('');
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);

  const canvasW = mode === 'initials' ? 280 : 480;
  const canvasH = mode === 'initials' ? 140 : 180;

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasStrokes(true);
  };

  const endDraw = () => { setDrawing(false); lastPos.current = null; };

  const clearCanvas = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    setHasStrokes(false);
  };

  const handleSave = () => {
    if (tab === 'type') {
      if (!typedName.trim()) return;
      const offscreen = document.createElement('canvas');
      offscreen.width = canvasW;
      offscreen.height = canvasH;
      const ctx = offscreen.getContext('2d')!;
      ctx.fillStyle = 'transparent';
      ctx.font = `italic ${mode === 'initials' ? 52 : 44}px "Dancing Script", cursive, serif`;
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, canvasW / 2, canvasH / 2);
      onSave(offscreen.toDataURL());
    } else {
      if (!hasStrokes) return;
      onSave(canvasRef.current!.toDataURL());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-lg">{mode === 'initials' ? 'Add Initials' : 'Add Signature'}</h3>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><XCircle size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['draw', 'type'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {t === 'draw' ? <><PenLine size={15} /> Draw</> : <><Keyboard size={15} /> Type</>}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'draw' ? (
            <div className="space-y-3">
              <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-50 cursor-crosshair"
                style={{ width: '100%', aspectRatio: `${canvasW}/${canvasH}` }}>
                <canvas ref={canvasRef} width={canvasW} height={canvasH} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
                {!hasStrokes && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-slate-300 text-sm font-medium">Draw your {mode} here</p>
                  </div>
                )}
                {/* Baseline */}
                <div className="absolute bottom-10 left-8 right-8 border-b border-dashed border-slate-300 pointer-events-none" />
              </div>
              <button onClick={clearCanvas} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-all">
                <RotateCcw size={13} /> Clear
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input type="text" value={typedName} onChange={e => setTypedName(e.target.value)}
                placeholder={mode === 'initials' ? 'Your initials (e.g. J.D.)' : 'Your full name'}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              {typedName && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[80px] flex items-center justify-center">
                  <span style={{ fontFamily: '"Dancing Script", cursive, serif', fontSize: mode === 'initials' ? 40 : 36, color: '#1e293b', fontStyle: 'italic' }}>
                    {typedName}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handleSave}
              disabled={tab === 'draw' ? !hasStrokes : !typedName.trim()}
              className="flex-[2] py-2.5 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-blue-700 transition-all">
              Apply {mode === 'initials' ? 'Initials' : 'Signature'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Status Screens ────────────────────────────────────────────────────────────

const StatusScreen: React.FC<{ icon: React.ReactNode; title: string; body: string; color: string }> = ({ icon, title, body, color }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
      <div className={`w-20 h-20 ${color} rounded-3xl flex items-center justify-center mx-auto mb-6`}>{icon}</div>
      <h1 className="text-2xl font-black text-slate-900 mb-3">{title}</h1>
      <p className="text-slate-500 leading-relaxed">{body}</p>
    </div>
  </div>
);

// ── Field Overlay ─────────────────────────────────────────────────────────────

interface FieldOverlayProps {
  field: SignField;
  value: string | undefined;
  signer: SignerConfig;
  onClick: (field: SignField) => void;
}

const FieldOverlay: React.FC<FieldOverlayProps> = ({ field, value, signer, onClick }) => {
  const filled = !!value;
  const isCheckbox = field.type === 'checkbox';

  return (
    <div
      onClick={() => onClick(field)}
      style={{
        position: 'absolute',
        left: field.x,
        top: field.y,
        width: field.width,
        height: field.height,
        border: `2px ${filled ? 'solid' : 'dashed'} ${filled ? signer.color : signer.color}`,
        borderRadius: isCheckbox ? 4 : 8,
        backgroundColor: filled ? 'transparent' : `${signer.color}18`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      title={`${field.label || field.type}${field.required ? ' (required)' : ''}`}
    >
      {filled ? (
        field.type === 'signature' || field.type === 'initials' ? (
          <img src={value} alt="sig" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : field.type === 'checkbox' ? (
          <CheckCircle size={20} style={{ color: signer.color }} />
        ) : (
          <span style={{ fontSize: 12, color: '#1e293b', padding: '0 4px', fontWeight: 600 }}>{value}</span>
        )
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: signer.color, fontWeight: 700, opacity: 0.8, letterSpacing: '0.03em' }}>
            {isCheckbox ? '☐' : (field.label || field.type.toUpperCase())}
          </div>
          {field.required && !isCheckbox && (
            <div style={{ fontSize: 9, color: signer.color, opacity: 0.6 }}>* required</div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  token: string;
}

type PortalState = 'loading' | 'ready' | 'error' | 'completed' | 'declined' | 'already-signed' | 'expired' | 'not-your-turn' | 'voided';

export const SignerPortal: React.FC<Props> = ({ token }) => {
  const [state, setState] = React.useState<PortalState>('loading');
  const [signDoc, setSignDoc] = React.useState<SignDocument | null>(null);
  const [signer, setSigner] = React.useState<SignerConfig | null>(null);
  const [pageImages, setPageImages] = React.useState<string[]>([]);
  const [fieldValues, setFieldValues] = React.useState<Record<string, string>>({});

  // Modals
  const [sigModalOpen, setSigModalOpen] = React.useState(false);
  const [sigModalFieldId, setSigModalFieldId] = React.useState<string | null>(null);
  const [sigModalMode, setSigModalMode] = React.useState<'signature' | 'initials'>('signature');
  const [textModal, setTextModal] = React.useState<{ open: boolean; fieldId: string; value: string }>({ open: false, fieldId: '', value: '' });
  const [declineModal, setDeclineModal] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);
  const [declining, setDeclining] = React.useState(false);

  // ── Load document ────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (!token) { setState('error'); return; }

    getDocumentByToken(token).then(result => {
      if (!result) { setState('error'); return; }
      const { document: doc, signer: s } = result;

      if (doc.status === 'voided') { setState('voided'); return; }
      if (doc.status === 'completed') { setState('completed'); return; }
      if (s.status === 'signed') { setState('already-signed'); return; }
      if (s.status === 'declined') { setState('declined'); return; }

      if (doc.expiresAt) {
        const expMs = doc.expiresAt.seconds ? doc.expiresAt.seconds * 1000 : 0;
        if (expMs && Date.now() > expMs) { setState('expired'); return; }
      }

      if (doc.signingOrder === 'sequential') {
        const prevSigners = doc.signers.filter(sig => sig.order < s.order);
        if (prevSigners.some(sig => sig.status !== 'signed')) { setState('not-your-turn'); return; }
      }

      setSignDoc(doc);
      setSigner(s);

      const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const prefill: Record<string, string> = {};
      doc.fields.filter(f => f.signerId === s.id && f.type === 'date').forEach(f => { prefill[f.id] = today; });
      // Restore already-filled values
      doc.fields.filter(f => f.signerId === s.id && f.value).forEach(f => { prefill[f.id] = f.value!; });
      setFieldValues(prefill);

      setState('ready');
      recordSignerViewed(doc.id!, s.id).catch(() => {});
      renderPdf(doc.pdfUrl);
    }).catch(() => setState('error'));
  }, [token]);

  const renderPdf = async (url: string) => {
    const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    const pdf = await getDocument(url).promise;
    const images: string[] = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const vp = page.getViewport({ scale: PAGE_W / page.getViewport({ scale: 1 }).width });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
      images.push(canvas.toDataURL());
    }
    setPageImages(images);
  };

  // ── Field interaction ────────────────────────────────────────────────────────

  const handleFieldClick = (field: SignField) => {
    if (!signer || field.signerId !== signer.id) return;
    switch (field.type) {
      case 'signature':
        setSigModalMode('signature'); setSigModalFieldId(field.id); setSigModalOpen(true);
        break;
      case 'initials':
        setSigModalMode('initials'); setSigModalFieldId(field.id); setSigModalOpen(true);
        break;
      case 'text':
        setTextModal({ open: true, fieldId: field.id, value: fieldValues[field.id] || '' });
        break;
      case 'checkbox':
        setFieldValues(prev => ({ ...prev, [field.id]: prev[field.id] === 'true' ? '' : 'true' }));
        break;
      case 'date':
        setTextModal({ open: true, fieldId: field.id, value: fieldValues[field.id] || '' });
        break;
    }
  };

  const applySig = (dataUrl: string) => {
    if (sigModalFieldId) setFieldValues(prev => ({ ...prev, [sigModalFieldId]: dataUrl }));
    setSigModalOpen(false);
    setSigModalFieldId(null);
  };

  const applyText = () => {
    setFieldValues(prev => ({ ...prev, [textModal.fieldId]: textModal.value }));
    setTextModal({ open: false, fieldId: '', value: '' });
  };

  // ── Submit / Decline ─────────────────────────────────────────────────────────

  const myFields = signDoc?.fields.filter(f => f.signerId === signer?.id) ?? [];
  const requiredFields = myFields.filter(f => f.required);
  const filledCount = requiredFields.filter(f => fieldValues[f.id]).length;
  const allFilled = filledCount === requiredFields.length;

  const handleSubmit = async () => {
    if (!signDoc || !signer) return;
    setSubmitting(true);
    try {
      const filled = myFields.map(f => ({ id: f.id, value: fieldValues[f.id] || '' }));
      await submitSignedFields(signDoc.id!, signer.id, filled);
      setState('completed');
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleDecline = async () => {
    if (!signDoc || !signer || !declineReason.trim()) return;
    setDeclining(true);
    try {
      await declineSigning(signDoc.id!, signer.id, declineReason.trim());
      setState('declined');
    } catch (e) {
      console.error(e);
    }
    setDeclining(false);
  };

  // ── Status screens ────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'completed') {
    return (
      <StatusScreen
        icon={<CheckCircle size={36} className="text-emerald-600" />}
        title="Document Completed"
        body="All parties have signed this document. You can close this window."
        color="bg-emerald-50"
      />
    );
  }

  if (state === 'already-signed') {
    return (
      <StatusScreen
        icon={<CheckCircle size={36} className="text-emerald-600" />}
        title="Already Signed"
        body="You have already signed this document. Thank you!"
        color="bg-emerald-50"
      />
    );
  }

  if (state === 'declined') {
    return (
      <StatusScreen
        icon={<XCircle size={36} className="text-red-500" />}
        title="Signing Declined"
        body="You have declined to sign this document. The document owner has been notified."
        color="bg-red-50"
      />
    );
  }

  if (state === 'voided') {
    return (
      <StatusScreen
        icon={<AlertTriangle size={36} className="text-amber-500" />}
        title="Document Voided"
        body="This document has been voided by the sender and is no longer available for signing."
        color="bg-amber-50"
      />
    );
  }

  if (state === 'expired') {
    return (
      <StatusScreen
        icon={<Clock size={36} className="text-amber-500" />}
        title="Link Expired"
        body="This signing link has expired. Please contact the document sender to request a new link."
        color="bg-amber-50"
      />
    );
  }

  if (state === 'not-your-turn') {
    const prevSigner = signDoc?.signers.find(s => s.order === (signer?.order ?? 1) - 1);
    return (
      <StatusScreen
        icon={<Clock size={36} className="text-blue-500" />}
        title="Waiting for Previous Signer"
        body={`You'll receive an email when it's your turn to sign. ${prevSigner ? `Currently waiting for ${prevSigner.name} to sign.` : ''}`}
        color="bg-blue-50"
      />
    );
  }

  if (state === 'error' || !signDoc || !signer) {
    return (
      <StatusScreen
        icon={<AlertTriangle size={36} className="text-red-500" />}
        title="Invalid Link"
        body="This signing link is invalid or has been revoked. Please check your email for the correct link."
        color="bg-red-50"
      />
    );
  }

  // ── Main Signing UI ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">A2Z</span>
            </div>
            <div className="min-w-0">
              <p className="font-black text-slate-900 truncate text-sm sm:text-base">{signDoc.title}</p>
              <p className="text-xs text-slate-400">Signing as <strong className="text-slate-600">{signer.name}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Progress pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: signer.color }} />
              {filledCount}/{requiredFields.length} fields
            </div>

            <button onClick={() => setDeclineModal(true)}
              className="px-3 py-2 text-xs font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
              Decline
            </button>

            <button onClick={handleSubmit} disabled={!allFilled || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-blue-700 transition-all active:scale-95 text-sm shadow-md shadow-blue-200">
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send size={15} />}
              {submitting ? 'Submitting…' : 'Submit Signature'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: requiredFields.length ? `${(filledCount / requiredFields.length) * 100}%` : '0%' }} />
        </div>
      </header>

      {/* Instructions banner */}
      {!allFilled && (
        <div className="bg-blue-600 text-white text-xs font-medium py-2 px-4 text-center">
          <span className="font-black">{requiredFields.length - filledCount} field{requiredFields.length - filledCount !== 1 ? 's' : ''} remaining.</span>
          {' '}Click the highlighted fields on the document below to complete your signature.
        </div>
      )}

      {allFilled && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center">
          All fields completed — click "Submit Signature" to finalize.
        </div>
      )}

      {/* PDF area */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {pageImages.length === 0 ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            pageImages.map((img, pageIndex) => {
              const pageFields = signDoc.fields.filter(f => f.pageIndex === pageIndex);
              return (
                <div key={pageIndex} className="relative mx-auto bg-white shadow-xl rounded-lg overflow-visible"
                  style={{ width: PAGE_W, maxWidth: '100%' }}>
                  <img src={img} alt={`Page ${pageIndex + 1}`} className="w-full block" draggable={false} />
                  {/* Scale overlay to match image display size vs PAGE_W */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                    ref={el => {
                      if (!el) return;
                      const scale = el.offsetWidth / PAGE_W;
                      el.style.setProperty('--scale', String(scale));
                    }}>
                    {pageFields.map(field => {
                      const fieldSigner = signDoc.signers.find(s => s.id === field.signerId);
                      if (!fieldSigner) return null;
                      const isMyField = field.signerId === signer.id;
                      return (
                        <div key={field.id} style={{
                          position: 'absolute',
                          left: `${(field.x / PAGE_W) * 100}%`,
                          top: field.y,
                          width: field.width,
                          height: field.height,
                          pointerEvents: isMyField ? 'auto' : 'none',
                          transform: 'none',
                        }}>
                          <FieldOverlay
                            field={field}
                            value={isMyField ? fieldValues[field.id] : field.value}
                            signer={fieldSigner}
                            onClick={handleFieldClick}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center">
        <p className="text-xs text-slate-400">Powered by <strong className="text-slate-600">PDFA2Z</strong> — Free E-Signing. Your signature is legally binding.</p>
      </footer>

      {/* Signature modal */}
      {sigModalOpen && (
        <SignatureCanvas mode={sigModalMode} onSave={applySig} onCancel={() => { setSigModalOpen(false); setSigModalFieldId(null); }} />
      )}

      {/* Text/Date modal */}
      {textModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setTextModal({ open: false, fieldId: '', value: '' }); }}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-black text-slate-900 mb-4">
              {signDoc.fields.find(f => f.id === textModal.fieldId)?.type === 'date' ? 'Enter Date' : 'Enter Text'}
            </h3>
            <input type="text" autoFocus value={textModal.value}
              onChange={e => setTextModal(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && applyText()}
              placeholder={signDoc.fields.find(f => f.id === textModal.fieldId)?.type === 'date' ? 'e.g. May 6, 2026' : 'Enter value…'}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setTextModal({ open: false, fieldId: '', value: '' })}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={applyText} disabled={!textModal.value.trim()}
                className="flex-[2] py-2.5 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Decline modal */}
      {declineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setDeclineModal(false); }}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-black text-slate-900 mb-1">Decline to Sign</h3>
            <p className="text-sm text-slate-500 mb-4">Please provide a reason for declining.</p>
            <textarea rows={3} value={declineReason} onChange={e => setDeclineReason(e.target.value)}
              placeholder="e.g. Terms are not agreed upon, need to review further…"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setDeclineModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleDecline} disabled={!declineReason.trim() || declining}
                className="flex-[2] py-2.5 bg-red-500 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-red-600 flex items-center justify-center gap-2">
                {declining ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                Decline Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
