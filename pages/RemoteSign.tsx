import * as React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Plus, FileText, Clock, CheckCircle, XCircle, Upload, ChevronRight,
  ChevronLeft, Trash2, Send, Users, LayoutTemplate, MoreVertical,
  Bell, Download, Eye, Pencil, AlertTriangle, Signature, Calendar,
  Type, SquareCheck, Fingerprint, Zap, Info, Copy, RefreshCw
} from 'lucide-react';
import {
  SignDocument, SignerConfig, SignField, FieldType, DocStatus,
  SIGNER_COLORS, FIELD_DEFAULTS, generateToken,
  createSignDocument, getOwnerDocuments, voidDocument, sendDocument,
  uploadPdfForSigning, saveDocumentFields,
  statusLabel, statusColor, signerStatusColor, formatDate,
} from '../utils/remoteSign';

// ── Constants ────────────────────────────────────────────────────────────────

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  signature: <Signature size={16} />,
  initials:  <Fingerprint size={16} />,
  date:      <Calendar size={16} />,
  text:      <Type size={16} />,
  checkbox:  <SquareCheck size={16} />,
};

const PAGE_W = 794; // rendered A4 width in px

// ── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  </div>
);

const SignerAvatar: React.FC<{ signer: SignerConfig; size?: number }> = ({ signer, size = 32 }) => (
  <div
    title={`${signer.name} (${signer.status})`}
    style={{ width: size, height: size, backgroundColor: signer.color, borderColor: signerStatusColor[signer.status] }}
    className="rounded-full flex items-center justify-center text-white font-bold border-2 text-xs shrink-0"
  >
    {signer.name.charAt(0).toUpperCase()}
  </div>
);

// ── Step indicator ────────────────────────────────────────────────────────────

