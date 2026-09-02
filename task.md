# Task Gym Daily

Daftar pekerjaan yang belum dikerjakan, berikut catatan verifikasi yang masih menggantung.
Terakhir diperbarui: 2026-09-02.

---

## A. Utang verifikasi — kerjakan lebih dulu

Ini bukan fitur baru, tapi hal-hal yang sudah dibangun namun belum pernah benar-benar
dijalankan. Risikonya lebih besar daripada fitur mana pun di bawah.

### A1. Uji aturan keamanan Firestore terhadap emulator
`firestore.rules` sudah ditulis tapi **belum pernah dijalankan Firestore**. Sintaks yang salah
akan ditolak saat deploy, tapi aturan yang terlalu ketat baru ketahuan saat aplikasi macet.

```bash
firebase emulators:start --only firestore,auth
```

Yang perlu dipastikan lolos: buat profil baru, tulis log harian, catat berat, simpan ukuran
tubuh, catat makan, simpan program sendiri. Yang perlu dipastikan **ditolak**: membaca
`users/{uid-orang-lain}`.

Pertimbangkan menambah `@firebase/rules-unit-testing` supaya ini jadi tes otomatis, bukan
pemeriksaan manual sekali jalan.

### A2. Verifikasi visual seluruh halaman
Belum ada satu pun halaman yang pernah dilihat dengan mata — semua verifikasi selama ini hanya
"rute balas 200" dan "modul ter-transform". Perlu login sungguhan lalu periksa:

- Tabel set di halaman Hari ini (input beban/repetisi, tombol centang per set)
- Timer istirahat melayang, terutama posisinya di atas bottom nav
- Kalender di halaman Riwayat
- Penyusun program di `/programs/susun`
- Pencatat makan di halaman Nutrisi

### A3. Periksa kontras tema terang
Token tema sudah terkompilasi benar, tapi tampilannya belum pernah dilihat. Yang paling rawan:
warna `plate` (merah `#D6353B`, kuning `#F0B429`, hijau `#31A05F`) di atas latar terang
`#FAF9F6` — kuning kemungkinan besar kurang kontras untuk teks.

### A4. Uji alur yang menyentuh Firestore
Belum pernah dijalankan sungguhan: simpan/ubah/hapus program sendiri, catat dan hapus makanan,
hapus akun. Untuk `deleteAllUserData`, uji dengan akun berisi banyak dokumen.

### A5. Indeks Firestore untuk koleksi `meals`
Query `meals` memakai bentuk range yang sama dengan `logs`, jadi harusnya cukup dengan indeks
single-field otomatis. Belum dikonfirmasi. Kalau muncul error indeks di console, ikuti tautan
yang diberikan Firebase.

### A6. Uji lapangan pelacak kardio
Seluruh logikanya sudah diuji (57 tes: perhitungan geo, store pelacak dengan timer palsu, dan
render halaman), tapi **belum pernah dipakai berlari sungguhan**. Yang hanya bisa dibuktikan di
luar: apakah penyaring titik terlalu ketat atau terlalu longgar di jalanan sebenarnya, seberapa
cepat baterai habis dengan wake lock menyala, dan berapa lama perekaman bertahan sebelum browser
menghentikannya. Bandingkan satu rute yang sama dengan aplikasi lain.

Aturan Firestore untuk koleksi `activities` juga ikut menunggu A1 — belum pernah dijalankan
emulator.

---

## B. Fitur yang belum dikerjakan

### B1. Push notification lewat FCM
**Kenapa:** pengingat sekarang hanya jalan selama aplikasi terbuka di salah satu tab. Ekspor
kalender adalah jalan keluar sementara, tapi bukan pengganti.

**Perlu apa:** Firebase Cloud Messaging + VAPID key, `firebase-messaging-sw.js`, simpan token
per perangkat di `users/{uid}/devices`, dan satu Cloud Function terjadwal yang mengirim pada jam
`reminderTime` tiap pengguna. Ini satu-satunya item di daftar ini yang butuh backend.

**Catatan:** `static/sw.js` sudah ada dan menangani `notificationclick`. FCM biasanya minta
service worker terpisah dengan nama tetap — periksa apakah keduanya bisa digabung sebelum
menambah service worker kedua.

### B3. Foto progres
**Kenapa:** perubahan bentuk badan sering tidak terlihat di angka.

