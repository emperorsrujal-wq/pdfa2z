// Firebase SDK initialization — used ONLY by the notarization module
// All other tools in pdfa2z.com are unaffected by this file.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey:            'AIzaSyBQRLGDtpS6bEyAd8cCuxCRsNiJhc54S7o',
  authDomain:        'gen-lang-client-0072471951.firebaseapp.com',
  projectId:         'gen-lang-client-0072471951',
  storageBucket:     'gen-lang-client-0072471951.firebasestorage.app',
  messagingSenderId: '508597263694',
  appId:             '1:508597263694:web:055a561efb6bbc7989121f',
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

// Forced Enterprise Mode: DEMO_MODE must be false to utilize hardcoded production keys.
export const DEMO_MODE = false;
