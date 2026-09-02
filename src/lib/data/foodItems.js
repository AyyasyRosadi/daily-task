/**
 * Makanan sehari-hari Indonesia dengan makro per porsi rumah tangga.
 *
 * Angka adalah perkiraan umum dari tabel komposisi pangan; resep tiap dapur
 * berbeda, terutama untuk gorengan dan masakan bersantan. Pakai sebagai panduan,
 * bukan ukuran laboratorium.
 */

export const foodCategories = [
  { id: 'pokok', label: 'Makanan pokok' },
  { id: 'lauk', label: 'Lauk hewani' },
  { id: 'nabati', label: 'Lauk nabati' },
  { id: 'sayur', label: 'Sayur' },
  { id: 'buah', label: 'Buah' },
  { id: 'minuman', label: 'Minuman' },
  { id: 'camilan', label: 'Camilan' },
  { id: 'lengkap', label: 'Menu lengkap' }
];

/** kcal, p (protein), k (karbohidrat), l (lemak) — semuanya per satu `porsi`. */
export const foodItems = [
  // Makanan pokok
  { name: 'Nasi putih', porsi: '1 centong (100 g)', cat: 'pokok', kcal: 130, p: 2.7, k: 28, l: 0.3 },
  { name: 'Nasi merah', porsi: '1 centong (100 g)', cat: 'pokok', kcal: 110, p: 2.6, k: 23, l: 0.9 },
  { name: 'Nasi uduk', porsi: '1 porsi (150 g)', cat: 'pokok', kcal: 260, p: 4.5, k: 40, l: 9 },
  { name: 'Kentang rebus', porsi: '1 buah sedang (150 g)', cat: 'pokok', kcal: 116, p: 3.1, k: 26, l: 0.2 },
  { name: 'Ubi rebus', porsi: '1 buah sedang (150 g)', cat: 'pokok', kcal: 130, p: 2.4, k: 30, l: 0.2 },
  { name: 'Singkong rebus', porsi: '100 g', cat: 'pokok', kcal: 160, p: 1.4, k: 38, l: 0.3 },
  { name: 'Roti tawar gandum', porsi: '2 lembar', cat: 'pokok', kcal: 160, p: 8, k: 28, l: 2 },
  { name: 'Mi instan rebus', porsi: '1 bungkus', cat: 'pokok', kcal: 380, p: 8, k: 54, l: 14 },
  { name: 'Oatmeal', porsi: '40 g kering', cat: 'pokok', kcal: 150, p: 5, k: 27, l: 3 },
  { name: 'Bihun goreng', porsi: '1 porsi (150 g)', cat: 'pokok', kcal: 290, p: 6, k: 45, l: 9 },

  // Lauk hewani
  { name: 'Dada ayam panggang', porsi: '100 g', cat: 'lauk', kcal: 165, p: 31, k: 0, l: 3.6 },
  { name: 'Paha ayam goreng', porsi: '1 potong (100 g)', cat: 'lauk', kcal: 260, p: 22, k: 6, l: 16 },
  { name: 'Ayam bakar', porsi: '1 potong (100 g)', cat: 'lauk', kcal: 190, p: 27, k: 2, l: 8 },
  { name: 'Telur rebus', porsi: '1 butir', cat: 'lauk', kcal: 72, p: 6.3, k: 0.4, l: 5 },
  { name: 'Telur ceplok', porsi: '1 butir', cat: 'lauk', kcal: 110, p: 6.3, k: 0.4, l: 9 },
  { name: 'Telur dadar', porsi: '1 butir', cat: 'lauk', kcal: 125, p: 7, k: 1, l: 10 },
  { name: 'Ikan kembung goreng', porsi: '1 ekor (100 g)', cat: 'lauk', kcal: 200, p: 22, k: 0, l: 12 },
  { name: 'Ikan lele goreng', porsi: '1 ekor (100 g)', cat: 'lauk', kcal: 210, p: 20, k: 2, l: 13 },
  { name: 'Ikan tuna', porsi: '100 g', cat: 'lauk', kcal: 130, p: 28, k: 0, l: 1 },
  { name: 'Udang rebus', porsi: '100 g', cat: 'lauk', kcal: 99, p: 24, k: 0.2, l: 0.3 },
  { name: 'Daging sapi rendang', porsi: '1 potong (75 g)', cat: 'lauk', kcal: 260, p: 18, k: 4, l: 19 },
  { name: 'Daging sapi tanpa lemak', porsi: '100 g', cat: 'lauk', kcal: 190, p: 27, k: 0, l: 9 },
  { name: 'Sosis ayam', porsi: '1 buah (50 g)', cat: 'lauk', kcal: 130, p: 6, k: 5, l: 10 },

  // Lauk nabati
  { name: 'Tempe goreng', porsi: '2 potong (50 g)', cat: 'nabati', kcal: 170, p: 9, k: 8, l: 11 },
  { name: 'Tempe bacem', porsi: '2 potong (50 g)', cat: 'nabati', kcal: 160, p: 9, k: 12, l: 8 },
  { name: 'Tempe kukus', porsi: '50 g', cat: 'nabati', kcal: 97, p: 9.5, k: 4, l: 5 },
  { name: 'Tahu goreng', porsi: '2 potong (60 g)', cat: 'nabati', kcal: 115, p: 7, k: 3, l: 8 },
  { name: 'Tahu putih rebus', porsi: '100 g', cat: 'nabati', kcal: 76, p: 8, k: 1.9, l: 4.8 },
  { name: 'Kacang tanah', porsi: '30 g', cat: 'nabati', kcal: 170, p: 7.5, k: 5, l: 14 },
  { name: 'Kacang merah rebus', porsi: '100 g', cat: 'nabati', kcal: 127, p: 9, k: 23, l: 0.5 },
  { name: 'Selai kacang', porsi: '1 sdm (16 g)', cat: 'nabati', kcal: 95, p: 4, k: 3, l: 8 },

  // Sayur
  { name: 'Sayur bayam bening', porsi: '1 mangkuk', cat: 'sayur', kcal: 40, p: 3, k: 6, l: 0.5 },
  { name: 'Tumis kangkung', porsi: '1 porsi (100 g)', cat: 'sayur', kcal: 95, p: 3, k: 6, l: 7 },
  { name: 'Capcay', porsi: '1 porsi (150 g)', cat: 'sayur', kcal: 120, p: 5, k: 10, l: 7 },
  { name: 'Sayur asem', porsi: '1 mangkuk', cat: 'sayur', kcal: 60, p: 2, k: 11, l: 1 },
  { name: 'Sayur lodeh', porsi: '1 mangkuk', cat: 'sayur', kcal: 140, p: 3, k: 10, l: 10 },
  { name: 'Brokoli rebus', porsi: '100 g', cat: 'sayur', kcal: 35, p: 2.8, k: 7, l: 0.4 },
  { name: 'Timun / lalapan', porsi: '100 g', cat: 'sayur', kcal: 16, p: 0.7, k: 3.6, l: 0.1 },

  // Buah
  { name: 'Pisang', porsi: '1 buah sedang', cat: 'buah', kcal: 105, p: 1.3, k: 27, l: 0.4 },
  { name: 'Apel', porsi: '1 buah sedang', cat: 'buah', kcal: 95, p: 0.5, k: 25, l: 0.3 },
  { name: 'Jeruk', porsi: '1 buah sedang', cat: 'buah', kcal: 62, p: 1.2, k: 15, l: 0.2 },
  { name: 'Pepaya', porsi: '1 potong (150 g)', cat: 'buah', kcal: 60, p: 0.9, k: 15, l: 0.2 },
  { name: 'Semangka', porsi: '1 potong (150 g)', cat: 'buah', kcal: 45, p: 0.9, k: 11, l: 0.2 },
  { name: 'Alpukat', porsi: '1/2 buah (100 g)', cat: 'buah', kcal: 160, p: 2, k: 9, l: 15 },
  { name: 'Mangga', porsi: '1 buah sedang', cat: 'buah', kcal: 135, p: 1.1, k: 35, l: 0.6 },

  // Minuman
  { name: 'Air putih', porsi: '1 gelas', cat: 'minuman', kcal: 0, p: 0, k: 0, l: 0 },
  { name: 'Susu sapi', porsi: '250 ml', cat: 'minuman', kcal: 150, p: 8, k: 12, l: 8 },
  { name: 'Susu low fat', porsi: '250 ml', cat: 'minuman', kcal: 105, p: 8.5, k: 12, l: 2.5 },
  { name: 'Yogurt plain', porsi: '150 g', cat: 'minuman', kcal: 90, p: 12, k: 7, l: 0.5 },
  { name: 'Whey protein', porsi: '1 scoop (30 g)', cat: 'minuman', kcal: 120, p: 24, k: 3, l: 1.5 },
  { name: 'Teh manis', porsi: '1 gelas', cat: 'minuman', kcal: 90, p: 0, k: 23, l: 0 },
  { name: 'Kopi hitam tanpa gula', porsi: '1 cangkir', cat: 'minuman', kcal: 5, p: 0.3, k: 0, l: 0 },
  { name: 'Es teh / minuman kemasan manis', porsi: '1 botol (350 ml)', cat: 'minuman', kcal: 140, p: 0, k: 35, l: 0 },

  // Camilan
  { name: 'Gorengan (bakwan/tahu isi)', porsi: '1 buah', cat: 'camilan', kcal: 140, p: 3, k: 12, l: 9 },
  { name: 'Pisang goreng', porsi: '1 buah', cat: 'camilan', kcal: 150, p: 1.5, k: 22, l: 7 },
  { name: 'Keripik kentang', porsi: '30 g', cat: 'camilan', kcal: 160, p: 2, k: 15, l: 10 },
  { name: 'Biskuit manis', porsi: '3 keping', cat: 'camilan', kcal: 140, p: 2, k: 21, l: 5 },
  { name: 'Cokelat batang', porsi: '30 g', cat: 'camilan', kcal: 160, p: 2, k: 17, l: 9 },
  { name: 'Roti isi cokelat', porsi: '1 buah', cat: 'camilan', kcal: 250, p: 5, k: 40, l: 8 },

  // Menu lengkap
  { name: 'Nasi padang (ayam gulai)', porsi: '1 porsi', cat: 'lengkap', kcal: 670, p: 27, k: 70, l: 32 },
  { name: 'Nasi goreng', porsi: '1 porsi', cat: 'lengkap', kcal: 600, p: 15, k: 76, l: 25 },
  { name: 'Soto ayam', porsi: '1 mangkuk + nasi', cat: 'lengkap', kcal: 420, p: 22, k: 45, l: 16 },
  { name: 'Bakso', porsi: '1 mangkuk', cat: 'lengkap', kcal: 350, p: 18, k: 35, l: 15 },
  { name: 'Gado-gado', porsi: '1 porsi', cat: 'lengkap', kcal: 480, p: 15, k: 40, l: 28 },
  { name: 'Ayam geprek + nasi', porsi: '1 porsi', cat: 'lengkap', kcal: 700, p: 33, k: 72, l: 30 },
  { name: 'Pecel lele + nasi', porsi: '1 porsi', cat: 'lengkap', kcal: 620, p: 28, k: 62, l: 28 },
  { name: 'Mi ayam', porsi: '1 mangkuk', cat: 'lengkap', kcal: 480, p: 20, k: 62, l: 16 }
];

export const mealSlots = [
  { id: 'sarapan', label: 'Sarapan' },
  { id: 'siang', label: 'Makan siang' },
  { id: 'malam', label: 'Makan malam' },
  { id: 'camilan', label: 'Camilan' }
];

/** Cari makanan berdasarkan nama, tidak peka huruf besar-kecil. */
export function searchFoods(query, category = null) {
  const q = query.trim().toLowerCase();
  return foodItems.filter((f) => {
    if (category && f.cat !== category) return false;
    if (!q) return true;
    return f.name.toLowerCase().includes(q);
  });
}
