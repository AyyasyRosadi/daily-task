# Gym Daily

Aplikasi web pencatat latihan gym harian: tugas harian dari program yang dipilih, streak, progres
mingguan dan tahunan, rekomendasi makanan, serta tips latihan. Dibangun dengan SvelteKit + Firebase,
siap dideploy ke Vercel.

## Fitur

- **Hari ini** — daftar gerakan sesuai jadwal program, progres berbentuk barbel yang terisi plat,
  pencatat air minum, dan catatan sesi.
- **Streak harian** — dihitung otomatis saat semua gerakan tercentang atau hari istirahat dicatat.
  Streak putus sendiri kalau ada hari yang terlewat.
- **Program** — 5 program siap pakai (Full Body Pemula, Push Pull Legs, Upper Lower, Kalistenik di
  Rumah, Bakar Lemak). Pilih satu, jadwalnya langsung mengikuti hari.
- **Program buatan sendiri** — penyusun di `/programs/susun`: tentukan hari latihan, pilih gerakan
  dari pustaka, atur set dan repetisi. Tersimpan di `users/{uid}/programs` dan diperlakukan sama
  persis dengan program bawaan, termasuk saat diekspor ke kalender.
- **Panduan gerakan** — 68 gerakan dengan 2-3 poin form dan satu kesalahan yang paling sering
  terjadi, dibuka langsung dari baris gerakan.
- **Ganti gerakan** — alat sedang dipakai? Pilih pengganti dari kelompok otot yang sama; alat yang
  berbeda diprioritaskan.
- **Progresi & minggu pemulihan** — saran beban tiap sesi (naik / tahan / turun) berdasarkan apakah
  sesi lalu tuntas, dengan setiap minggu ke-4 otomatis jadi minggu deload. Semuanya saran, bukan
  perubahan otomatis.
- **Catatan beban per set** — isi beban dan repetisi tiap set, bukan sekadar centang. Beban set
  sebelumnya dan rekor pribadi tampil sebagai acuan, dan set bisa ditambah/dikurangi saat sesi.
- **Timer istirahat** — hitungan mundur otomatis begitu satu set ditandai selesai, lengkap dengan
  getar dan notifikasi. Durasinya diatur di Profil (60/90/120/180 detik).
- **Riwayat** — kalender bulanan yang bisa dibuka per tanggal: rincian set, volume, air minum,
  berat badan, dan catatan sesi. Tahun sebelumnya dimuat sekali jalan saat bulannya dibuka.
- **Progres** — rekap minggu berjalan, grafik 12 bulan, rekor streak, grafik berat badan, serta
  grafik beban per gerakan dengan perkiraan 1RM (Epley) dan rekor pribadi.
- **Nutrisi** — kalkulator kalori (Mifflin-St Jeor) + target makro dan menu harian per tujuan,
  ditambah pencatat makan harian dengan ~70 makanan Indonesia dan sisa kalori berjalan.
- **Ukuran tubuh** — pinggang, dada, lengan, paha, pinggul, bahu; dengan selisih terhadap
  pengukuran sebelumnya dan grafik per bagian.
- **Kelola akun & ekspor** — ganti kata sandi/email, atur ulang lewat email, hapus akun berikut
  seluruh datanya, dan unduh data sendiri sebagai CSV (satu baris per set) atau cadangan JSON.
- **Lencana & rekor** — lencana beruntun, jumlah sesi, total volume, dan ragam gerakan; ditambah
  papan rekor pribadi per gerakan. Semuanya dihitung ulang dari data, tidak disimpan terpisah, jadi
  tidak pernah basi.
- **Tren air minum** — rata-rata dan persentase target tercapai dalam 14 hari terakhir.
- **Tema terang & gelap** — bisa juga ikut pengaturan sistem. Warna netral memakai CSS variable,
  jadi pergantian tema tidak menyentuh satu pun kelas di komponen.
- **Tips** — kumpulan tips latihan, nutrisi, istirahat, dan kebiasaan.
- **Profil** — data diri dan data tubuh, ringkasan streak, program aktif, pengaturan pengingat, dan
  ekspor jadwal ke kalender.
- **Pengingat latihan** — notifikasi browser pada jam yang dipilih. Berjalan selama aplikasi masih
  terbuka di salah satu tab; di Android notifikasi dikirim lewat service worker (`static/sw.js`).
- **Sambungan kalender** — jadwal program diekspor sebagai acara berulang (`RRULE` mingguan) dengan
  alarm 30 menit sebelum mulai. Berkas `.ics` untuk Apple Calendar, plus tautan langsung ke Google
  Calendar untuk Android. Alarm kalender tetap berbunyi walau aplikasi tertutup.
- **Bisa dipasang & jalan offline** — `manifest.webmanifest` + service worker (`static/sw.js`) yang
  menyimpan cangkang aplikasi dan aset ber-hash, ditambah cache permanen Firestore. Latihan tetap
  bisa dicatat tanpa sinyal dan tersinkron sendiri saat koneksi kembali.

## 1. Siapkan Firebase

