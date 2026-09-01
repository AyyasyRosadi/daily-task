/**
 * Service worker Gym Daily.
 *
 * Dua tugas: menampilkan notifikasi pengingat, dan menyimpan cangkang aplikasi
 * supaya tetap terbuka saat sinyal gym jelek atau tidak ada internet sama sekali.
 *
 * Berkas ini ditulis tangan, bukan dihasilkan build, jadi ia sengaja tidak memakai
 * daftar aset hasil build. Sebagai gantinya aset ber-hash di /_app/immutable/
 * disimpan saat pertama diminta — isinya sudah terikat hash, jadi tidak pernah basi.
 */

const VERSION = 'v2';
const SHELL = `gym-daily-shell-${VERSION}`;
const ASSETS = `gym-daily-assets-${VERSION}`;

// Halaman yang perlu tersedia offline. Aplikasi ini client-side rendering penuh,
// jadi satu dokumen root sudah cukup untuk semua rute.
const SHELL_URLS = ['/', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {
        /* satu aset gagal tidak boleh menggagalkan pemasangan */
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL && k !== ASSETS).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

/** Aset ber-hash aman disimpan selamanya. */
function isImmutable(url) {
  return url.pathname.startsWith('/_app/immutable/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Firebase dan Google Fonts diurus jaringan

  if (isImmutable(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSETS).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Navigasi: coba jaringan dulu supaya rilis baru langsung terpakai,
  // jatuh ke cangkang tersimpan kalau sedang offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/').then((hit) => hit ?? Response.error()))
    );
    return;
  }

  if (SHELL_URLS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((hit) => hit ?? fetch(request)));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
