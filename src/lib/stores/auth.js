import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, firebaseReady } from '$lib/firebase';

/** null = belum masuk, object = sudah masuk */
export const user = writable(null);
export const authReady = writable(false);

if (browser) {
  if (firebaseReady) {
    onAuthStateChanged(auth, (u) => {
      user.set(u);
      authReady.set(true);
    });
  } else {
    authReady.set(true);
  }
}

export async function register(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

/** Pesan error Firebase dalam bahasa Indonesia. */
export function authError(code) {
  const map = {
    'auth/invalid-email': 'Format email belum benar.',
    'auth/missing-password': 'Kata sandi belum diisi.',
    'auth/weak-password': 'Kata sandi minimal 6 karakter.',
    'auth/email-already-in-use': 'Email ini sudah terdaftar. Coba masuk saja.',
    'auth/invalid-credential': 'Email atau kata sandi tidak cocok.',
    'auth/user-not-found': 'Akun dengan email ini belum ada.',
    'auth/wrong-password': 'Kata sandi salah.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
    'auth/network-request-failed': 'Koneksi terputus. Cek jaringan lalu ulangi.',
    'auth/operation-not-allowed': 'Metode Email/Password belum diaktifkan di Firebase Console.'
  };
  return map[code] ?? 'Terjadi kesalahan. Coba lagi sebentar.';
}
