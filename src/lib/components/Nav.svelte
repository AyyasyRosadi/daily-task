<script>
  import { page } from '$app/stores';

  /**
   * Lima tab, dan sengaja tidak lebih.
   *
   * Halaman lain dicapai dari halaman induknya, bukan dari sini: Kardio dan
   * Tips lewat kartu di halaman Hari ini, Riwayat dan Ukuran tubuh lewat
   * halaman Progres. Di layar ponsel 360 px, tujuh tab membuat labelnya saling
   * berdempetan dan tidak ada satu pun yang gampang ditekan.
   */
  const items = [
    { href: '/', label: 'Hari ini', d: 'M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z' },
    { href: '/programs', label: 'Program', d: 'M5 6h14M5 12h14M5 18h9' },
    { href: '/progress', label: 'Progres', d: 'M4 19V9m5 10V5m5 14v-7m5 7V8' },
    { href: '/nutrisi', label: 'Nutrisi', d: 'M12 8c0-2.5 2-4 4-4 0 2.5-1.7 4-4 4zm0 0c-1.4-1.6-4.4-2.2-6.2-.4C3.6 9.7 4.3 14 6.6 17.4 8 19.5 10 21 12 21s4-1.5 5.4-3.6c2.3-3.4 3-7.7.8-9.8-1.8-1.8-4.8-1.2-6.2.4z' },
    { href: '/profil', label: 'Profil', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0' }
  ];

  const active = $derived($page.url.pathname);

  /**
   * Halaman yang tidak punya tab sendiri tetap menyalakan tab induknya, supaya
   * pengguna tidak merasa keluar dari aplikasi saat membuka Kardio atau Riwayat.
   */
  const induk = {
    '/aktivitas': '/',
    '/tips': '/',
    '/riwayat': '/progress',
    '/ukuran': '/progress'
  };
  const tabAktif = $derived(induk[active] ?? active);
</script>

<nav
  class="fixed inset-x-0 bottom-0 z-20 border-t border-hair/5 bg-rubber/95 backdrop-blur"
  style="padding-bottom: env(safe-area-inset-bottom)"
>
  <ul class="mx-auto flex max-w-lg">
    {#each items as item}
      {@const isActive = tabAktif === item.href}
      <li class="flex-1">
        <a
          href={item.href}
          class="flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors {isActive
            ? 'text-plate-yellow'
            : 'text-mute hover:text-chalk'}"
          aria-current={isActive ? 'page' : undefined}
        >
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d={item.d} />
          </svg>
          {item.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>
