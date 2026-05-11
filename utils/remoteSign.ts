import { db, storage, auth, FUNCTIONS_BASE_URL } from '../config/firebase';
import {
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc,
  query, where, getDocs, Timestamp, serverTimestamp, arrayUnion, increment,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';


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

export const requestOtp = async (token: string): Promise<{ maskedEmail: string; alreadySent?: boolean }> => {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/esign/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (res.status === 429) {
    // Rate-limited — a code was already sent recently; return maskedEmail so UX can proceed
    const data = await res.json().catch(() => ({}));
    return { maskedEmail: data.maskedEmail ?? '', alreadySent: true };
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const verifyOtp = async (token: string, otp: string): Promise<boolean> => {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/esign/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, otp }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Verification failed. Please try again.');
  }
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

export const uploadPdfForSigning = (
  docId: string,
  pdfBytes: ArrayBuffer,
  onProgress?: (pct: number) => void,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfRef = ref(storage, `sign_pdfs/${docId}/original.pdf`);
    const task2 = uploadBytesResumable(pdfRef, new Uint8Array(pdfBytes), { contentType: 'application/pdf' });
    task2.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task2.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      },
    );
  });
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

export const updateSignDocumentPdfUrl = async (docId: string, pdfUrl: string): Promise<void> => {
  await updateDoc(doc(db, 'sign_documents', docId), { pdfUrl, updatedAt: serverTimestamp() });
};

export const sendDocument = async (docId: string, customMessage: string): Promise<void> => {
  const token = await getIdToken();
  await updateDoc(doc(db, 'sign_documents', docId), {
    status: 'sent',
    customMessage,
    updatedAt: serverTimestamp(),
    auditTrail: arrayUnion({ timestamp: Timestamp.now(), event: 'Document sent', actor: 'owner' }),
  });
  // Trigger email via functions — await so callers can catch SMTP failures
  if (token) {
    const r = await fetch(`${FUNCTIONS_BASE_URL}/esign/send-invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ docId }),
    });
    if (!r.ok) {
      const msg = await r.text().catch(() => r.statusText);
      throw new Error(`Failed to send invitations: ${msg}`);
    }
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

// Signers are unauthenticated so they can't write to Storage directly.
// We POST the bytes to a Cloud Function which uploads via admin SDK.
export const saveSignedPdf = async (docId: string, pdfBytes: Uint8Array, token: string): Promise<string> => {
  // Use FileReader for fast, non-blocking Base64 encoding of large arrays
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const base64DataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  const pdfBase64 = base64DataUrl.split(',')[1];

  const res = await fetch(`${FUNCTIONS_BASE_URL}/esign/upload-signed-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docId, token, pdfBase64 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Upload failed: ${res.status} ${err.error ?? ''}`);
  }
  const { url } = await res.json();
  return url;
};

// ── Templates ─────────────────────────────────────────────────────────────────

export interface SignTemplate {
  id?: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  pdfUrl: string;
  // fields use signerId = 'slot-0', 'slot-1', … (position indices, not real people)
  fields: SignField[];
  pageCount: number;
  signingOrder: SigningOrder;
  signerSlots: Array<{ id: string; role: string; color: string }>;
  reminderFrequency?: ReminderFrequency;
  createdAt?: any;
  usageCount: number;
}

export const saveTemplate = async (
  data: Omit<SignTemplate, 'id' | 'createdAt' | 'usageCount'>,
): Promise<string> => {
  const ref = doc(collection(db, 'sign_templates'));
  await setDoc(ref, { ...data, id: ref.id, usageCount: 0, createdAt: serverTimestamp() });
  return ref.id;
};

export const getOwnerTemplates = async (ownerId: string): Promise<SignTemplate[]> => {
  const q = query(collection(db, 'sign_templates'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as SignTemplate))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
  await deleteDoc(doc(db, 'sign_templates', templateId));
};

export const incrementTemplateUsage = async (templateId: string): Promise<void> => {
  await updateDoc(doc(db, 'sign_templates', templateId), { usageCount: increment(1) });
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
