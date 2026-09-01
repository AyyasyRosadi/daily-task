import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { profile, todayLog, dayKey } from '$lib/stores/data';

const LAST_FIRED_KEY = 'gym-daily:last-reminder';

export const notificationsSupported = browser && typeof Notification !== 'undefined';

/** 'default' = belum ditanya, 'granted' = diizinkan, 'denied' = ditolak. */
export const permission = writable(notificationsSupported ? Notification.permission : 'unsupported');

/**
 * Chrome di Android melarang `new Notification()` dan mewajibkan service worker.
 * Registrasi ini dipakai lebih dulu kalau tersedia, dengan constructor sebagai cadangan.
 */
let swRegistration = null;

export async function ensureServiceWorker() {
  if (!browser || !('serviceWorker' in navigator)) return null;
  if (swRegistration) return swRegistration;
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return swRegistration;
  } catch {
    return null;
  }
}

export async function requestPermission() {
  if (!notificationsSupported) return 'unsupported';
  const result = await Notification.requestPermission();
  permission.set(result);
  if (result === 'granted') await ensureServiceWorker();
  return result;
}

const options = (body) => ({
  body,
  icon: '/favicon.svg',
  badge: '/favicon.svg',
  tag: 'gym-daily-reminder',
  renotify: true
});

async function show(title, body) {
  if (!notificationsSupported || Notification.permission !== 'granted') return false;

  const registration = await ensureServiceWorker();
  if (registration) {
    try {
      await registration.showNotification(title, options(body));
      return true;
    } catch {
      /* jatuh ke constructor di bawah */
    }
  }

  try {
    new Notification(title, options(body));
    return true;
  } catch {
    return false;
  }
}

/** Kirim notifikasi sekali jalan, dipakai juga oleh timer istirahat. */
export const notify = show;

export function sendTestNotification() {
  return show('Gym Daily', 'Pengingat sudah aktif. Sampai jumpa di jam latihanmu.');
}

function readLastFired() {
  if (!browser) return null;
  try {
    return localStorage.getItem(LAST_FIRED_KEY);
  } catch {
    return null;
  }
}

function writeLastFired(key) {
  if (!browser) return;
  try {
    localStorage.setItem(LAST_FIRED_KEY, key);
  } catch {
    /* mode privat menolak penyimpanan — pengingat tetap jalan, hanya bisa dobel */
  }
}

/** Apakah menit sekarang sudah melewati jam pengingat pada hari ini. */
function isDue(time, now) {
  const [h, m] = String(time ?? '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const dueMinutes = h * 60 + m;
  // Toleransi 10 menit supaya pengingat tetap muncul kalau tab baru dibuka lagi.
  return nowMinutes >= dueMinutes && nowMinutes - dueMinutes <= 10;
}

async function tick() {
  const p = get(profile);
  if (!p?.reminderEnabled) return;
  if (!notificationsSupported || Notification.permission !== 'granted') return;

  const key = get(dayKey);
  if (readLastFired() === key) return;
  if (!isDue(p.reminderTime, new Date())) return;

  const log = get(todayLog);
  if (log?.completed) return;
  if (log?.isRest && !p.reminderOnRestDays) return;

  const title = log?.isRest ? 'Hari pemulihan' : `Waktunya ${log?.title ?? 'latihan'}`;
  const body = log?.isRest
    ? 'Tandai hari istirahatmu supaya rentetannya tidak putus.'
    : 'Buka Gym Daily dan centang latihan hari ini.';

  if (await show(title, body)) writeLastFired(key);
}

/**
 * Penjadwal pengingat yang berjalan selama aplikasi terbuka.
 * Mengembalikan fungsi untuk menghentikannya.
 */
export function startReminderScheduler() {
  if (!browser || !notificationsSupported) return () => {};
  tick();
  const timer = setInterval(tick, 30_000);
  const onVisible = () => {
    if (document.visibilityState === 'visible') tick();
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
