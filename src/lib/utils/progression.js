import { exercises } from '$lib/data/exercises.js';
import { keyToDate } from '$lib/utils/date';
import { exerciseHistory } from '$lib/utils/workout';

/**
 * Progresi beban dan minggu pemulihan.
 *
 * Semua yang dihasilkan di sini berupa SARAN, bukan perubahan otomatis. Angka
 * yang benar-benar tercatat tetap yang kamu ketik sendiri — badan tidak selalu
 * mengikuti jadwal, dan aplikasi tidak tahu kamu kurang tidur atau sedang sakit.
 */

/** Setiap minggu ke-4 dipakai untuk memulihkan diri sebelum menambah beban lagi. */
export const DELOAD_EVERY = 4;

/** Minggu ke berapa dari program yang sedang berjalan, dimulai dari 1. */
export function programWeek(profile, todayKey) {
  if (!profile?.programStartedAt || !todayKey) return null;
  const start = keyToDate(profile.programStartedAt);
  const now = keyToDate(todayKey);
  const days = Math.floor((now - start) / 86_400_000);
  if (days < 0) return null;
  return Math.floor(days / 7) + 1;
}

/** Minggu pemulihan: beban diturunkan supaya sendi dan saraf sempat pulih. */
export function isDeloadWeek(week) {
  return Boolean(week) && week % DELOAD_EVERY === 0;
}

/** Ringkasan posisi program: minggu ke berapa, sisa berapa, deload atau tidak. */
export function programProgress(profile, program, todayKey) {
  const week = programWeek(profile, todayKey);
  if (!week || !program) return null;
  const total = Number(program.weeks) || 8;
  return {
    week,
    total,
    deload: isDeloadWeek(week),
    finished: week > total,
    percent: Math.min(100, Math.round((week / total) * 100))
  };
}

/**
 * Kenaikan beban sekali langkah. Gerakan bawah tubuh dan barbel besar menambah
 * lebih banyak karena otot yang terlibat lebih besar.
 */
export function loadStep(name) {
  const ex = exercises[name];
  if (!ex) return 2.5;
  if (ex.equipment === 'tubuh' || ex.equipment === 'kardio') return 0;
  const bigLifts = ex.group === 'kaki' || ex.group === 'punggung';
  if (ex.equipment === 'barbel' || ex.equipment === 'mesin') return bigLifts ? 5 : 2.5;
  return bigLifts ? 2.5 : 1;
}

/** Repetisi target sebuah gerakan sebagai angka, atau null kalau berbasis waktu. */
function targetReps(task) {
  const n = parseInt(task?.reps, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Saran beban untuk sesi hari ini.
 *
 * naik      — sesi lalu semua set tuntas di repetisi target
 * tahan     — sesi lalu belum tuntas, ulangi beban yang sama
 * turun     — dua sesi berturut-turut gagal, kurangi 10% untuk membangun ulang
 * pemulihan — sedang minggu deload, pakai sekitar 60% beban biasa
 */
export function suggestLoad(logs, task, todayKey, { deload = false } = {}) {
  const step = loadStep(task.name);
  if (step === 0) return null;

  const history = exerciseHistory(logs, task.name).filter((r) => r.date < todayKey);
  if (!history.length) return null;

  const last = history.at(-1);
  if (!last.topKg) return null;

  if (deload) {
    return {
      kg: roundToStep(last.topKg * 0.6, step),
      status: 'pemulihan',
      reason: 'Minggu pemulihan. Turunkan beban dan selesaikan set dengan mudah.'
    };
  }

  const target = targetReps(task);
  const cleared = (row) => {
    if (row.setCount < task.sets) return false;
    if (target === null) return true;
    return row.sets.every((s) => Number(s.reps) >= target);
  };

  if (cleared(last)) {
    return {
      kg: roundToStep(last.topKg + step, step),
      status: 'naik',
      reason: `Sesi lalu tuntas di ${trim(last.topKg)} kg. Naik ${trim(step)} kg.`
    };
  }

  const prev = history.at(-2);
  if (prev && !cleared(prev)) {
    return {
      kg: roundToStep(last.topKg * 0.9, step),
      status: 'turun',
      reason: 'Dua sesi belum tuntas. Kurangi beban lalu bangun lagi dari sana.'
    };
  }

  return {
    kg: roundToStep(last.topKg, step),
    status: 'tahan',
    reason: `Ulangi ${trim(last.topKg)} kg sampai semua set tuntas.`
  };
}

/** Bulatkan ke kelipatan terdekat yang benar-benar ada platnya di gym. */
function roundToStep(kg, step) {
  const grain = step >= 5 ? 2.5 : 1.25;
  return Math.max(grain, Math.round(kg / grain) * grain);
}

function trim(n) {
  return String(Number(Number(n).toFixed(2)));
}
