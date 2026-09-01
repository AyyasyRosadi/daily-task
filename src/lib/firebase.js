import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from '$env/dynamic/public';

const config = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY,
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.PUBLIC_FIREBASE_APP_ID
};

/** True kalau semua kunci Firebase sudah diisi di environment. */
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

const app = firebaseReady ? (getApps()[0] ?? initializeApp(config)) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
