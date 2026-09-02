import { derived, get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import { dateKey, keyToDate, shiftKey } from '$lib/utils/date';
import { tasksFromSession } from '$lib/data/programs';
import { sessionFor, startProgramSync, stopProgramSync } from '$lib/stores/programs';
import { emptySet, setsOf } from '$lib/utils/workout';
import { compactPoints } from '$lib/utils/geo';

export const profile = writable(null);
export const yearLogs = writable([]);
export const weights = writable([]);
export const measurements = writable([]);
export const yearMeals = writable([]);
export const activities = writable([]);
export const syncing = writable(true);
export const dayKey = writable(dateKey());

/**
 * Ukuran tubuh yang dilacak selain berat badan. Timbangan sering diam saat
 * komposisi tubuh sebenarnya berubah, jadi angka-angka ini lebih jujur.
 */
export const measurementFields = [
  { id: 'pinggang', label: 'Pinggang', hint: 'Setinggi pusar, jangan ditahan napas' },
  { id: 'dada', label: 'Dada', hint: 'Bagian terlebar, lengan rileks' },
  { id: 'lengan', label: 'Lengan', hint: 'Bisep terbesar, lengan ditekuk' },
  { id: 'paha', label: 'Paha', hint: 'Bagian terlebar, tepat di bawah bokong' },
  { id: 'pinggul', label: 'Pinggul', hint: 'Bagian bokong terlebar' },
  { id: 'bahu', label: 'Bahu', hint: 'Melingkar di titik bahu terlebar' }
];

/** Log tahun-tahun sebelumnya, dimuat sekali jalan saat halaman Riwayat memintanya. */
export const archiveLogs = writable([]);
const loadedYears = new Set();

/** Semua log yang tersedia di klien: tahun berjalan + arsip yang sudah dimuat. */
export const allLogs = derived([yearLogs, archiveLogs], ([$year, $archive]) => {
  const byId = new Map();
  for (const log of [...$archive, ...$year]) byId.set(log.id, log);
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
});

let uid = null;
let unsubs = [];

export const todayLog = derived([yearLogs, dayKey], ([$logs, $key]) => {
  return $logs.find((l) => l.id === $key) ?? null;
});

/** Streak dianggap putus kalau hari terakhir bukan hari ini atau kemarin. */
export const streak = derived([profile, dayKey], ([$p, $key]) => {
  if (!$p?.lastDoneDate) return 0;
  if ($p.lastDoneDate === $key || $p.lastDoneDate === shiftKey($key, -1)) return $p.streak ?? 0;
  return 0;
});

function defaultProfile() {
  return {
    createdAt: Date.now(),
    name: '',
    activeProgram: null,
    programStartedAt: null,
    goal: 'maintain',
    activity: 'moderate',
    sex: 'laki-laki',
    age: null,
    height: null,
    weight: null,
    streak: 0,
    bestStreak: 0,
    lastDoneDate: null,
    reminderEnabled: false,
    reminderTime: '18:00',
    reminderOnRestDays: false,
    restSeconds: 90,
    theme: 'gelap'
  };
}

export function stopSync() {
  unsubs.forEach((u) => u());
  unsubs = [];
  uid = null;
  profile.set(null);
  yearLogs.set([]);
  weights.set([]);
  measurements.set([]);
  yearMeals.set([]);
  activities.set([]);
  archiveLogs.set([]);
  loadedYears.clear();
  stopProgramSync();
  syncing.set(true);
}

/**
 * Muat log satu tahun penuh sekali jalan. Tahun berjalan sudah ditangani
 * langganan realtime, jadi tidak perlu diambil ulang.
 */
export async function loadYear(year) {
  if (!uid || !db) return;
  if (year === new Date().getFullYear() || loadedYears.has(year)) return;
  loadedYears.add(year);
  try {
    const snap = await getDocs(
      query(
        collection(db, 'users', uid, 'logs'),
        where('date', '>=', `${year}-01-01`),
        where('date', '<=', `${year}-12-31`)
      )
    );
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    archiveLogs.update((prev) => [...prev.filter((l) => !l.id.startsWith(`${year}-`)), ...rows]);
  } catch {
    // Gagal memuat arsip tidak boleh merusak halaman; tahun itu bisa diminta lagi.
    loadedYears.delete(year);
  }
}

export function startSync(nextUid) {
  if (!browser || !db || uid === nextUid) return;
  stopSync();
  uid = nextUid;
  syncing.set(true);
  startProgramSync(uid);

  const userRef = doc(db, 'users', uid);
  unsubs.push(
    onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) {
        await setDoc(userRef, defaultProfile());
        return;
      }
      profile.set({ uid, ...snap.data() });
      syncing.set(false);
    })
  );

  const year = new Date().getFullYear();
  const logsQuery = query(
    collection(db, 'users', uid, 'logs'),
    where('date', '>=', `${year}-01-01`),
    where('date', '<=', `${year}-12-31`)
  );
  unsubs.push(
    onSnapshot(logsQuery, (snap) => {
      yearLogs.set(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })
  );

  unsubs.push(
    onSnapshot(collection(db, 'users', uid, 'weights'), (snap) => {
      weights.set(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.date.localeCompare(b.date)));
    })
  );

  const mealsQuery = query(
    collection(db, 'users', uid, 'meals'),
    where('date', '>=', `${year}-01-01`),
    where('date', '<=', `${year}-12-31`)
  );
  unsubs.push(
    onSnapshot(mealsQuery, (snap) => {
      yearMeals.set(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })
  );

  const activitiesQuery = query(
    collection(db, 'users', uid, 'activities'),
    where('date', '>=', `${year}-01-01`),
    where('date', '<=', `${year}-12-31`)
  );
  unsubs.push(
    onSnapshot(activitiesQuery, (snap) => {
      activities.set(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => b.id.localeCompare(a.id))
      );
    })
  );

  unsubs.push(
    onSnapshot(collection(db, 'users', uid, 'measurements'), (snap) => {
      measurements.set(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.date.localeCompare(b.date))
      );
    })
  );
}