1. Buka console.firebase.google.com, buat project baru.
2. **Authentication → Sign-in method → Email/Password → Enable.**
3. **Firestore Database → Create database** (mode production, region `asia-southeast2` untuk Jakarta).
4. **Project settings → Your apps → Web app (`</>`)** → daftarkan app, salin nilai `firebaseConfig`.
5. Pasang aturan keamanan dari `firestore.rules` di repo ini — jangan biarkan mode uji berjalan.
   Salin isinya ke **Firestore → Rules → Publish**, atau pasang lewat CLI:

   ```bash
   firebase deploy --only firestore:rules
   ```

   Rinciannya ada di bagian [Aturan keamanan Firestore](#aturan-keamanan-firestore) di bawah.

## 2. Jalankan di lokal

```bash
cp .env.example .env      # lalu isi nilainya dari firebaseConfig
npm install
npm run dev
```

Buka http://localhost:5173, daftar akun, lalu pilih program di tab Program.

## 3. Deploy ke Vercel

```bash
npm i -g vercel
vercel
```

Atau lewat dashboard: push repo ini ke GitHub, lalu **Vercel → New Project → Import**. Vercel
mendeteksi SvelteKit otomatis, build command tidak perlu diubah.

Sebelum deploy, tambahkan 6 environment variable di **Project Settings → Environment Variables**
(centang Production, Preview, dan Development):

```
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_STORAGE_BUCKET
PUBLIC_FIREBASE_MESSAGING_SENDER_ID
PUBLIC_FIREBASE_APP_ID
```

Terakhir, tambahkan domain Vercel kamu di **Firebase → Authentication → Settings → Authorized
domains**. Kalau dilewat, login akan ditolak di production.

## Aturan keamanan Firestore

Aturannya ada di `firestore.rules` dan ikut diversikan bersama kode. Prinsipnya satu: seluruh data
hidup di bawah `users/{uid}` dan hanya pemilik uid itu yang boleh menyentuhnya. Tidak ada koleksi
publik, jadi tidak ada jalur baca lintas akun.

```bash
npm install -g firebase-tools     # sekali saja
firebase login
firebase deploy --only firestore:rules
```

Aturan ini **wajib dipasang**. Proyek Firestore yang baru dibuat berjalan dalam mode uji yang
terbuka untuk siapa pun dan kedaluwarsa setelah 30 hari.

Untuk mencoba tanpa menyentuh data asli: `firebase emulators:start --only firestore,auth`.

## Tes

```bash
npm test          # sekali jalan
npm run test:watch
```

Vitest menguji logika murni di `src/lib`: pencatatan set, aturan progresi, pembangkit iCalendar,
ekspor CSV/JSON, dan keutuhan pustaka gerakan terhadap program bawaan. Tes tidak menyentuh Firebase
maupun merender komponen — modul `$app/*` dan `$env/*` di-stub di `tests/stubs/`.

## Struktur data Firestore

```
users/{uid}
  name, activeProgram, programStartedAt, goal, activity,
  sex, age, height, weight, streak, bestStreak, lastDoneDate,
  reminderEnabled, reminderTime, reminderOnRestDays, restSeconds

users/{uid}/logs/{YYYY-MM-DD}
  date, programId, title, focus, minutes, isRest,
  tasks: [{ id, name, sets, reps, group, done,
            logs: [{ kg, reps, done }] }],
  water, note, completed

users/{uid}/weights/{YYYY-MM-DD}
  date, kg

users/{uid}/measurements/{YYYY-MM-DD}
  date, pinggang, dada, lengan, paha, pinggul, bahu   (cm, hanya yang diisi)

users/{uid}/meals/{YYYY-MM-DD}
  date, items: [{ name, porsi, slot, servings, kcal, p, k, l, at }]

users/{uid}/programs/{slug}
  name, level, weeks, daysPerWeek, place, goal, summary, updatedAt,
  schedule: { <0-6>: { title, focus, minutes, exercises: [...] } }
```

`logs[]` di dalam `tasks` menyimpan beban dan repetisi aktual per set. Catatan lama yang belum
punya field ini tetap terbaca: seluruh fungsi di `src/lib/utils/workout.js` memperlakukan `logs`
yang hilang sebagai set kosong, jadi tidak perlu migrasi data.

## Menambah program sendiri

Cara termudah: pakai penyusun di dalam aplikasi lewat **Program → Susun program sendiri**.

Untuk menambah program bawaan bagi semua pengguna, edit `src/lib/data/programs.js`: tambahkan satu
objek ke array `programs` dengan `schedule` yang dikunci hari (`0` Minggu sampai `6` Sabtu). Hari
tanpa entri otomatis jadi hari istirahat.

Berkas data lain: pustaka gerakan dan panduan formnya di `src/lib/data/exercises.js`, basis data
makanan di `src/lib/data/foodItems.js`, menu contoh di `src/lib/data/foods.js`, tips di
`src/lib/data/tips.js`.

## Catatan

Angka kalori dan makro di aplikasi ini adalah perkiraan umum, bukan saran medis.
