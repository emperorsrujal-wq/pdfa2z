import * as React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  Plus, FileText, Clock, CheckCircle, XCircle, Upload,
  Trash2, Send, Download, Copy, RefreshCw,
  ChevronLeft, Info, Signature, Calendar, Type, SquareCheck,
  Fingerprint, Zap, AlertCircle, BookmarkPlus, LayoutTemplate, Users,
} from 'lucide-react';
import {
  SignDocument, SignerConfig, SignField, FieldType, DocStatus, SignTemplate,
  SIGNER_COLORS, FIELD_DEFAULTS, generateToken,
  createSignDocument, getOwnerDocuments, voidDocument, sendDocument,
  uploadPdfForSigning, saveDocumentFields, updateSignDocumentPdfUrl,
  saveTemplate, getOwnerTemplates, deleteTemplate, incrementTemplateUsage,
  statusLabel, statusColor, signerStatusColor, formatDate,
} from '../utils/remoteSign';

const PAGE_W = 794;

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  signature: <Signature size={15} />,
  initials:  <Fingerprint size={15} />,
  date:      <Calendar size={15} />,
  text:      <Type size={15} />,
  checkbox:  <SquareCheck size={15} />,
};

// ── Signer Avatar ─────────────────────────────────────────────────────────────

const SignerAvatar: React.FC<{ signer: SignerConfig; size?: number }> = ({ signer, size = 30 }) => (
  <div
    title={`${signer.name} (${signer.status})`}
    style={{ width: size, height: size, background: signer.color, borderColor: signerStatusColor[signer.status] }}
    className="rounded-full flex items-center justify-center text-white font-bold border-2 text-xs shrink-0"
  >
    {signer.name.charAt(0).toUpperCase()}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const RemoteSign: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  type View = 'dashboard' | 'setup' | 'fields' | 'review';
  const [view, setView] = React.useState<View>('dashboard');

  // Document list
  const [documents, setDocuments] = React.useState<SignDocument[]>([]);
  const [docsLoading, setDocsLoading] = React.useState(false);
  const [sentDocId, setSentDocId] = React.useState<string | null>(null);
  const [docsError, setDocsError] = React.useState(false);
  const [signerLinksDoc, setSignerLinksDoc] = React.useState<SignDocument | null>(null);

  // Templates
  const [dashTab, setDashTab] = React.useState<'documents' | 'templates'>('documents');
  const [templates, setTemplates] = React.useState<SignTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = React.useState(false);
  const [saveTemplateMsg, setSaveTemplateMsg] = React.useState('');
  const [useTemplateModal, setUseTemplateModal] = React.useState<SignTemplate | null>(null);
  const [utTitle, setUtTitle] = React.useState('');
  const [utSigners, setUtSigners] = React.useState<{ name: string; email: string }[]>([]);
  const [utSending, setUtSending] = React.useState(false);
  const [utError, setUtError] = React.useState('');

  // Draft state
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = React.useState<ArrayBuffer | null>(null);
  const [pdfPageCount, setPdfPageCount] = React.useState(1);
  const [previewImg, setPreviewImg] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [signingOrder, setSigningOrder] = React.useState<'sequential' | 'parallel'>('sequential');
  const [expiryDays, setExpiryDays] = React.useState(14);
  const [reminderFreq, setReminderFreq] = React.useState<'daily' | '3days' | 'weekly' | 'none'>('3days');
  const [signers, setSigners] = React.useState<SignerConfig[]>([]);
  const [fields, setFields] = React.useState<SignField[]>([]);
  const [customMsg, setCustomMsg] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');

  // Background upload state — upload starts immediately on file select
  type UploadState = 'idle' | 'uploading' | 'done' | 'error';
  const [uploadState, setUploadState] = React.useState<UploadState>('idle');
  const [uploadPct, setUploadPct] = React.useState(0);
  // Holds the pre-created docId + pdfUrl from the background upload
  const bgDocIdRef = React.useRef<string | null>(null);
  const bgPdfUrlRef = React.useRef<string | null>(null);

  // Signer form
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');

  // Load documents + templates
  React.useEffect(() => {
    if (!user) return;
    setDocsLoading(true); setDocsError(false);
    getOwnerDocuments(user.uid)
      .then(docs => { setDocuments(docs); setDocsLoading(false); })
      .catch(() => { setDocsLoading(false); setDocsError(true); });
    setTemplatesLoading(true);
    getOwnerTemplates(user.uid)
      .then(ts => { setTemplates(ts); setTemplatesLoading(false); })
      .catch(() => setTemplatesLoading(false));
  }, [user]);

  // Generate preview + page count when PDF uploaded
  React.useEffect(() => {
    if (!pdfBytes) { setPreviewImg(null); return; }
    import('pdfjs-dist').then(async ({ GlobalWorkerOptions, getDocument }) => {
      GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
      const pdf = await getDocument({ data: pdfBytes.slice(0) }).promise;
      setPdfPageCount(pdf.numPages);
      const page = await pdf.getPage(1);
      const vp = page.getViewport({ scale: 380 / page.getViewport({ scale: 1 }).width });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
      setPreviewImg(canvas.toDataURL());
    }).catch(() => {});
  }, [pdfBytes]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
          <Signature size={36} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">Free Remote E-Signing</h2>
        <p className="text-slate-500 max-w-md mb-8">Upload a document, add your signers' emails, place signature fields, and send — no account needed for signers.</p>
        <button onClick={() => openAuthModal('signup')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
          Get started free
        </button>
      </div>
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') return;
    setPdfFile(file);
    const buf = await file.arrayBuffer();
    setPdfBytes(buf);
    if (!title) setTitle(file.name.replace(/\.pdf$/i, ''));
    // Reset previous draft so a new upload creates a fresh doc
    setDraftId(null);
    bgDocIdRef.current = null;
    bgPdfUrlRef.current = null;
    setUploadError('');

    // ── Start background upload immediately ────────────────────────────────
    // We create a temporary doc in Firestore to get a docId, then stream the
    // PDF to Firebase Storage in the background while the user fills signers.
    setUploadState('uploading');
    setUploadPct(0);
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + expiryDays);
      const tmpDocId = await createSignDocument({
        ownerId: user!.uid,
        ownerEmail: user!.email ?? '',
        ownerName: user!.displayName ?? user!.email ?? 'Owner',
        title: file.name.replace(/\.pdf$/i, ''),
        pdfUrl: '',
        status: 'draft',
        signers: [],
        fields: [],
        signingOrder,
        pageCount: 1, // will be updated once pdfjs parses the doc
        expiresAt: { seconds: Math.floor(expiry.getTime() / 1000) },
        reminderFrequency: reminderFreq,
      });
      bgDocIdRef.current = tmpDocId;

      const pdfUrl = await uploadPdfForSigning(tmpDocId, buf, (pct) => {
        setUploadPct(pct);
      });

      bgPdfUrlRef.current = pdfUrl;
      await updateSignDocumentPdfUrl(tmpDocId, pdfUrl);
      setUploadState('done');
    } catch (err) {
      console.error('Background upload failed:', err);
      setUploadState('error');
      setUploadError('Upload failed — please try selecting the file again.');
    }
  };

  const addSigner = () => {
    if (!newEmail.trim() || !newName.trim()) return;
    const s: SignerConfig = {
      id: crypto.randomUUID(),
      email: newEmail.trim().toLowerCase(),
      name: newName.trim(),
      order: signers.length + 1,
      color: SIGNER_COLORS[signers.length % SIGNER_COLORS.length],
      status: 'pending',
      token: generateToken(),
    };
    setSigners(prev => [...prev, s]);
    setNewName(''); setNewEmail('');
  };

  const removeSigner = (id: string) => {
    setSigners(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
    setFields(prev => prev.filter(f => f.signerId !== id));
  };

  const goToFields = async () => {
    if (!pdfBytes || !title.trim() || signers.length === 0) return;
    // If already committed, go straight to the field editor
    if (draftId) { setView('fields'); return; }

    const docId = bgDocIdRef.current;
    if (!docId) {
      setUploadError('No document created yet. Please wait for the upload to complete.');
      return;
    }

    // If background upload still in progress, just wait — user pressed button early
    if (uploadState === 'uploading') {
      setUploadError('Still uploading… please wait a moment and try again.');
      return;
    }

    if (uploadState === 'error') {
      setUploadError('Upload failed. Please re-select the file and try again.');
      return;
    }

    // Upload is done — update the doc with final title, signers, and page count
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + expiryDays);
      const { updateDoc, doc: firestoreDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      await import('firebase/firestore').then(({ serverTimestamp }) =>
        updateDoc(firestoreDoc(db, 'sign_documents', docId), {
          title: title.trim(),
          signers,
          signingOrder,
          pageCount: pdfPageCount,
          reminderFrequency: reminderFreq,
          expiresAt: { seconds: Math.floor((Date.now() + expiryDays * 86400000) / 1000) },
          updatedAt: serverTimestamp(),
        })
      );
      // Store token → docId mappings for any signers that were added
      const { setDoc, doc: fsDoc } = await import('firebase/firestore');
      for (const signer of signers) {
        await setDoc(fsDoc(db, 'sign_tokens', signer.token), {
          docId,
          signerId: signer.id,
        });
      }
      setDraftId(docId);
      setView('fields');
    } catch (e) {
      console.error('goToFields error:', e);
      setUploadError('Something went wrong. Please try again.');
    }
  };

  const handleSend = async () => {
    if (!draftId) return;
    setSending(true);
    try {
      await saveDocumentFields(draftId, fields);
      await sendDocument(draftId, customMsg);
      setSentDocId(draftId);
      resetState();
      setView('dashboard');
      getOwnerDocuments(user.uid).then(setDocuments).catch(() => {});
    } catch (e: any) {
      console.error(e);
      setUploadError(e?.message?.includes('invitations')
        ? 'Document saved but email delivery failed. Check your SMTP configuration and try resending.'
        : 'Something went wrong. Please try again.');
    }
    setSending(false);
  };

  const resetState = () => {
    setPdfFile(null); setPdfBytes(null); setPreviewImg(null); setTitle('');
    setSigners([]); setFields([]); setCustomMsg(''); setDraftId(null);
    setPdfPageCount(1); setReminderFreq('3days'); setUploadError('');
    setSigningOrder('sequential'); setExpiryDays(14);
    setNewName(''); setNewEmail('');
    setUploadState('idle'); setUploadPct(0);
    bgDocIdRef.current = null; bgPdfUrlRef.current = null;
  };

  const handleVoid = async (docId: string) => {
    if (!confirm('Void this document? All pending signers will be notified.')) return;
    await voidDocument(docId, user.email ?? '');
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'voided' as DocStatus } : d));
  };

  // Save current fields + signers as a reusable template
  const handleSaveTemplate = async () => {
    const pdfUrl = bgPdfUrlRef.current;
    if (!pdfUrl || !user || fields.length === 0) return;
    // Map real signer IDs → slot-0, slot-1, …
    const slotMap = new Map(signers.map((s, i) => [s.id, `slot-${i}`]));
    const templateFields = fields.map(f => ({ ...f, signerId: slotMap.get(f.signerId) ?? f.signerId }));
    const signerSlots = signers.map((s, i) => ({ id: `slot-${i}`, role: `Signer ${i + 1}`, color: s.color }));
    await saveTemplate({
      ownerId: user.uid, ownerEmail: user.email ?? '', ownerName: user.displayName ?? user.email ?? 'Owner',
      title, pdfUrl, fields: templateFields, pageCount: pdfPageCount,
      signingOrder, signerSlots, reminderFrequency: reminderFreq,
    });
    // Refresh template list
    getOwnerTemplates(user.uid).then(setTemplates).catch(() => {});
    setSaveTemplateMsg('Template saved! Find it in your Templates tab.');
    setTimeout(() => setSaveTemplateMsg(''), 4000);
  };

  // Create a document from a template and send it immediately
  const handleUseTemplate = async () => {
    if (!useTemplateModal || !user) return;
    const valid = utSigners.every(s => s.name.trim() && s.email.trim());
    if (!valid) { setUtError('Please fill in name and email for every signer.'); return; }
    setUtSending(true); setUtError('');
    try {
      const newSigners: SignerConfig[] = utSigners.map((inp, i) => ({
        id: crypto.randomUUID(),
        email: inp.email.trim().toLowerCase(),
        name: inp.name.trim(),
        order: i + 1,
        color: useTemplateModal.signerSlots[i]?.color ?? SIGNER_COLORS[i % SIGNER_COLORS.length],
        status: 'pending',
        token: generateToken(),
      }));
      const slotToId = new Map(useTemplateModal.signerSlots.map((slot, i) => [slot.id, newSigners[i].id]));
      const mappedFields: SignField[] = useTemplateModal.fields.map(f => ({
        ...f,
        id: crypto.randomUUID(),
        signerId: slotToId.get(f.signerId) ?? f.signerId,
        value: undefined,
        filledAt: undefined,
      }));
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 14);
      const docId = await createSignDocument({
        ownerId: user.uid, ownerEmail: user.email ?? '', ownerName: user.displayName ?? user.email ?? 'Owner',
        title: utTitle || useTemplateModal.title,
        pdfUrl: useTemplateModal.pdfUrl,
        status: 'draft',
        signers: newSigners,
        fields: mappedFields,
        signingOrder: useTemplateModal.signingOrder,
        pageCount: useTemplateModal.pageCount,
        expiresAt: { seconds: Math.floor(expiry.getTime() / 1000) },
        reminderFrequency: useTemplateModal.reminderFrequency ?? '3days',
      });
      await sendDocument(docId, '');
      incrementTemplateUsage(useTemplateModal.id!).catch(() => {});
      getOwnerDocuments(user.uid).then(setDocuments).catch(() => {});
      // refresh template usage count
      getOwnerTemplates(user.uid).then(setTemplates).catch(() => {});
      setUseTemplateModal(null);
      setSentDocId(docId);
      setDashTab('documents');
    } catch (e: any) {
      setUtError(e?.message || 'Something went wrong. Please try again.');
    }
    setUtSending(false);
  };

  // ── Full-screen field placement ───────────────────────────────────────────────

  if (view === 'fields') {
    return (
      <FieldPlacementView
        pdfBytes={pdfBytes!}
        signers={signers}
        fields={fields}
        setFields={setFields}
        onBack={() => setView('setup')}
        onNext={() => setView('review')}
        onSaveTemplate={handleSaveTemplate}
        saveTemplateMsg={saveTemplateMsg}
      />
    );
  }

  // ── Review & Send ─────────────────────────────────────────────────────────────

  if (view === 'review') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('fields')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Review & Send</h1>
            <p className="text-sm text-slate-500">Check everything looks right before sending</p>
          </div>
        </div>

        {/* Document summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-black text-slate-900">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{pdfPageCount} page{pdfPageCount !== 1 ? 's' : ''} · {signingOrder} signing · expires in {expiryDays} days · {fields.length} fields placed</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Signers ({signers.length})</p>
            <div className="space-y-2">
              {signers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: s.color }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                  {signingOrder === 'sequential' && (
                    <span className="text-xs text-slate-400 font-bold shrink-0">Signs #{i + 1}</span>
                  )}
                  <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full shrink-0">
                    {fields.filter(f => f.signerId === s.id).length} fields
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom message */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Message to signers <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea rows={3} value={customMsg} onChange={e => setCustomMsg(e.target.value)}
            placeholder="Please review and sign this agreement at your earliest convenience."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">Each signer gets a secure email with their unique signing link. No account required for them.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setView('fields')}
            className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">
            ← Edit Fields
          </button>
          <button onClick={handleSend} disabled={sending}
            className="flex-[2] py-3.5 bg-blue-600 text-white font-black rounded-2xl disabled:opacity-50 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            {sending ? <><RefreshCw size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send for Signature</>}
          </button>
        </div>
      </div>
    );
  }

  // ── Setup (upload + signers on one screen) ────────────────────────────────────

  if (view === 'setup') {
    const canProceed = pdfFile && title.trim() && signers.length > 0;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => { resetState(); setView('dashboard'); }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">New Document</h1>
            <p className="text-sm text-slate-500">Upload a PDF, add signers, then place fields</p>
          </div>
        </div>

        {/* Upload + Preview row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Upload zone */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">1. Upload your PDF</label>
            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all
              ${pdfFile && uploadState === 'done' ? 'border-emerald-400 bg-emerald-50' : pdfFile ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}>
              <input type="file" accept=".pdf,application/pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              {pdfFile ? (
                <>
                  {uploadState === 'done' && <CheckCircle size={28} className="text-emerald-500 mb-2" />}
                  {uploadState === 'uploading' && <RefreshCw size={28} className="text-blue-500 mb-2 animate-spin" />}
                  {uploadState === 'error' && <AlertCircle size={28} className="text-red-500 mb-2" />}
                  <p className="font-bold text-sm text-center px-3 truncate max-w-full"
                    style={{ color: uploadState === 'done' ? '#059669' : uploadState === 'error' ? '#dc2626' : '#2563eb' }}>
                    {pdfFile.name}
                  </p>
                  {uploadState === 'uploading' && (
                    <div className="w-3/4 mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">Uploading…</span>
                        <span className="text-[10px] font-bold text-blue-500">{uploadPct}%</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadPct}%` }} />
                      </div>
                    </div>
                  )}
                  {uploadState === 'done' && (
                    <p className="text-xs text-emerald-500 mt-1">{pdfPageCount} page{pdfPageCount !== 1 ? 's' : ''} · ready · click to change</p>
                  )}
                  {uploadState === 'error' && (
                    <p className="text-xs text-red-500 mt-1">Upload failed — click to try again</p>
                  )}
                </>
              ) : (
                <>
                  <Upload size={28} className="text-slate-300 mb-2" />
                  <p className="font-bold text-slate-500 text-sm">Drop PDF here or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">PDF files only · uploads immediately in background</p>
                </>
              )}
            </label>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Document title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. NDA Agreement"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          {/* PDF Preview */}
          <div className="flex flex-col">
            <label className="block text-sm font-bold text-slate-700 mb-2">Preview</label>
            <div className="flex-1 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center min-h-[160px]">
              {previewImg ? (
                <img src={previewImg} alt="PDF preview" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-6">
                  <FileText size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">PDF preview appears here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900">2. Who needs to sign?</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add each person's name and email address</p>
          </div>

          {/* Add signer form */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <input type="text" placeholder="Full name" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSigner()}
              className="flex-1 min-w-0 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="email" placeholder="Email address" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSigner()}
              className="flex-[2] min-w-0 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={addSigner} disabled={!newName.trim() || !newEmail.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-slate-700 transition-all text-sm shrink-0">
              <Plus size={15} /> Add
            </button>
          </div>

          {/* Signer list */}
          {signers.length > 0 ? (
            <div className="space-y-2">
              {signers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: s.color }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{s.name}</p>
                    <p className="text-xs text-slate-500 truncate">{s.email}</p>
                  </div>
                  {signingOrder === 'sequential' && (
                    <span className="text-xs text-slate-400 font-bold shrink-0">#{i + 1}</span>
                  )}
                  <button onClick={() => removeSigner(s.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg shrink-0 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
              <AlertCircle size={15} />
              <span>No signers added yet — add at least one above</span>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-black text-slate-900">3. Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Signing order</label>
              <select value={signingOrder} onChange={e => setSigningOrder(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="sequential">Sequential (one by one)</option>
                <option value="parallel">Parallel (all at once)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Link expires in</label>
              <select value={expiryDays} onChange={e => setExpiryDays(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Auto-reminders</label>
              <select value={reminderFreq} onChange={e => setReminderFreq(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="daily">Every day</option>
                <option value="3days">Every 3 days</option>
                <option value="weekly">Weekly</option>
                <option value="none">No reminders</option>
              </select>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {uploadError}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={goToFields}
          disabled={!canProceed}
          className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl disabled:opacity-40 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-200 active:scale-[0.99]"
        >
          {!pdfFile
            ? 'Upload a PDF to continue'
            : signers.length === 0
              ? 'Add at least one signer to continue'
              : uploadState === 'uploading'
                ? <><RefreshCw size={18} className="animate-spin" /> Uploading {uploadPct}% — you can add signers while this completes</>
                : uploadState === 'error'
                  ? <><AlertCircle size={18} /> Upload failed — re-select the file to retry</>
                  : <>Place Signature Fields <span className="text-blue-200">→</span></>
          }
        </button>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Remote Signing</h1>
          <p className="text-slate-500 mt-1 text-sm">Send documents for e-signature. No account required for signers.</p>
        </div>
        <button onClick={() => { resetState(); setView('setup'); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> New Document
        </button>
      </div>

      {sentDocId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600 shrink-0" />
          <p className="text-emerald-700 font-medium text-sm">Document sent! Signing invitations emailed to all signers.</p>
          <button onClick={() => setSentDocId(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><XCircle size={16} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: documents.length, color: 'bg-slate-100 text-slate-600', icon: <FileText size={20} /> },
          { label: 'Pending', value: documents.filter(d => d.status === 'sent').length, color: 'bg-blue-50 text-blue-600', icon: <Clock size={20} /> },
          { label: 'Completed', value: documents.filter(d => d.status === 'completed').length, color: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle size={20} /> },
          { label: 'Voided', value: documents.filter(d => d.status === 'voided').length, color: 'bg-red-50 text-red-500', icon: <XCircle size={20} /> },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color}`}>{c.icon}</div>
            <div><p className="text-2xl font-black text-slate-900">{c.value}</p><p className="text-xs text-slate-500 font-medium">{c.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-slate-100">
        <button
          onClick={() => setDashTab('documents')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px ${dashTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <FileText size={15} /> Documents ({documents.length})
        </button>
        <button
          onClick={() => setDashTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px ${dashTab === 'templates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <LayoutTemplate size={15} /> Templates ({templates.length})
        </button>
      </div>

      {dashTab === 'documents' && (<>
      {docsError && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-amber-700 text-sm flex-1">Could not load your documents. Check your connection and try again.</p>
          <button
            onClick={() => { setDocsLoading(true); setDocsError(false); getOwnerDocuments(user.uid).then(docs => { setDocuments(docs); setDocsLoading(false); }).catch(() => { setDocsLoading(false); setDocsError(true); }); }}
            className="text-sm font-bold text-amber-700 hover:underline shrink-0">
            Retry
          </button>
        </div>
      )}

      {/* Document list */}
      {docsLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Send size={28} className="text-blue-400" />
          </div>
          <p className="font-bold text-slate-700 mb-1">No documents yet</p>
          <p className="text-slate-400 text-sm mb-6">Click "New Document" to send your first contract for signing.</p>
          <button onClick={() => { resetState(); setView('setup'); }}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            Create your first document
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="text-left px-6 py-4">Document</th>
                <th className="text-left px-4 py-4 hidden md:table-cell">Signers</th>
                <th className="text-left px-4 py-4 hidden sm:table-cell">Sent</th>
                <th className="text-left px-4 py-4">Status</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody>
              {documents.map(d => (
                <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{d.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.pageCount} page{d.pageCount !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex -space-x-1">
                      {d.signers.map(s => <SignerAvatar key={s.id} signer={s} size={26} />)}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell text-slate-500">{formatDate(d.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[d.status]}`}>
                      {statusLabel[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {d.status === 'completed' && d.signedPdfUrl && (
                        <a href={d.signedPdfUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Download signed PDF">
                          <Download size={15} />
                        </a>
                      )}
                      {d.status === 'sent' && (
                        <>
                          <button
                            onClick={() => setSignerLinksDoc(d)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="View signing links">
                            <Copy size={15} />
                          </button>
                          <button onClick={() => handleVoid(d.id!)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Void document">
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>)}

      {dashTab === 'templates' && (
        <div>
          {templatesLoading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : templates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LayoutTemplate size={28} className="text-slate-400" />
              </div>
              <p className="font-bold text-slate-700 mb-1">No templates yet</p>
              <p className="text-slate-400 text-sm">Create a document, place fields, then click "Save as Template" in the field editor to reuse it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <LayoutTemplate size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.pageCount} page{t.pageCount !== 1 ? 's' : ''} · {t.signerSlots.length} signer{t.signerSlots.length !== 1 ? 's' : ''} · {t.fields.length} fields</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {t.signerSlots.map(slot => (
                      <div key={slot.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: slot.color + '18', color: slot.color }}>
                        <Users size={11} /> {slot.role}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-xs text-slate-400">{t.usageCount} use{t.usageCount !== 1 ? 's' : ''}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { if (!confirm('Delete this template?')) return; deleteTemplate(t.id!).then(() => getOwnerTemplates(user.uid).then(setTemplates).catch(() => {})); }}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Delete template">
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => { setUseTemplateModal(t); setUtTitle(t.title); setUtSigners(t.signerSlots.map(() => ({ name: '', email: '' }))); setUtError(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all">
                        <Send size={12} /> Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {signerLinksDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSignerLinksDoc(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-slate-900 mb-1">Signing Links</h3>
            <p className="text-sm text-slate-500 mb-4">Copy and share each link with the respective signer.</p>
            <div className="space-y-3">
              {signerLinksDoc.signers.map(s => {
                const link = `${window.location.origin}/sign/${s.token}`;
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: s.color }}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-400 truncate">{s.email}</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(link)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 shrink-0">
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setSignerLinksDoc(null)}
              className="mt-4 w-full py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      {useTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setUseTemplateModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-slate-900 mb-1">Use Template</h3>
            <p className="text-sm text-slate-500 mb-4">Fill in the recipient details and the document will be sent immediately.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Document title</label>
                <input type="text" value={utTitle} onChange={e => setUtTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              {useTemplateModal.signerSlots.map((slot, i) => (
                <div key={slot.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: slot.color }}>{i + 1}</div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{slot.role}</span>
                  </div>
                  <input type="text" placeholder="Full name" value={utSigners[i]?.name ?? ''}
                    onChange={e => setUtSigners(prev => prev.map((s, j) => j === i ? { ...s, name: e.target.value } : s))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                  <input type="email" placeholder="Email address" value={utSigners[i]?.email ?? ''}
                    onChange={e => setUtSigners(prev => prev.map((s, j) => j === i ? { ...s, email: e.target.value } : s))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
              ))}
              {utError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-700 text-xs">
                  <AlertCircle size={14} className="shrink-0" /> {utError}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setUseTemplateModal(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm">
                Cancel
              </button>
              <button onClick={handleUseTemplate} disabled={utSending}
                className="flex-[2] py-2.5 bg-blue-600 text-white font-black rounded-xl disabled:opacity-50 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200">
                {utSending ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Document</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Field Placement View (full-screen fixed overlay) ──────────────────────────

interface FPVProps {
  pdfBytes: ArrayBuffer;
  signers: SignerConfig[];
  fields: SignField[];
  setFields: React.Dispatch<React.SetStateAction<SignField[]>>;
  onBack: () => void;
  onNext: () => void;
  onSaveTemplate: () => Promise<void>;
  saveTemplateMsg: string;
}

const FieldPlacementView: React.FC<FPVProps> = ({ pdfBytes, signers, fields, setFields, onBack, onNext, onSaveTemplate, saveTemplateMsg }) => {
  const [savingTemplate, setSavingTemplate] = React.useState(false);
  const [activeType, setActiveType] = React.useState<FieldType>('signature');
  const [activeSignerId, setActiveSignerId] = React.useState(signers[0]?.id ?? '');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [pageImages, setPageImages] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!pdfBytes) return;
    import('pdfjs-dist').then(async ({ GlobalWorkerOptions, getDocument }) => {
      GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
      const pdf = await getDocument({ data: pdfBytes.slice(0) }).promise;
      const imgs: string[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const vp = page.getViewport({ scale: PAGE_W / page.getViewport({ scale: 1 }).width });
        const c = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
        imgs.push(c.toDataURL());
      }
      setPageImages(imgs);
    });
  }, [pdfBytes]);

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const def = FIELD_DEFAULTS[activeType];
    const f: SignField = {
      id: crypto.randomUUID(),
      type: activeType,
      signerId: activeSignerId,
      pageIndex,
      x: Math.max(0, x - def.width / 2),
      y: Math.max(0, y - def.height / 2),
      width: def.width,
      height: def.height,
      required: true,
      label: def.label,
    };
    setFields(prev => [...prev, f]);
    setSelectedId(f.id);
  };

  const activeSigner = signers.find(s => s.id === activeSignerId);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #e2e8f0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, overflowX: 'auto' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#475569', background: 'white', cursor: 'pointer' }}>
          ← Back
        </button>

        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

        {/* Signer selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Placing for:</span>
          {signers.map(s => (
            <button key={s.id} onClick={() => setActiveSignerId(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                borderRadius: 20, border: `2px solid ${activeSignerId === s.id ? s.color : '#e2e8f0'}`,
                background: activeSignerId === s.id ? s.color + '18' : 'white',
                fontSize: 12, fontWeight: 700, color: activeSignerId === s.id ? s.color : '#64748b', cursor: 'pointer'
              }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 800 }}>
                {s.name.charAt(0)}
              </div>
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

        {/* Field type selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Field:</span>
          {(['signature', 'initials', 'date', 'text', 'checkbox'] as FieldType[]).map(t => (
            <button key={t} onClick={() => setActiveType(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                borderRadius: 20, border: `2px solid ${activeType === t ? '#2563eb' : '#e2e8f0'}`,
                background: activeType === t ? '#2563eb' : 'white',
                fontSize: 12, fontWeight: 700, color: activeType === t ? 'white' : '#64748b', cursor: 'pointer'
              }}>
              {FIELD_ICONS[t]}
              <span style={{ textTransform: 'capitalize' }}>{t}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{fields.length} field{fields.length !== 1 ? 's' : ''}</span>

        <button
          disabled={fields.length === 0 || savingTemplate}
          onClick={async () => { setSavingTemplate(true); await onSaveTemplate(); setSavingTemplate(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: savingTemplate ? '#f1f5f9' : 'white', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: fields.length === 0 ? 'not-allowed' : 'pointer', opacity: fields.length === 0 ? 0.4 : 1 }}>
          <BookmarkPlus size={14} />
          {savingTemplate ? 'Saving…' : 'Save as Template'}
        </button>

        <button onClick={onNext}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
          Review & Send →
        </button>
      </div>

      {/* Save-template success banner */}
      {saveTemplateMsg && (
        <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '8px 16px', fontSize: 12, color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          ✓ {saveTemplateMsg}
        </div>
      )}

      {/* Instruction bar */}
      <div style={{ background: '#eff6ff', borderBottom: '1px solid #dbeafe', padding: '8px 16px', fontSize: 12, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Zap size={13} style={{ color: '#3b82f6', flexShrink: 0 }} />
        Click anywhere on the document to place a <strong style={{ marginLeft: 4, marginRight: 4 }}>{activeType}</strong> field for <strong style={{ color: activeSigner?.color, marginLeft: 4 }}>{activeSigner?.name}</strong>. Drag to reposition. Click a field then ✕ to delete.
      </div>

      {/* PDF scroll area */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {pageImages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid #bfdbfe', borderTopColor: '#2563eb', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Loading document…</p>
          </div>
        )}
        {pageImages.map((img, pageIndex) => {
          const pageFields = fields.filter(f => f.pageIndex === pageIndex);
          return (
            <div key={pageIndex} style={{ position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', borderRadius: 8, overflow: 'visible', cursor: 'crosshair', background: 'white', width: PAGE_W }}>
              <img src={img} alt={`Page ${pageIndex + 1}`} style={{ width: '100%', display: 'block', borderRadius: 8 }} draggable={false} />
              <div style={{ position: 'absolute', inset: 0 }} onClick={e => handlePageClick(e, pageIndex)}>
                {pageFields.map(field => {
                  const signer = signers.find(s => s.id === field.signerId);
                  return (
                    <DraggableField key={field.id} field={field} signer={signer}
                      isSelected={selectedId === field.id}
                      onSelect={() => setSelectedId(field.id)}
                      onMove={(dx, dy) => setFields(prev => prev.map(f => f.id === field.id ? { ...f, x: f.x + dx, y: f.y + dy } : f))}
                      onDelete={() => { setFields(prev => prev.filter(f => f.id !== field.id)); setSelectedId(null); }}
                      onAssign={sid => setFields(prev => prev.map(f => f.id === field.id ? { ...f, signerId: sid } : f))}
                      signers={signers}
                    />
                  );
                })}
              </div>
              {pageImages.length > 1 && (
                <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>Page {pageIndex + 1}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
};

// ── Draggable Field ───────────────────────────────────────────────────────────

interface DraggableFieldProps {
  field: SignField; signer?: SignerConfig; isSelected: boolean;
  onSelect: () => void; onMove: (dx: number, dy: number) => void;
  onDelete: () => void; onAssign: (sid: string) => void; signers: SignerConfig[];
}

const DraggableField: React.FC<DraggableFieldProps> = ({ field, signer, isSelected, onSelect, onMove, onDelete, onAssign, signers }) => {
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const [showAssign, setShowAssign] = React.useState(false);
  const color = signer?.color ?? '#94A3B8';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); onSelect();
    dragStart.current = { x: e.clientX, y: e.clientY };
    const move = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      onMove(ev.clientX - dragStart.current.x, ev.clientY - dragStart.current.y);
      dragStart.current = { x: ev.clientX, y: ev.clientY };
    };
    const up = () => { dragStart.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      style={{ position: 'absolute', left: field.x, top: field.y, width: field.width, height: field.height, border: `2px ${isSelected ? 'solid' : 'dashed'} ${color}`, borderRadius: 6, background: color + '22', cursor: 'move', userSelect: 'none', boxSizing: 'border-box', outline: isSelected ? `2px solid ${color}66` : 'none', outlineOffset: 2 }}
      onMouseDown={handleMouseDown}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10, fontWeight: 700, color }}>
        {FIELD_ICONS[field.type]}
        <span style={{ fontSize: 10 }}>{field.label}</span>
      </div>

      {/* Signer badge */}
      <div style={{ position: 'absolute', top: -10, left: -10, width: 18, height: 18, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 900, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
        {signer?.name.charAt(0) ?? '?'}
      </div>

      {isSelected && (
        <>
          <button
            onMouseDown={e => { e.stopPropagation(); setShowAssign(v => !v); }}
            style={{ position: 'absolute', top: -18, right: 20, background: 'white', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 10, padding: '2px 6px', fontWeight: 700, color: '#475569', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {signer?.name.split(' ')[0] ?? '?'} ▾
          </button>
          <button
            onMouseDown={e => { e.stopPropagation(); onDelete(); }}
            style={{ position: 'absolute', top: -10, right: -10, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            ✕
          </button>

          {showAssign && (
            <div onMouseDown={e => e.stopPropagation()}
              style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, minWidth: 140, overflow: 'hidden' }}>
              {signers.map(s => (
                <button key={s.id} onClick={() => { onAssign(s.id); setShowAssign(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#334155', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseOut={e => (e.currentTarget.style.background = 'none')}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 800 }}>
                    {s.name.charAt(0)}
                  </div>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
