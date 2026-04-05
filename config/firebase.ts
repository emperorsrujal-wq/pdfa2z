// Firebase SDK initialization — used ONLY by the notarization module
// All other tools in pdfa2z.com are unaffected by this file.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'demo-api-key',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'pdf-tools-6c9d2.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'pdf-tools-6c9d2',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'pdf-tools-6c9d2.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
};

// Prevent duplicate initialization in dev hot-reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const storage  = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

export const FUNCTIONS_BASE_URL =
  import.meta.env.VITE_FUNCTIONS_URL ||
  `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/api`;

// Demo mode: active when no real Firebase API key is provided
export const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY;
