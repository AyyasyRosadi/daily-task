/**
 * Standar kekuatan pembanding: "beban segini setara level apa".
 *
 * SUMBER ANGKA — angka di bawah ini disalin apa adanya dari tabel
 * ExRx.net "Weightlifting Performance Standards" (Ages 18-39, kilogram),
 * bukan karangan sendiri:
 *
 *   https://exrx.net/Testing/WeightLifting/StrengthStandards
 *   https://exrx.net/Testing/WeightLifting/SquatStandardsKg
 *   https://exrx.net/Testing/WeightLifting/BenchStandardsKg
 *   https://exrx.net/Testing/WeightLifting/DeadliftStandardsKg
 *   https://exrx.net/Testing/WeightLifting/PressStandardsKg
 *
 * Yang perlu diketahui tentang tabel aslinya:
 *
 * - Angkanya adalah 1RM (satu repetisi maksimal) tanpa alat bantu selain sabuk,
 *   dikumpulkan dari sistem klasifikasi angkat besi dan powerlifting sejak
 *   1950-an. ExRx menegaskan ini "performance standards", bukan norma statistik:
 *   bukan rata-rata populasi, dan tidak diturunkan dari regresi.
 * - Tabelnya untuk usia 18-39. ExRx punya tabel terpisah untuk 40-49, 50-59,
 *   dan 60-69 yang angkanya jauh lebih rendah; aplikasi ini belum memakainya,
 *   jadi pengguna di luar rentang itu akan melihat pembanding yang terlalu berat.
 * - Baris berat badan adalah kelas, bukan titik: kelas 75 berarti "sampai 75 kg".
 *   `rowFor` di bawah karena itu memilih kelas pertama yang menampung berat
 *   badan pengguna, bukan yang terdekat.
 * - Standar squat ExRx mensyaratkan paha turun di bawah sejajar lantai, dan
 *   "Press" berarti overhead press berdiri tanpa dorongan kaki.
 *
 * Kolom, berurutan: [berat badan, belum terlatih, pemula, menengah, mahir, elit]
 */

export const levels = [
  { id: 'belum', label: 'Belum terlatih' },
  { id: 'pemula', label: 'Pemula' },
  { id: 'menengah', label: 'Menengah' },
  { id: 'mahir', label: 'Mahir' },
  { id: 'elit', label: 'Elit' }
];

/** Penjelasan tiap level, diringkas dari halaman ExRx. */
export const levelNote = {
  belum: 'Belum pernah latihan beban teratur, tapi sudah bisa melakukan gerakannya dengan benar.',
  pemula: 'Latihan teratur sampai sekitar setengah tahun.',
  menengah: 'Latihan teratur sampai sekitar dua tahun.',
  mahir: 'Latihan teratur bertahun-tahun dengan kemajuan terukur.',
  elit: 'Setara atlet cabang olahraga kekuatan.'
};

