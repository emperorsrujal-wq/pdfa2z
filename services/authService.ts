// Auth service — wraps Firebase Auth for the notarization module only.
// No other tools use this.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, DEMO_MODE } from '../config/firebase';

// Mock user for demo mode
const DEMO_USER: User = {
  uid: 'demo-user-123',
  email: 'demo@pdfa2z.com',
  displayName: 'Demo User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
} as any;

let _demoLoggedIn = false;
const _demoListeners: ((user: User | null) => void)[] = [];

const _notifyDemoListeners = () => {
  const u = _demoLoggedIn ? DEMO_USER : null;
  _demoListeners.forEach(cb => cb(u));
};

export interface UserProfile {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  state_residence: string;
  user_type: 'individual' | 'business' | 'lawyer';
  created_at?: any;
}

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  state: string
): Promise<User> {
  // Manual demo trigger for "Enter as Demo User" button
  if (email === 'demo@pdfa2z.com' && password === 'demo') {
    _demoLoggedIn = true;
    _notifyDemoListeners();
    return DEMO_USER;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });

    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      first_name: firstName,
      last_name: lastName,
      state_residence: state,
      user_type: 'individual',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    return cred.user;
  } catch (err: any) {
    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key') {
      console.warn('Firebase Auth unconfigured. Falling back to Demo Mode.');
      _demoLoggedIn = true;
      _notifyDemoListeners();
      return DEMO_USER;
    }
    throw err;
  }
}

// ── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<User> {
  // Manual demo trigger
  if (email === 'demo@pdfa2z.com' && password === 'demo') {
    _demoLoggedIn = true;
    _notifyDemoListeners();
    return DEMO_USER;
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (err: any) {
    // If auth is unconfigured in Firebase Console, fallback to Demo Mode for testing
    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key') {
      console.warn('Firebase Auth unconfigured. Falling back to Demo Mode.');
      _demoLoggedIn = true;
      _notifyDemoListeners();
      return DEMO_USER;
    }
    throw err;
  }
}

// ── Google Sign In ────────────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);

  // Ensure user doc exists
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) {
    const names = (cred.user.displayName || '').split(' ');
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email,
      first_name: names[0] || '',
      last_name: names.slice(1).join(' ') || '',
      state_residence: '',
      user_type: 'individual',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  return cred.user;
}

// ── Apple Sign In ─────────────────────────────────────────────────────────────
export async function signInWithApple(): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  const cred = await signInWithPopup(auth, provider);

  // Ensure user doc exists
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) {
    const names = (cred.user.displayName || '').split(' ');
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email,
      first_name: names[0] || 'Apple',
      last_name: names.slice(1).join(' ') || 'User',
      state_residence: '',
      user_type: 'individual',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  return cred.user;
}

// ── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  if (DEMO_MODE) {
    _demoLoggedIn = false;
    _notifyDemoListeners();
    return;
  }
  return fbSignOut(auth);
}

// ── Auth State Listener ───────────────────────────────────────────────────────
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  // Always listen to demo state changes for fallback support
  _demoListeners.push(callback);
  
  // Also initialize with current demo state if mode matches
  if (_demoLoggedIn) callback(DEMO_USER);

  // Also listen to real Firebase state changes
  const fbUnsubscribe = fbOnAuthStateChanged(auth, (u) => {
    // If we have a real user, it takes precedence. 
    // If not, we still might have a demo user from the fallback.
    if (u) {
      callback(u);
    } else {
      callback(_demoLoggedIn ? DEMO_USER : null);
    }
  });
  
  return () => {
    const idx = _demoListeners.indexOf(callback);
    if (idx > -1) _demoListeners.splice(idx, 1);
    fbUnsubscribe();
  };
}

// ── Get current user ────────────────────────────────────────────────────────
export function getCurrentUser(): User | null {
  if (_demoLoggedIn) return DEMO_USER;
  return auth.currentUser;
}

// ── Reset Password ──────────────────────────────────────────────────────────
export async function resetPassword(email: string): Promise<void> {
  if (DEMO_MODE) return;
  return sendPasswordResetEmail(auth, email);
}

// ── Get Auth Token ───────────────────────────────────────────────────────────
export async function getAuthToken(): Promise<string> {
  if (DEMO_MODE) return 'demo-token';
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}
