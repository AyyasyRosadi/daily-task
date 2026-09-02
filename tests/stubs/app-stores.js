// Stub $app/stores. Belum ada tes komponen, jadi cukup store kosong.
import { readable } from 'svelte/store';
export const page = readable({ url: new URL('http://localhost/'), params: {} });
export const navigating = readable(null);
export const updated = readable(false);
