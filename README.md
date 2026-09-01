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
- **Progres** — rekap minggu berjalan, grafik 12 bulan, rekor streak, dan grafik berat badan.
- **Nutrisi** — kalkulator kalori (Mifflin-St Jeor) + target makro dan menu harian per tujuan.
- **Tips** — kumpulan tips latihan, nutrisi, istirahat, dan kebiasaan.
- **Profil** — data diri dan data tubuh, ringkasan streak, program aktif, pengaturan pengingat, dan
  ekspor jadwal ke kalender.
- **Pengingat latihan** — notifikasi browser pada jam yang dipilih. Berjalan selama aplikasi masih
  terbuka di salah satu tab; di Android notifikasi dikirim lewat service worker (`static/sw.js`).
- **Sambungan kalender** — jadwal program diekspor sebagai acara berulang (`RRULE` mingguan) dengan
  alarm 30 menit sebelum mulai. Berkas `.ics` untuk Apple Calendar, plus tautan langsung ke Google
  Calendar untuk Android. Alarm kalender tetap berbunyi walau aplikasi tertutup.

## 1. Siapkan Firebase

1. Buka console.firebase.google.com, buat project baru.
2. **Authentication → Sign-in method → Email/Password → Enable.**
3. **Firestore Database → Create database** (mode production, region `asia-southeast2` untuk Jakarta).
4. **Project settings → Your apps → Web app (`</>`)** → daftarkan app, salin nilai `firebaseConfig`.
5. Tempel aturan keamanan ini di **Firestore → Rules → Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

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

## Struktur data Firestore

```
users/{uid}
  name, activeProgram, programStartedAt, goal, activity,
  sex, age, height, weight, streak, bestStreak, lastDoneDate,
  reminderEnabled, reminderTime, reminderOnRestDays

users/{uid}/logs/{YYYY-MM-DD}
  date, programId, title, focus, minutes, isRest,
  tasks: [{ id, name, sets, reps, group, done }],
  water, note, completed

users/{uid}/weights/{YYYY-MM-DD}
  date, kg
```

## Menambah program sendiri

Semua program ada di `src/lib/data/programs.js`. Tambahkan satu objek baru ke array `programs`
dengan `schedule` yang dikunci hari (`0` Minggu sampai `6` Sabtu). Hari tanpa entri otomatis jadi
hari istirahat. Menu makanan ada di `src/lib/data/foods.js`, tips di `src/lib/data/tips.js`.

## Catatan

Angka kalori dan makro di aplikasi ini adalah perkiraan umum, bukan saran medis.
