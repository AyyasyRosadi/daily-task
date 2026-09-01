import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { browser } from '$app/environment';
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

/**
 * Cache lokal permanen supaya data latihan tetap terbaca dan bisa ditulis saat
 * offline; Firestore menyinkronkan sendiri begitu koneksi kembali. Gym sering
 * berada di basement tanpa sinyal, jadi ini bukan kemewahan.
 */
function createDb() {
  if (!app) return null;
  if (!browser) return getFirestore(app);
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch {
    // Mode privat atau browser tanpa IndexedDB: jalan tanpa cache permanen.
    return getFirestore(app);
  }
}

export const db = createDb();
