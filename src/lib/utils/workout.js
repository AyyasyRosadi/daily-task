/**
 * Catatan set aktual: beban dan repetisi yang benar-benar diangkat.
 *
 * Log lama hanya punya `done` per gerakan tanpa rincian set. Semua fungsi di sini
 * menoleransi bentuk lama supaya data yang sudah terkumpul tidak perlu dimigrasi.
 */

/** Satu set kosong. */
export function emptySet() {
  return { kg: null, reps: null, done: false };
}

/**
 * Daftar set sebuah gerakan, selalu sepanjang target set-nya.
 * Log lama tanpa `logs` dianggap punya set kosong sebanyak targetnya.
 */
export function setsOf(task) {
  const target = Math.max(1, Number(task?.sets) || 1);
  const stored = Array.isArray(task?.logs) ? task.logs : [];
  const length = Math.max(target, stored.length);
  return Array.from({ length }, (_, i) => ({
    kg: stored[i]?.kg ?? null,
    reps: stored[i]?.reps ?? null,
    done: Boolean(stored[i]?.done)
  }));
}

/** Set dianggap terisi kalau sudah ditandai selesai. */
export function doneSets(task) {
  return setsOf(task).filter((s) => s.done);
}

/** Perkiraan 1RM dengan rumus Epley. Tanpa beban atau repetisi, hasilnya null. */
export function epley1RM(kg, reps) {
  const w = Number(kg);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return null;
  if (r === 1) return w;
  return w * (1 + r / 30);
}

/** Volume satu gerakan: total beban x repetisi dari set yang selesai. */
export function taskVolume(task) {
  return doneSets(task).reduce((sum, s) => {
    const kg = Number(s.kg) || 0;
    const reps = Number(s.reps) || 0;
    return sum + kg * reps;
  }, 0);
}

/** Volume seluruh sesi. */
export function logVolume(log) {
  return (log?.tasks ?? []).reduce((sum, t) => sum + taskVolume(t), 0);
}

/** Set terberat sebuah gerakan. */
export function topSet(task) {
  return doneSets(task).reduce((best, s) => {
    const kg = Number(s.kg);
    if (!Number.isFinite(kg) || kg <= 0) return best;
    return !best || kg > Number(best.kg) ? s : best;
  }, null);
}

/** Apakah gerakan ini punya minimal satu set dengan beban tercatat. */
export function hasLoad(task) {
  return doneSets(task).some((s) => Number(s.kg) > 0);
}

/** Nama gerakan unik yang pernah dicatat dengan beban, diurutkan sesuai abjad. */
export function exerciseNames(logs) {
  const names = new Set();
  for (const log of logs ?? []) {
    for (const task of log.tasks ?? []) {
      if (hasLoad(task)) names.add(task.name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'id'));
}

/**
 * Riwayat satu gerakan lintas sesi, urut dari tanggal terlama.
 * Hanya sesi yang punya beban tercatat yang ikut.
 */
export function exerciseHistory(logs, name) {
  const rows = [];
  for (const log of logs ?? []) {
    const task = (log.tasks ?? []).find((t) => t.name === name);
    if (!task || !hasLoad(task)) continue;
    const sets = doneSets(task).filter((s) => Number(s.kg) > 0);
    const best = topSet(task);
    rows.push({
      date: log.id,
      sets,
      setCount: sets.length,
      totalReps: sets.reduce((n, s) => n + (Number(s.reps) || 0), 0),
      topKg: Number(best?.kg) || 0,
      volume: taskVolume(task),
      est1RM: epley1RM(best?.kg, best?.reps)
    });
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Penampilan terakhir sebuah gerakan sebelum tanggal tertentu.
 * Dipakai untuk menampilkan pembanding "sesi lalu" saat mencatat set.
 */
export function lastPerformance(logs, name, beforeKey) {
  const history = exerciseHistory(logs, name).filter((row) => row.date < beforeKey);
  return history.length ? history[history.length - 1] : null;
}

/** Rekor beban terberat sepanjang catatan untuk sebuah gerakan. */
export function personalRecord(logs, name) {
  return exerciseHistory(logs, name).reduce((best, row) => {
    return !best || row.topKg > best.topKg ? row : best;
  }, null);
}

/** Angka dirapikan: buang nol di belakang koma supaya 60.0 tampil sebagai 60. */
export function trimNumber(value, digits = 1) {
  // Number(null) dan Number('') sama-sama 0, jadi keduanya harus ditolak lebih
  // dulu — kalau tidak, nilai kosong tampil sebagai "0" di layar.
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return String(Number(n.toFixed(digits)));
}
