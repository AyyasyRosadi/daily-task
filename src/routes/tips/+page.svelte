<script>
  import { tipCategories, tips } from '$lib/data/tips.js';
  import { logout } from '$lib/stores/auth';
  import { profile, stopSync } from '$lib/stores/data';

  let active = $state('Semua');
  const list = $derived(active === 'Semua' ? tips : tips.filter((t) => t.category === active));

  const accent = {
    Latihan: '#D6353B',
    Nutrisi: '#31A05F',
    Istirahat: '#2C6BE0',
    Kebiasaan: '#F0B429'
  };

  async function keluar() {
    stopSync();
    await logout();
  }
</script>

<header>
  <h1 class="num text-3xl font-bold">Tips sehat</h1>
  <p class="mt-1 text-sm text-mute">Hal-hal kecil yang paling sering menentukan hasil dalam jangka panjang.</p>
</header>

<div class="mt-4 flex flex-wrap gap-2">
  {#each tipCategories as c}
    <button
      class="chip {active === c ? 'bg-chalk text-rubber' : 'bg-rack text-mute'}"
      onclick={() => (active = c)}
    >
      {c}
    </button>
  {/each}
</div>

<div class="mt-4 space-y-3">
  {#each list as tip}
    <article class="card border-l-2" style="border-left-color: {accent[tip.category]}">
      <p class="text-[11px] text-mute">{tip.category}</p>
      <h2 class="mt-1 text-base font-semibold">{tip.title}</h2>
      <p class="mt-2 text-sm text-mute">{tip.body}</p>
    </article>
  {/each}
</div>

<section class="card mt-6">
  <h2 class="font-semibold">Akun</h2>
  {#if $profile}
    <p class="mt-1 text-xs text-mute">
      Data latihan tersimpan di Firebase dan ikut ke perangkat lain saat kamu masuk dengan akun sama.
    </p>
  {/if}
  <button class="btn-ghost mt-3 w-full" onclick={keluar}>Keluar dari akun</button>
</section>
