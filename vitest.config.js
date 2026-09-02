import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Tes hanya menyasar logika murni di `src/lib`, jadi konfigurasi ini sengaja
 * tidak memuat plugin SvelteKit. Alias `$lib` disediakan manual; modul `$app/*`
 * dan `$env/*` di-stub karena hanya ada saat aplikasi benar-benar berjalan.
 */
export default defineConfig({
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      '$app/environment': fileURLToPath(new URL('./tests/stubs/app-environment.js', import.meta.url)),
      '$app/stores': fileURLToPath(new URL('./tests/stubs/app-stores.js', import.meta.url)),
      '$env/dynamic/public': fileURLToPath(new URL('./tests/stubs/env-public.js', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
});
