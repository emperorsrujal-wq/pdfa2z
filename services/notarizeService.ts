// Notarize service — all frontend calls for the RON (Remote Online Notarization) module.
// Completely isolated from other pdfa2z.com tools.

import {
  collection, addDoc, getDoc, getDocs, doc, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, FUNCTIONS_BASE_URL, DEMO_MODE } from '../config/firebase';
import { getAuthToken, getCurrentUser } from './authService';

// ── Types ────────────────────────────────────────────────────────────────────

export type DocumentType = 'power_of_attorney' | 'affidavit' | 'mortgage' | 'contract' | 'id_document' | 'other';
export type NotaryType   = 'acknowledgment' | 'jurat' | 'witness';
export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface NotarizeDocument {
  id: string;
  file_name: string;
  file_size: number;
  document_type: DocumentType;
  upload_status: 'uploading' | 'ready' | 'error';
  download_url: string;
  created_at: any;
}

export interface NotarizationSession {
  id: string;
  user_id: string;
  document_id: string;
  document_name?: string;
  status: SessionStatus;
  notary_type: NotaryType;
  num_signers: number;
  meeting_link?: string;
  notarized_document_url?: string;
  video_recording_url?: string;
  identity_verified: boolean;
  created_at: any;
  completed_at?: any;
  error_message?: string;
}

export interface Payment {
  id: string;
  session_id: string;
  amount_cents: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  created_at: any;
}

// ── Demo Data ─────────────────────────────────────────────────────────────────

let _demoSessions: NotarizationSession[] = [];
let _demoDocs: NotarizeDocument[] = [];
let _demoSessionListeners: Array<(sessions: NotarizationSession[]) => void> = [];

const notifyDemoListeners = () => {
  _demoSessionListeners.forEach(fn => fn([..._demoSessions]));
};

// ── Helper: Authenticated Fetch ───────────────────────────────────────────────

