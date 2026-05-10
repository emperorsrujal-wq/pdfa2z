import * as React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, PenLine, Keyboard, RotateCcw, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import {
  SignDocument, SignerConfig, SignField,
  getDocumentByToken, getSignDocument, recordSignerViewed,
  submitSignedFields, declineSigning, saveSignedPdf,
  requestOtp, verifyOtp,
} from '../utils/remoteSign';
import { FUNCTIONS_BASE_URL } from '../config/firebase';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_W = 794;

// ── Signature Canvas ──────────────────────────────────────────────────────────

const SignatureCanvas: React.FC<{
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  mode: 'signature' | 'initials';
}> = ({ onSave, onCancel, mode }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = React.useState(false);
  const [hasStrokes, setHasStrokes] = React.useState(false);
  const [tab, setTab] = React.useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = React.useState('');
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);
  const W = mode === 'initials' ? 280 : 480;
  const H = mode === 'initials' ? 140 : 180;

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = canvasRef.current!.width / rect.width;
    const sy = canvasRef.current!.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); setDrawing(true); lastPos.current = pos(e);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return; e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const p = pos(e);
    ctx.beginPath(); ctx.moveTo(lastPos.current!.x, lastPos.current!.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    lastPos.current = p; setHasStrokes(true);
  };
  const endDraw = () => { setDrawing(false); lastPos.current = null; };
  const clear = () => {
    canvasRef.current!.getContext('2d')!.clearRect(0, 0, W, H); setHasStrokes(false);
  };
  const save = () => {
    if (tab === 'type') {
      if (!typedName.trim()) return;
      const oc = document.createElement('canvas'); oc.width = W; oc.height = H;
      const ctx = oc.getContext('2d')!;
      ctx.font = `italic ${mode === 'initials' ? 52 : 44}px Georgia,serif`;
      ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(typedName, W / 2, H / 2);
      onSave(oc.toDataURL());
    } else {
      if (!hasStrokes) return; onSave(canvasRef.current!.toDataURL());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-lg">{mode === 'initials' ? 'Add Initials' : 'Add Signature'}</h3>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><XCircle size={20} /></button>
        </div>
        <div className="flex border-b border-slate-100">
          {(['draw', 'type'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {t === 'draw' ? <><PenLine size={14} /> Draw</> : <><Keyboard size={14} /> Type</>}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-4">
          {tab === 'draw' ? (
            <>
              <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-50 cursor-crosshair" style={{ aspectRatio: `${W}/${H}` }}>
                <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
                {!hasStrokes && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><p className="text-slate-300 text-sm font-medium">Draw here</p></div>}
                <div className="absolute bottom-10 left-8 right-8 border-b-2 border-dashed border-slate-300 pointer-events-none" />
              </div>
              <button onClick={clear} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-all"><RotateCcw size={12} /> Clear</button>
            </>
          ) : (
            <div className="space-y-3">
              <input autoFocus type="text" value={typedName} onChange={e => setTypedName(e.target.value)}
                placeholder={mode === 'initials' ? 'Your initials (e.g. J.D.)' : 'Your full legal name'}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              {typedName && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[80px] flex items-center justify-center">
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: mode === 'initials' ? 40 : 34, color: '#1e293b', fontStyle: 'italic' }}>{typedName}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={save} disabled={tab === 'draw' ? !hasStrokes : !typedName.trim()}
              className="flex-[2] py-2.5 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-blue-700 transition-all">
              Apply {mode === 'initials' ? 'Initials' : 'Signature'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── OTP Input ─────────────────────────────────────────────────────────────────

const OtpInput: React.FC<{ onComplete: (code: string) => void }> = ({ onComplete }) => {
  const [digits, setDigits] = React.useState(Array(6).fill(''));
  const refs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };
  const handleChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits]; next[i] = v; setDigits(next);
    if (v && i < 5) refs[i + 1].current?.focus();
    const full = next.join('');
    if (full.length === 6) onComplete(full);
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      refs[5].current?.focus();
      onComplete(text);
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-11 h-14 text-center text-2xl font-black border-2 rounded-xl outline-none transition-all
            ${d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-900'}
            focus:border-blue-500 focus:bg-blue-50`}
        />
      ))}
    </div>
  );
};

// ── Status Screens ────────────────────────────────────────────────────────────

const StatusScreen: React.FC<{ icon: React.ReactNode; title: string; body: string; color: string; extra?: React.ReactNode }> = ({ icon, title, body, color, extra }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
      <div className={`w-20 h-20 ${color} rounded-3xl flex items-center justify-center mx-auto mb-6`}>{icon}</div>
      <h1 className="text-2xl font-black text-slate-900 mb-3">{title}</h1>
      <p className="text-slate-500 leading-relaxed mb-6">{body}</p>
      {extra}
      <p className="text-xs text-slate-300 mt-6">Powered by <strong>PDFA2Z E-Sign</strong></p>
    </div>
  </div>
);

// ── Field Overlay ─────────────────────────────────────────────────────────────

const FieldOverlay: React.FC<{
  field: SignField; value: string | undefined; signer: SignerConfig;
  pageW: number; pageH: number;
  onClick: (f: SignField) => void;
}> = ({ field, value, signer, pageW, pageH, onClick }) => {
  const filled = !!value;
  const pct = (n: number, base: number) => `${(n / base) * 100}%`;

  return (
    <div onClick={() => onClick(field)} style={{
      position: 'absolute',
      left: pct(field.x, pageW),
      top: pct(field.y, pageH),
      width: pct(field.width, pageW),
      height: pct(field.height, pageH),
      border: `2px ${filled ? 'solid' : 'dashed'} ${signer.color}`,
      borderRadius: field.type === 'checkbox' ? 4 : 8,
      backgroundColor: filled ? 'transparent' : `${signer.color}22`,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', userSelect: 'none',
      transition: 'background 0.15s',
    }} title={`${field.label || field.type}${field.required ? ' (required)' : ''}`}>
      {filled ? (
        field.type === 'signature' || field.type === 'initials'
          ? <img src={value} alt="sig" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          : field.type === 'checkbox'
            ? <CheckCircle size={18} style={{ color: signer.color }} />
            : <span style={{ fontSize: 11, color: '#1e293b', padding: '0 4px', fontWeight: 700, lineHeight: 1.3 }}>{value}</span>
      ) : (
        <div style={{ textAlign: 'center', padding: '2px 4px' }}>
          <div style={{ fontSize: 10, color: signer.color, fontWeight: 700, opacity: 0.85, letterSpacing: '0.04em' }}>
            {field.type === 'checkbox' ? '☐' : (field.label || field.type.toUpperCase())}
          </div>
          {field.required && field.type !== 'checkbox' && (
            <div style={{ fontSize: 8, color: signer.color, opacity: 0.55 }}>required</div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

type PortalState =
  | 'loading'
  | 'verify-identity'
  | 'otp-sent'
  | 'signing'
  | 'submitting'
  | 'completed'
  | 'already-signed'
  | 'declined'
  | 'expired'
  | 'not-your-turn'
  | 'voided'
  | 'error';

export const SignerPortal: React.FC<{ token: string }> = ({ token }) => {
  const [state, setState] = React.useState<PortalState>('loading');
  const [signDoc, setSignDoc] = React.useState<SignDocument | null>(null);
  const [signer, setSigner] = React.useState<SignerConfig | null>(null);

  // PDF rendering
  const [pageImages, setPageImages] = React.useState<string[]>([]);
  const [pageHeights, setPageHeights] = React.useState<number[]>([]);
  const [pdfLoadError, setPdfLoadError] = React.useState(false);

  // Field values
  const [fieldValues, setFieldValues] = React.useState<Record<string, string>>({});

  // OTP
  const [maskedEmail, setMaskedEmail] = React.useState('');
  const [otpError, setOtpError] = React.useState('');
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Modals
  const [sigModal, setSigModal] = React.useState<{ open: boolean; fieldId: string; mode: 'signature' | 'initials' }>({ open: false, fieldId: '', mode: 'signature' });
  const [textModal, setTextModal] = React.useState<{ open: boolean; fieldId: string; value: string; isDate: boolean }>({ open: false, fieldId: '', value: '', isDate: false });
  const [declineModal, setDeclineModal] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState('');
  const [declining, setDeclining] = React.useState(false);

  // ── Cooldown timer ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

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
        const prevSigners = doc.signers.filter((sig: SignerConfig) => sig.order < s.order);
        if (prevSigners.some((sig: SignerConfig) => sig.status !== 'signed')) { setState('not-your-turn'); return; }
      }

      setSignDoc(doc); setSigner(s);
      setState('verify-identity');
    }).catch(() => setState('error'));
  }, [token]);

  // ── OTP handlers ─────────────────────────────────────────────────────────────

  const sendOtp = async () => {
    setOtpLoading(true); setOtpError('');
    try {
      const { maskedEmail: me, alreadySent } = await requestOtp(token);
      setMaskedEmail(me);
      setState('otp-sent');
      // If rate-limited, don't reset the cooldown (code was already sent)
      if (!alreadySent) setResendCooldown(60);
    } catch (e: any) {
      setOtpError('Failed to send code. Please check your connection and try again.');
    }
    setOtpLoading(false);
  };

  const handleOtpComplete = async (code: string) => {
    setOtpLoading(true); setOtpError('');
    try {
      const ok = await verifyOtp(token, code);
      if (ok) {
        await enterSigningMode();
      }
    } catch (e: any) {
      setOtpError(e.message || 'Verification failed.');
    }
    setOtpLoading(false);
  };

  const enterSigningMode = async () => {
    if (!signDoc || !signer) return;
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const prefill: Record<string, string> = {};
    signDoc.fields.filter(f => f.signerId === signer.id && f.type === 'date').forEach(f => { prefill[f.id] = today; });
    signDoc.fields.filter(f => f.signerId === signer.id && f.value).forEach(f => { prefill[f.id] = f.value!; });
    setFieldValues(prefill);
    setState('signing');
    recordSignerViewed(signDoc.id!, signer.id).catch(() => {});
    try {
      await renderPdf(signDoc.id!);
    } catch (e) {
      console.error('Failed to load PDF:', e);
      setPdfLoadError(true);
    }
  };

  const renderPdf = async (docId: string) => {
    // Fetch via Cloud Function proxy to avoid Firebase Storage CORS restrictions.
    const proxyUrl = `${FUNCTIONS_BASE_URL}/esign/pdf?docId=${encodeURIComponent(docId)}&token=${encodeURIComponent(token)}`;
    const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`PDF fetch failed: ${res.status}`);
    const bytes = await res.arrayBuffer();
    const pdf = await getDocument({ data: new Uint8Array(bytes) }).promise;
    const images: string[] = [];
    const heights: number[] = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const vp = page.getViewport({ scale: PAGE_W / page.getViewport({ scale: 1 }).width });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
      images.push(canvas.toDataURL());
      heights.push(vp.height);
    }
    setPageImages(images);
    setPageHeights(heights);
  };

  // ── Field interaction ────────────────────────────────────────────────────────

  const handleFieldClick = (field: SignField) => {
    if (!signer || field.signerId !== signer.id) return;
    switch (field.type) {
      case 'signature': setSigModal({ open: true, fieldId: field.id, mode: 'signature' }); break;
      case 'initials':  setSigModal({ open: true, fieldId: field.id, mode: 'initials' }); break;
      case 'text':      setTextModal({ open: true, fieldId: field.id, value: fieldValues[field.id] || '', isDate: false }); break;
      case 'date':      setTextModal({ open: true, fieldId: field.id, value: fieldValues[field.id] || '', isDate: true }); break;
      case 'checkbox':  setFieldValues(prev => ({ ...prev, [field.id]: prev[field.id] === 'true' ? '' : 'true' })); break;
    }
  };

  const applySig = (dataUrl: string) => {
    setFieldValues(prev => ({ ...prev, [sigModal.fieldId]: dataUrl }));
    setSigModal({ open: false, fieldId: '', mode: 'signature' });
  };

  const applyText = () => {
    setFieldValues(prev => ({ ...prev, [textModal.fieldId]: textModal.value }));
    setTextModal({ open: false, fieldId: '', value: '', isDate: false });
  };

  // ── Signed PDF generation ─────────────────────────────────────────────────────

  const generateAndSaveSignedPdf = async (finalDoc: SignDocument) => {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    // Use the proxy endpoint to avoid Firebase Storage CORS restrictions
    const proxyUrl = `${FUNCTIONS_BASE_URL}/esign/pdf?docId=${encodeURIComponent(finalDoc.id!)}&token=${encodeURIComponent(token)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`PDF fetch failed: ${response.status}`);
    const originalBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(originalBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    for (const field of finalDoc.fields) {
      if (!field.value) continue;
      const page = pages[field.pageIndex];
      if (!page) continue;
      const { width: pw, height: ph } = page.getSize();
      // Scale from 794px coordinate space to PDF points (same aspect ratio)
      const scale = pw / PAGE_W;
      const pdfX = field.x * scale;
      const pdfW = field.width * scale;
      const pdfH = field.height * scale;
      // PDF origin is bottom-left; our coords are top-left
      const pdfY = ph - (field.y + field.height) * scale;

      if (field.type === 'signature' || field.type === 'initials') {
        if (field.value.startsWith('data:image/png')) {
          try {
            const b64 = field.value.split(',')[1];
            const imgBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const img = await pdfDoc.embedPng(imgBytes);
            page.drawImage(img, { x: pdfX, y: pdfY, width: pdfW, height: pdfH });
          } catch { /* skip malformed image */ }
        }
      } else if (field.type === 'checkbox' && field.value === 'true') {
        const fs = Math.min(pdfH * 0.75, 14);
        page.drawText('X', { x: pdfX + pdfW * 0.15, y: pdfY + (pdfH - fs) / 2, size: fs, font, color: rgb(0.05, 0.05, 0.05) });
      } else if (field.type === 'text' || field.type === 'date') {
        const fs = Math.max(7, Math.min(11, pdfH * 0.55));
        page.drawText(field.value, { x: pdfX + 3, y: pdfY + (pdfH - fs) / 2, size: fs, font, color: rgb(0.05, 0.05, 0.05), maxWidth: pdfW - 6 });
      }
    }

    const signedBytes = await pdfDoc.save();
    await saveSignedPdf(finalDoc.id!, new Uint8Array(signedBytes), token);
  };

  // ── Submit / Decline ─────────────────────────────────────────────────────────

  const myFields = signDoc?.fields.filter(f => f.signerId === signer?.id) ?? [];
  const requiredFields = myFields.filter(f => f.required);
  const filledCount = requiredFields.filter(f => fieldValues[f.id]).length;
  const allFilled = filledCount === requiredFields.length;

  const handleSubmit = async () => {
    if (!signDoc || !signer || !allFilled) return;
    setState('submitting');
    try {
      const filled = myFields.map(f => ({ id: f.id, value: fieldValues[f.id] || '' }));
      const allSigned = await submitSignedFields(signDoc.id!, signer.id, filled);
      if (allSigned) {
        // Fetch the complete document (all signers' values) then embed into PDF
        try {
          const finalDoc = await getSignDocument(signDoc.id!);
          if (finalDoc) await generateAndSaveSignedPdf(finalDoc);
        } catch (e) {
          console.error('Signed PDF generation failed (non-fatal):', e);
        }
      }
      setState('completed');
    } catch (e) {
      console.error(e);
      setState('signing');
    }
  };

  const handleDecline = async () => {
    if (!signDoc || !signer || !declineReason.trim()) return;
    setDeclining(true);
    try {
      await declineSigning(signDoc.id!, signer.id, declineReason.trim());
      setState('declined');
    } catch (e) { console.error(e); }
    setDeclining(false);
  };

  // ── Status screens ────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'completed' || state === 'already-signed') {
    return <StatusScreen icon={<CheckCircle size={36} className="text-emerald-600" />}
      title={state === 'completed' ? 'Signature Submitted!' : 'Already Signed'}
      body={state === 'completed' ? 'Your signature has been recorded. You\'ll receive a confirmation email with the completed document once all parties sign.' : 'You have already signed this document. Check your email for the completion notice.'}
      color="bg-emerald-50" />;
  }

  if (state === 'declined') {
    return <StatusScreen icon={<XCircle size={36} className="text-red-500" />}
      title="Signing Declined"
      body="You have declined to sign this document. The document owner has been notified."
      color="bg-red-50" />;
  }

  if (state === 'voided') {
    return <StatusScreen icon={<AlertTriangle size={36} className="text-amber-500" />}
      title="Document Voided"
      body="This document has been voided by the sender and is no longer available for signing."
      color="bg-amber-50" />;
  }

  if (state === 'expired') {
    return <StatusScreen icon={<Clock size={36} className="text-amber-500" />}
      title="Link Expired"
      body="This signing link has expired. Please contact the document sender to request a new link."
      color="bg-amber-50" />;
  }

  if (state === 'not-your-turn') {
    const prevSigner = signDoc?.signers.find((s: SignerConfig) => s.order === (signer?.order ?? 1) - 1);
    return <StatusScreen icon={<Clock size={36} className="text-blue-500" />}
      title="Waiting for Previous Signer"
      body={`You'll receive an email when it's your turn to sign.${prevSigner ? ` Currently waiting for ${prevSigner.name}.` : ''}`}
      color="bg-blue-50" />;
  }

  if (state === 'error' || !signDoc || !signer) {
    return <StatusScreen icon={<AlertTriangle size={36} className="text-red-500" />}
      title="Invalid Link"
      body="This signing link is invalid or has been revoked. Check your email for the correct link."
      color="bg-red-50" />;
  }

  // ── OTP: Verify Identity screen ───────────────────────────────────────────────

  if (state === 'verify-identity') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">A2Z</span>
              </div>
              <span className="text-white font-black text-sm">PDFA2Z E‑Sign</span>
            </div>
            <h1 className="text-white font-black text-2xl leading-tight">Verify your identity<br />to sign this document</h1>
          </div>

          <div className="px-8 py-7 space-y-6">
            {/* Document card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-blue-600 text-lg">📄</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{signDoc.title}</p>
                  <p className="text-xs text-slate-500">Requested by <strong>{signDoc.ownerName}</strong></p>
                </div>
              </div>
            </div>

            {/* Signing party info */}
            <div className="flex items-center gap-3 p-4 border border-blue-100 bg-blue-50 rounded-2xl">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0" style={{ background: signer.color }}>
                {signer.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{signer.name}</p>
                <p className="text-xs text-slate-500">Signing party #{signer.order}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-600 leading-relaxed">We'll send a one-time verification code to your email address. No account needed — just verify it's you.</p>
            </div>

            {otpError && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{otpError}</p>}

            <button onClick={sendOtp} disabled={otpLoading}
              className="w-full py-3.5 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {otpLoading ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {otpLoading ? 'Sending code…' : 'Send Verification Code'}
            </button>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              🔒 Your signing link is private and unique to you.<br />Electronic signatures are legally binding.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── OTP: Enter Code screen ────────────────────────────────────────────────────

  if (state === 'otp-sent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">A2Z</span>
              </div>
              <span className="text-white font-black text-sm">PDFA2Z E‑Sign</span>
            </div>
            <h1 className="text-white font-black text-2xl leading-tight">Enter your<br />verification code</h1>
          </div>

          <div className="px-8 py-7 space-y-6">
            <div className="text-center space-y-1">
              <p className="text-sm text-slate-600">We sent a 6-digit code to</p>
              <p className="font-bold text-slate-900">{maskedEmail}</p>
              <p className="text-xs text-slate-400">Check your inbox — it may take a moment to arrive</p>
            </div>

            <OtpInput onComplete={handleOtpComplete} />

            {otpLoading && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}

            {otpError && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 text-center">
                {otpError}
              </div>
            )}

            <div className="text-center space-y-3">
              <p className="text-xs text-slate-400">Didn't receive it?</p>
              <button onClick={sendOtp} disabled={resendCooldown > 0 || otpLoading}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-300 transition-all">
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
              </button>
            </div>

            <button onClick={() => { setState('verify-identity'); setOtpError(''); }}
              className="w-full py-2.5 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 text-sm transition-all">
              ← Back
            </button>

            <p className="text-xs text-slate-300 text-center">Code expires in 15 minutes</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Signing UI ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Sticky header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">A2Z</span>
            </div>
            <span className="font-black text-slate-700 text-sm hidden sm:block">PDFA2Z E‑Sign</span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Document + signer */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 truncate text-sm">{signDoc.title}</p>
            <p className="text-xs text-slate-400 hidden sm:block">
              Signing as <strong style={{ color: signer.color }}>{signer.name}</strong>
              {' '}· {filledCount}/{requiredFields.length} fields complete
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setDeclineModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all hidden sm:block">
              Decline
            </button>
            <button onClick={handleSubmit} disabled={!allFilled || state === 'submitting'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-200">
              {state === 'submitting'
                ? <RefreshCw size={14} className="animate-spin" />
                : <Send size={14} />}
              {state === 'submitting' ? 'Submitting…' : 'Submit Signature'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: requiredFields.length ? `${(filledCount / requiredFields.length) * 100}%` : '0%' }} />
        </div>
      </header>

      {/* Instruction banner */}
      {!allFilled ? (
        <div className="bg-blue-600 text-white text-center text-xs font-semibold py-2 px-4">
          <span className="font-black">{requiredFields.length - filledCount} field{requiredFields.length - filledCount !== 1 ? 's' : ''} remaining</span>
          {' '}— click the highlighted areas on the document below
        </div>
      ) : (
        <div className="bg-emerald-600 text-white text-center text-xs font-bold py-2 px-4">
          All fields complete — click <strong>"Submit Signature"</strong> to finalize
        </div>
      )}

      {/* PDF area */}
      <main className="flex-1 py-6 px-4 overflow-x-auto">
        <div className="space-y-4" style={{ minWidth: Math.min(PAGE_W, window.innerWidth - 32) }}>
          {pageImages.length === 0 ? (
            <div className="flex justify-center py-24">
              <div className="text-center space-y-4">
                {pdfLoadError ? (
                  <>
                    <AlertTriangle size={36} className="text-amber-500 mx-auto" />
                    <p className="text-sm text-slate-700 font-semibold">Failed to load the document</p>
                    <p className="text-xs text-slate-400 max-w-xs">The document may be temporarily unavailable. Please try again or contact the sender.</p>
                    <button
                      onClick={() => { setPdfLoadError(false); renderPdf(signDoc!.id!).catch(() => setPdfLoadError(true)); }}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all">
                      Retry
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-slate-400 font-medium">Loading document…</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            pageImages.map((img, pageIndex) => {
              const pH = pageHeights[pageIndex] || PAGE_W * 1.414;
              const pageFields = signDoc.fields.filter(f => f.pageIndex === pageIndex);
              return (
                <div key={pageIndex} className="relative mx-auto bg-white shadow-xl rounded-lg"
                  style={{ width: '100%', maxWidth: PAGE_W }}>
                  <img src={img} alt={`Page ${pageIndex + 1}`} className="w-full block rounded-lg" draggable={false} />
                  {/* Field overlays — sized & positioned as % of image natural dimensions */}
                  <div className="absolute inset-0">
                    {pageFields.map(field => {
                      const fieldSigner = signDoc.signers.find((s: SignerConfig) => s.id === field.signerId);
                      if (!fieldSigner) return null;
                      const isMyField = field.signerId === signer.id;
                      return (
                        <FieldOverlay key={field.id}
                          field={field}
                          value={isMyField ? fieldValues[field.id] : field.value}
                          signer={fieldSigner}
                          pageW={PAGE_W}
                          pageH={pH}
                          onClick={isMyField ? handleFieldClick : () => {}}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute bottom-2 right-3 text-xs text-slate-300 font-medium">Page {pageIndex + 1}</div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Mobile decline button */}
      <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-3">
        <button onClick={() => setDeclineModal(true)}
          className="w-full py-2.5 text-sm font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
          Decline to Sign
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-3 px-4 text-center">
        <p className="text-xs text-slate-400">Powered by <strong className="text-slate-600">PDFA2Z E-Sign</strong> · Your signature is legally binding under ESIGN & eIDAS</p>
      </footer>

      {/* Signature modal */}
      {sigModal.open && (
        <SignatureCanvas mode={sigModal.mode} onSave={applySig} onCancel={() => setSigModal({ open: false, fieldId: '', mode: 'signature' })} />
      )}

      {/* Text / Date modal */}
      {textModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setTextModal({ open: false, fieldId: '', value: '', isDate: false })}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-black text-slate-900 mb-4">{textModal.isDate ? 'Enter Date' : 'Enter Text'}</h3>
            <input autoFocus type="text" value={textModal.value}
              onChange={e => setTextModal(p => ({ ...p, value: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && applyText()}
              placeholder={textModal.isDate ? 'e.g. May 6, 2026' : 'Enter value…'}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setTextModal({ open: false, fieldId: '', value: '', isDate: false })}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={applyText} disabled={!textModal.value.trim()}
                className="flex-[2] py-2.5 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Decline modal */}
      {declineModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setDeclineModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-black text-slate-900 mb-1">Decline to Sign</h3>
            <p className="text-sm text-slate-500 mb-4">The document owner will be notified with your reason.</p>
            <textarea rows={3} value={declineReason} onChange={e => setDeclineReason(e.target.value)}
              placeholder="e.g. Need to review terms with my lawyer first…"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setDeclineModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleDecline} disabled={!declineReason.trim() || declining}
                className="flex-[2] py-2.5 bg-red-500 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-red-600 flex items-center justify-center gap-2">
                {declining && <RefreshCw size={14} className="animate-spin" />}
                Decline Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
