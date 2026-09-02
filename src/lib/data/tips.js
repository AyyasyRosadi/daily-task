/**
 * Tips harian.
 *
 * Urutannya tidak ditentukan di sini. `src/lib/utils/tips.js` mengacak daftar
 * ini dengan benih tanggal — sama sepanjang hari, berbeda tiap hari — lalu
 * menaikkan tips yang nyambung dengan program yang sedang dijalani.
 *
 * Penanda opsional untuk penargetan, semuanya boleh dikosongkan:
 *   programs  id program bawaan yang paling terbantu tips ini
 *   levels    'Pemula' | 'Menengah' | 'Lanjutan'
 *   places    'Gym' | 'Rumah' | 'Gym atau rumah'
 *   minDays   berlaku kalau program punya minimal sekian hari latihan per minggu
 *
 * Program buatan sendiri ikut kena penargetan lewat `levels` dan `places`,
 * karena bentuk datanya sama persis dengan program bawaan.
 */

export const tipCategories = ['Semua', 'Latihan', 'Nutrisi', 'Istirahat', 'Kebiasaan'];

export const tips = [
  // ============================ LATIHAN ============================
  {
    category: 'Latihan',
    title: 'Naikkan beban sedikit demi sedikit',
    body: 'Kalau repetisi terakhir masih terasa ringan dua minggu berturut-turut, tambah 2,5 kg atau satu repetisi per set. Kenaikan kecil yang konsisten mengalahkan lompatan besar sesekali.'
  },
  {
    category: 'Latihan',
    title: 'Pemanasan 8 menit sudah cukup',
    body: 'Lima menit kardio ringan lalu dua set gerakan utama dengan beban ringan. Peregangan statis panjang sebelum angkat beban justru menurunkan tenaga.'
  },
  {
    category: 'Latihan',
    title: 'Catat beban tiap sesi',
    body: 'Tanpa catatan, sulit tahu apakah kamu benar-benar maju. Tulis beban dan repetisi setiap latihan, lalu targetkan mengalahkan angka minggu lalu.'
  },
  {
    category: 'Latihan',
    title: 'Istirahat antar set sesuai tujuan',
    body: 'Latihan kekuatan 2-3 menit, hipertrofi 60-90 detik, sirkuit metabolik 30-45 detik. Terburu-buru pada latihan berat mengurangi kualitas set berikutnya.'
  },
  {
    category: 'Latihan',
    title: 'Gerakan besar dulu, isolasi belakangan',
    body: 'Squat, deadlift, bench, dan row menuntut tenaga dan konsentrasi paling banyak. Kerjakan saat masih segar; curl dan lateral raise tetap bisa dikerjakan dengan badan yang sudah lelah.',
    programs: ['push-pull-legs', 'upper-lower']
  },
  {
    category: 'Latihan',
    title: 'Sisakan satu sampai dua repetisi',
    body: 'Berhenti saat kamu masih sanggup satu atau dua repetisi lagi dengan bentuk yang benar. Set sampai gagal total menambah kelelahan jauh lebih banyak daripada tambahan hasilnya.'
  },
  {
    category: 'Latihan',
    title: 'Turunkan beban dengan terkontrol',
    body: 'Bagian menurunkan beban sama pentingnya dengan mengangkat. Dua detik turun, satu detik naik. Beban yang jatuh bebas melewatkan separuh manfaat gerakannya.'
  },
  {
    category: 'Latihan',
    title: 'Rentang gerak penuh, beban lebih ringan',
    body: 'Setengah squat dengan beban besar kalah oleh squat penuh dengan beban lebih ringan. Kalau rentang geraknya menyusut, bebannya sudah terlalu berat.'
  },
  {
    category: 'Latihan',
    title: 'Latih kaki, jangan dilewati',
    body: 'Kaki adalah kelompok otot terbesar di badan. Melewatinya bukan cuma soal bentuk — kekuatan pinggul dan paha yang menopang hampir semua gerakan lain.'
  },
  {
    category: 'Latihan',
    title: 'Tarikan sebanyak dorongan',
    body: 'Bench press dan overhead press menarik bahu ke depan. Imbangi dengan row dan face pull dalam jumlah set yang setara supaya postur tidak makin membungkuk.',
    programs: ['push-pull-legs', 'upper-lower']
  },
  {
    category: 'Latihan',
    title: 'Full body tiga kali seminggu sudah cukup',
    body: 'Untuk yang baru mulai, tiap otot dilatih tiga kali seminggu dengan volume sedang lebih cepat membuahkan hasil daripada split rumit yang jarang dijalani.',
    programs: ['full-body-start'],
    levels: ['Pemula']
  },
  {
    category: 'Latihan',
    title: 'Kuasai gerakannya sebelum menambah beban',
    body: 'Dua sampai tiga minggu pertama sebaiknya dipakai membiasakan pola gerak dengan beban ringan. Beban yang naik di atas teknik yang belum jadi hanya menunda cedera.',
    programs: ['full-body-start', 'home-bodyweight'],
    levels: ['Pemula']
  },
  {
    category: 'Latihan',
    title: 'Enam hari latihan menuntut pemulihan yang serius',
    body: 'Program padat hanya berhasil kalau tidur dan makannya ikut naik. Kalau beban mandek dua minggu sementara badan makin lelah, kurangi jadi lima hari.',
    programs: ['push-pull-legs'],
    minDays: 6
  },
  {
    category: 'Latihan',
    title: 'Upper lower memberi dua stimulus per minggu',
    body: 'Tiap otot terlatih dua kali seminggu tanpa sesi yang terlalu panjang. Kalau harus melewatkan satu hari, geser — jangan digabung jadi satu sesi raksasa.',
    programs: ['upper-lower']
  },
  {
    category: 'Latihan',
    title: 'Tanpa beban, naikkan kesulitan lewat posisi',
    body: 'Push up bisa dipersulit dengan mengangkat kaki, memperlambat turunnya, atau berhenti sebentar di bawah. Berat badan tidak bertambah, tapi bebannya bertambah.',
    programs: ['home-bodyweight'],
    places: ['Rumah']
  },
  {
    category: 'Latihan',
    title: 'Latihan di rumah butuh repetisi lebih tinggi',
    body: 'Tanpa beban tambahan, rangsangan datang dari repetisi dan waktu di bawah tegangan. Set 15-25 repetisi yang mendekati batas lebih efektif daripada 8 repetisi santai.',
    programs: ['home-bodyweight'],
    places: ['Rumah']
  },
  {
    category: 'Latihan',
    title: 'Saat defisit, pertahankan beban',
    body: 'Selama menurunkan lemak, tugas latihan beban adalah menjaga otot yang sudah ada. Jangan kejar rekor baru; jaga beban tetap sambil kalori turun.',
    programs: ['lean-cut']
  },
  {
    category: 'Latihan',
    title: 'Kardio secukupnya saat memotong lemak',
    body: 'Kardio membantu defisit, tapi terlalu banyak menggerogoti pemulihan latihan beban. Mulai dari yang paling sedikit yang masih membuat berat turun.',
    programs: ['lean-cut']
  },
  {
    category: 'Latihan',
    title: 'Napas: tahan saat berat, buang saat mudah',
    body: 'Tarik napas dan tahan sebelum turun, buang setelah melewati titik tersulit. Perut yang terisi napas membuat batang tubuh jauh lebih stabil di beban besar.',
    levels: ['Menengah', 'Lanjutan']
  },
  {
    category: 'Latihan',
    title: 'Nyeri sendi bukan hal yang ditahan',
    body: 'Pegal otot wajar; nyeri tajam di sendi tidak. Ganti gerakannya dengan variasi lain untuk kelompok otot yang sama, dan periksa kalau tidak membaik dalam seminggu.'
  },
  {
    category: 'Latihan',
    title: 'Volume yang berguna ada batasnya',
    body: 'Sekitar 10-20 set per kelompok otot per minggu sudah menutup sebagian besar manfaatnya. Menambah terus di atas itu lebih banyak menambah lelah daripada hasil.',
    levels: ['Menengah', 'Lanjutan']
  },
  {
    category: 'Latihan',
    title: 'Sesi yang panjang bukan sesi yang baik',
    body: 'Setelah sekitar 75 menit, kualitas set biasanya sudah turun. Kalau sesimu selalu lewat dua jam, kemungkinan besar istirahat antar setnya yang kepanjangan.'
  },
  {
    category: 'Latihan',
    title: 'Ganti gerakan, bukan batalkan latihan',
    body: 'Alat dipakai orang lain bukan alasan pulang. Hampir semua gerakan punya pengganti yang melatih kelompok otot sama dengan alat yang berbeda.'
  },
  {
    category: 'Latihan',
    title: 'Naikkan beban lebih pelan pada gerakan atas badan',
    body: 'Squat dan deadlift bisa naik 2,5-5 kg per minggu di awal. Bench dan overhead press biasanya hanya sanggup separuhnya. Menyamakan targetnya membuat teknik cepat rusak.'
  },

  // ============================ NUTRISI ============================
  {
    category: 'Nutrisi',
    title: 'Protein disebar sepanjang hari',
    body: 'Bagi kebutuhan protein ke 3-4 waktu makan, sekitar 25-40 g sekali makan. Lebih mudah dicerna dan lebih baik untuk pemulihan otot dibanding satu porsi besar.'
  },
  {
    category: 'Nutrisi',
    title: 'Karbohidrat bukan musuh',
    body: 'Karbohidrat mengisi glikogen otot yang jadi bahan bakar utama saat angkat beban. Kurangi porsinya kalau perlu, tapi jangan dihilangkan di hari latihan berat.'
  },
  {
    category: 'Nutrisi',
    title: 'Minum sebelum haus',
    body: 'Turun 2% cairan tubuh sudah menurunkan performa. Target sekitar 2,5-3,5 liter sehari, lebih banyak kalau latihan di ruangan panas seperti kebanyakan gym di Jakarta.'
  },
  {
    category: 'Nutrisi',
    title: 'Makan setelah latihan tidak perlu buru-buru',
    body: 'Jendela waktunya jauh lebih longgar dari yang sering diceritakan. Yang penting total protein dan kalori harianmu tercapai, bukan makan dalam 30 menit setelah set terakhir.'
  },
  {
    category: 'Nutrisi',
    title: 'Telur dan tempe adalah protein termurah',
    body: 'Per gram protein, telur dan tempe hampir selalu mengalahkan dada ayam, apalagi suplemen. Menu hemat di halaman Nutrisi disusun di sekitar dua bahan ini.'
  },
  {
    category: 'Nutrisi',
    title: 'Kalori cair paling gampang terlewat',
    body: 'Satu es teh manis dan satu minuman kemasan bisa menambah 300 kkal tanpa membuat kenyang sama sekali. Ini yang paling sering membuat defisit tidak jalan.',
    programs: ['lean-cut']
  },
  {
    category: 'Nutrisi',
    title: 'Suplemen paling akhir, bukan paling awal',
    body: 'Whey hanya protein bubuk yang praktis, bukan sesuatu yang tidak bisa digantikan makanan. Selesaikan dulu tidur, protein harian, dan konsistensi latihan.'
  },
  {
    category: 'Nutrisi',
    title: 'Surplus yang terlalu besar jadi lemak',
    body: 'Naik 0,25-0,5 kg per minggu sudah cukup cepat untuk menambah otot. Lebih dari itu, sebagian besar tambahannya bukan otot dan harus dipotong lagi nanti.',
    programs: ['push-pull-legs']
  },
  {
    category: 'Nutrisi',
    title: 'Defisit yang terlalu dalam memakan otot',
    body: 'Turun lebih dari sekitar 1% berat badan per minggu biasanya ikut mengambil otot dan membuat tenaga latihan anjlok. Pelan justru lebih hemat waktu.',
    programs: ['lean-cut']
  },
  {
    category: 'Nutrisi',
    title: 'Sayur untuk rasa kenyang, bukan untuk kalori',
    body: 'Semangkuk sayur menambah volume makanan tanpa menambah kalori berarti. Ini alat paling murah untuk bertahan di defisit tanpa terus merasa lapar.',
    programs: ['lean-cut']
  },
  {
    category: 'Nutrisi',
    title: 'Gorengan bukan haram, tapi mahal kalorinya',
    body: 'Satu bakwan sekitar 140 kkal dengan protein hampir nol. Bukan berarti dilarang — hanya perlu tahu bahwa tiga potong setara satu porsi nasi lengkap.'
  },
  {
    category: 'Nutrisi',
    title: 'Sarapan tidak wajib, tapi protein pagi membantu',
    body: 'Melewatkan sarapan tidak merusak apa pun kalau total harianmu tetap tercapai. Tapi mengejar 120 g protein hanya dalam dua kali makan biasanya lebih berat.'
  },
  {
    category: 'Nutrisi',
    title: 'Timbang makanan selama seminggu saja',
    body: 'Tidak perlu selamanya. Satu minggu menimbang cukup untuk mengalibrasi tebakanmu, dan setelah itu perkiraan mata biasanya sudah jauh lebih akurat.'
  },
  {
    category: 'Nutrisi',
    title: 'Nasi padang sekali tidak menggagalkan apa pun',
    body: 'Yang menentukan hasil adalah rata-rata seminggu, bukan satu makan. Satu porsi besar bisa ditebus dengan makan berikutnya yang lebih ringan.'
  },
  {
    category: 'Nutrisi',
    title: 'Serat sering terlupakan saat memotong lemak',
    body: 'Saat porsi turun, serat ikut turun dan pencernaan jadi bermasalah. Sayur, buah, dan kacang-kacangan menjaga hal ini tanpa banyak menambah kalori.',
    programs: ['lean-cut']
  },
  {
    category: 'Nutrisi',
    title: 'Latihan di rumah tetap butuh protein yang sama',
    body: 'Tidak ada beban bukan berarti kebutuhan proteinnya lebih rendah. Otot yang dipaksa bekerja tetap perlu bahan untuk diperbaiki.',
    programs: ['home-bodyweight'],
    places: ['Rumah']
  },
  {
    category: 'Nutrisi',
    title: 'Makan sebelum latihan: 1-2 jam, jangan berat',
    body: 'Karbohidrat yang gampang dicerna satu sampai dua jam sebelumnya sudah cukup. Makan besar tepat sebelum latihan biasanya hanya membuat begah.'
  },
  {
    category: 'Nutrisi',
    title: 'Alkohol memukul pemulihan dua kali',
    body: 'Selain kalorinya, alkohol mengganggu tidur dan pembentukan protein otot. Kalau sedang mengejar hasil, ini pos yang paling murah untuk dipotong.'
  },

  // ============================ ISTIRAHAT ============================
  {
    category: 'Istirahat',
    title: 'Tidur adalah sesi latihan keempat',
    body: 'Kurang dari 6 jam tidur menurunkan kekuatan dan memperlambat pemulihan. Kalau harus memilih antara latihan jam 11 malam atau tidur cukup, pilih tidur.'
  },
  {
    category: 'Istirahat',
    title: 'Nyeri otot bukan ukuran keberhasilan',
    body: 'Otot pegal hanya menandakan stimulus yang belum terbiasa. Ukuran sebenarnya adalah beban yang naik dan badan yang berubah dari bulan ke bulan.'
  },
  {
    category: 'Istirahat',
    title: 'Ambil minggu ringan tiap 6-8 minggu',
    body: 'Turunkan volume sekitar setengah selama satu minggu. Sendi dan sistem saraf ikut pulih, dan biasanya kekuatan justru naik setelahnya.',
    levels: ['Menengah', 'Lanjutan']
  },
  {
    category: 'Istirahat',
    title: 'Jam tidur yang tetap mengalahkan jumlah jamnya',
    body: 'Tidur dan bangun di jam yang sama tiap hari membuat kualitas tidurnya jauh lebih baik daripada jumlah jam yang berantakan tapi banyak.'
  },
  {
    category: 'Istirahat',
    title: 'Hari pulih bukan hari rebahan total',
    body: 'Jalan kaki 20-30 menit di hari libur latihan mempercepat pemulihan dibanding diam sepenuhnya. Ringan saja — ini bukan sesi tambahan.'
  },
  {
    category: 'Istirahat',
    title: 'Tanda kamu perlu istirahat lebih',
    body: 'Beban yang biasanya ringan terasa berat, tidur memburuk, dan minat latihan hilang beberapa hari berturut-turut. Itu bukan malas — itu belum pulih.',
    minDays: 5
  },
  {
    category: 'Istirahat',
    title: 'Otot besar butuh jeda lebih panjang',
    body: 'Setelah hari kaki berat, 48-72 jam sebelum melatih kaki lagi itu wajar. Otot kecil seperti bahu dan lengan biasanya siap lebih cepat.'
  },
  {
    category: 'Istirahat',
    title: 'Layar sebelum tidur menunda kantuk',
    body: 'Bukan mitos yang berlebihan, tapi juga bukan penentu segalanya. Kalau susah tidur, ini salah satu hal termudah yang bisa dicoba diubah lebih dulu.'
  },
  {
    category: 'Istirahat',
    title: 'Melewatkan satu sesi tidak menghapus apa pun',
    body: 'Otot tidak menyusut dalam beberapa hari. Kalau badan minta libur, ambil — kerugiannya jauh lebih kecil daripada memaksa lalu cedera.'
  },
  {
    category: 'Istirahat',
    title: 'Peregangan setelah latihan, bukan sebelum',
    body: 'Peregangan statis paling berguna saat otot sudah hangat. Sepuluh menit setelah sesi lebih bermanfaat daripada memaksakannya di awal.'
  },
  {
    category: 'Istirahat',
    title: 'Program lima hari perlu satu hari benar-benar kosong',
    body: 'Latihan lima hari seminggu hanya berkelanjutan kalau ada satu hari tanpa apa pun. Menyisipkan kardio di semua hari libur menghapus manfaat liburnya.',
    programs: ['lean-cut', 'home-bodyweight'],
    minDays: 5
  },

  // ============================ KEBIASAAN ============================
  {
    category: 'Kebiasaan',
    title: 'Siapkan tas gym malam sebelumnya',
    body: 'Keputusan yang sudah diambil semalam tidak perlu diperdebatkan lagi besok sore. Hambatan kecil seperti ini yang paling sering membatalkan latihan.'
  },
  {
    category: 'Kebiasaan',
    title: 'Sesi 20 menit tetap dihitung',
    body: 'Hari sibuk lebih baik diisi latihan pendek daripada dilewati. Rantai kebiasaan yang tidak putus lebih berharga daripada satu sesi sempurna.'
  },
  {
    category: 'Kebiasaan',
    title: 'Ukur badan, bukan cuma timbangan',
    body: 'Berat badan naik turun karena air dan isi perut. Tambahkan foto tiap dua minggu dan lingkar pinggang supaya gambarannya lebih jujur.'
  },
  {
    category: 'Kebiasaan',
    title: 'Timbang di jam yang sama',
    body: 'Pagi setelah ke kamar mandi, sebelum makan dan minum. Bandingkan rata-rata mingguan, bukan angka harian yang bisa berbeda dua kilogram tanpa alasan.'
  },
  {
    category: 'Kebiasaan',
    title: 'Latihan di jam yang sama tiap hari',
    body: 'Jam yang tetap mengubah latihan dari keputusan harian jadi kebiasaan. Jam terbaik adalah jam yang paling mungkin kamu jalani terus-menerus.'
  },
  {
    category: 'Kebiasaan',
    title: 'Dua hari terlewat, jangan sampai tiga',
    body: 'Satu hari bolong itu normal. Yang berbahaya adalah rantai yang putus dan tidak pernah disambung. Buat aturan sendiri: tidak pernah bolos dua kali berturut-turut.'
  },
  {
    category: 'Kebiasaan',
    title: 'Jangan ganti program terlalu cepat',
    body: 'Program apa pun butuh 8-12 minggu untuk terlihat hasilnya. Berpindah tiap beberapa minggu membuatmu selalu berada di bagian yang paling tidak produktif.'
  },
  {
    category: 'Kebiasaan',
    title: 'Bandingkan dengan dirimu tiga bulan lalu',
    body: 'Membandingkan diri dengan orang di gym sebelah hampir selalu menyesatkan — genetik, waktu latihan, dan titik awalnya berbeda. Catatanmu sendiri pembanding yang jujur.'
  },
  {
    category: 'Kebiasaan',
    title: 'Rencanakan hari yang berantakan sejak sekarang',
    body: 'Akan ada minggu dengan lembur dan acara keluarga. Putuskan dari sekarang versi minimalnya: satu sesi 20 menit, gerakan besar saja.'
  },
  {
    category: 'Kebiasaan',
    title: 'Latihan di rumah butuh tempat tetap',
    body: 'Satu sudut yang selalu siap dipakai menghilangkan alasan terbesar batal latihan di rumah: harus membereskan ruangan dulu.',
    programs: ['home-bodyweight'],
    places: ['Rumah']
  },
  {
    category: 'Kebiasaan',
    title: 'Foto progres lebih jujur daripada cermin',
    body: 'Cermin dilihat tiap hari sehingga perubahannya tidak terasa. Foto dengan pose dan pencahayaan sama tiap dua minggu menunjukkan hal yang berbeda.'
  },
  {
    category: 'Kebiasaan',
    title: 'Satu perubahan sekaligus',
    body: 'Mengubah pola latihan, pola makan, dan jam tidur berbarengan membuatmu tidak tahu mana yang berhasil. Dan biasanya ketiganya sama-sama gagal bertahan.'
  }
];
