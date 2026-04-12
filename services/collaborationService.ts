import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  Timestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { EditElement } from '../utils/pdfHelpers';

export interface CollaborationState {
  elements: EditElement[];
  activeUsers: string[];
  lastUpdated: Timestamp;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  x: number;
  y: number;
  pageIndex: number;
  createdAt: Timestamp;
}

/**
 * Syncs document state with Firestore for real-time collaboration.
 */
export const syncDocumentState = (
  docId: string, 
  onUpdate: (state: CollaborationState) => void
) => {
  const docRef = doc(db, 'collaboration', docId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as CollaborationState);
    }
  });
};

/**
 * Updates the shared document state.
 */
export const updateSharedState = async (docId: string, elements: EditElement[]) => {
  const docRef = doc(db, 'collaboration', docId);
  await setDoc(docRef, {
    elements,
    lastUpdated: Timestamp.now(),
    activeUsers: arrayUnion(auth.currentUser?.email || 'Guest')
  }, { merge: true });
};

/**
 * Adds a comment to the shared document.
 */
export const addComment = async (docId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'userId' | 'userName'>) => {
  const commentId = `comment-${Date.now()}`;
  const docRef = doc(db, 'collaboration', docId, 'comments', commentId);
  
  await setDoc(docRef, {
    ...comment,
    id: commentId,
    userId: auth.currentUser?.uid || 'anonymous',
    userName: auth.currentUser?.displayName || 'Anonymous User',
    createdAt: Timestamp.now()
  });
};

/**
 * Listen for comments on a document.
 */
export const listenForComments = (
  docId: string,
  onUpdate: (comments: Comment[]) => void
) => {
  const q = query(
    collection(db, 'collaboration', docId, 'comments'),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (querySnap) => {
    const comments: Comment[] = [];
    querySnap.forEach((doc) => {
      comments.push(doc.data() as Comment);
    });
    onUpdate(comments);
  });
};
