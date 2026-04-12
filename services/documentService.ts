import {
  collection, addDoc, getDoc, getDocs, doc, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, DEMO_MODE } from '../config/firebase';
import { getCurrentUser } from './authService';
import { UserDocument, ToolCategory } from '../types';

// ── Persistence Layer for Demo Mode (LocalStorage) ───────────────────────────
const DEMO_DOC_KEY = 'pdfa2z_demo_documents';

function getDemoDocs(): UserDocument[] {
  const stored = localStorage.getItem(DEMO_DOC_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveDemoDoc(doc: UserDocument) {
  const docs = getDemoDocs();
  docs.unshift(doc);
  localStorage.setItem(DEMO_DOC_KEY, JSON.stringify(docs));
}

// ── Generic Document Service ────────────────────────────────────────────────

export async function uploadToLibrary(
  file: File | Blob,
  fileName: string,
  category: ToolCategory,
  metadata?: Record<string, any>
): Promise<UserDocument> {
  const user = getCurrentUser();
  const userId = user?.uid || 'anonymous';

  if (DEMO_MODE) {
    // Simulation: Create a localized entry
    const newDoc: UserDocument = {
      id: `demo-${Date.now()}`,
      userId: userId,
      fileName,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      category,
      downloadUrl: file instanceof File ? URL.createObjectURL(file) : '', // Real URL in non-blob cases
      storagePath: `demo/${userId}/${fileName}`,
      metadata,
      createdAt: Timestamp.now(),
      isDeleted: false,
    };
    saveDemoDoc(newDoc);
    return newDoc;
  }

  if (!user) throw new Error('Sign in required to save to library');

  // Real: upload to Firebase Storage
  const path = `user_docs/${userId}/${Date.now()}-${fileName}`;
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  await new Promise((resolve, reject) => {
    uploadTask.on('state_changed', null, reject, () => resolve(null));
  });

  const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

  // Save metadata to Firestore
  const docRef = await addDoc(collection(db, 'documents'), {
    userId,
    fileName,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    category,
    downloadUrl,
    storagePath: path,
    metadata,
    createdAt: serverTimestamp(),
    isDeleted: false,
  });

  return {
    id: docRef.id,
    userId,
    fileName,
    fileSize: file.size,
    fileType: file.type,
    category,
    downloadUrl,
    storagePath: path,
    metadata,
    createdAt: serverTimestamp(),
    isDeleted: false,
  };
}

export async function getUserDocuments(): Promise<UserDocument[]> {
  const user = getCurrentUser();
  if (DEMO_MODE) return getDemoDocs();
  if (!user) return [];

  const q = query(
    collection(db, 'documents'),
    where('userId', '==', user.uid),
    where('is_deleted', '==', false),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserDocument));
}

export async function deleteDocument(docId: string): Promise<void> {
  if (DEMO_MODE) {
    const docs = getDemoDocs().filter(d => d.id !== docId);
    localStorage.setItem(DEMO_DOC_KEY, JSON.stringify(docs));
    return;
  }
  await updateDoc(doc(db, 'documents', docId), { is_deleted: true });
}
