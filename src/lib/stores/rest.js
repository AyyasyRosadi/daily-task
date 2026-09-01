import { get, writable } from 'svelte/store';

/**
 * Timer istirahat antar set.
 *
 * Sisa waktu dihitung dari stempel waktu selesai, bukan dari pengurangan tiap detik,
 * supaya tetap akurat kalau tab disembunyikan dan interval-nya diperlambat browser.
 */

export const DEFAULT_REST_SECONDS = 90;

/** { endsAt, total, label } saat berjalan, null saat mati. */
export const rest = writable(null);

/** Sisa detik, diperbarui tiap detik selama timer hidup. */
export const remaining = writable(0);

let ticker = null;
let onDone = null;

function stopTicker() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}

function tick() {
  const current = get(rest);
  if (!current) return stopTicker();
  const left = Math.max(0, Math.ceil((current.endsAt - Date.now()) / 1000));
  remaining.set(left);
  if (left === 0) {
    stopTicker();
    rest.set(null);
    onDone?.(current);
  }
}

/** Mulai atau setel ulang timer istirahat. */
export function startRest(seconds = DEFAULT_REST_SECONDS, label = '') {
  const total = Math.max(5, Number(seconds) || DEFAULT_REST_SECONDS);
  rest.set({ endsAt: Date.now() + total * 1000, total, label });
  remaining.set(total);
  stopTicker();
  ticker = setInterval(tick, 250);
}

/** Tambah atau kurangi waktu tanpa menghentikan hitungan. */
export function adjustRest(deltaSeconds) {
  const current = get(rest);
  if (!current) return;
  const endsAt = Math.max(Date.now(), current.endsAt + deltaSeconds * 1000);
  rest.set({ ...current, endsAt, total: Math.max(current.total, Math.ceil((endsAt - Date.now()) / 1000)) });
  tick();
}

export function stopRest() {
  stopTicker();
  rest.set(null);
  remaining.set(0);
}

/** Daftarkan apa yang terjadi saat hitungan habis (getar, notifikasi). */
export function onRestFinished(handler) {
  onDone = handler;
}
