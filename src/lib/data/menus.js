/**
 * Kombinasi menu harian, dikelompokkan per tingkat biaya.
 *
 * PENTING — tidak ada satu pun angka kalori atau protein di berkas ini. Tiap
 * menu hanya menunjuk nama makanan di `foodItems.js` beserta kelipatan porsinya,
 * dan totalnya dihitung di `src/lib/utils/menus.js`. Kalau angkanya ditulis
 * ulang di sini, cepat atau lambat akan ada dua set angka yang tidak cocok untuk
 * makanan yang sama.
 *
 * Konsekuensinya: nama makanan harus persis sama dengan yang ada di
 * `foodItems.js`. Ada tes yang memastikan itu, jadi salah ketik tidak akan
 * diam-diam lolos jadi menu tanpa kalori.
 *
 * SOAL HARGA — tier di sini bukan harga yang dihitung, melainkan batasan bahan.
 * Tiap makanan punya `cost` 1-3 di `foodItems.js`, dan tiap tier punya aturan
 * bahan apa yang boleh dipakai (lihat `budgetTiers`). Kisaran rupiah di bawah
 * hanya gambaran kasar, bukan hasil hitungan: harga bahan berbeda tiap kota dan
 * berubah tiap tahun, jadi angka rupiah di dalam kode akan basi jauh lebih cepat
 * daripada urutan murah-mahalnya.
 */

export const budgetTiers = [
  {
    id: 'hemat',
    label: 'Hemat',
    kisaran: 'sekitar Rp25-40 rb per hari',
    note: 'Masak sendiri atau warteg. Protein dari telur, tempe, tahu, dan ikan yang paling murah di pasar.',
    // Tanpa bahan mahal sama sekali, dan bahan tingkat sedang dibatasi.
    maxCost: 2,
    maxSedang: 3
  },
  {
    id: 'normal',
    label: 'Normal',
    kisaran: 'sekitar Rp45-75 rb per hari',
    note: 'Campur masak sendiri dan beli di luar. Ayam, susu, dan buah masuk tiap hari.',
    maxCost: 3,
    maxMahal: 1
  },
  {
    id: 'pilihan',
    label: 'Rekomendasi',
    kisaran: 'tanpa batas biaya',
    note: 'Disusun untuk hasil terbaik, bukan untuk hemat. Protein lebih beragam, sayur dan buah lebih banyak.',
    maxCost: 3
  }
];

export const menuGoals = [
  { id: 'cut', label: 'Turun lemak' },
  { id: 'maintain', label: 'Jaga berat' },
  { id: 'bulk', label: 'Naik massa' }
];

export const menuSlots = [
  { id: 'sarapan', label: 'Sarapan' },
  { id: 'siang', label: 'Makan siang' },
  { id: 'malam', label: 'Makan malam' },
  { id: 'camilan', label: 'Camilan' }
];

