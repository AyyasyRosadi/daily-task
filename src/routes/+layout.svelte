<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { firebaseReady } from '$lib/firebase';
  import { authReady, user } from '$lib/stores/auth';
  import { refreshDay, startSync, stopSync } from '$lib/stores/data';
  import { startReminderScheduler } from '$lib/stores/notifications';
  import Nav from '$lib/components/Nav.svelte';
  import SetupNotice from '$lib/components/SetupNotice.svelte';

  let { children } = $props();

  $effect(() => {
    if ($user) startSync($user.uid);
    else stopSync();
  });

  $effect(() => {
    if (!$authReady) return;
    const onLoginPage = $page.url.pathname === '/masuk';
    if (!$user && !onLoginPage) goto('/masuk');
    if ($user && onLoginPage) goto('/');
  });

  onMount(() => {
    const tick = () => refreshDay();
    document.addEventListener('visibilitychange', tick);
    const timer = setInterval(tick, 60_000);
    const stopReminders = startReminderScheduler();
    return () => {
      document.removeEventListener('visibilitychange', tick);
      clearInterval(timer);
      stopReminders();
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
    {#if $user}<Nav />{/if}
  </div>
{/if}
