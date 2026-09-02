/**
 * Pustaka gerakan: panduan form singkat dan kesalahan yang paling sering terjadi.
 *
 * `equipment` dipakai untuk mencari pengganti saat alat sedang dipakai orang lain.
 * `cues` sengaja dibatasi 2-3 poin — panduan yang terlalu panjang tidak akan dibaca
 * orang yang sedang berdiri di antara set.
 */

export const equipmentLabel = {
  barbel: 'Barbel',
  dumbbell: 'Dumbbell',
  mesin: 'Mesin',
  kabel: 'Kabel',
  tubuh: 'Berat badan',
  kettlebell: 'Kettlebell',
  tali: 'Tali',
  kardio: 'Kardio'
};

export const exercises = {
  // --- Kaki ---
  'Back squat': {
    group: 'kaki',
    equipment: 'barbel',
    cues: [
      'Barbel bertumpu di otot punggung atas, bukan di tulang leher.',
      'Turun sampai pangkal paha sejajar lutut, dada tetap tegak.',
      'Dorong lantai dengan seluruh telapak kaki saat naik.'
    ],
    mistake: 'Lutut jatuh ke dalam saat naik. Dorong lutut ke arah jempol kaki.'
  },
  'Front squat': {
    group: 'kaki',
    equipment: 'barbel',
    cues: [
      'Barbel di depan bahu, siku tinggi menghadap depan.',
      'Badan lebih tegak daripada back squat.',
      'Jaga siku tetap naik sepanjang gerakan.'
    ],
    mistake: 'Siku turun sehingga barbel menggelinding ke depan.'
  },
  'Goblet squat': {
    group: 'kaki',
    equipment: 'dumbbell',
    cues: [
      'Peluk satu dumbbell di depan dada.',
      'Turun perlahan, siku lewat di dalam lutut.',
      'Beban di depan membantu badan tetap tegak.'
    ],
    mistake: 'Punggung membungkuk karena beban terlalu berat.'
  },
  'Bodyweight squat': {
    group: 'kaki',
    equipment: 'tubuh',
    cues: ['Kaki selebar bahu.', 'Turun sampai paha sejajar lantai.', 'Berat merata di telapak kaki.'],
    mistake: 'Tumit terangkat. Lebarkan kuda-kuda sedikit.'
  },
  'Bulgarian split squat': {
    group: 'kaki',
    equipment: 'dumbbell',
    cues: [
      'Punggung kaki belakang di bangku, kaki depan selangkah ke depan.',
      'Turun lurus ke bawah, bukan ke depan.',
      'Berat bertumpu di kaki depan.'
    ],
    mistake: 'Kaki depan terlalu dekat bangku sehingga lutut tertekan.'
  },
  'Reverse lunge': {
    group: 'kaki',
    equipment: 'dumbbell',
    cues: ['Melangkah ke belakang, bukan ke depan.', 'Lutut belakang hampir menyentuh lantai.', 'Badan tegak.'],
    mistake: 'Langkah terlalu pendek sehingga lutut depan melewati jari kaki.'
  },
  'Walking lunge': {
    group: 'kaki',
    equipment: 'dumbbell',
    cues: ['Melangkah panjang ke depan.', 'Turunkan lutut belakang mendekati lantai.', 'Dorong dengan tumit depan.'],
    mistake: 'Badan condong ke depan karena langkah kependekan.'
  },
  'Romanian deadlift': {
    group: 'kaki',
    equipment: 'barbel',
    cues: [
      'Dorong pinggul ke belakang, lutut hanya sedikit menekuk.',
      'Barbel menyusur dekat paha.',
      'Berhenti saat terasa tarikan di paha belakang.'
    ],
    mistake: 'Punggung membulat. Turunkan beban dan jaga dada tetap terbuka.'
  },
  'Deadlift': {
    group: 'punggung',
    equipment: 'barbel',
    cues: [
      'Barbel di atas tengah telapak kaki, bahu sedikit di depan barbel.',
      'Tegangkan punggung sebelum menarik.',
      'Dorong lantai dan luruskan pinggul bersamaan.'
    ],
    mistake: 'Pinggul naik duluan sehingga jadi tarikan punggung bawah.'
  },
  'Hip thrust': {
    group: 'kaki',
    equipment: 'barbel',
    cues: ['Punggung atas bertumpu di bangku.', 'Dorong lewat tumit.', 'Kunci bokong di posisi atas satu detik.'],
    mistake: 'Punggung bawah melengkung berlebihan di puncak.'
  },
  'Glute bridge': {
    group: 'kaki',
    equipment: 'tubuh',
    cues: ['Telentang, lutut menekuk.', 'Angkat pinggul sampai badan lurus.', 'Remas bokong di atas.'],
    mistake: 'Mendorong lewat ujung kaki, bukan tumit.'
  },
  'Leg press': {
    group: 'kaki',
    equipment: 'mesin',
    cues: ['Kaki selebar bahu di tengah papan.', 'Turun sampai lutut sekitar 90 derajat.', 'Jangan kunci lutut di atas.'],
    mistake: 'Turun terlalu dalam sampai pinggul terangkat dari sandaran.'
  },
  'Leg curl': {
    group: 'kaki',
    equipment: 'mesin',
    cues: ['Bantalan tepat di atas tumit.', 'Tekuk perlahan.', 'Tahan sebentar di posisi paling tertekuk.'],
    mistake: 'Pinggul terangkat untuk membantu. Tetap menempel di bantalan.'
  },
  'Leg extension': {
    group: 'kaki',
    equipment: 'mesin',
    cues: ['Sandaran diatur supaya lutut sejajar poros mesin.', 'Luruskan kaki pelan.', 'Turunkan dengan terkontrol.'],
    mistake: 'Menghentak beban ke atas dengan ayunan.'
  },
  'Calf raise': {
    group: 'kaki',
    equipment: 'tubuh',
    cues: ['Naik setinggi mungkin di ujung kaki.', 'Tahan sebentar di puncak.', 'Turun perlahan sampai tumit di bawah pijakan.'],
    mistake: 'Memantul cepat tanpa jeda di atas.'
  },
  'Standing calf raise': {
    group: 'kaki',
    equipment: 'mesin',
    cues: ['Bahu rapat di bantalan.', 'Rentang gerak penuh, atas dan bawah.', 'Lutut tetap lurus.'],
    mistake: 'Menekuk lutut sehingga beban pindah ke paha.'
  },
  'Kettlebell swing': {
    group: 'kaki',
    equipment: 'kettlebell',
    cues: [
      'Tenaga dari dorongan pinggul, bukan angkatan bahu.',
      'Kettlebell diayun sampai setinggi dada.',
      'Punggung tetap datar sepanjang ayunan.'
    ],
    mistake: 'Jadi squat lalu mengangkat dengan lengan.'
  },
  'Squat jump': {
    group: 'kaki',
    equipment: 'tubuh',
    cues: ['Turun setengah squat.', 'Meledak ke atas.', 'Mendarat lembut dengan lutut menekuk.'],
    mistake: 'Mendarat dengan kaki kaku. Sendi harus meredam.'
  },
  "World's greatest stretch": {
    group: 'kaki',
    equipment: 'tubuh',
    cues: [
      'Melangkah panjang ke depan seperti lunge.',
      'Turunkan siku sisi dalam ke arah lantai.',
      'Putar dada ke atas mengikuti tangan yang terangkat.'
    ],
    mistake: 'Terburu-buru. Tahan tiap posisi dua tarikan napas sebelum berganti sisi.'
  },
  'Hip flexor stretch': {
    group: 'kaki',
    equipment: 'tubuh',
    cues: ['Posisi setengah berlutut.', 'Selipkan panggul ke depan.', 'Tahan 30 detik tiap sisi.'],
    mistake: 'Melengkungkan punggung bawah, bukan meregangkan pangkal paha.'
  },

  // --- Dada ---
  'Barbell bench press': {
    group: 'dada',
    equipment: 'barbel',
    cues: [
      'Tulang belikat ditarik ke belakang dan ke bawah.',
      'Turunkan barbel ke tengah dada.',
      'Kaki menapak kuat di lantai.'
    ],
    mistake: 'Memantulkan barbel di dada. Selalu pakai pengaman kalau latihan sendiri.'
  },
  'Dumbbell bench press': {
    group: 'dada',
    equipment: 'dumbbell',
    cues: ['Dumbbell sejajar dada.', 'Turun sampai terasa regangan.', 'Dorong ke atas sedikit menyatu.'],
    mistake: 'Rentang gerak terlalu pendek karena beban kelewat berat.'
  },
  'Bench press dumbbell': {
    group: 'dada',
    equipment: 'dumbbell',
    cues: ['Sama dengan dumbbell bench press.', 'Pergelangan tangan lurus.', 'Turun terkontrol.'],
    mistake: 'Siku melebar 90 derajat penuh sehingga bahu tertekan.'
  },
  'Incline dumbbell press': {
    group: 'dada',
    equipment: 'dumbbell',
    cues: ['Bangku dimiringkan 30-45 derajat.', 'Menyasar dada bagian atas.', 'Siku sekitar 45 derajat dari badan.'],
    mistake: 'Kemiringan terlalu tegak sehingga jadi latihan bahu.'
  },
  'Cable fly': {
    group: 'dada',
    equipment: 'kabel',
    cues: ['Siku sedikit menekuk dan dikunci.', 'Gerakan memeluk, bukan mendorong.', 'Remas dada di tengah.'],
    mistake: 'Menekuk siku seperti press sehingga jadi gerakan lain.'
  },
  Dip: {
    group: 'dada',
    equipment: 'tubuh',
    cues: ['Badan condong sedikit ke depan untuk dada.', 'Turun sampai bahu sejajar siku.', 'Bahu tetap jauh dari telinga.'],
    mistake: 'Turun terlalu dalam sehingga bahu tertarik.'
  },
  'Push up': {
    group: 'dada',
    equipment: 'tubuh',
    cues: ['Badan lurus dari kepala ke tumit.', 'Tangan sedikit lebih lebar dari bahu.', 'Turun sampai dada hampir menyentuh lantai.'],
    mistake: 'Pinggul melorot. Kencangkan perut dan bokong.'
  },

  // --- Punggung ---
  'Pull up': {
    group: 'punggung',
    equipment: 'tubuh',
    cues: ['Gantung penuh dengan bahu aktif.', 'Tarik siku ke arah pinggang.', 'Dagu melewati palang.'],
    mistake: 'Mengayun badan. Kalau belum kuat, pakai band atau mesin bantuan.'
  },
  'Weighted pull up': {
    group: 'punggung',
    equipment: 'tubuh',
    cues: ['Tambah beban hanya kalau sudah bisa 8 repetisi bersih.', 'Rentang gerak tetap penuh.', 'Turun terkontrol.'],
    mistake: 'Menambah beban sambil memperpendek rentang gerak.'
  },
  'Lat pulldown': {
    group: 'punggung',
    equipment: 'mesin',
    cues: ['Dada dibusungkan.', 'Tarik batang ke tulang selangka.', 'Turunkan bahu sebelum menarik.'],
    mistake: 'Menarik di belakang leher. Berisiko untuk bahu.'
  },
  'Barbell row': {
    group: 'punggung',
    equipment: 'barbel',
    cues: ['Badan condong sekitar 45 derajat.', 'Tarik ke arah pusar.', 'Punggung tetap datar.'],
    mistake: 'Badan ikut naik-turun mengikuti tarikan.'
  },
  'Pendlay row': {
    group: 'punggung',
    equipment: 'barbel',
    cues: ['Badan sejajar lantai.', 'Barbel berhenti penuh di lantai tiap repetisi.', 'Tarikan eksplosif.'],
    mistake: 'Badan naik saat menarik sehingga jadi barbell row biasa.'
  },
  'Dumbbell row': {
    group: 'punggung',
    equipment: 'dumbbell',
    cues: ['Satu lutut dan satu tangan di bangku.', 'Tarik dumbbell ke pinggang.', 'Punggung datar.'],
    mistake: 'Memutar badan untuk mengangkat lebih berat.'
  },
  'Chest supported row': {
    group: 'punggung',
    equipment: 'mesin',
    cues: ['Dada menempel di bantalan.', 'Tarik dengan siku.', 'Remas tulang belikat di akhir.'],
    mistake: 'Menarik dengan tangan, bukan punggung.'
  },
  'Seated row': {
    group: 'punggung',
    equipment: 'mesin',
    cues: ['Punggung tegak, dada terbuka.', 'Tarik pegangan ke perut.', 'Jangan ayunkan badan ke belakang.'],
    mistake: 'Membungkuk jauh ke depan saat beban kembali.'
  },
  'Cable row': {
    group: 'punggung',
    equipment: 'kabel',
    cues: ['Sama dengan seated row.', 'Kontrol beban saat kembali.', 'Remas tulang belikat.'],
    mistake: 'Menggerakkan badan maju-mundur seperti mendayung perahu.'
  },
  'Inverted row (meja)': {
    group: 'punggung',
    equipment: 'tubuh',
    cues: ['Berbaring di bawah meja kokoh.', 'Badan lurus.', 'Tarik dada ke tepi meja.'],
    mistake: 'Pinggul turun duluan. Kencangkan perut.'
  },
  'Superman hold': {
    group: 'punggung',
    equipment: 'tubuh',
    cues: ['Telungkup, angkat dada dan paha.', 'Leher netral menghadap lantai.', 'Tahan sesuai waktu.'],
    mistake: 'Mendongak sehingga leher tertekan.'
  },

  // --- Bahu ---
  'Overhead press': {
    group: 'bahu',
    equipment: 'barbel',
    cues: ['Perut dan bokong dikencangkan.', 'Barbel lewat dekat wajah.', 'Kunci lengan tepat di atas kepala.'],
    mistake: 'Melengkungkan punggung bawah untuk mendorong beban.'
  },
  'Seated dumbbell press': {
    group: 'bahu',
    equipment: 'dumbbell',
    cues: ['Punggung menempel sandaran.', 'Mulai dari setinggi telinga.', 'Dorong ke atas sedikit menyatu.'],
    mistake: 'Menurunkan dumbbell terlalu dalam sehingga bahu tertarik.'
  },
  'Shoulder press dumbbell': {
    group: 'bahu',
    equipment: 'dumbbell',
    cues: ['Bisa duduk atau berdiri.', 'Pergelangan lurus di atas siku.', 'Gerakan halus.'],
    mistake: 'Siku terlalu melebar ke samping.'
  },
  'Lateral raise': {
    group: 'bahu',
    equipment: 'dumbbell',
    cues: ['Beban ringan saja.', 'Angkat sampai setinggi bahu.', 'Siku sedikit menekuk, pimpin dengan siku.'],
    mistake: 'Mengayun dengan tenaga badan. Ini gerakan terisolasi.'
  },
  'Cable lateral raise': {
    group: 'bahu',
    equipment: 'kabel',
    cues: ['Kabel dari posisi terendah.', 'Tegangan konstan sepanjang gerakan.', 'Satu tangan bergantian.'],
    mistake: 'Mengangkat melebihi bahu sehingga trapezius mengambil alih.'
  },
  'Rear delt fly': {
    group: 'bahu',
    equipment: 'dumbbell',
    cues: ['Badan membungkuk ke depan.', 'Buka lengan ke samping.', 'Beban ringan, repetisi tinggi.'],
    mistake: 'Menarik ke belakang seperti row.'
  },
  'Face pull': {
    group: 'bahu',
    equipment: 'kabel',
    cues: ['Kabel setinggi wajah.', 'Tarik ke arah dahi.', 'Putar keluar sehingga kepalan menghadap belakang.'],
    mistake: 'Menarik terlalu rendah ke arah dada.'
  },
  'Pike push up': {
    group: 'bahu',
    equipment: 'tubuh',
    cues: ['Pinggul tinggi membentuk huruf V.', 'Turunkan ubun-ubun ke lantai.', 'Siku mengarah ke belakang.'],
    mistake: 'Pinggul turun sehingga jadi push up biasa.'
  },

  // --- Lengan ---
  'Barbell curl': {
    group: 'lengan',
    equipment: 'barbel',
    cues: ['Siku menempel di sisi badan.', 'Angkat tanpa mengayun.', 'Turunkan perlahan.'],
    mistake: 'Punggung melengkung ke belakang untuk membantu.'
  },
  'Hammer curl': {
    group: 'lengan',
    equipment: 'dumbbell',
    cues: ['Telapak saling menghadap sepanjang gerakan.', 'Siku diam.', 'Kontrol saat turun.'],
    mistake: 'Bahu ikut terangkat di puncak.'
  },
  'Triceps pushdown': {
    group: 'lengan',
    equipment: 'kabel',
    cues: ['Siku menempel di rusuk.', 'Luruskan lengan sepenuhnya.', 'Hanya lengan bawah yang bergerak.'],
    mistake: 'Membungkuk dan mendorong dengan berat badan.'
  },
  'Rope pushdown': {
    group: 'lengan',
    equipment: 'kabel',
    cues: ['Buka tali di posisi terbawah.', 'Siku tetap diam.', 'Tahan sebentar saat lengan lurus.'],
    mistake: 'Siku bergerak maju-mundur.'
  },
  'Overhead triceps extension': {
    group: 'lengan',
    equipment: 'dumbbell',
    cues: ['Beban di atas kepala.', 'Turunkan ke belakang kepala.', 'Siku tetap mengarah ke depan.'],
    mistake: 'Siku melebar sehingga tekanan hilang.'
  },

  // --- Inti ---
  Plank: {
    group: 'inti',
    equipment: 'tubuh',
    cues: ['Siku tepat di bawah bahu.', 'Badan lurus dari kepala ke tumit.', 'Perut dan bokong dikencangkan.'],
    mistake: 'Pinggul terlalu tinggi atau melorot.'
  },
  'Hollow hold': {
    group: 'inti',
    equipment: 'tubuh',
    cues: ['Punggung bawah menempel lantai.', 'Kaki dan bahu terangkat.', 'Turunkan kaki hanya sejauh punggung tetap menempel.'],
    mistake: 'Punggung bawah melengkung ke atas.'
  },
  'Hanging knee raise': {
    group: 'inti',
    equipment: 'tubuh',
    cues: ['Gantung tanpa mengayun.', 'Tarik lutut ke dada.', 'Turunkan perlahan.'],
    mistake: 'Mengandalkan momentum ayunan.'
  },
  'Hanging leg raise': {
    group: 'inti',
    equipment: 'tubuh',
    cues: ['Versi lebih berat dari knee raise.', 'Kaki lurus.', 'Angkat sampai setinggi pinggul atau lebih.'],
    mistake: 'Mengayun badan seperti pendulum.'
  },
  'Russian twist': {
    group: 'inti',
    equipment: 'tubuh',
    cues: ['Duduk condong ke belakang.', 'Putar dari batang tubuh, bukan lengan.', 'Kaki bisa diangkat untuk versi lebih berat.'],
    mistake: 'Menggerakkan tangan saja tanpa memutar badan.'
  },
  'Mountain climber': {
    group: 'inti',
    equipment: 'tubuh',
    cues: ['Posisi plank tinggi.', 'Tarik lutut bergantian dengan cepat.', 'Pinggul tetap rendah.'],
    mistake: 'Pinggul naik-turun seperti melompat.'
  },
  'Cat cow': {
    group: 'inti',
    equipment: 'tubuh',
    cues: ['Merangkak.', 'Lengkungkan lalu bulatkan punggung bergantian.', 'Ikuti irama napas.'],
    mistake: 'Bergerak terlalu cepat tanpa mengikuti napas.'
  },
  'Peregangan penuh': {
    group: 'inti',
    equipment: 'tubuh',
    cues: ['Tahan tiap posisi 30 detik.', 'Napas tetap jalan.', 'Regangkan sampai terasa, bukan sampai sakit.'],
    mistake: 'Memantul saat meregang.'
  },

  // --- Kardio ---
  'Jalan cepat': {
    group: 'kardio',
    equipment: 'kardio',
    cues: ['Kecepatan yang masih memungkinkan bicara.', 'Langkah panjang dan mantap.'],
    mistake: 'Terlalu pelan sehingga denyut jantung tidak naik.'
  },
  'Jalan santai': {
    group: 'kardio',
    equipment: 'kardio',
    cues: ['Ringan saja, ini pemulihan.', 'Fokus melancarkan peredaran darah.'],
    mistake: 'Menjadikannya sesi latihan tambahan.'
  },
  'Jalan cepat atau sepeda': {
    group: 'kardio',
    equipment: 'kardio',
    cues: ['Pilih yang paling nyaman untuk lutut.', 'Jaga intensitas sedang.'],
    mistake: 'Memaksakan intensitas tinggi di hari pemulihan.'
  },
  'Sepeda statis': {
    group: 'kardio',
    equipment: 'kardio',
    cues: ['Sadel setinggi pinggul.', 'Lutut sedikit menekuk saat pedal terbawah.'],
    mistake: 'Sadel terlalu rendah sehingga lutut tertekan.'
  },
  'Sepeda statis santai': {
    group: 'kardio',
    equipment: 'kardio',
    cues: ['Beban ringan.', 'Kayuh stabil untuk pemulihan.'],
    mistake: 'Menambah beban sampai terengah-engah.'
  },
  'Rowing machine': {
    group: 'kardio',
    equipment: 'kardio',
    cues: ['Urutannya kaki, badan, tangan.', 'Kembali dengan urutan terbalik.', 'Punggung tetap datar.'],
    mistake: 'Menarik dengan tangan lebih dulu.'
  },
  'Interval treadmill 30/90 detik': {
    group: 'kardio',
    equipment: 'kardio',
    cues: ['30 detik cepat, 90 detik pemulihan.', 'Pegangan hanya untuk naik-turun.'],
    mistake: 'Berpegangan sepanjang sesi sehingga bebannya berkurang.'
  },
  Burpee: {
    group: 'kardio',
    equipment: 'tubuh',
    cues: ['Squat, tendang kaki ke belakang, push up, lompat.', 'Jaga irama tetap.'],
    mistake: 'Pinggul melorot saat bagian push up.'
  },
  'Jumping jack': {
    group: 'kardio',
    equipment: 'tubuh',
    cues: ['Gerakan lengan dan kaki serempak.', 'Mendarat lembut di ujung kaki.'],
    mistake: 'Mendarat dengan kaki kaku.'
  },
  'Battle rope': {
    group: 'kardio',
    equipment: 'tali',
    cues: ['Kuda-kuda setengah squat.', 'Gerakkan dari bahu.', 'Jaga irama tetap sampai waktu habis.'],
    mistake: 'Berdiri tegak sehingga punggung bawah bekerja berlebihan.'
  }
};

