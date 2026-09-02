import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

/**
 * Dua macam tes hidup berdampingan di sini:
 *
 * - `tests/*.test.js` — logika murni di `src/lib`, jalan di lingkungan node.
 * - `tests/components/*.test.js` — render komponen Svelte, butuh jsdom.
 *
 * Plugin SvelteKit tetap tidak dipakai (terlalu banyak yang harus dipalsukan);
 * cukup plugin Svelte saja untuk meng-compile `.svelte`. Modul `$app/*` dan
 * `$env/*` di-stub karena hanya ada saat aplikasi benar-benar berjalan.
 */
const alias = {
  $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
  '$app/environment': fileURLToPath(new URL('./tests/stubs/app-environment.js', import.meta.url)),
  '$app/navigation': fileURLToPath(new URL('./tests/stubs/app-navigation.js', import.meta.url)),
  '$app/stores': fileURLToPath(new URL('./tests/stubs/app-stores.js', import.meta.url)),
  '$env/dynamic/public': fileURLToPath(new URL('./tests/stubs/env-public.js', import.meta.url))
};

export default defineConfig({
  plugins: [svelte()],
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'logika',
          environment: 'node',
          include: ['tests/*.test.js']
        }
      },
      {
        plugins: [svelte()],
        resolve: { alias, conditions: ['browser'] },
        test: {
          name: 'komponen',
          environment: 'jsdom',
          // Pool 'forks' bikin worker jsdom kehabisan waktu saat start di Windows.
          pool: 'threads',
          include: ['tests/components/*.test.js'],
          setupFiles: ['./tests/components/setup.js']
        }
      }
    ]
  }
});