async function authFetch(path: string, opts: RequestInit = {}): Promise<any> {
  const token = await getAuthToken();
  const res = await fetch(`${FUNCTIONS_BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

// ── Upload Document ───────────────────────────────────────────────────────────

export async function uploadDocument(
  file: File,
  documentType: DocumentType,
  onProgress?: (pct: number) => void
): Promise<NotarizeDocument> {
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  if (DEMO_MODE) {
    // Simulate upload with progress
    for (let p = 0; p <= 100; p += 20) {
      onProgress?.(p);
      await new Promise(r => setTimeout(r, 150));
    }
    const doc: NotarizeDocument = {
      id: `demo-doc-${Date.now()}`,
      file_name: file.name,
      file_size: file.size,
      document_type: documentType,
      upload_status: 'ready',
      download_url: URL.createObjectURL(file),
      created_at: Timestamp.now(),
    };
    _demoDocs.push(doc);
    return doc;
  }

  // Real: upload to Firebase Storage first
  const filePath = `uploads/${user.uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  await new Promise<void>((resolve, reject) => {
    uploadTask.on('state_changed',
      snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      resolve
    );
  });

  const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

  // Save metadata to Firestore
  const docRef = await addDoc(collection(db, 'documents'), {
    user_id: user.uid,
    file_name: file.name,
    file_size: file.size,
    storage_path: filePath,
    download_url: downloadUrl,
    mime_type: file.type,
    upload_status: 'ready',
    document_type: documentType,
    created_at: serverTimestamp(),
    is_deleted: false,
  });

  return {
    id: docRef.id,
    file_name: file.name,
    file_size: file.size,
    document_type: documentType,
    upload_status: 'ready',
    download_url: downloadUrl,
    created_at: serverTimestamp(),
  };
}

// ── Create Notarization Session ───────────────────────────────────────────────

export async function createSession(params: {
  document: NotarizeDocument;
  notaryType: NotaryType;
  numSigners: number;
  contactEmail: string;
  contactPhone: string;
}): Promise<NotarizationSession> {
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  if (DEMO_MODE) {
    const session: NotarizationSession = {
      id: `demo-sess-${Date.now()}`,
      user_id: user.uid,
      document_id: params.document.id,
      document_name: params.document.file_name,
      status: 'pending',
      notary_type: params.notaryType,
      num_signers: params.numSigners,
      identity_verified: false,
      created_at: Timestamp.now(),
      meeting_link: `https://meet.onenotary.com/demo-session-${Date.now()}`,
    };
    _demoSessions.push(session);
    notifyDemoListeners();

    // Simulate 30s notarization completion
    setTimeout(() => {
      const s = _demoSessions.find(s => s.id === session.id);
      if (s) {
        s.status = 'in_progress';
        notifyDemoListeners();
        setTimeout(() => {
          if (s) {
            s.status = 'completed';
            s.identity_verified = true;
            s.notarized_document_url = params.document.download_url;
            s.completed_at = Timestamp.now();
            notifyDemoListeners();
          }
        }, 20000);
      }
    }, 10000);

    return session;
  }

  // Real: call Firebase Function
  const data = await authFetch('/sessions/create', {
    method: 'POST',
    body: JSON.stringify({
      document_id: params.document.id,
      document_download_url: params.document.download_url,
      notary_type: params.notaryType,
      num_signers: params.numSigners,
      contact_email: params.contactEmail,
      contact_phone: params.contactPhone,
    }),
  });

  return {
    id: data.session_id,
    user_id: user.uid,
    document_id: params.document.id,
    document_name: params.document.file_name,
    status: 'pending',
    notary_type: params.notaryType,
    num_signers: params.numSigners,
    identity_verified: false,
    meeting_link: data.meeting_link,
    created_at: Timestamp.now(),
  };
}

// ── Get Session (one-shot) ────────────────────────────────────────────────────

export async function getSession(sessionId: string): Promise<NotarizationSession | null> {
  if (DEMO_MODE) {
    return _demoSessions.find(s => s.id === sessionId) || null;
  }
  const snap = await getDoc(doc(db, 'notarization_sessions', sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as NotarizationSession;
}

// ── Subscribe to Session Updates (real-time) ──────────────────────────────────

export function subscribeToSession(sessionId: string, callback: (s: NotarizationSession | null) => void): () => void {
  if (DEMO_MODE) {
    const handler = (sessions: NotarizationSession[]) => {
      callback(sessions.find(s => s.id === sessionId) || null);
    };
    _demoSessionListeners.push(handler);
    handler(_demoSessions);
    return () => {
      _demoSessionListeners = _demoSessionListeners.filter(f => f !== handler);
    };
  }
  return onSnapshot(doc(db, 'notarization_sessions', sessionId), snap => {
    if (!snap.exists()) { callback(null); return; }
    callback({ id: snap.id, ...snap.data() } as NotarizationSession);
  });
}

// ── Subscribe to User's Sessions (all) ───────────────────────────────────────

export function subscribeToUserSessions(callback: (sessions: NotarizationSession[]) => void): () => void {
  const user = getCurrentUser();
  if (!user) { callback([]); return () => {}; }

  if (DEMO_MODE) {
    _demoSessionListeners.push(callback);
    callback([..._demoSessions]);
    return () => {
      _demoSessionListeners = _demoSessionListeners.filter(f => f !== callback);
    };
  }

  const q = query(
    collection(db, 'notarization_sessions'),
    where('user_id', '==', user.uid),
    orderBy('created_at', 'desc')
  );

  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotarizationSession)));
  });
}

// ── Cancel Session ────────────────────────────────────────────────────────────

export async function cancelSession(sessionId: string): Promise<void> {
  if (DEMO_MODE) {
    const s = _demoSessions.find(s => s.id === sessionId);
    if (s) { s.status = 'cancelled'; notifyDemoListeners(); }
    return;
  }
  await authFetch(`/sessions/${sessionId}/cancel`, { method: 'POST' });
}

// ── Create Payment Intent ─────────────────────────────────────────────────────

export async function createPaymentIntent(sessionId: string): Promise<{ clientSecret: string; amount: number }> {
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 800)); // simulate network
    return { clientSecret: 'demo_secret_' + Date.now(), amount: 4500 };
  }
  const data = await authFetch('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ notarization_session_id: sessionId }),
  });
  return { clientSecret: data.client_secret, amount: data.amount };
}

// ── Get User Documents ────────────────────────────────────────────────────────

export async function getUserDocuments(): Promise<NotarizeDocument[]> {
  const user = getCurrentUser();
  if (!user) return [];

  if (DEMO_MODE) return _demoDocs;

  const q = query(
    collection(db, 'documents'),
    where('user_id', '==', user.uid),
    where('is_deleted', '==', false),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotarizeDocument));
}

// ── Format helpers ────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  power_of_attorney: 'Power of Attorney',
  affidavit: 'Affidavit',
  mortgage: 'Mortgage Document',
  contract: 'Contract / Agreement',
  id_document: 'ID Document',
  other: 'Other',
};

export const STATUS_LABELS: Record<SessionStatus, string> = {
  pending: 'Awaiting Payment',
  in_progress: 'Notarization In Progress',
  completed: 'Notarized ✓',
  failed: 'Failed',
  cancelled: 'Cancelled',
};
