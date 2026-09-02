export const goals = [
  {
    id: 'cut',
    name: 'Turun lemak',
    calorieShift: -0.18,
    proteinPerKg: 2.0,
    note: 'Defisit ringan supaya otot tetap terjaga dan tenaga latihan tidak drop.'
  },
  {
    id: 'maintain',
    name: 'Jaga berat',
    calorieShift: 0,
    proteinPerKg: 1.8,
    note: 'Kalori sekitar kebutuhan harian. Fokusnya performa dan komposisi tubuh.'
  },
  {
    id: 'bulk',
    name: 'Naik massa',
    calorieShift: 0.12,
    proteinPerKg: 1.9,
    note: 'Surplus pelan supaya kenaikan berat lebih banyak jadi otot daripada lemak.'
  }
];

/**
 * Menu harian sekarang ada di `menus.js` dan angkanya dihitung dari
 * `foodItems.js`, bukan ditulis tangan. `mealPlans` yang dulu di sini dihapus:
 * isinya set kalori dan protein kedua untuk makanan yang sama, dan dua set angka
 * yang sama-sama ditulis tangan pasti berbeda cepat atau lambat.
 */

// Sumber protein murah yang gampang ditemukan.
export const proteinSources = [
  { name: 'Telur ayam', per: '1 butir', protein: 6, kcal: 72 },
  { name: 'Dada ayam', per: '100 g', protein: 31, kcal: 165 },
  { name: 'Tempe', per: '100 g', protein: 19, kcal: 193 },
  { name: 'Tahu putih', per: '100 g', protein: 8, kcal: 76 },
  { name: 'Ikan kembung', per: '100 g', protein: 22, kcal: 130 },
  { name: 'Susu sapi', per: '250 ml', protein: 8, kcal: 150 },
  { name: 'Kacang merah', per: '100 g', protein: 9, kcal: 127 },
  { name: 'Yogurt plain', per: '150 g', protein: 12, kcal: 90 }
];