/** Panduan sebuah gerakan, atau null kalau belum ada di pustaka. */
export function guideFor(name) {
  return exercises[name] ?? null;
}

/**
 * Kandidat pengganti: gerakan lain di kelompok otot yang sama.
 * Alat yang berbeda diprioritaskan, karena alasan paling umum mengganti gerakan
 * adalah alatnya sedang dipakai orang lain.
 */
export function alternativesFor(name, limit = 8) {
  const source = exercises[name];
  if (!source) return [];
  return Object.entries(exercises)
    .filter(([key, ex]) => key !== name && ex.group === source.group)
    .sort(([, a], [, b]) => {
      const aDiff = a.equipment === source.equipment ? 1 : 0;
      const bDiff = b.equipment === source.equipment ? 1 : 0;
      return aDiff - bDiff;
    })
    .slice(0, limit)
    .map(([key, ex]) => ({ name: key, ...ex }));
}

/** Semua gerakan dalam satu kelompok otot, untuk penyusun program sendiri. */
export function byGroup(group) {
  return Object.entries(exercises)
    .filter(([, ex]) => ex.group === group)
    .map(([name, ex]) => ({ name, ...ex }))
    .sort((a, b) => a.name.localeCompare(b.name, 'id'));
}

/** Daftar kelompok otot yang ada isinya. */
export function groups() {
  return [...new Set(Object.values(exercises).map((e) => e.group))].sort();
}
