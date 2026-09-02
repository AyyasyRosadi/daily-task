import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Tema tampilan: gelap, terang, atau ikut pengaturan sistem.
 *
 * Pilihannya disimpan di localStorage, bukan hanya di profil Firestore, supaya
 * tema sudah benar sejak halaman pertama dimuat — sebelum sesi login selesai.
 * Profil tetap menyimpannya juga agar ikut berpindah antar perangkat.
 */

const KEY = 'gym-daily:theme';

export const themes = [
  { id: 'gelap', label: 'Gelap' },
  { id: 'terang', label: 'Terang' },
  { id: 'sistem', label: 'Ikut sistem' }
];

function read() {
  if (!browser) return 'gelap';
  try {
    const saved = localStorage.getItem(KEY);
    return themes.some((t) => t.id === saved) ? saved : 'gelap';
  } catch {
    return 'gelap';
  }
}

export const theme = writable(read());

function prefersLight() {
  return browser && window.matchMedia?.('(prefers-color-scheme: light)').matches;
}

/** Terapkan tema ke elemen html. Kelas `light` yang menukar seluruh palet. */
function apply(value) {
  if (!browser) return;
  const light = value === 'terang' || (value === 'sistem' && prefersLight());
  document.documentElement.classList.toggle('light', light);
  document.documentElement.classList.toggle('dark', !light);
  // Warna bilah status ponsel ikut menyesuaikan.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', light ? '#FAF9F6' : '#0F1412');
}

export function setTheme(value) {
  const next = themes.some((t) => t.id === value) ? value : 'gelap';
  theme.set(next);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* mode privat menolak penyimpanan — tema tetap berlaku untuk sesi ini */
  }
  apply(next);
}

/**
 * Pasang tema saat aplikasi dibuka dan ikuti perubahan pengaturan sistem
 * selama pilihannya masih "sistem". Mengembalikan fungsi pembersih.
 */
export function initTheme() {
  if (!browser) return () => {};
  let current = read();
  theme.set(current);
  apply(current);

  const media = window.matchMedia?.('(prefers-color-scheme: light)');
  const onChange = () => {
    if (current === 'sistem') apply(current);
  };
  media?.addEventListener?.('change', onChange);

  const unsub = theme.subscribe((v) => {
    current = v;
  });

  return () => {
    media?.removeEventListener?.('change', onChange);
    unsub();
  };
}