/** Dipanggil saat tab kembali aktif supaya tanggal tidak basi setelah lewat tengah malam. */
export function refreshDay() {
  const now = dateKey();
  if (get(dayKey) !== now) dayKey.set(now);
}

function logRef(key) {
  return doc(db, 'users', uid, 'logs', key);
}

export async function saveProfile(patch) {
  if (!uid) return;
  await updateDoc(doc(db, 'users', uid), patch);
}

function buildLog(key, programId, previous) {
  const session = sessionFor(programId, keyToDate(key));
  return {
    date: key,
    programId,
    title: session?.title ?? 'Istirahat',
    focus: session?.focus ?? 'Pemulihan',
    minutes: session?.minutes ?? 0,
    isRest: !session || session.exercises.length === 0,
    tasks: tasksFromSession(session),
    water: previous?.water ?? 0,
    note: previous?.note ?? '',
    completed: false
  };
}

/** Buat catatan hari ini kalau belum ada. */
export async function ensureLog(key = get(dayKey)) {
  const p = get(profile);
  if (!uid || !p?.activeProgram) return null;
  const existing = get(yearLogs).find((l) => l.id === key);
  if (existing) return existing;
  const payload = buildLog(key, p.activeProgram, null);
  await setDoc(logRef(key), payload);
  return { id: key, ...payload };
}

export async function chooseProgram(programId) {
  if (!uid) return;
  await saveProfile({ activeProgram: programId, programStartedAt: dateKey() });
  const key = get(dayKey);
  const previous = get(yearLogs).find((l) => l.id === key);
  await setDoc(logRef(key), buildLog(key, programId, previous));
}

export async function resetToday() {
  const p = get(profile);
  const key = get(dayKey);
  if (!uid || !p?.activeProgram) return;
  const previous = get(yearLogs).find((l) => l.id === key);
  await setDoc(logRef(key), buildLog(key, p.activeProgram, previous));
}

async function markStreak(key) {
  const p = get(profile);
  if (!p || p.lastDoneDate === key) return;
  const next = p.lastDoneDate === shiftKey(key, -1) ? (p.streak ?? 0) + 1 : 1;
  await saveProfile({
    streak: next,
    bestStreak: Math.max(p.bestStreak ?? 0, next),
    lastDoneDate: key
  });
}

