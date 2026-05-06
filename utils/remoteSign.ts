import { db, storage, auth, FUNCTIONS_BASE_URL } from '../config/firebase';
import {
  collection, doc, getDoc, setDoc, updateDoc,
  query, where, getDocs, Timestamp, serverTimestamp, arrayUnion
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ── Types ─────────────────────────────────────────────────────────────────────

export type FieldType = 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
export type SignerStatus = 'pending' | 'viewed' | 'signed' | 'declined';
export type DocStatus = 'draft' | 'sent' | 'completed' | 'voided' | 'expired';
export type SigningOrder = 'sequential' | 'parallel';
export type ReminderFrequency = 'daily' | '3days' | 'weekly' | 'none';

export const SIGNER_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export const FIELD_DEFAULTS: Record<FieldType, { width: number; height: number; label: string }> = {
  signature: { width: 200, height: 60,  label: 'Signature' },
  initials:  { width: 80,  height: 50,  label: 'Initials' },
  date:      { width: 150, height: 40,  label: 'Date' },
  text:      { width: 180, height: 40,  label: 'Text' },
  checkbox:  { width: 30,  height: 30,  label: 'Checkbox' },
};

export interface SignerConfig {
  id: string;
  email: string;
  name: string;
  order: number;
  color: string;
  status: SignerStatus;
  signedAt?: any;
  viewedAt?: any;
  declinedAt?: any;
  declineReason?: string;
  token: string;
  ipAddress?: string;
}

export interface SignField {
  id: string;
  type: FieldType;
  signerId: string;
  pageIndex: number;
  x: number;   // pixels from left of rendered page
  y: number;   // pixels from top of rendered page
  width: number;
  height: number;
  required: boolean;
  label?: string;
  value?: string;
  filledAt?: any;
}

export interface AuditEvent {
  timestamp: any;
  event: string;
  actor: string;
  ip?: string;
}

export interface SignDocument {
  id?: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  pdfUrl: string;
  status: DocStatus;
  signers: SignerConfig[];
  fields: SignField[];
  signingOrder: SigningOrder;
  expiresAt?: any;
  createdAt?: any;
  updatedAt?: any;
  completedAt?: any;
  customMessage?: string;
  reminderFrequency?: ReminderFrequency;
  signedPdfUrl?: string;
  auditTrail: AuditEvent[];
  pageCount: number;
}

// ── Token generator ───────────────────────────────────────────────────────────

export const generateToken = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

// ── OTP helpers ──────────────────────────────────────────────────────────────

export const requestOtp = async (token: string): Promise<{ maskedEmail: string }> => {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/esign/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const verifyOtp = async (token: string, otp: string): Promise<boolean> => {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/esign/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, otp }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.ok === true;
};

// ── Auth helper ───────────────────────────────────────────────────────────────

const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const uploadPdfForSigning = async (docId: string, pdfBytes: ArrayBuffer): Promise<string> => {
  const pdfRef = ref(storage, `sign_pdfs/${docId}/original.pdf`);
  await uploadBytes(pdfRef, new Uint8Array(pdfBytes), { contentType: 'application/pdf' });
  return getDownloadURL(pdfRef);
};

export const createSignDocument = async (
  data: Omit<SignDocument, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>,
): Promise<string> => {
  const docRef = doc(collection(db, 'sign_documents'));
  const document: SignDocument = {
    ...data,
    id: docRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    auditTrail: [{ timestamp: Timestamp.now(), event: 'Document created', actor: data.ownerEmail }],
  };
  await setDoc(docRef, document);

  // Store token → docId mappings for fast signer portal lookup
  for (const signer of data.signers) {
    await setDoc(doc(db, 'sign_tokens', signer.token), {
      docId: docRef.id,
      signerId: signer.id,
    });
  }
  return docRef.id;
};

export const getSignDocument = async (id: string): Promise<SignDocument | null> => {
  const snap = await getDoc(doc(db, 'sign_documents', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as SignDocument;
};

export const getDocumentByToken = async (token: string): Promise<{ document: SignDocument; signer: SignerConfig } | null> => {
  const tokenSnap = await getDoc(doc(db, 'sign_tokens', token));
  if (!tokenSnap.exists()) return null;
  const { docId, signerId } = tokenSnap.data();
  const signDoc = await getSignDocument(docId);
  if (!signDoc) return null;
  const signer = signDoc.signers.find(s => s.id === signerId);
  if (!signer) return null;
  return { document: signDoc, signer };
};

export const getOwnerDocuments = async (ownerId: string): Promise<SignDocument[]> => {
  const q = query(collection(db, 'sign_documents'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as SignDocument));
  return docs.sort((a, b) => {
    const ta = a.createdAt?.seconds ?? 0;
    const tb = b.createdAt?.seconds ?? 0;
    return tb - ta;
  });
};

export const saveDocumentFields = async (docId: string, fields: SignField[]): Promise<void> => {
  await updateDoc(doc(db, 'sign_documents', docId), { fields, updatedAt: serverTimestamp() });
};

export const sendDocument = async (docId: string, customMessage: string): Promise<void> => {
  const token = await getIdToken();
  await updateDoc(doc(db, 'sign_documents', docId), {
    status: 'sent',
    customMessage,
    updatedAt: serverTimestamp(),
    auditTrail: arrayUnion({ timestamp: Timestamp.now(), event: 'Document sent', actor: 'owner' }),
  });
  // Trigger email via functions
  if (token) {
    fetch(`${FUNCTIONS_BASE_URL}/esign/send-invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ docId }),
    }).catch(() => {}); // fire-and-forget
  }
};

export const voidDocument = async (docId: string, ownerEmail: string): Promise<void> => {
  await updateDoc(doc(db, 'sign_documents', docId), {
    status: 'voided',
    updatedAt: serverTimestamp(),
    auditTrail: arrayUnion({ timestamp: Timestamp.now(), event: 'Document voided', actor: ownerEmail }),
  });
};

export const recordSignerViewed = async (docId: string, signerId: string): Promise<void> => {
  const signDoc = await getSignDocument(docId);
  if (!signDoc) return;
  const updatedSigners = signDoc.signers.map(s =>
    s.id === signerId && s.status === 'pending'
      ? { ...s, status: 'viewed' as SignerStatus, viewedAt: Timestamp.now() }
      : s,
  );
  await updateDoc(doc(db, 'sign_documents', docId), {
    signers: updatedSigners,
    updatedAt: serverTimestamp(),
    auditTrail: arrayUnion({
      timestamp: Timestamp.now(),
      event: 'Document viewed by signer',
      actor: signDoc.signers.find(s => s.id === signerId)?.email ?? signerId,
    }),
  });
};

export const submitSignedFields = async (
  docId: string,
  signerId: string,
  filledFields: { id: string; value: string }[],
): Promise<boolean> => {
  const signDoc = await getSignDocument(docId);
  if (!signDoc) return false;
  const now = Timestamp.now();
  const signerEmail = signDoc.signers.find(s => s.id === signerId)?.email ?? signerId;

  const updatedFields = signDoc.fields.map(f => {
    const filled = filledFields.find(ff => ff.id === f.id);
    return filled ? { ...f, value: filled.value, filledAt: now } : f;
  });
  const updatedSigners = signDoc.signers.map(s =>
    s.id === signerId ? { ...s, status: 'signed' as SignerStatus, signedAt: now } : s,
  );
  const allSigned = updatedSigners.every(s => s.status === 'signed');

  await updateDoc(doc(db, 'sign_documents', docId), {
    fields: updatedFields,
    signers: updatedSigners,
    status: allSigned ? 'completed' : 'sent',
    ...(allSigned ? { completedAt: now } : {}),
    updatedAt: serverTimestamp(),
    auditTrail: arrayUnion({ timestamp: now, event: 'Document signed', actor: signerEmail }),
  });

  // Notify backend (fire-and-forget)
  fetch(`${FUNCTIONS_BASE_URL}/esign/on-signed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docId, signerId, allSigned }),
  }).catch(() => {});

  if (allSigned) {
    fetch(`${FUNCTIONS_BASE_URL}/esign/on-completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId }),
    }).catch(() => {});
  }

  return allSigned;
};

export const declineSigning = async (docId: string, signerId: string, reason: string): Promise<void> => {
  const signDoc = await getSignDocument(docId);
  if (!signDoc) return;
  const signerEmail = signDoc.signers.find(s => s.id === signerId)?.email ?? signerId;
  const updatedSigners = signDoc.signers.map(s =>
    s.id === signerId
      ? { ...s, status: 'declined' as SignerStatus, declinedAt: Timestamp.now(), declineReason: reason }
      : s,
  );
  await updateDoc(doc(db, 'sign_documents', docId), {
    signers: updatedSigners,
    updatedAt: serverTimestamp(),
    auditTrail: arrayUnion({ timestamp: Timestamp.now(), event: `Declined: ${reason}`, actor: signerEmail }),
  });

  // Notify owner (fire-and-forget)
  fetch(`${FUNCTIONS_BASE_URL}/esign/on-declined`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docId, signerId }),
  }).catch(() => {});
};

export const saveSignedPdf = async (docId: string, pdfBytes: Uint8Array): Promise<string> => {
  const pdfRef = ref(storage, `sign_pdfs/${docId}/signed.pdf`);
  await uploadBytes(pdfRef, pdfBytes, { contentType: 'application/pdf' });
  const url = await getDownloadURL(pdfRef);
  await updateDoc(doc(db, 'sign_documents', docId), { signedPdfUrl: url });
  return url;
};

// ── Formatting helpers ────────────────────────────────────────────────────────

export const statusLabel: Record<DocStatus, string> = {
  draft: 'Draft', sent: 'Pending', completed: 'Completed', voided: 'Voided', expired: 'Expired',
};
export const statusColor: Record<DocStatus, string> = {
  draft:     'bg-slate-100 text-slate-600',
  sent:      'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  voided:    'bg-red-100 text-red-600',
  expired:   'bg-amber-100 text-amber-700',
};
export const signerStatusColor: Record<SignerStatus, string> = {
  pending:  '#94A3B8',
  viewed:   '#F59E0B',
  signed:   '#10B981',
  declined: '#EF4444',
};

export const formatDate = (ts: any): string => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