**Perlu apa:** Firebase Storage (belum dipakai sama sekali di proyek ini), aturan keamanan
Storage terpisah, kompresi di sisi klien sebelum unggah, dan tampilan banding dua foto.
Perhatikan biaya penyimpanan dan privasi — foto badan lebih sensitif daripada data lain di
aplikasi ini.

---

## C. Kualitas kode

### C1. Tes komponen — sebagian selesai
Kerangkanya sudah ada: `@testing-library/svelte` + jsdom, proyek Vitest kedua bernama
`komponen` (`tests/components/`), dan empat berkas tes — `TaskRow.svelte`, penyusun program,
store pelacak kardio, dan halaman Kardio. Total sekarang 227 tes di 13 berkas.

Yang belum: `RestTimer.svelte` (timer melayang), pencatat makan di halaman Nutrisi, dan
kalender di halaman Riwayat.

Catatan: proyek `komponen` dipaksa memakai pool `threads`. Pool `forks` bawaan Vitest bikin
worker jsdom kehabisan waktu saat start di Windows.

### C2. Tinjau `npm audit` — selesai, sisa satu yang tidak bisa ditutup
Dari 10 kerentanan (1 kritis, 1 tinggi, 6 sedang, 2 rendah) tersisa 3 rendah. Yang dinaikkan:
vite 5 → 8, vitest 2 → 4, `@sveltejs/vite-plugin-svelte` 4 → 7, `@sveltejs/adapter-vercel`
5 → 6, kit dan svelte ke versi terbaru. Semua tes lolos dan build tetap jalan.

Sisanya `cookie <0.7.0` lewat `@sveltejs/kit`: versi kit terbaru (2.70.3) masih masuk rentang
advisory-nya, jadi belum ada yang bisa dipasang. Perlu ditengok lagi saat kit rilis versi baru.

### C3. Build gagal di Windows
`npm run build` berhenti di `EPERM: operation not permitted, symlink` dari
`@sveltejs/adapter-vercel`. Bundling-nya sendiri sukses penuh — ini murni soal izin symlink
Windows. Aktifkan Developer Mode di Windows, atau jalankan build dari WSL. Deploy di Vercel
tidak terpengaruh.

### C4. Panduan gerakan perlu ditinjau orang yang berkompeten
68 dari 69 entri panduan form di `src/lib/data/exercises.js` ditulis oleh Claude, bukan dikutip
dari sumber resmi. Sama untuk angka gizi di `src/lib/data/foodItems.js`. Keduanya sudah diberi
catatan "perkiraan" di UI, tapi kalau aplikasi ini dipakai orang lain, sebaiknya ditinjau
pelatih atau ahli gizi.

---

## D. Ide yang belum masuk daftar mana pun

- Riwayat lebih dari satu tahun ke belakang di halaman Riwayat (sekarang tahun lama dimuat
  sekali jalan saat bulannya dibuka — sudah jalan, tapi belum ada navigasi antar tahun)
- Impor kembali dari cadangan JSON (ekspornya sudah ada, impornya belum)
- Catatan per gerakan, bukan hanya per sesi
- Mode "latihan bebas" tanpa program, untuk hari yang tidak terjadwal

---

## Sudah selesai (referensi)

Prioritas tinggi: catat beban per set, riwayat harian, timer istirahat, grafik beban per
gerakan, PWA + offline.

Prioritas menengah: program buatan sendiri, ganti gerakan, panduan gerakan, ukuran tubuh, catat
makanan, kelola akun, ekspor data, progresi + minggu deload.

Lainnya: aturan keamanan Firestore, kerangka tes Vitest, lencana + rekor pribadi, tren air
minum, tema terang/gelap.

Ditambahkan 2026-09-02 (kedua): pelacak kardio dengan GPS — start/jeda/stop untuk lari dan
sepeda, jarak/pace/kecepatan langsung, rute sebagai SVG buatan sendiri tanpa dependensi peta,
entri jarak manual saat GPS tidak tersedia, koleksi `activities` + aturannya, dan penanda
melayang saat sesi berjalan di halaman lain. Sesi yang tersimpan ikut menghitung streak.

Ditambahkan 2026-09-02: bagikan ringkasan minggu/bulan (kartu canvas 1080x1080 + Web Share API
dengan fallback unduh, `src/lib/utils/share.js`), standar kekuatan pembanding di halaman Progres
(`src/lib/data/strengthStandards.js`, angka disalin dari tabel 1RM ExRx.net usia 18-39),
tes komponen pertama, dan pembaruan dependensi `npm audit`.