export const standards = {
  bench: {
    pria: [
      [52, 37.5, 50, 60, 82.5, 100],
      [56, 40, 52.5, 62.5, 90, 110],
      [60, 45, 57.5, 70, 95, 117.5],
      [67, 50, 65, 77.5, 107.5, 132.5],
      [75, 55, 70, 85, 115, 145],
      [82, 60, 75, 90, 125, 157.5],
      [90, 62.5, 80, 97.5, 132.5, 162.5],
      [100, 62.5, 82.5, 102.5, 137.5, 172.5],
      [110, 65, 85, 105, 142.5, 180],
      [125, 67.5, 87.5, 107.5, 147.5, 185],
      [145, 70, 90, 112.5, 152.5, 190],
      [999, 72.5, 92.5, 115, 155, 192.5]
    ],
    wanita: [
      [44, 22.5, 30, 35, 42.5, 52.5],
      [48, 25, 32.5, 37.5, 45, 57.5],
      [52, 27.5, 35, 37.5, 50, 62.5],
      [56, 30, 37.5, 40, 52.5, 65],
      [60, 32.5, 40, 42.5, 57.5, 67.5],
      [67, 35, 40, 47.5, 62.5, 75],
      [75, 37.5, 42.5, 52.5, 65, 85],
      [82, 37.5, 50, 55, 72.5, 90],
      [90, 40, 52.5, 60, 75, 95],
      [999, 42.5, 55, 62.5, 80, 100]
    ],
  },
  squat: {
    pria: [
      [52, 35, 65, 80, 107.5, 145],
      [56, 37.5, 70, 87.5, 117.5, 157.5],
      [60, 40, 77.5, 92.5, 127.5, 167.5],
      [67, 45, 85, 105, 142.5, 185],
      [75, 50, 92.5, 112.5, 155, 202.5],
      [82, 55, 100, 122.5, 167.5, 217.5],
      [90, 57.5, 105, 130, 177.5, 230],
      [100, 60, 110, 135, 185, 240],
      [110, 62.5, 115, 140, 192.5, 250],
      [125, 65, 117.5, 145, 197.5, 257.5],
      [145, 67.5, 122.5, 147.5, 202.5, 262.5],
      [999, 70, 125, 150, 207.5, 270]
    ],
    wanita: [
      [44, 20, 37.5, 45, 60, 75],
      [48, 22.5, 40, 47.5, 65, 80],
      [52, 25, 45, 52.5, 67.5, 87.5],
      [56, 25, 47.5, 55, 72.5, 90],
      [60, 27.5, 50, 60, 77.5, 95],
      [67, 30, 55, 62.5, 85, 105],
      [75, 32.5, 57.5, 67.5, 90, 115],
      [82, 35, 62.5, 75, 97.5, 122.5],
      [90, 37.5, 67.5, 80, 105, 132.5],
      [999, 40, 72.5, 85, 110, 137.5]
    ],
  },
  deadlift: {
    pria: [
      [52, 42.5, 82.5, 92.5, 135, 175],
      [56, 47.5, 87.5, 100, 145, 187.5],
      [60, 50, 95, 110, 155, 200],
      [67, 57.5, 107.5, 122.5, 172.5, 217.5],
      [75, 62.5, 115, 135, 185, 235],
      [82, 67.5, 125, 142.5, 200, 250],
      [90, 70, 132.5, 152.5, 207.5, 257.5],
      [100, 75, 137.5, 160, 217.5, 265],
      [110, 77.5, 145, 165, 222.5, 270],
      [125, 80, 147.5, 170, 227.5, 272.5],
      [145, 82.5, 152.5, 172.5, 230, 277.5],
      [999, 85, 155, 177.5, 232.5, 280]
    ],
    wanita: [
      [44, 25, 47.5, 50, 80, 105],
      [48, 27.5, 52.5, 60, 85, 110],
      [52, 30, 55, 62.5, 90, 115],
      [56, 32.5, 60, 67.5, 95, 120],
      [60, 35, 62.5, 72.5, 100, 125],
      [67, 37.5, 67.5, 80, 110, 135],
      [75, 40, 72.5, 85, 117.5, 145],
      [82, 42.5, 80, 92.5, 125, 150],
      [90, 45, 87.5, 97.5, 130, 160],
      [999, 50, 90, 105, 137.5, 165]
    ],
  },
  press: {
    pria: [
      [52, 22.5, 32.5, 40, 50, 60],
      [56, 25, 35, 45, 52.5, 65],
      [60, 27.5, 37.5, 47.5, 57.5, 70],
      [67, 30, 42.5, 55, 62.5, 77.5],
      [75, 32.5, 45, 57.5, 70, 85],
      [82, 35, 50, 62.5, 75, 100],
      [90, 37.5, 52.5, 65, 77.5, 105],
      [100, 40, 55, 70, 82.5, 115],
      [110, 42.5, 57.5, 72.5, 85, 120],
      [125, 42.5, 60, 75, 87.5, 122.5],
      [145, 45, 60, 75, 90, 125],
      [999, 45, 62.5, 77.5, 92.5, 130]
    ],
    wanita: [
      [44, 15, 17.5, 22.5, 30, 40],
      [48, 15, 20, 25, 32.5, 42.5],
      [52, 17.5, 22.5, 27.5, 35, 45],
      [56, 17.5, 22.5, 27.5, 37.5, 47.5],
      [60, 17.5, 25, 30, 40, 50],
      [67, 20, 27.5, 32.5, 42.5, 55],
      [75, 22.5, 30, 35, 47.5, 62.5],
      [82, 22.5, 32.5, 37.5, 50, 65],
      [90, 25, 35, 40, 52.5, 67.5],
      [999, 27.5, 37.5, 42.5, 57.5, 72.5]
    ],
  },
};

