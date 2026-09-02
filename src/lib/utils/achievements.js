import { exerciseNames, logVolume, personalRecord } from '$lib/utils/workout';

/**
 * Lencana pencapaian.
 *
 * Semuanya dihitung ulang dari data yang sudah ada, tidak disimpan terpisah.
 * Artinya lencana tidak pernah bisa basi atau salah, dan menghapus catatan
 * lama otomatis menarik kembali lencananya.
 */

const streakBadges = [
  { id: 'streak-7', label: 'Seminggu penuh', need: 7, icon: '🔥' },
  { id: 'streak-30', label: 'Sebulan beruntun', need: 30, icon: '🔥' },
  { id: 'streak-100', label: '100 hari beruntun', need: 100, icon: '🔥' }
];

const sessionBadges = [
  { id: 'sesi-10', label: '10 sesi', need: 10, icon: '🏋️' },
  { id: 'sesi-50', label: '50 sesi', need: 50, icon: '🏋️' },
  { id: 'sesi-100', label: '100 sesi', need: 100, icon: '🏋️' },
  { id: 'sesi-250', label: '250 sesi', need: 250, icon: '🏋️' }
];

const volumeBadges = [
  { id: 'ton-10', label: '10 ton terangkat', need: 10_000, icon: '⚙️' },
  { id: 'ton-100', label: '100 ton terangkat', need: 100_000, icon: '⚙️' },
  { id: 'ton-500', label: '500 ton terangkat', need: 500_000, icon: '⚙️' }
];

const varietyBadges = [
  { id: 'variasi-5', label: '5 gerakan tercatat', need: 5, icon: '🎯' },
  { id: 'variasi-15', label: '15 gerakan tercatat', need: 15, icon: '🎯' }
];

function tier(badges, value) {
  return badges.map((b) => ({
    ...b,
    value,
    earned: value >= b.need,
    percent: Math.min(100, Math.round((value / b.need) * 100))
  }));
}

/**
 * Seluruh lencana beserta status dan kemajuannya.
 * `logs` sebaiknya berisi semua log yang tersedia di klien.
 */
export function achievements(logs, profile) {
  const completed = (logs ?? []).filter((l) => l.completed && !l.isRest);
  const totalVolume = (logs ?? []).reduce((sum, l) => sum + logVolume(l), 0);
  const variety = exerciseNames(logs).length;
  const bestStreak = Number(profile?.bestStreak) || 0;

  return [
    ...tier(streakBadges, bestStreak),
    ...tier(sessionBadges, completed.length),
    ...tier(volumeBadges, totalVolume),
    ...tier(varietyBadges, variety)
  ];
}

/** Lencana yang sudah diraih, terbaru lebih dulu dalam urutan tingkat. */
export function earned(logs, profile) {
  return achievements(logs, profile).filter((b) => b.earned);
}

/** Lencana berikutnya yang paling dekat diraih, untuk ditampilkan sebagai target. */
export function nextTarget(logs, profile) {
  const pending = achievements(logs, profile).filter((b) => !b.earned);
  if (!pending.length) return null;
  return pending.reduce((closest, b) => (b.percent > closest.percent ? b : closest));
}

/**
 * Rekor pribadi tiap gerakan, diurutkan dari yang terberat.
 * Dipakai sebagai papan rekor di halaman Progres.
 */
export function recordBoard(logs) {
  return exerciseNames(logs)
    .map((name) => ({ name, ...personalRecord(logs, name) }))
    .filter((r) => r.topKg > 0)
    .sort((a, b) => b.topKg - a.topKg);
}
