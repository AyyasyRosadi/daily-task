<script>
  import { page } from '$app/stores';
  import { rest } from '$lib/stores/rest';
  import { activity, elapsed, pauseActivity, resumeActivity } from '$lib/stores/tracker';
  import { activityTypes, distanceLabel, durationLabel } from '$lib/utils/geo';

  // Di halaman Kardio sendiri sudah ada kendali yang jauh lebih lengkap, jadi
  // penanda ini hanya muncul saat pengguna sedang di halaman lain.
  const show = $derived($activity && $page.url.pathname !== '/aktivitas');

  // Timer istirahat memakai tempat yang sama persis. Kalau dua-duanya hidup,
  // penanda ini naik satu tingkat supaya tidak saling menimpa.
  const bottom = $derived($rest ? 'bottom-[148px]' : 'bottom-[68px]');
</script>

{#if show}
  <div
    class="fixed inset-x-0 z-30 px-4 {bottom}"
    style="padding-bottom: env(safe-area-inset-bottom)"
    role="status"
    aria-live="polite"
  >
    <div
      class="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-hair/10 bg-deck px-4 py-3 shadow-lg shadow-black/40"
    >
      <a href="/aktivitas" class="min-w-0 flex-1">
        <p class="text-[11px] text-mute">
          {activityTypes[$activity.type].icon}
          {activityTypes[$activity.type].label}
          {$activity.status === 'jeda' ? '· jeda' : '· berjalan'}
        </p>
        <p class="num text-2xl font-bold text-plate-yellow">
          {durationLabel($elapsed)}
          <span class="text-base text-mute">{distanceLabel($activity.distance)}</span>
        </p>
      </a>

      {#if $activity.status === 'jalan'}
        <button class="chip bg-rack text-chalk" onclick={pauseActivity}>Jeda</button>
      {:else}
        <button class="chip bg-plate-yellow text-rubber" onclick={resumeActivity}>Lanjut</button>
      {/if}
      <a class="chip bg-rack text-chalk" href="/aktivitas">Buka</a>
    </div>
  </div>
{/if}