/** Simpan daftar tugas yang sudah diubah, lalu perbarui status selesai sesi. */
async function commitTasks(log, tasks) {
  const completed = tasks.length > 0 && tasks.every((t) => t.done);
  await updateDoc(logRef(log.id), { tasks, completed });
  if (completed) await markStreak(log.id);
}

export async function toggleTask(taskId) {
  const log = get(todayLog);
  if (!log) return;
  const tasks = log.tasks.map((t) => {
    if (t.id !== taskId) return t;
    const next = !t.done;
    // Mencentang seluruh gerakan ikut menandai semua setnya, dan sebaliknya.
    return { ...t, done: next, logs: setsOf(t).map((s) => ({ ...s, done: next })) };
  });
  await commitTasks(log, tasks);
}

/**
 * Catat satu set: beban, repetisi, atau status selesainya.
 * Gerakan dianggap selesai begitu semua setnya ditandai.
 */
export async function logSet(taskId, index, patch) {
  const log = get(todayLog);
  if (!log) return;
  const tasks = log.tasks.map((t) => {
    if (t.id !== taskId) return t;
    const sets = setsOf(t).map((s, i) => (i === index ? { ...s, ...patch } : s));
    return { ...t, logs: sets, done: sets.length > 0 && sets.every((s) => s.done) };
  });
  await commitTasks(log, tasks);
}

/** Tambah satu set di luar target program, untuk sesi yang terasa ringan. */
export async function addSet(taskId) {
  const log = get(todayLog);
  if (!log) return;
  const tasks = log.tasks.map((t) => {
    if (t.id !== taskId) return t;
    const sets = [...setsOf(t), emptySet()];
    return { ...t, logs: sets, done: false };
  });
  await commitTasks(log, tasks);
}

/**
 * Ganti sebuah gerakan dengan gerakan lain di kelompok otot yang sama.
 * Target set dan repetisi dipertahankan; catatan set direset karena bebannya
 * tidak lagi sebanding.
 */
export async function swapExercise(taskId, newName, newGroup) {
  const log = get(todayLog);
  if (!log || !newName) return;
  const tasks = log.tasks.map((t) => {
    if (t.id !== taskId) return t;
    return {
      ...t,
      name: newName,
      group: newGroup ?? t.group,
      done: false,
      logs: setsOf(t).map(() => emptySet()),
      swappedFrom: t.swappedFrom ?? t.name
    };
  });
  await commitTasks(log, tasks);
}

/** Buang set terakhir. Target set bawaan program tidak bisa dikurangi di bawah satu. */
export async function removeSet(taskId) {
  const log = get(todayLog);
  if (!log) return;
  const tasks = log.tasks.map((t) => {
    if (t.id !== taskId) return t;
    const sets = setsOf(t);
    if (sets.length <= 1) return t;
    const next = sets.slice(0, -1);
    return { ...t, logs: next, done: next.every((s) => s.done) };
  });
  await commitTasks(log, tasks);
}

export async function completeRestDay() {
  const log = (await ensureLog()) ?? get(todayLog);
  if (!log) return;
  await updateDoc(logRef(log.id), { completed: true });
  await markStreak(log.id);
}

export async function setWater(glasses) {
  const log = get(todayLog);
  if (!log) return;
  await updateDoc(logRef(log.id), { water: Math.max(0, glasses) });
}

export async function saveNote(note) {
  const log = get(todayLog);
  if (!log) return;
  await updateDoc(logRef(log.id), { note });
}

/** Catatan makan hari ini. */
export const todayMeals = derived([yearMeals, dayKey], ([$meals, $key]) => {
  return $meals.find((m) => m.id === $key)?.items ?? [];
});

