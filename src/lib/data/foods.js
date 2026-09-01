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

// Menu harian per tujuan. Angka kalori dan protein adalah perkiraan per porsi.
export const mealPlans = {
  cut: [
    {
      slot: 'Sarapan',
      time: '06.30',
      items: [
        { name: 'Oatmeal air + pisang + putih telur 3 butir', kcal: 380, protein: 24 },
        { name: 'Telur rebus 2 + roti gandum 2 lembar', kcal: 340, protein: 20 }
      ]
    },
    {
      slot: 'Makan siang',
      time: '12.30',
      items: [
        { name: 'Nasi merah 150 g + dada ayam bakar 150 g + tumis buncis', kcal: 520, protein: 45 },
        { name: 'Pecel sayur + tempe kukus + telur rebus', kcal: 480, protein: 28 }
      ]
    },
    {
      slot: 'Sebelum latihan',
      time: '16.00',
      items: [
        { name: 'Pisang + kopi hitam tanpa gula', kcal: 110, protein: 1 },
        { name: 'Roti gandum 1 lembar + selai kacang tipis', kcal: 180, protein: 7 }
      ]
    },
    {
      slot: 'Setelah latihan',
      time: '19.00',
      items: [
        { name: 'Ikan kembung bakar + nasi 100 g + lalapan', kcal: 470, protein: 38 },
        { name: 'Susu rendah lemak 250 ml + telur rebus 2', kcal: 280, protein: 24 }
      ]
    },
    {
      slot: 'Camilan malam',
      time: '21.00',
      items: [
        { name: 'Yogurt plain 150 g + kayu manis', kcal: 130, protein: 12 },
        { name: 'Edamame rebus 100 g', kcal: 120, protein: 11 }
      ]
    }
  ],
  maintain: [
    {
      slot: 'Sarapan',
      time: '06.30',
      items: [
        { name: 'Nasi uduk porsi kecil + telur dadar + tempe orek', kcal: 520, protein: 22 },
        { name: 'Oatmeal susu + selai kacang + pisang', kcal: 480, protein: 20 }
      ]
    },
    {
      slot: 'Camilan pagi',
      time: '10.00',
      items: [
        { name: 'Susu 250 ml + pisang', kcal: 240, protein: 10 },
        { name: 'Kacang almond 25 g', kcal: 150, protein: 6 }
      ]
    },
    {
      slot: 'Makan siang',
      time: '12.30',
      items: [
        { name: 'Nasi 200 g + ayam kecap + sayur bening bayam', kcal: 680, protein: 42 },
        { name: 'Soto ayam + nasi + telur rebus', kcal: 620, protein: 38 }
      ]
    },
    {
      slot: 'Sebelum latihan',
      time: '16.00',
      items: [
        { name: 'Roti tawar 2 lembar + madu', kcal: 220, protein: 6 },
        { name: 'Kurma 4 butir', kcal: 110, protein: 1 }
      ]
    },
    {
      slot: 'Makan malam',
      time: '19.30',
      items: [
        { name: 'Nasi 150 g + ikan nila bakar + capcay', kcal: 600, protein: 40 },
        { name: 'Ayam suwir + kentang rebus + salad', kcal: 560, protein: 42 }
      ]
    }
  ],
  bulk: [
    {
      slot: 'Sarapan',
      time: '06.30',
      items: [
        { name: 'Nasi goreng telur + ayam suwir + susu 250 ml', kcal: 760, protein: 34 },
        { name: 'Oatmeal susu full cream + selai kacang + pisang 2', kcal: 700, protein: 26 }
      ]
    },
    {
      slot: 'Camilan pagi',
      time: '10.00',
      items: [
        { name: 'Roti gandum 2 + telur 2 + susu', kcal: 520, protein: 28 },
        { name: 'Smoothie pisang, oat, susu, selai kacang', kcal: 560, protein: 22 }
      ]
    },
    {
      slot: 'Makan siang',
      time: '12.30',
      items: [
        { name: 'Nasi 250 g + rendang + telur balado + sayur', kcal: 900, protein: 48 },
        { name: 'Nasi 250 g + ayam bakar 2 potong + tahu tempe', kcal: 850, protein: 52 }
      ]
    },
    {
      slot: 'Sebelum latihan',
      time: '16.00',
      items: [
        { name: 'Pisang 2 + roti + madu', kcal: 340, protein: 6 },
        { name: 'Nasi kecil + telur dadar', kcal: 380, protein: 16 }
      ]
    },
    {
      slot: 'Setelah latihan',
      time: '19.30',
      items: [
        { name: 'Nasi 200 g + dada ayam 200 g + sayur + susu', kcal: 880, protein: 62 },
        { name: 'Mie ayam porsi besar + telur + tambahan ayam', kcal: 820, protein: 44 }
      ]
    },
    {
      slot: 'Camilan malam',
      time: '21.30',
      items: [
        { name: 'Susu full cream 250 ml + kacang 30 g', kcal: 350, protein: 14 },
        { name: 'Yogurt + granola + madu', kcal: 320, protein: 12 }
      ]
    }
  ]
};

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
