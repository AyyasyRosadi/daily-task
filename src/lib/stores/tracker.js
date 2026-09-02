import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { acceptPoint, activityTypes, currentSpeed, trackDistance } from '$lib/utils/geo';

/**
 * Pelacak sesi lari/sepeda yang sedang berjalan.
 *
 * Waktu aktif dihitung dari stempel waktu, bukan dari pengurangan tiap detik —
 * alasannya sama persis dengan timer istirahat di `rest.js`: browser
 * memperlambat `setInterval` di tab yang tersembunyi, dan hitungan yang
 * mengandalkan interval akan tertinggal makin jauh selama sesi panjang. Di sini
 * taruhannya lebih besar karena sesinya berjam-jam, bukan sembilan puluh detik.
 *
 * BATAS YANG TIDAK BISA DIAKALI: begitu layar terkunci atau browser dipindah ke
 * belakang, iOS Safari menghentikan JavaScript hampir seketika dan Android
 * Chrome mencekiknya berat. Perekaman GPS ikut berhenti. Wake Lock menahan layar
 * tetap menyala selama sesi, dan itu satu-satunya peredam yang tersedia untuk
 * aplikasi web — bukan solusi. Halaman pelacak wajib mengatakan ini ke pengguna,
 * bukan menyembunyikannya.
 */

/**
 * Sesi berjalan, atau null saat tidak ada.
 * { type, status, startedAt, accumulated, resumedAt, points, raw, distance, gps, error }
 */
export const activity = writable(null);

/** Detik aktif berjalan, diperbarui tiap detik selama sesi hidup. */
export const elapsed = writable(0);

let ticker = null;
let watchId = null;
let wakeLock = null;

/** Waktu aktif dalam milidetik: jeda tidak ikut dihitung. */
function activeMs(session) {
  if (!session) return 0;
  const running = session.resumedAt ? Date.now() - session.resumedAt : 0;
  return session.accumulated + running;
}

function tick() {
  const session = get(activity);
  if (!session) {
    clearInterval(ticker);
    ticker = null;
    return;
  }
  elapsed.set(Math.floor(activeMs(session) / 1000));
}

function startTicker() {
  if (ticker) clearInterval(ticker);
  ticker = setInterval(tick, 500);
  tick();
}

// --- Wake lock -------------------------------------------------------------

/**
 * Wake lock lepas sendiri setiap kali tab tersembunyi, dan tidak dikembalikan
 * saat tab kembali terlihat. Tanpa pemasangan ulang di `visibilitychange`,
 * layar akan mati sekali saja lalu tidak pernah dijaga lagi sepanjang sesi.
 */
async function requestWakeLock() {
  if (!browser || !navigator.wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch {
    // Ditolak browser atau baterai lemah: sesi tetap jalan, layar saja yang mati.
    wakeLock = null;
  }
}

function releaseWakeLock() {
  wakeLock?.release?.().catch(() => {});
  wakeLock = null;
}

async function onVisibility() {
  const session = get(activity);
  if (document.visibilityState !== 'visible') return;
  if (session?.status === 'jalan' && !wakeLock) await requestWakeLock();
  // Hitungan dikoreksi begitu tab kembali: selama tersembunyi, ticker-nya
  // diperlambat browser dan angka di layar sudah pasti tertinggal.
  tick();
}

// --- GPS -------------------------------------------------------------------

function onPosition(position) {
  const session = get(activity);
  if (!session || session.status !== 'jalan') return;

  const point = {
    t: activeMs(session) / 1000,
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    acc: position.coords.accuracy
  };

  activity.update((s) => {
    if (!s) return s;
    const previous = s.raw[s.raw.length - 1] ?? null;
    if (!acceptPoint(previous, point, s.type)) {
      // Titik ditolak tetap menandakan GPS hidup — status sinyal ikut diperbarui.
      return { ...s, gps: point.acc, error: '' };
    }
    const raw = [...s.raw, point];
    return { ...s, raw, distance: trackDistance(raw), gps: point.acc, error: '' };
  });
}

function onPositionError(err) {
  const pesan =
    err.code === err.PERMISSION_DENIED
      ? 'Izin lokasi ditolak. Durasi tetap tercatat; jarak bisa diisi manual setelah selesai.'
      : 'Sinyal GPS belum didapat. Durasi tetap berjalan.';
  activity.update((s) => (s ? { ...s, error: pesan, gps: null } : s));
}

function startWatch() {
  if (!browser || !navigator.geolocation || watchId !== null) return;
  watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
    enableHighAccuracy: true,
    // Titik hasil cache tidak berguna di sini: yang dibutuhkan posisi sekarang.
    maximumAge: 0,
    timeout: 20_000
  });
}

function stopWatch() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

// --- Kendali sesi ----------------------------------------------------------

/** Mulai sesi baru. Jenis: 'lari' atau 'sepeda'. */
export async function startActivity(type = 'lari') {
  if (get(activity)) return;
  const jenis = activityTypes[type] ? type : 'lari';

  activity.set({
    type: jenis,
    status: 'jalan',
    startedAt: Date.now(),
    accumulated: 0,
    resumedAt: Date.now(),
    raw: [],
    distance: 0,
    gps: null,
    error: navigator?.geolocation ? '' : 'Perangkat ini tidak punya GPS. Jarak bisa diisi manual.'
  });

  startTicker();
  startWatch();
  document.addEventListener('visibilitychange', onVisibility);
  await requestWakeLock();
}

export function pauseActivity() {
  const session = get(activity);
  if (!session || session.status !== 'jalan') return;
  stopWatch();
  releaseWakeLock();
  activity.set({
    ...session,
    status: 'jeda',
    accumulated: activeMs(session),
    resumedAt: null
  });
  tick();
}

export async function resumeActivity() {
  const session = get(activity);
  if (!session || session.status !== 'jeda') return;
  activity.set({ ...session, status: 'jalan', resumedAt: Date.now() });
  startTicker();
  startWatch();
  await requestWakeLock();
}

function teardown() {
  stopWatch();
  releaseWakeLock();
  if (ticker) clearInterval(ticker);
  ticker = null;
  if (browser) document.removeEventListener('visibilitychange', onVisibility);
}

/**
 * Hentikan sesi dan kembalikan hasilnya untuk disimpan.
 *
 * Sengaja tidak menyimpan sendiri: halaman yang memanggil masih perlu
 * menanyakan jarak manual kalau GPS tidak menghasilkan apa-apa, dan pengguna
 * masih boleh membuang sesinya. Store ini hanya tahu cara merekam.
 */
export function stopActivity() {
  const session = get(activity);
  if (!session) return null;
  const seconds = Math.round(activeMs(session) / 1000);
  teardown();
  activity.set(null);
  elapsed.set(0);
  return {
    type: session.type,
    startedAt: session.startedAt,
    seconds,
    meters: Math.round(session.distance),
    raw: session.raw
  };
}

/** Buang sesi tanpa menyimpan apa pun. */
export function discardActivity() {
  teardown();
  activity.set(null);
  elapsed.set(0);
}

/** Kecepatan sesaat sesi berjalan, dalam meter per detik. */
export function liveSpeed(session) {
  return currentSpeed(session?.raw ?? []);
}
