<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { firebaseReady } from '$lib/firebase';
  import { authReady, user } from '$lib/stores/auth';
  import { profile, refreshDay, startSync, stopSync } from '$lib/stores/data';
  import { ensureServiceWorker, notify, startReminderScheduler } from '$lib/stores/notifications';
  import { onRestFinished } from '$lib/stores/rest';
  import { initTheme, setTheme } from '$lib/stores/theme';
  import Nav from '$lib/components/Nav.svelte';
  import RestTimer from '$lib/components/RestTimer.svelte';
  import SetupNotice from '$lib/components/SetupNotice.svelte';

  let { children } = $props();

  $effect(() => {
    if ($user) startSync($user.uid);
    else stopSync();
  });

  // Tema tersimpan lokal agar cepat, lalu disamakan dengan profil begitu sesi masuk.
  $effect(() => {
    if ($profile?.theme) setTheme($profile.theme);
  });

  $effect(() => {
    if (!$authReady) return;
    const onLoginPage = $page.url.pathname === '/masuk';
    if (!$user && !onLoginPage) goto('/masuk');
    if ($user && onLoginPage) goto('/');
  });

  onMount(() => {
    // Daftarkan lebih awal supaya cangkang aplikasi tersimpan sebelum sinyal hilang.
    ensureServiceWorker();
    const stopTheme = initTheme();

    const tick = () => refreshDay();
    document.addEventListener('visibilitychange', tick);
    const timer = setInterval(tick, 60_000);
    const stopReminders = startReminderScheduler();

    onRestFinished(({ label }) => {
      navigator.vibrate?.([200, 100, 200]);
      notify('Istirahat selesai', label ? `Lanjut set ${label}.` : 'Lanjut set berikutnya.');
    });
    return () => {
      document.removeEventListener('visibilitychange', tick);
      clearInterval(timer);
      stopReminders();
      stopTheme();
    };
  });
</script>

{#if !firebaseReady}
  <SetupNotice />
{:else if !$authReady}
  <div class="flex min-h-screen items-center justify-center text-mute">Menyiapkan sesi...</div>
{:else}
  <div class="min-h-screen">
    <main class="mx-auto w-full max-w-lg px-4 pb-28 pt-7">
      {@render children()}
    </main>
    {#if $user}<RestTimer /><Nav />{/if}
  </div>
{/if}
