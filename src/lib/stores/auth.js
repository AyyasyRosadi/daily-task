import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail
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

/** Kirim tautan atur ulang kata sandi ke email. */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Firebase menolak perubahan sensitif kalau sesi login sudah lama.
 * Semua fungsi di bawah karena itu meminta kata sandi saat ini lebih dulu.
 */
async function reauthenticate(password) {
  const current = auth.currentUser;
  if (!current?.email) throw new Error('Belum masuk.');
  const credential = EmailAuthProvider.credential(current.email, password);
  await reauthenticateWithCredential(current, credential);
  return current;
}

export async function changePassword(currentPassword, nextPassword) {
  const current = await reauthenticate(currentPassword);
  await updatePassword(current, nextPassword);
}

/**
 * Email baru harus diverifikasi dulu lewat tautan yang dikirim ke alamat itu.
 * Alamat lama tetap berlaku sampai tautannya diklik.
 */
export async function changeEmail(currentPassword, nextEmail) {
  const current = await reauthenticate(currentPassword);
  await verifyBeforeUpdateEmail(current, nextEmail);
}

export async function updateDisplayName(name) {
  if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name });
}

/** Hapus akun autentikasi. Data Firestore dihapus terpisah sebelum ini dipanggil. */
export async function deleteAccount(currentPassword) {
  const current = await reauthenticate(currentPassword);
  await deleteUser(current);
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
    'auth/operation-not-allowed': 'Metode Email/Password belum diaktifkan di Firebase Console.',
    'auth/requires-recent-login': 'Demi keamanan, masuk ulang dulu sebelum mengubah ini.',
    'auth/missing-email': 'Email belum diisi.',
    'auth/invalid-new-email': 'Format email baru belum benar.'
  };
  return map[code] ?? 'Terjadi kesalahan. Coba lagi sebentar.';
}