/** Total kalori dan makro yang sudah masuk hari ini. */
export const todayNutrition = derived(todayMeals, ($items) =>
  $items.reduce(
    (sum, it) => ({
      calories: sum.calories + (Number(it.kcal) || 0),
      protein: sum.protein + (Number(it.p) || 0),
      carbs: sum.carbs + (Number(it.k) || 0),
      fat: sum.fat + (Number(it.l) || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
);

function mealRef(key) {
  return doc(db, 'users', uid, 'meals', key);
}

/** Tambah satu makanan ke catatan hari ini, dikali jumlah porsi. */
export async function addMeal(food, slot, servings = 1) {
  if (!uid || !food) return;
  const key = get(dayKey);
  const n = Number(servings) || 1;
  const item = {
    name: food.name,
    porsi: food.porsi,
    slot,
    servings: n,
    kcal: Math.round(food.kcal * n),
    p: Math.round(food.p * n * 10) / 10,
    k: Math.round(food.k * n * 10) / 10,
    l: Math.round(food.l * n * 10) / 10,
    at: Date.now()
  };
  await setDoc(mealRef(key), { date: key, items: [...get(todayMeals), item] }, { merge: true });
}

/** Hapus satu catatan makan berdasarkan posisinya. */
export async function removeMeal(index) {
  if (!uid) return;
  const key = get(dayKey);
  const items = get(todayMeals).filter((_, i) => i !== index);
  await setDoc(mealRef(key), { date: key, items }, { merge: true });
}

/**
 * Simpan ukuran tubuh untuk hari ini. Hanya field yang diisi yang ditulis,
 * supaya pengukuran sebagian tidak menghapus angka sebelumnya.
 */
export async function logMeasurement(values) {
  if (!uid) return;
  const key = get(dayKey);
  const payload = { date: key };
  for (const [field, value] of Object.entries(values)) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) payload[field] = num;
  }
  if (Object.keys(payload).length === 1) return;
  await setDoc(doc(db, 'users', uid, 'measurements', key), payload, { merge: true });
}

/** Hapus seluruh data pengguna di Firestore. Dipakai sebelum menghapus akun. */
export async function deleteAllUserData() {
  if (!uid || !db) return;
  for (const sub of ['logs', 'weights', 'measurements', 'meals', 'programs', 'activities']) {
    const snap = await getDocs(collection(db, 'users', uid, sub));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
  await deleteDoc(doc(db, 'users', uid));
}

/**
 * Simpan sesi lari/sepeda.
 *
 * Id dokumen dibentuk dari tanggal dan jam mulai supaya urut sendiri dan dua
 * sesi di hari yang sama tidak saling menimpa. Rute mentah disederhanakan dulu:
 * satu jam perekaman bisa ribuan titik, sementara satu dokumen Firestore
 * dibatasi 1 MiB. Jaraknya sendiri sudah dihitung dari titik mentah, jadi
 * penyederhanaan tidak mengubah angka yang dilihat pengguna.
 */
export async function saveActivity({ type, startedAt, seconds, meters, raw, note = '' }) {
  if (!uid || !db) return null;
  const start = new Date(startedAt ?? Date.now());
  const key = dateKey(start);
  const jam = [start.getHours(), start.getMinutes(), start.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join('');

  const payload = {
    date: key,
    type: type === 'sepeda' ? 'sepeda' : 'lari',
    startedAt: start.getTime(),
    seconds: Math.max(0, Math.round(Number(seconds) || 0)),
    meters: Math.max(0, Math.round(Number(meters) || 0)),
    route: compactPoints(raw ?? []),
    note: String(note ?? '').slice(0, 300)
  };

  await setDoc(doc(db, 'users', uid, 'activities', `${key}-${jam}`), payload);
  // Lari pagi tetap menghitung hari itu sebagai hari aktif, walau tidak ada
  // sesi latihan beban yang terjadwal.
  await markStreak(key);
  return { id: `${key}-${jam}`, ...payload };
}

export async function deleteActivity(id) {
  if (!uid || !db || !id) return;
  await deleteDoc(doc(db, 'users', uid, 'activities', id));
}

export async function logWeight(kg) {
  if (!uid || !kg) return;
  const key = get(dayKey);
  await setDoc(doc(db, 'users', uid, 'weights', key), { date: key, kg: Number(kg) });
  await saveProfile({ weight: Number(kg) });
}
