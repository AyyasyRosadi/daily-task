/**
 * Urutan tips harian.
 *
 * Dua hal yang harus benar sekaligus:
 *
 * - Urutannya berubah tiap hari, tapi **tetap sama sepanjang hari itu**. Kalau
 *   dipakai `Math.random()`, urutannya berubah tiap kali komponen dirender ulang
 *   — tips yang sedang dibaca bisa melompat pergi saat halaman digambar ulang.
 *   Karena itu pengacakannya memakai benih dari tanggal, bukan acak sungguhan.
 * - Tips yang berhubungan dengan program yang sedang dijalani naik ke atas,
 *   tanpa membuang tips lainnya dari daftar.
 */

/** Benih angka dari kunci tanggal YYYY-MM-DD. */
export function seedFromKey(key) {
  const digits = String(key ?? '').replace(/\D/g, '');
  // Tanggal berurutan menghasilkan benih berurutan; pengali besar di bawah yang
  // memastikan urutan dua hari bertetangga tetap terlihat berbeda jauh.
  return Number(digits) || 1;
}

/** PRNG kecil dan deterministik (mulberry32). */
function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates dengan benih tetap. Daftar aslinya tidak diubah. */
export function shuffleWithSeed(list, seed) {
  const out = [...(list ?? [])];
  const next = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Seberapa nyambung sebuah tips dengan program yang dipakai sekarang.
 *
 * Nol berarti tips umum — bukan berarti tidak berguna, hanya tidak khusus.
 * Program buatan sendiri tetap dapat skor lewat tingkat dan tempatnya, karena
 * bentuk datanya sama persis dengan program bawaan.
 */
export function scoreTip(tip, program) {
  if (!program) return 0;
  let score = 0;
  if (tip.programs?.includes(program.id)) score += 4;
  if (tip.levels?.includes(program.level)) score += 2;
  if (tip.places?.includes(program.place)) score += 1;
  // Program padat menuntut hal yang berbeda dari program tiga hari seminggu.
  if (tip.minDays && Number(program.daysPerWeek) >= tip.minDays) score += 1;
  return score;
}

/**
 * Skor diringkas jadi tiga tingkat sebelum diurutkan.
 *
 * Ini bukan penyederhanaan yang tidak perlu. Kalau diurutkan langsung dengan
 * skor mentah, satu tips dengan skor tertinggi akan menang tiap hari, dan
 * pengguna program yang sama melihat "tips hari ini" yang persis sama selamanya.
 * Dengan tiga tingkat, banyak tips berbagi tingkat yang sama, sehingga
 * pengacakan harian benar-benar menentukan siapa yang muncul di atas.
 */
function tier(score) {
  if (score >= 2) return 2; // menyebut program ini atau tingkatannya
  if (score >= 1) return 1; // cocok tempat latihannya atau padatnya jadwal
  return 0; // berlaku untuk siapa saja
}

/**
 * Daftar tips untuk satu hari: yang nyambung dengan program di atas, sisanya
 * di bawah, dan urutan di dalam tiap tingkat diacak dengan benih tanggal.
 *
 * Pengacakan dilakukan lebih dulu, baru diurutkan. Urutan ini penting: `sort`
 * di JavaScript stabil, jadi hasil acak tadi bertahan di dalam tiap tingkat.
 */
export function dailyTips(tips, { dateKey, program = null, category = null } = {}) {
  const list = (tips ?? []).filter((t) => !category || category === 'Semua' || t.category === category);
  const diacak = shuffleWithSeed(list, seedFromKey(dateKey));
  return diacak
    .map((tip) => {
      const score = scoreTip(tip, program);
      return { ...tip, score, tier: tier(score) };
    })
    .sort((a, b) => b.tier - a.tier);
}

/** Satu tips untuk disorot hari ini. */
export function tipOfDay(tips, options = {}) {
  return dailyTips(tips, options)[0] ?? null;
}