const Steps: React.FC<{ current: number }> = ({ current }) => {
  const steps = ['Upload', 'Signers', 'Place Fields', 'Review & Send'];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${i === current ? 'bg-blue-600 text-white' : i < current ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black border border-current">{i < current ? '✓' : i + 1}</span>
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`h-px w-4 shrink-0 ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────────────────────

export const RemoteSign: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  // View state
  const [view, setView] = React.useState<'dashboard' | 'prepare' | 'fields'>('dashboard');
  const [step, setStep] = React.useState(0); // 0-3 in prepare mode

  // Document list
  const [documents, setDocuments] = React.useState<SignDocument[]>([]);
  const [docsLoading, setDocsLoading] = React.useState(false);

  // Draft document being created
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = React.useState<ArrayBuffer | null>(null);
  const [pdfPageCount, setPdfPageCount] = React.useState(1);
  const [title, setTitle] = React.useState('');
  const [signingOrder, setSigningOrder] = React.useState<'sequential' | 'parallel'>('sequential');
  const [expiryDays, setExpiryDays] = React.useState(14);
  const [reminderFreq, setReminderFreq] = React.useState<'daily' | '3days' | 'weekly' | 'none'>('3days');
  const [signers, setSigners] = React.useState<SignerConfig[]>([]);
  const [fields, setFields] = React.useState<SignField[]>([]);
  const [customMsg, setCustomMsg] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sentDocId, setSentDocId] = React.useState<string | null>(null);

  // Signer form
  const [newSignerEmail, setNewSignerEmail] = React.useState('');
  const [newSignerName, setNewSignerName] = React.useState('');

  // Load documents
  React.useEffect(() => {
    if (!user) return;
    setDocsLoading(true);
    getOwnerDocuments(user.uid).then(docs => {
      setDocuments(docs);
      setDocsLoading(false);
    }).catch(() => setDocsLoading(false));
  }, [user]);

  // Get PDF page count from uploaded file
  React.useEffect(() => {
    if (!pdfBytes) return;
    import('pdfjs-dist').then(({ GlobalWorkerOptions, getDocument }) => {
      GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      getDocument({ data: pdfBytes.slice(0) }).promise.then(pdf => {
        setPdfPageCount(pdf.numPages);
      }).catch(() => {});
    });
  }, [pdfBytes]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
          <Signature size={36} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">Free Remote E-Signing</h2>
        <p className="text-slate-500 max-w-md mb-8">Upload a contract, add signers, place signature fields — and send a secure signing link. No account needed for your signers.</p>
        <button onClick={() => openAuthModal('signup')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
          Sign in to get started — it's free
        </button>
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') return;
    setPdfFile(file);
    const buf = await file.arrayBuffer();
    setPdfBytes(buf);
    if (!title) setTitle(file.name.replace('.pdf', ''));
  };

  const addSigner = () => {
    if (!newSignerEmail.trim() || !newSignerName.trim()) return;
    const newSigner: SignerConfig = {
      id: crypto.randomUUID(),
      email: newSignerEmail.trim(),
      name: newSignerName.trim(),
      order: signers.length + 1,
      color: SIGNER_COLORS[signers.length % SIGNER_COLORS.length],
      status: 'pending',
      token: generateToken(),
    };
    setSigners(prev => [...prev, newSigner]);
    setNewSignerEmail('');
    setNewSignerName('');
  };

  const removeSigner = (id: string) => {
    setSigners(prev => prev.filter(s => s.id !== id));
    setFields(prev => prev.filter(f => f.signerId !== id));
  };

  const goToFields = async () => {
    if (!pdfBytes || !title || signers.length === 0) return;
    // Create draft document in Firestore
    const url = draftId ? '' : await uploadPdfForSigning('__temp__', pdfBytes);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);
    const docId = await createSignDocument({
      ownerId: user.uid,
      ownerEmail: user.email ?? '',
      ownerName: user.displayName ?? user.email ?? 'Owner',
      title,
      pdfUrl: '',
      status: 'draft',
      signers,
      fields: [],
      signingOrder,
      pageCount: pdfPageCount,
      expiresAt: { seconds: Math.floor(expiry.getTime() / 1000) },
      reminderFrequency: reminderFreq,
    });
    // Upload PDF with real docId
    const pdfUrl = await uploadPdfForSigning(docId, pdfBytes);
    await saveDocumentFields(docId, []);
    setDraftId(docId);
    setView('fields');
  };

  const handleSend = async () => {
    if (!draftId) return;
    setSending(true);
    try {
      await saveDocumentFields(draftId, fields);
      await sendDocument(draftId, customMsg);
      setSentDocId(draftId);
      setDocuments(prev => prev.map(d => d.id === draftId ? { ...d, status: 'sent' as DocStatus } : d));
      resetPrepState();
      setView('dashboard');
      // Reload docs
      getOwnerDocuments(user.uid).then(setDocuments).catch(() => {});
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const resetPrepState = () => {
    setStep(0); setPdfFile(null); setPdfBytes(null); setTitle('');
    setSigners([]); setFields([]); setCustomMsg(''); setDraftId(null); setPdfPageCount(1); setReminderFreq('3days');
  };

  const handleVoid = async (docId: string) => {
    if (!confirm('Void this document? All pending signers will be notified.')) return;
    await voidDocument(docId, user.email ?? '');
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'voided' as DocStatus } : d));
  };

  const copySigningLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/sign/${token}`);
  };

  // ── Render: Dashboard ────────────────────────────────────────────────────────

  const renderDashboard = () => {
    const total = documents.length;
    const pending = documents.filter(d => d.status === 'sent').length;
    const completed = documents.filter(d => d.status === 'completed').length;
    const voided = documents.filter(d => d.status === 'voided').length;

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Remote Signing</h1>
            <p className="text-slate-500 mt-1 text-sm">Send documents for e-signature — no account required for signers.</p>
          </div>
          <button
            onClick={() => { resetPrepState(); setView('prepare'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={18} /> New Document
          </button>
        </div>

        {/* Sent banner */}
        {sentDocId && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <p className="text-emerald-700 font-medium text-sm">Document sent! Signing invitations have been emailed to all signers.</p>
            <button onClick={() => setSentDocId(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><XCircle size={16} /></button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Sent" value={total} color="bg-slate-100 text-slate-600" icon={<FileText size={20} />} />
          <StatCard label="Awaiting Signature" value={pending} color="bg-blue-50 text-blue-600" icon={<Clock size={20} />} />
          <StatCard label="Completed" value={completed} color="bg-emerald-50 text-emerald-600" icon={<CheckCircle size={20} />} />
          <StatCard label="Voided" value={voided} color="bg-red-50 text-red-500" icon={<XCircle size={20} />} />
        </div>

        {/* Document list */}
        {docsLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Send size={28} className="text-blue-400" /></div>
            <p className="font-bold text-slate-700 mb-1">No documents yet</p>
            <p className="text-slate-400 text-sm">Click "New Document" to send your first contract for signing.</p>
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
                        {d.signers.map(s => <SignerAvatar key={s.id} signer={s} size={28} />)}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell text-slate-500">{formatDate(d.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[d.status]}`}>
                        {statusLabel[d.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {d.status === 'completed' && d.signedPdfUrl && (
                          <a href={d.signedPdfUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Download signed PDF">
                            <Download size={16} />
                          </a>
                        )}
                        {d.status === 'sent' && (
                          <>
                            <button onClick={() => d.signers.forEach(s => copySigningLink(s.token))}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Copy signing links">
                              <Copy size={16} />
                            </button>
                            <button onClick={() => handleVoid(d.id!)}
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Void document">
                              <XCircle size={16} />
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
      </div>
    );
  };

  // ── Render: Prepare (steps 0-3) ───────────────────────────────────────────────

  const renderUploadStep = () => (
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-xl font-black text-slate-900">Upload your document</h2>

      {/* Drop zone */}
      <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all
        ${pdfFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}>
        <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
        {pdfFile ? (
          <>
            <CheckCircle size={32} className="text-emerald-500 mb-2" />
            <p className="font-bold text-emerald-700">{pdfFile.name}</p>
            <p className="text-xs text-emerald-500 mt-1">{pdfPageCount} pages • click to change</p>
          </>
        ) : (
          <>
            <Upload size={32} className="text-slate-300 mb-3" />
            <p className="font-bold text-slate-500">Drop PDF here or click to upload</p>
            <p className="text-xs text-slate-400 mt-1">PDF files only</p>
          </>
        )}
      </label>

      {/* Title */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Document title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. NDA Agreement — Acme Corp"
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      {/* Signing order + expiry */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Signing order</label>
          <select value={signingOrder} onChange={e => setSigningOrder(e.target.value as any)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="sequential">Sequential (one by one)</option>
            <option value="parallel">Parallel (all at once)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Expires in</label>
          <select value={expiryDays} onChange={e => setExpiryDays(Number(e.target.value))}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Auto-reminders to signers</label>
        <select value={reminderFreq} onChange={e => setReminderFreq(e.target.value as any)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="daily">Every day (urgent)</option>
          <option value="3days">Every 3 days (recommended)</option>
          <option value="weekly">Once a week (relaxed)</option>
          <option value="none">No automatic reminders</option>
        </select>
      </div>

      <button
        disabled={!pdfFile || !title.trim()}
        onClick={() => setStep(1)}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-40 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
      >
        Next: Add Signers <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderSignersStep = () => (
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-xl font-black text-slate-900">Add signers</h2>

      {/* Signer list */}
      {signers.length > 0 && (
        <div className="space-y-2">
          {signers.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: s.color }}>
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{s.name}</p>
                <p className="text-xs text-slate-400 truncate">{s.email}</p>
              </div>
              {signingOrder === 'sequential' && (
                <span className="text-xs text-slate-400 font-bold shrink-0">#{i + 1}</span>
              )}
              <button onClick={() => removeSigner(s.id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add signer form */}
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-bold text-slate-600">Add a signer</p>
        <input type="text" placeholder="Full name" value={newSignerName} onChange={e => setNewSignerName(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
        <input type="email" placeholder="Email address" value={newSignerEmail} onChange={e => setNewSignerEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSigner()}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
        <button onClick={addSigner} disabled={!newSignerEmail.trim() || !newSignerName.trim()}
          className="w-full py-2 bg-slate-800 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 text-sm">
          <Plus size={16} /> Add Signer
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(0)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
          <ChevronLeft size={18} /> Back
        </button>
        <button disabled={signers.length === 0} onClick={() => { setStep(2); goToFields(); }}
          className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-40 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          Next: Place Fields <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderSendStep = () => (
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-xl font-black text-slate-900">Review & Send</h2>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <FileText size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Document</p>
            <p className="font-bold text-slate-800">{title}</p>
            <p className="text-xs text-slate-400">{pdfPageCount} pages · {signingOrder} signing · expires in {expiryDays} days</p>
          </div>
        </div>
        <div className="border-t border-slate-50 pt-4">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Signers ({signers.length})</p>
          <div className="space-y-2">
            {signers.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: s.color }}>{s.name.charAt(0)}</div>
                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                <span className="text-sm text-slate-400">&lt;{s.email}&gt;</span>
                {signingOrder === 'sequential' && <span className="ml-auto text-xs text-slate-400 font-bold">Sign #{i + 1}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-50 pt-4">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Signature fields placed</p>
          <p className="text-sm font-bold text-slate-700">{fields.length} field{fields.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Custom message */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Email message to signers (optional)</label>
        <textarea rows={3} value={customMsg} onChange={e => setCustomMsg(e.target.value)}
          placeholder="Please review and sign this agreement at your earliest convenience."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">Signers will receive a secure email with a direct signing link. No account creation required.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setView('fields')} className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
          <ChevronLeft size={18} /> Edit Fields
        </button>
        <button onClick={handleSend} disabled={sending}
          className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-40 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          {sending ? <><RefreshCw size={16} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send for Signature</>}
        </button>
      </div>
    </div>
  );

  // ── Render: Field Placement (full-screen) ─────────────────────────────────────

  if (view === 'fields') {
    return (
      <FieldPlacementView
        pdfBytes={pdfBytes!}
        pageCount={pdfPageCount}
        signers={signers}
        fields={fields}
        setFields={setFields}
        onBack={() => setView('prepare')}
        onNext={() => { setView('prepare'); setStep(3); }}
      />
    );
  }

  // ── Render: Prepare Wizard ────────────────────────────────────────────────────

  if (view === 'prepare') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={() => setView('dashboard')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <ChevronLeft size={20} />
          </button>
          <Steps current={step} />
        </div>
        <div className="max-w-2xl mx-auto">
          {step === 0 && renderUploadStep()}
          {step === 1 && renderSignersStep()}
          {step === 2 && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Uploading PDF…</p>
            </div>
          )}
          {step === 3 && renderSendStep()}
        </div>
      </div>
    );
  }

  return renderDashboard();
};

// ── Field Placement View ───────────────────────────────────────────────────────

interface FPVProps {
  pdfBytes: ArrayBuffer;
  pageCount: number;
  signers: SignerConfig[];
  fields: SignField[];
  setFields: React.Dispatch<React.SetStateAction<SignField[]>>;
  onBack: () => void;
  onNext: () => void;
}

const FieldPlacementView: React.FC<FPVProps> = ({ pdfBytes, pageCount, signers, fields, setFields, onBack, onNext }) => {
  const [activeFieldType, setActiveFieldType] = React.useState<FieldType>('signature');
  const [activeSignerId, setActiveSignerId] = React.useState<string>(signers[0]?.id ?? '');
  const [selectedFieldId, setSelectedFieldId] = React.useState<string | null>(null);
  const [pageImages, setPageImages] = React.useState<string[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Render all PDF pages as images
  React.useEffect(() => {
    if (!pdfBytes) return;
    import('pdfjs-dist').then(async ({ GlobalWorkerOptions, getDocument }) => {
      GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      const pdf = await getDocument({ data: pdfBytes.slice(0) }).promise;
      const images: string[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: PAGE_W / page.getViewport({ scale: 1 }).width });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
        images.push(canvas.toDataURL());
      }
      setPageImages(images);
    });
  }, [pdfBytes]);

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number, pageH: number) => {
    if (selectedFieldId) { setSelectedFieldId(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const def = FIELD_DEFAULTS[activeFieldType];
    const newField: SignField = {
      id: crypto.randomUUID(),
      type: activeFieldType,
      signerId: activeSignerId,
      pageIndex,
      x: x - def.width / 2,
      y: y - def.height / 2,
      width: def.width,
      height: def.height,
      required: true,
      label: def.label,
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  const deleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    setSelectedFieldId(null);
  };

  const moveField = (id: string, dx: number, dy: number) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, x: f.x + dx, y: f.y + dy } : f));
  };

  const fieldTypeButtons: { type: FieldType; label: string }[] = [
    { type: 'signature', label: 'Signature' },
    { type: 'initials', label: 'Initials' },
    { type: 'date', label: 'Date' },
    { type: 'text', label: 'Text' },
    { type: 'checkbox', label: 'Checkbox' },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Signer</p>
          <div className="space-y-1">
            {signers.map(s => (
              <button key={s.id} onClick={() => setActiveSignerId(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left text-sm ${activeSignerId === s.id ? 'bg-slate-100 font-bold text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: s.color }}>{s.name.charAt(0)}</div>
                <span className="truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Field type</p>
          <div className="space-y-1">
            {fieldTypeButtons.map(({ type, label }) => (
              <button key={type} onClick={() => setActiveFieldType(type)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left ${activeFieldType === type ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                {FIELD_ICONS[type]} {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-400 text-center">{fields.length} field{fields.length !== 1 ? 's' : ''} placed</p>
          <button onClick={onBack} className="w-full py-2 text-sm font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Back</button>
          <button onClick={onNext} className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all">
            Review & Send →
          </button>
        </div>
      </div>

      {/* PDF canvas area */}
      <div ref={containerRef} className="flex-1 overflow-auto p-6 space-y-4">
        <div className="bg-white/80 backdrop-blur rounded-xl px-4 py-2 inline-flex items-center gap-2 text-xs text-slate-500 mb-2 sticky top-0 z-10 shadow-sm">
          <Zap size={13} className="text-blue-500" />
          Click anywhere on the PDF to place a <strong>{activeFieldType}</strong> field for <strong>{signers.find(s => s.id === activeSignerId)?.name}</strong>
        </div>

        {pageImages.length === 0 && (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        )}

        {pageImages.map((img, pageIndex) => {
          const imgEl = new Image(); imgEl.src = img;
          const pageH = img ? 1123 : 1123; // approximate A4 height
          const pageFields = fields.filter(f => f.pageIndex === pageIndex);

          return (
            <div key={pageIndex} className="mx-auto shadow-2xl rounded-lg overflow-visible relative"
              style={{ width: PAGE_W, cursor: 'crosshair' }}
              onClick={e => handlePageClick(e, pageIndex, pageH)}>
              <img src={img} alt={`Page ${pageIndex + 1}`} className="w-full block" draggable={false} />
              <div className="absolute inset-0 top-0 left-0">
                {pageFields.map(field => {
                  const signer = signers.find(s => s.id === field.signerId);
                  const isSelected = selectedFieldId === field.id;
                  return (
                    <DraggableField
                      key={field.id}
                      field={field}
                      signer={signer}
                      isSelected={isSelected}
                      onSelect={() => setSelectedFieldId(field.id)}
                      onMove={(dx, dy) => moveField(field.id, dx, dy)}
                      onDelete={() => deleteField(field.id)}
                      onAssign={signerId => setFields(prev => prev.map(f => f.id === field.id ? { ...f, signerId } : f))}
                      signers={signers}
                    />
                  );
                })}
              </div>
              {pageImages.length > 1 && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-bold">Page {pageIndex + 1}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Draggable Field ───────────────────────────────────────────────────────────

interface DraggableFieldProps {
  field: SignField;
  signer?: SignerConfig;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (dx: number, dy: number) => void;
  onDelete: () => void;
  onAssign: (signerId: string) => void;
  signers: SignerConfig[];
}

const DraggableField: React.FC<DraggableFieldProps> = ({ field, signer, isSelected, onSelect, onMove, onDelete, onAssign, signers }) => {
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const [showAssign, setShowAssign] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    dragStart.current = { x: e.clientX, y: e.clientY };

    const onMove_ = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = ev.clientX - dragStart.current.x;
      const dy = ev.clientY - dragStart.current.y;
      dragStart.current = { x: ev.clientX, y: ev.clientY };
      onMove(dx, dy);
    };
    const onUp = () => { dragStart.current = null; window.removeEventListener('mousemove', onMove_); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove_);
    window.addEventListener('mouseup', onUp);
  };

  const color = signer?.color ?? '#94A3B8';

  return (
    <div
      style={{ left: field.x, top: field.y, width: field.width, height: field.height, borderColor: color }}
      className={`absolute border-2 rounded cursor-move select-none ${isSelected ? 'ring-2 ring-offset-1' : ''}`}
      onMouseDown={handleMouseDown}
    >
      {/* Background */}
      <div className="absolute inset-0 rounded" style={{ background: color + '25' }} />

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center gap-1 text-[11px] font-bold" style={{ color }}>
        {FIELD_ICONS[field.type]}<span>{field.label}</span>
      </div>

      {/* Signer dot */}
      <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black shadow" style={{ background: color }}>
        {signer?.name.charAt(0) ?? '?'}
      </div>

      {/* Controls when selected */}
      {isSelected && (
        <>
          <button
            onMouseDown={e => { e.stopPropagation(); setShowAssign(v => !v); }}
            className="absolute -top-5 right-6 bg-white border border-slate-200 shadow rounded text-[10px] px-1.5 py-0.5 font-bold text-slate-600 hover:bg-slate-50"
          >
            {signer?.name.split(' ')[0] ?? '?'} ▾
          </button>
          <button
            onMouseDown={e => { e.stopPropagation(); onDelete(); }}
            className="absolute -top-5 -right-0.5 bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded shadow text-[10px] font-black"
          >✕</button>

          {showAssign && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 min-w-[140px]"
              onMouseDown={e => e.stopPropagation()}>
              {signers.map(s => (
                <button key={s.id} onClick={() => { onAssign(s.id); setShowAssign(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-sm text-left">
                  <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: s.color }}>{s.name.charAt(0)}</div>
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