/** [nama makanan, kelipatan porsi] — nama harus ada di `foodItems.js`. */
export const dailyMenus = [
  // ===================== HEMAT =====================

  // --- Hemat / turun lemak ---
  {
    id: 'hemat-cut-telur-tempe',
    tier: 'hemat',
    goal: 'cut',
    name: 'Telur tempe seharian',
    note: 'Protein murah paling padat: telur dan tempe. Lauknya murah, jadi sayurnya bisa banyak.',
    sarapan: [['Telur rebus', 3], ['Pepaya', 1], ['Kopi hitam tanpa gula', 1]],
    siang: [['Nasi putih', 2], ['Ikan kembung goreng', 1.5], ['Tumis kangkung', 1]],
    malam: [['Nasi putih', 2], ['Tempe kukus', 2], ['Sayur bayam bening', 1]],
    camilan: [['Pisang', 2], ['Air putih', 4]]
  },
  {
    id: 'hemat-cut-lele-lalapan',
    tier: 'hemat',
    goal: 'cut',
    name: 'Lele lalapan',
    note: 'Warung pecel lele hampir selalu ada. Perbanyak lalapan, kurangi sambal berminyak.',
    sarapan: [['Putih telur', 1], ['Telur rebus', 1], ['Jagung rebus', 1]],
    siang: [['Nasi putih', 2], ['Ikan lele goreng', 1.5], ['Timun / lalapan', 1], ['Sayur asem', 1]],
    malam: [['Nasi putih', 2], ['Telur ceplok', 2], ['Tahu putih rebus', 1], ['Tempe kukus', 1], ['Sup sayur bening', 1]],
    camilan: [['Jeruk', 2], ['Pisang', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-cut-sarden',
    tier: 'hemat',
    goal: 'cut',
    name: 'Sarden kaleng darurat',
    note: 'Untuk hari tanpa waktu masak. Sarden kaleng murah dan proteinnya tinggi.',
    sarapan: [['Telur rebus', 3], ['Semangka', 1]],
    siang: [['Nasi putih', 2], ['Sarden kaleng saus tomat', 1.5], ['Tumis buncis', 1]],
    malam: [['Nasi putih', 2], ['Tahu goreng', 1], ['Sayur bayam bening', 1], ['Telur rebus', 1]],
    camilan: [['Pisang', 2], ['Air putih', 4]]
  },
  {
    id: 'hemat-cut-tauge-tahu',
    tier: 'hemat',
    goal: 'cut',
    name: 'Tahu tauge murah',
    note: 'Kalori paling rendah di daftar hemat, dengan protein hampir semuanya dari nabati.',
    sarapan: [['Putih telur', 1], ['Telur ceplok', 1], ['Pepaya', 1]],
    siang: [['Nasi putih', 2], ['Ikan nila goreng', 1.5], ['Tumis tauge', 1]],
    malam: [['Nasi putih', 2], ['Tahu putih rebus', 2], ['Tempe kukus', 2], ['Sup sayur bening', 1]],
    camilan: [['Jeruk', 1], ['Pisang', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-cut-singkong',
    tier: 'hemat',
    goal: 'cut',
    name: 'Karbo dari singkong dan ubi',
    note: 'Pengganti nasi yang lebih mengenyangkan per kalorinya, dan biasanya lebih murah.',
    sarapan: [['Ubi rebus', 1], ['Telur rebus', 3]],
    siang: [['Nasi putih', 2], ['Ikan kembung goreng', 1.5], ['Sayur asem', 1]],
    malam: [['Singkong rebus', 2], ['Tempe kukus', 2], ['Telur ceplok', 1], ['Tumis kangkung', 1]],
    camilan: [['Semangka', 1], ['Pisang', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-cut-ketoprak',
    tier: 'hemat',
    goal: 'cut',
    name: 'Ketoprak siang, ringan malam',
    note: 'Satu porsi jajanan kaki lima di siang hari, ditebus dengan malam yang ringan.',
    sarapan: [['Telur rebus', 3], ['Ubi rebus', 1], ['Kopi hitam tanpa gula', 1]],
    siang: [['Ketoprak', 1], ['Telur rebus', 1]],
    malam: [['Tahu putih rebus', 1], ['Tempe kukus', 1], ['Sayur bayam bening', 1], ['Nasi putih', 2]],
    camilan: [['Pepaya', 1], ['Air putih', 4]]
  },

  // --- Hemat / jaga berat ---
  {
    id: 'hemat-maintain-warteg',
    tier: 'hemat',
    goal: 'maintain',
    name: 'Warteg standar',
    note: 'Pola paling umum: nasi, satu lauk hewani, satu nabati, satu sayur.',
    sarapan: [['Nasi uduk', 1.5], ['Telur dadar', 1]],
    siang: [['Nasi putih', 2], ['Ikan lele goreng', 1.5], ['Tempe goreng', 1], ['Sayur asem', 1]],
    malam: [['Nasi putih', 2], ['Telur ceplok', 1], ['Tumis kangkung', 1], ['Tahu goreng', 1]],
    camilan: [['Pisang', 2], ['Teh manis', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-maintain-bubur',
    tier: 'hemat',
    goal: 'maintain',
    name: 'Bubur ayam pagi',
    note: 'Sarapan yang gampang dicari di mana saja, lalu dua kali makan berat biasa.',
    sarapan: [['Bubur ayam', 1], ['Telur rebus', 2], ['Pisang', 1]],
    siang: [['Nasi putih', 2], ['Ikan nila goreng', 1.5], ['Tumis buncis', 1]],
    malam: [['Nasi putih', 2], ['Tempe bacem', 1], ['Telur rebus', 2], ['Sayur bayam bening', 1]],
    camilan: [['Jeruk', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-maintain-lontong',
    tier: 'hemat',
    goal: 'maintain',
    name: 'Lontong sayur pagi',
    note: 'Sarapan bersantan sekali, jadi dua makan berikutnya dijaga tetap kering.',
    sarapan: [['Lontong sayur', 1], ['Telur rebus', 2]],
    siang: [['Nasi putih', 2], ['Ikan kembung goreng', 1.5], ['Timun / lalapan', 1]],
    malam: [['Nasi putih', 2], ['Tahu goreng', 1], ['Tempe kukus', 1], ['Sup sayur bening', 1]],
    camilan: [['Pisang', 2], ['Air putih', 4]]
  },
  {
    id: 'hemat-maintain-bakso',
    tier: 'hemat',
    goal: 'maintain',
    name: 'Bakso malam',
    note: 'Semangkuk bakso proteinnya lumayan untuk harganya, asal kuahnya tidak diminum habis.',
    sarapan: [['Roti tawar gandum', 1.5], ['Telur ceplok', 3]],
    siang: [['Nasi putih', 2], ['Sarden kaleng saus tomat', 1.5], ['Tumis tauge', 1]],
    malam: [['Bakso', 1], ['Nasi putih', 2], ['Telur rebus', 2], ['Tumis kangkung', 1]],
    camilan: [['Pepaya', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-maintain-kacang-merah',
    tier: 'hemat',
    goal: 'maintain',
    name: 'Kacang merah dan telur',
    note: 'Kacang merah rebus murah, kenyang lama, dan proteinnya tidak kalah dari tahu.',
    sarapan: [['Telur rebus', 3], ['Jagung rebus', 1], ['Pisang', 1]],
    siang: [['Nasi putih', 2], ['Kacang merah rebus', 1], ['Ikan nila goreng', 1.5], ['Sayur asem', 1]],
    malam: [['Nasi putih', 2], ['Ikan kembung goreng', 1.5], ['Tempe goreng', 1], ['Sayur bayam bening', 1]],
    camilan: [['Semangka', 1], ['Pisang', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-maintain-mi-ayam',
    tier: 'hemat',
    goal: 'maintain',
    name: 'Mi ayam siang',
    note: 'Jajan sekali sehari masih muat, selama dua makan lainnya penuh sayur dan protein.',
    sarapan: [['Telur dadar', 3], ['Nasi putih', 2]],
    siang: [['Mi ayam', 1], ['Telur rebus', 2], ['Tumis tauge', 1]],
    malam: [['Nasi putih', 2], ['Ikan lele goreng', 1.5], ['Tumis kangkung', 1], ['Tahu putih rebus', 1]],
    camilan: [['Jeruk', 1], ['Air putih', 4]]
  },

  // --- Hemat / naik massa ---
  {
    id: 'hemat-bulk-nasi-telur',
    tier: 'hemat',
    goal: 'bulk',
    name: 'Nasi banyak, telur banyak',
    note: 'Cara paling murah menaikkan kalori: tambah centong nasi dan tambah butir telur.',
    sarapan: [['Nasi uduk', 1.5], ['Telur dadar', 3], ['Susu kedelai', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Ikan lele goreng', 1.5], ['Tempe goreng', 1], ['Sayur asem', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Telur ceplok', 2], ['Tahu goreng', 1], ['Tumis kangkung', 1]],
    camilan: [['Pisang', 2], ['Kacang tanah', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-bulk-mi-nasi',
    tier: 'hemat',
    goal: 'bulk',
    name: 'Mi instan plus telur',
    note: 'Mi instan sendiri kurang protein. Dua telur dan sayur membuatnya jauh lebih layak.',
    sarapan: [['Nasi goreng', 1], ['Telur ceplok', 1]],
    siang: [['Mi instan rebus', 1], ['Telur rebus', 2], ['Tumis tauge', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ikan kembung goreng', 1.5], ['Tempe bacem', 1], ['Sayur bayam bening', 1]],
    camilan: [['Pisang goreng', 2], ['Susu kedelai', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-bulk-singkong-tempe',
    tier: 'hemat',
    goal: 'bulk',
    name: 'Singkong dan tempe',
    note: 'Karbohidrat termurah per kalori. Cocok untuk yang susah naik berat.',
    sarapan: [['Singkong rebus', 1], ['Telur dadar', 3], ['Susu kedelai', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Ikan nila goreng', 1.5], ['Tempe goreng', 2], ['Tumis buncis', 1]],
    malam: [['Nasi putih', 2], ['Telur ceplok', 2], ['Sayur lodeh', 1]],
    camilan: [['Pisang', 2], ['Kacang tanah', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-bulk-padang',
    tier: 'hemat',
    goal: 'bulk',
    name: 'Sekali nasi padang',
    note: 'Satu porsi nasi padang menutup sepertiga kalori harian sekaligus. Hari latihan berat.',
    sarapan: [['Nasi uduk', 1.5], ['Telur ceplok', 3]],
    siang: [['Nasi padang (ayam gulai)', 1]],
    malam: [['Nasi putih', 2], ['Tempe kukus', 2], ['Tahu goreng', 1], ['Sayur bayam bening', 1]],
    camilan: [['Pisang', 2], ['Susu kedelai', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-bulk-geprek',
    tier: 'hemat',
    goal: 'bulk',
    name: 'Ayam geprek malam',
    note: 'Protein besar dengan harga jajanan. Sarapan dan siang dibuat sederhana.',
    sarapan: [['Nasi putih', 2], ['Telur dadar', 3], ['Susu kedelai', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Sarden kaleng saus tomat', 1.5], ['Tumis kangkung', 1], ['Tempe goreng', 1]],
    malam: [['Ayam geprek + nasi', 1]],
    camilan: [['Pisang', 2], ['Kacang tanah', 1], ['Air putih', 4]]
  },
  {
    id: 'hemat-bulk-empat-kali',
    tier: 'hemat',
    goal: 'bulk',
    name: 'Empat kali makan murah',
    note: 'Untuk perut yang cepat penuh: porsi sedang tapi sering, bukan sekali besar.',
    sarapan: [['Nasi uduk', 1.5], ['Telur rebus', 3], ['Pisang', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Ikan lele goreng', 1.5], ['Tahu goreng', 1], ['Sayur asem', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Telur dadar', 2], ['Tempe bacem', 1], ['Tumis buncis', 1]],
    camilan: [['Pisang goreng', 2], ['Kacang tanah', 1], ['Susu kedelai', 1], ['Air putih', 4]]
  },

  // ===================== NORMAL =====================

  // --- Normal / turun lemak ---
  {
    id: 'normal-cut-ayam-nasi-merah',
    tier: 'normal',
    goal: 'cut',
    name: 'Dada ayam dan nasi merah',
    note: 'Pola defisit paling lurus: protein tinggi tiap makan, karbohidrat secukupnya.',
    sarapan: [['Oatmeal', 2], ['Putih telur', 1], ['Pisang', 1]],
    siang: [['Nasi merah', 2], ['Dada ayam panggang', 1.5], ['Brokoli rebus', 1]],
    malam: [['Nasi merah', 2], ['Ikan kembung goreng', 1.5], ['Tumis buncis', 1]],
    camilan: [['Apel', 1], ['Susu low fat', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-cut-soto',
    tier: 'normal',
    goal: 'cut',
    name: 'Soto ayam siang',
    note: 'Soto berkuah bening relatif ringan untuk makanan warung, dan proteinnya lumayan.',
    sarapan: [['Telur rebus', 3], ['Roti tawar gandum', 1.5], ['Jeruk', 1]],
    siang: [['Soto ayam', 1]],
    malam: [['Nasi merah', 2], ['Ayam suwir kecap', 1.5], ['Sayur bayam bening', 1]],
    camilan: [['Pepaya', 1], ['Susu low fat', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-cut-ikan-dua-kali',
    tier: 'normal',
    goal: 'cut',
    name: 'Ikan dua kali sehari',
    note: 'Ikan mengenyangkan dengan lemak yang lebih baik daripada gorengan ayam.',
    sarapan: [['Oatmeal', 2], ['Telur rebus', 3]],
    siang: [['Nasi putih', 2], ['Ikan kembung goreng', 1.5], ['Tumis kangkung', 1], ['Timun / lalapan', 1]],
    malam: [['Nasi merah', 2], ['Ikan nila goreng', 1.5], ['Sup sayur bening', 1]],
    camilan: [['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-cut-gado-gado',
    tier: 'normal',
    goal: 'cut',
    name: 'Gado-gado dan ayam',
    note: 'Sayur banyak sekaligus. Bumbu kacangnya berlemak, jadi malamnya dijaga kering.',
    sarapan: [['Putih telur', 1], ['Telur ceplok', 1], ['Roti tawar gandum', 1.5]],
    siang: [['Gado-gado', 1]],
    malam: [['Nasi merah', 2], ['Dada ayam panggang', 1.5], ['Tumis tauge', 1]],
    camilan: [['Jeruk', 2], ['Air putih', 4]]
  },
  {
    id: 'normal-cut-kentang',
    tier: 'normal',
    goal: 'cut',
    name: 'Kentang sebagai karbo',
    note: 'Kentang rebus termasuk makanan paling mengenyangkan per kalorinya.',
    sarapan: [['Telur rebus', 3], ['Pepaya', 1], ['Kopi hitam tanpa gula', 1]],
    siang: [['Kentang rebus', 2], ['Dada ayam panggang', 1.5], ['Capcay', 1]],
    malam: [['Nasi merah', 2], ['Ikan nila goreng', 1.5], ['Sayur bayam bening', 1]],
    camilan: [['Susu low fat', 1], ['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-cut-puasa-siang',
    tier: 'normal',
    goal: 'cut',
    name: 'Sarapan ringan, malam padat',
    note: 'Untuk yang latihan sore. Kalori digeser ke sekitar waktu latihan.',
    sarapan: [['Kopi hitam tanpa gula', 1], ['Pisang', 1], ['Telur rebus', 3]],
    siang: [['Nasi merah', 2], ['Tempe kukus', 2], ['Telur rebus', 2], ['Tumis buncis', 1]],
    malam: [['Nasi putih', 2], ['Ayam bakar', 1.5], ['Brokoli rebus', 1], ['Timun / lalapan', 1]],
    camilan: [['Susu low fat', 1], ['Air putih', 4]]
  },

  // --- Normal / jaga berat ---
  {
    id: 'normal-maintain-ayam-bakar',
    tier: 'normal',
    goal: 'maintain',
    name: 'Ayam bakar dan sayur',
    note: 'Menu harian yang gampang diulang tiap minggu tanpa bosan.',
    sarapan: [['Nasi uduk', 1.5], ['Telur dadar', 1], ['Susu sapi', 1]],
    siang: [['Nasi putih', 2], ['Ayam bakar', 1.5], ['Capcay', 1]],
    malam: [['Nasi putih', 2], ['Ikan kembung goreng', 1.5], ['Sayur asem', 1], ['Tempe goreng', 1]],
    camilan: [['Pisang', 2], ['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-maintain-roti-pagi',
    tier: 'normal',
    goal: 'maintain',
    name: 'Roti gandum pagi',
    note: 'Sarapan cepat untuk yang buru-buru berangkat kerja.',
    sarapan: [['Roti tawar gandum', 1.5], ['Selai kacang', 2], ['Susu sapi', 1]],
    siang: [['Nasi putih', 2], ['Ayam suwir kecap', 1.5], ['Tumis kangkung', 1]],
    malam: [['Nasi putih', 2], ['Ikan nila goreng', 1.5], ['Sup sayur bening', 1], ['Tahu goreng', 1]],
    camilan: [['Pisang', 2], ['Air putih', 4]]
  },
  {
    id: 'normal-maintain-nasi-goreng',
    tier: 'normal',
    goal: 'maintain',
    name: 'Nasi goreng pagi',
    note: 'Sisa nasi semalam jadi sarapan. Dua makan berikutnya diberi sayur banyak.',
    sarapan: [['Nasi goreng', 1], ['Telur ceplok', 1]],
    siang: [['Nasi putih', 2], ['Dada ayam panggang', 1.5], ['Tumis buncis', 1]],
    malam: [['Nasi putih', 2], ['Tempe bacem', 1], ['Telur rebus', 2], ['Sayur bayam bening', 1]],
    camilan: [['Jeruk', 1], ['Susu low fat', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-maintain-padang',
    tier: 'normal',
    goal: 'maintain',
    name: 'Nasi padang seminggu sekali',
    note: 'Satu porsi besar di siang hari, ditebus dengan malam yang ringan dan berprotein.',
    sarapan: [['Oatmeal', 2], ['Telur rebus', 3], ['Pisang', 1]],
    siang: [['Nasi padang (ayam gulai)', 1]],
    malam: [['Nasi merah', 2], ['Ikan nila goreng', 1.5], ['Tumis tauge', 1]],
    camilan: [['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-maintain-mi-ayam-sore',
    tier: 'normal',
    goal: 'maintain',
    name: 'Mi ayam sore',
    note: 'Jajanan sore yang paling gampang dicari, ditutup makan malam berprotein.',
    sarapan: [['Roti tawar gandum', 1.5], ['Telur ceplok', 3], ['Susu sapi', 1]],
    siang: [['Nasi putih', 2], ['Ikan kembung goreng', 1.5], ['Sayur asem', 1]],
    malam: [['Mi ayam', 1], ['Telur rebus', 1]],
    camilan: [['Pisang', 2], ['Air putih', 4]]
  },
  {
    id: 'normal-maintain-hari-libur',
    tier: 'normal',
    goal: 'maintain',
    name: 'Hari libur latihan',
    note: 'Karbohidrat sedikit lebih rendah karena tidak ada sesi yang perlu dibiayai.',
    sarapan: [['Telur dadar', 3], ['Roti tawar gandum', 1.5], ['Jeruk', 1]],
    siang: [['Nasi merah', 2], ['Ayam suwir kecap', 1.5], ['Capcay', 1]],
    malam: [['Nasi merah', 2], ['Tahu putih rebus', 1], ['Tempe kukus', 1], ['Sup sayur bening', 1]],
    camilan: [['Susu low fat', 1], ['Apel', 1], ['Air putih', 4]]
  },

  // --- Normal / naik massa ---
  {
    id: 'normal-bulk-ayam-nasi',
    tier: 'normal',
    goal: 'bulk',
    name: 'Ayam nasi tiga kali',
    note: 'Pola bulking paling sederhana: tiap makan berat ada nasi besar dan satu lauk hewani.',
    sarapan: [['Nasi uduk', 1.5], ['Telur dadar', 3], ['Susu sapi', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Ayam bakar', 1.5], ['Tempe goreng', 1], ['Capcay', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ikan kembung goreng', 1.5], ['Tumis kangkung', 1]],
    camilan: [['Pisang', 2], ['Selai kacang', 2], ['Roti tawar gandum', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-bulk-geprek',
    tier: 'normal',
    goal: 'bulk',
    name: 'Geprek dan susu',
    note: 'Susu adalah cara termudah menambah kalori tanpa menambah rasa kenyang.',
    sarapan: [['Oatmeal', 2], ['Telur ceplok', 3], ['Susu sapi', 1], ['Pisang', 1]],
    siang: [['Ayam geprek + nasi', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ikan nila goreng', 1.5], ['Tempe bacem', 1], ['Sayur lodeh', 1]],
    camilan: [['Susu sapi', 1], ['Pisang', 2], ['Air putih', 4]]
  },
  {
    id: 'normal-bulk-empat-makan',
    tier: 'normal',
    goal: 'bulk',
    name: 'Empat kali makan',
    note: 'Kalau tiga kali makan sudah terasa penuh, pecah jadi empat porsi lebih kecil.',
    sarapan: [['Roti tawar gandum', 1.5], ['Selai kacang', 2], ['Telur ceplok', 3], ['Susu sapi', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Dada ayam panggang', 1.5], ['Tumis buncis', 1], ['Tahu goreng', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ayam suwir kecap', 1.5], ['Sayur asem', 1]],
    camilan: [['Bakso', 1], ['Pisang', 2], ['Air putih', 4]]
  },
  {
    id: 'normal-bulk-padang-besar',
    tier: 'normal',
    goal: 'bulk',
    name: 'Hari latihan kaki',
    note: 'Kalori paling besar di tier ini, untuk hari squat atau deadlift berat.',
    sarapan: [['Nasi uduk', 1.5], ['Telur dadar', 3], ['Susu sapi', 1]],
    siang: [['Nasi padang (ayam gulai)', 1], ['Telur rebus', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ayam bakar', 1.5], ['Tempe goreng', 1], ['Tumis kangkung', 1]],
    camilan: [['Pisang', 2], ['Kacang tanah', 1], ['Susu sapi', 1], ['Air putih', 4]]
  },
  {
    id: 'normal-bulk-mi-instan-plus',
    tier: 'normal',
    goal: 'bulk',
    name: 'Mi instan yang diperbaiki',
    note: 'Mi instan tetap boleh, asal ditambah telur, ayam suwir, dan sayur.',
    sarapan: [['Nasi goreng', 1], ['Telur ceplok', 3], ['Susu sapi', 1]],
    siang: [['Mi instan rebus', 1], ['Telur rebus', 2], ['Ayam suwir kecap', 1.5], ['Tumis tauge', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ikan kembung goreng', 1.5], ['Sayur lodeh', 1]],
    camilan: [['Pisang', 2], ['Air putih', 4]]
  },
  {
    id: 'normal-bulk-susah-naik',
    tier: 'normal',
    goal: 'bulk',
    name: 'Untuk yang susah naik berat',
    note: 'Kalori cair dan lemak sehat ditambah supaya tidak keburu kenyang.',
    sarapan: [['Oatmeal', 2], ['Selai kacang', 2], ['Susu sapi', 1], ['Pisang', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Ayam bakar', 1.5], ['Alpukat', 1], ['Capcay', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ikan nila goreng', 1.5], ['Tempe goreng', 1], ['Sayur asem', 1]],
    camilan: [['Susu sapi', 1], ['Kacang tanah', 1], ['Mangga', 1], ['Air putih', 4]]
  },

  // ===================== REKOMENDASI =====================

  // --- Rekomendasi / turun lemak ---
  {
    id: 'pilihan-cut-protein-tinggi',
    tier: 'pilihan',
    goal: 'cut',
    name: 'Protein tinggi, kalori rendah',
    note: 'Setiap makan punya sumber protein dan sayur. Rasa lapar paling tertahan di pola ini.',
    sarapan: [['Greek yogurt', 1], ['Oatmeal', 2], ['Pisang', 1]],
    siang: [['Nasi merah', 2], ['Dada ayam panggang', 1.5], ['Brokoli rebus', 1]],
    malam: [['Ikan salmon panggang', 1.5], ['Kentang rebus', 1], ['Tumis buncis', 1]],
    camilan: [['Whey protein', 1], ['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-cut-laut',
    tier: 'pilihan',
    goal: 'cut',
    name: 'Hari laut',
    note: 'Tuna dan udang: protein sangat tinggi dengan lemak sangat rendah.',
    sarapan: [['Putih telur', 2], ['Telur rebus', 1], ['Roti tawar gandum', 1.5], ['Jeruk', 1]],
    siang: [['Nasi merah', 2], ['Ikan tuna', 1.5], ['Capcay', 1], ['Alpukat', 1]],
    malam: [['Udang rebus', 1.5], ['Kentang rebus', 2], ['Brokoli rebus', 1], ['Timun / lalapan', 1]],
    camilan: [['Greek yogurt', 1], ['Semangka', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-cut-sapi-tanpa-lemak',
    tier: 'pilihan',
    goal: 'cut',
    name: 'Daging sapi tanpa lemak',
    note: 'Daging merah tetap muat di defisit selama potongannya tanpa lemak.',
    sarapan: [['Putih telur', 2], ['Oatmeal', 2], ['Pepaya', 1]],
    siang: [['Nasi merah', 2], ['Daging sapi tanpa lemak', 1.5], ['Tumis buncis', 1]],
    malam: [['Dada ayam panggang', 1.5], ['Kentang rebus', 1], ['Sup sayur bening', 1]],
    camilan: [['Yogurt plain', 1], ['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-cut-nabati',
    tier: 'pilihan',
    goal: 'cut',
    name: 'Berat ke nabati',
    note: 'Sebagian besar protein dari edamame, tempe, dan tahu. Serat tinggi, kenyang lama.',
    sarapan: [['Greek yogurt', 1], ['Oatmeal', 2], ['Jeruk', 1]],
    siang: [['Nasi merah', 2], ['Edamame rebus', 1], ['Tempe kukus', 2], ['Brokoli rebus', 1]],
    malam: [['Ikan nila goreng', 1.5], ['Kentang rebus', 1], ['Tumis tauge', 1]],
    camilan: [['Whey protein', 1], ['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-cut-latihan-sore',
    tier: 'pilihan',
    goal: 'cut',
    name: 'Latihan sore',
    note: 'Karbohidrat dikumpulkan di sekitar jam latihan, bukan disebar rata seharian.',
    sarapan: [['Putih telur', 2], ['Telur rebus', 1], ['Alpukat', 1]],
    siang: [['Dada ayam panggang', 1.5], ['Kentang rebus', 1], ['Brokoli rebus', 1], ['Timun / lalapan', 1]],
    malam: [['Nasi merah', 3], ['Ikan tuna', 1.5], ['Tumis buncis', 1]],
    camilan: [['Pisang', 2], ['Whey protein', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-cut-defisit-dalam',
    tier: 'pilihan',
    goal: 'cut',
    name: 'Defisit paling dalam',
    note: 'Kalori terendah di seluruh daftar. Jangan dipakai lebih dari beberapa minggu berturut-turut.',
    sarapan: [['Putih telur', 2], ['Greek yogurt', 1], ['Semangka', 1]],
    siang: [['Dada ayam panggang', 1.5], ['Kentang rebus', 2], ['Sup sayur bening', 1]],
    malam: [['Udang rebus', 1.5], ['Brokoli rebus', 1], ['Timun / lalapan', 1], ['Nasi merah', 2]],
    camilan: [['Greek yogurt', 1], ['Jeruk', 1], ['Apel', 1], ['Air putih', 4]]
  },

  // --- Rekomendasi / jaga berat ---
  {
    id: 'pilihan-maintain-seimbang',
    tier: 'pilihan',
    goal: 'maintain',
    name: 'Seimbang sepanjang hari',
    note: 'Protein tersebar rata di empat waktu, sekitar 30 g sekali makan.',
    sarapan: [['Oatmeal', 2], ['Telur ceplok', 3], ['Greek yogurt', 1], ['Pisang', 1]],
    siang: [['Nasi merah', 2], ['Dada ayam panggang', 1.5], ['Capcay', 1], ['Alpukat', 1]],
    malam: [['Nasi putih', 2], ['Ikan salmon panggang', 1.5], ['Tumis buncis', 1]],
    camilan: [['Almond', 1], ['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-maintain-sapi',
    tier: 'pilihan',
    goal: 'maintain',
    name: 'Daging sapi dan telur',
    note: 'Untuk yang lebih suka daging merah daripada ayam.',
    sarapan: [['Telur dadar', 3], ['Roti tawar gandum', 1.5], ['Susu sapi', 1]],
    siang: [['Nasi putih', 2], ['Daging sapi tanpa lemak', 1.5], ['Tumis kangkung', 1]],
    malam: [['Nasi merah', 2], ['Ikan nila goreng', 1.5], ['Capcay', 1], ['Tempe kukus', 1]],
    camilan: [['Greek yogurt', 1], ['Mangga', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-maintain-nabati-berat',
    tier: 'pilihan',
    goal: 'maintain',
    name: 'Nabati sebagai tulang punggung',
    note: 'Hanya satu lauk hewani sehari. Sisanya edamame, tempe, tahu, dan kacang.',
    sarapan: [['Oatmeal', 2], ['Susu kedelai', 1], ['Almond', 1], ['Pisang', 1]],
    siang: [['Nasi merah', 2], ['Edamame rebus', 1], ['Tempe bacem', 1], ['Brokoli rebus', 1]],
    malam: [['Nasi putih', 2], ['Ikan salmon panggang', 1.5], ['Tumis buncis', 1]],
    camilan: [['Greek yogurt', 1], ['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-maintain-cepat',
    tier: 'pilihan',
    goal: 'maintain',
    name: 'Minim masak',
    note: 'Untuk minggu yang padat: hampir semuanya siap dalam sepuluh menit.',
    sarapan: [['Greek yogurt', 1], ['Almond', 1], ['Pisang', 1]],
    siang: [['Nasi putih', 2], ['Ikan tuna', 1.5], ['Timun / lalapan', 1], ['Alpukat', 1], ['Roti tawar gandum', 1]],
    malam: [['Kentang rebus', 3], ['Dada ayam panggang', 1.5], ['Brokoli rebus', 1], ['Almond', 1]],
    camilan: [['Whey protein', 1], ['Apel', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-maintain-hari-latihan',
    tier: 'pilihan',
    goal: 'maintain',
    name: 'Hari latihan berat',
    note: 'Karbohidrat sedikit lebih tinggi untuk mengisi glikogen sebelum sesi besar.',
    sarapan: [['Oatmeal', 2], ['Putih telur', 2], ['Telur ceplok', 1], ['Pisang', 1]],
    siang: [['Nasi putih', 2], ['Ayam bakar', 1.5], ['Capcay', 1]],
    malam: [['Nasi merah', 2], ['Ikan tuna', 1.5], ['Tumis buncis', 1], ['Edamame rebus', 1]],
    camilan: [['Whey protein', 1], ['Mangga', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-maintain-hari-pulih',
    tier: 'pilihan',
    goal: 'maintain',
    name: 'Hari pulih',
    note: 'Karbohidrat turun, protein tetap, sayur naik. Untuk hari tanpa latihan.',
    sarapan: [['Telur dadar', 3], ['Alpukat', 1], ['Jeruk', 1]],
    siang: [['Nasi merah', 2], ['Dada ayam panggang', 1.5], ['Brokoli rebus', 1], ['Tumis tauge', 1]],
    malam: [['Ikan salmon panggang', 1.5], ['Kentang rebus', 1], ['Sup sayur bening', 1]],
    camilan: [['Greek yogurt', 1], ['Almond', 1], ['Air putih', 4]]
  },

  // --- Rekomendasi / naik massa ---
  {
    id: 'pilihan-bulk-bersih',
    tier: 'pilihan',
    goal: 'bulk',
    name: 'Surplus bersih',
    note: 'Kalori naik dari nasi, susu, dan lemak sehat — bukan dari gorengan.',
    sarapan: [['Oatmeal', 2], ['Telur ceplok', 3], ['Selai kacang', 2], ['Susu sapi', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Dada ayam panggang', 1.5], ['Alpukat', 1], ['Capcay', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ikan salmon panggang', 1.5], ['Tumis buncis', 1]],
    camilan: [['Whey protein', 1], ['Pisang', 2], ['Almond', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-bulk-sapi',
    tier: 'pilihan',
    goal: 'bulk',
    name: 'Sapi dan nasi',
    note: 'Daging sapi tiap hari. Kalorinya besar tanpa perlu volume makanan yang banyak.',
    sarapan: [['Nasi uduk', 1.5], ['Telur dadar', 3], ['Susu sapi', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Daging sapi tanpa lemak', 1.5], ['Tumis kangkung', 1], ['Tempe goreng', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ayam bakar', 1.5], ['Capcay', 1]],
    camilan: [['Greek yogurt', 1], ['Pisang', 2], ['Almond', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-bulk-cair',
    tier: 'pilihan',
    goal: 'bulk',
    name: 'Kalori cair',
    note: 'Untuk yang perutnya cepat penuh: sebagian kalori diminum, bukan dikunyah.',
    sarapan: [['Whey protein', 1], ['Oatmeal', 2], ['Selai kacang', 2], ['Susu sapi', 1], ['Pisang', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Ayam suwir kecap', 1.5], ['Alpukat', 1], ['Tumis buncis', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ikan tuna', 1.5], ['Capcay', 1]],
    camilan: [['Susu sapi', 1], ['Whey protein', 1], ['Mangga', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-bulk-lima-kali',
    tier: 'pilihan',
    goal: 'bulk',
    name: 'Lima kali makan',
    note: 'Porsi sedang tapi sering. Paling nyaman untuk surplus besar tanpa begah.',
    sarapan: [['Oatmeal', 2], ['Telur ceplok', 3], ['Greek yogurt', 1], ['Pisang', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Dada ayam panggang', 1.5], ['Edamame rebus', 1], ['Capcay', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Ikan salmon panggang', 1.5], ['Tumis kangkung', 1]],
    camilan: [['Whey protein', 1], ['Roti tawar gandum', 1], ['Selai kacang', 2], ['Almond', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-bulk-hari-kaki',
    tier: 'pilihan',
    goal: 'bulk',
    name: 'Hari kaki',
    note: 'Karbohidrat paling tinggi di seluruh daftar. Untuk hari squat berat.',
    sarapan: [['Oatmeal', 2], ['Putih telur', 2], ['Telur ceplok', 3], ['Pisang', 2]],
    siang: [['Nasi putih porsi besar', 1], ['Ayam bakar', 1.5], ['Kentang rebus', 1], ['Capcay', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Daging sapi tanpa lemak', 1.5], ['Tumis buncis', 1]],
    camilan: [['Whey protein', 1], ['Mangga', 1], ['Susu sapi', 1], ['Air putih', 4]]
  },
  {
    id: 'pilihan-bulk-laut',
    tier: 'pilihan',
    goal: 'bulk',
    name: 'Surplus dari laut',
    note: 'Salmon dan udang sebagai sumber utama, dengan lemak dari alpukat dan almond.',
    sarapan: [['Oatmeal', 2], ['Telur dadar', 3], ['Alpukat', 1], ['Susu sapi', 1]],
    siang: [['Nasi putih porsi besar', 1], ['Ikan salmon panggang', 1.5], ['Brokoli rebus', 1]],
    malam: [['Nasi putih porsi besar', 1], ['Udang rebus', 1.5], ['Edamame rebus', 1], ['Capcay', 1]],
    camilan: [['Greek yogurt', 1], ['Almond', 1], ['Pisang', 2], ['Air putih', 4]]
  }
];
