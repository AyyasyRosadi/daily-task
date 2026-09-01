import { derived, get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { dateKey, keyToDate, shiftKey } from '$lib/utils/date';
import { sessionForDate, tasksFromSession } from '$lib/data/programs';

export const profile = writable(null);
export const yearLogs = writable([]);
export const weights = writable([]);
export const syncing = writable(true);
export const dayKey = writable(dateKey());

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
    reminderOnRestDays: false
  };
}

export function stopSync() {
  unsubs.forEach((u) => u());
  unsubs = [];
  uid = null;
  profile.set(null);
  yearLogs.set([]);
  weights.set([]);
  syncing.set(true);
}

export function startSync(nextUid) {
  if (!browser || !db || uid === nextUid) return;
  stopSync();
  uid = nextUid;
  syncing.set(true);

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
  const session = sessionForDate(programId, keyToDate(key));
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

export async function toggleTask(taskId) {
  const log = get(todayLog);
  if (!log) return;
  const tasks = log.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
  const completed = tasks.length > 0 && tasks.every((t) => t.done);
  await updateDoc(logRef(log.id), { tasks, completed });
  if (completed) await markStreak(log.id);
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

export async function logWeight(kg) {
  if (!uid || !kg) return;
  const key = get(dayKey);
  await setDoc(doc(db, 'users', uid, 'weights', key), { date: key, kg: Number(kg) });
  await saveProfile({ weight: Number(kg) });
}