/**
 * Gerakan di pustaka aplikasi yang punya pembanding.
 *
 * Sengaja hanya gerakan yang benar-benar sama dengan lift di tabel ExRx.
 * Variasi seperti front squat atau incline press punya beban wajar yang berbeda,
 * dan menyamakannya dengan tabel ini akan menyesatkan — jadi dibiarkan kosong.
 */
export const liftOf = {
  'Back squat': 'squat',
  Deadlift: 'deadlift',
  'Barbell bench press': 'bench',
  'Overhead press': 'press'
};

export const liftLabel = {
  squat: 'Back squat',
  bench: 'Bench press',
  deadlift: 'Deadlift',
  press: 'Overhead press'
};

/** Kelas berat badan yang menampung `bodyweight`, atau kelas terberat. */
function rowFor(lift, sex, bodyweight) {
  const table = standards[lift]?.[sex === 'perempuan' ? 'wanita' : 'pria'];
  const bw = Number(bodyweight);
  if (!table || !Number.isFinite(bw) || bw <= 0) return null;
  return table.find((row) => bw <= row[0]) ?? table[table.length - 1];
}

/**
 * Ambang tiap level untuk satu gerakan dan satu berat badan.
 * Mengembalikan null kalau gerakannya tidak punya pembanding atau berat badan
 * belum diisi — dua-duanya hal biasa, bukan kesalahan.
 */
export function thresholds(exerciseName, sex, bodyweight) {
  const lift = liftOf[exerciseName];
  const row = lift ? rowFor(lift, sex, bodyweight) : null;
  if (!row) return null;
  return levels.map((level, i) => ({ ...level, kg: row[i + 1] }));
}

/**
 * Level sebuah angkatan dibandingkan standar.
 *
 * `kg` sebaiknya 1RM perkiraan, bukan beban set biasa — tabel ExRx adalah tabel
 * 1RM. Hasilnya:
 *
 *   - `level`   level yang sudah dilewati, null kalau masih di bawah ambang terbawah
 *   - `next`    level berikutnya, null kalau sudah elit
 *   - `toNext`  sisa kilogram menuju level berikutnya
 *   - `percent` kemajuan 0-100 dari ambang level sekarang ke level berikutnya
 */
export function levelFor(exerciseName, sex, bodyweight, kg) {
  const rows = thresholds(exerciseName, sex, bodyweight);
  const load = Number(kg);
  if (!rows || !Number.isFinite(load) || load <= 0) return null;

  const passed = rows.filter((r) => load >= r.kg);
  const level = passed.length ? passed[passed.length - 1] : null;
  const next = rows[passed.length] ?? null;

  // Di bawah ambang terbawah, kemajuan dihitung dari nol supaya bar-nya tetap
  // bergerak alih-alih diam di 0% sampai ambang pertama terlampaui.
  const from = level ? level.kg : 0;
  const percent = next
    ? Math.max(0, Math.min(100, Math.round(((load - from) / (next.kg - from)) * 100)))
    : 100;

  return {
    lift: liftOf[exerciseName],
    level,
    next,
    thresholds: rows,
    kg: load,
    toNext: next ? Number((next.kg - load).toFixed(1)) : 0,
    percent
  };
}
