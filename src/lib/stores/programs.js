import { derived, get, writable } from 'svelte/store';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { programs as builtIn } from '$lib/data/programs';

/**
 * Program buatan pengguna, tersimpan di users/{uid}/programs.
 * Bentuknya sengaja sama persis dengan program bawaan supaya seluruh aplikasi
 * — jadwal harian, ekspor kalender, riwayat — tidak perlu tahu bedanya.
 */
export const customPrograms = writable([]);

/** Program bawaan dan buatan sendiri dalam satu daftar. */
export const allPrograms = derived(customPrograms, ($custom) => [...builtIn, ...$custom]);

/**
 * Pencarian program yang reaktif, untuk dipakai di komponen.
 * `resolveProgram` di bawah memakai `get()` sehingga tidak ikut berubah saat
 * program buatan sendiri baru selesai dimuat — pakai store ini di markup.
 */
export const programMap = derived(allPrograms, ($all) => new Map($all.map((p) => [p.id, p])));

const rest = { title: 'Istirahat', focus: 'Pemulihan', minutes: 0, exercises: [] };

let unsub = null;
let uid = null;

export function startProgramSync(nextUid) {
  if (!db || uid === nextUid) return;
  stopProgramSync();
  uid = nextUid;
  unsub = onSnapshot(collection(db, 'users', uid, 'programs'), (snap) => {
    customPrograms.set(
      snap.docs
        .map((d) => ({ ...d.data(), id: d.id, custom: true }))
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'id'))
    );
  });
}

export function stopProgramSync() {
  unsub?.();
  unsub = null;
  uid = null;
  customPrograms.set([]);
}

/** Cari program berdasarkan id, bawaan maupun buatan sendiri. */
export function resolveProgram(id) {
  if (!id) return null;
  return get(allPrograms).find((p) => p.id === id) ?? null;
}

/** Sesi terjadwal untuk sebuah tanggal, dari program mana pun. */
export function sessionFor(programId, date = new Date()) {
  const program = resolveProgram(programId);
  if (!program) return null;
  return program.schedule?.[date.getDay()] ?? rest;
}

/** Id yang aman dipakai sebagai nama dokumen Firestore. */
export function slugify(name) {
  const base = String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'program';
}

/** Id unik yang belum dipakai program bawaan maupun buatan sendiri. */
export function uniqueProgramId(name, exceptId = null) {
  const taken = new Set(get(allPrograms).map((p) => p.id).filter((id) => id !== exceptId));
  const base = slugify(name);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function saveCustomProgram(program) {
  if (!uid || !db) return null;
  const { custom, ...payload } = program;
  await setDoc(doc(db, 'users', uid, 'programs', program.id), {
    ...payload,
    updatedAt: Date.now()
  });
  return program.id;
}

export async function deleteCustomProgram(id) {
  if (!uid || !db) return;
  await deleteDoc(doc(db, 'users', uid, 'programs', id));
}

/** Kerangka program kosong untuk penyusun. */
export function blankProgram() {
  return {
    id: '',
    name: '',
    level: 'Menengah',
    weeks: 8,
    daysPerWeek: 0,
    place: 'Gym',
    goal: '',
    summary: '',
    schedule: {},
    custom: true
  };
}

/** Salin program bawaan sebagai titik awal program sendiri. */
export function cloneProgram(source, name) {
  return {
    ...structuredClone({ ...source, custom: true }),
    id: uniqueProgramId(name),
    name
  };
}
