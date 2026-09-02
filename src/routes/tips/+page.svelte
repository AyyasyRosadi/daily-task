<script>
  import { tipCategories, tips } from '$lib/data/tips.js';
  import { dayKey, profile } from '$lib/stores/data';
  import { programMap } from '$lib/stores/programs';
  import { dailyTips } from '$lib/utils/tips';

  let active = $state('Semua');

  // Program yang sedang dijalani, kalau ada. Program buatan sendiri ikut kena
  // penargetan lewat tingkat dan tempatnya, sama seperti program bawaan.
  const program = $derived($profile?.activeProgram ? ($programMap.get($profile.activeProgram) ?? null) : null);

  const list = $derived(
    dailyTips(tips, { dateKey: $dayKey, program, category: active })
  );

  const hariIni = $derived(list[0] ?? null);
  const sisanya = $derived(list.slice(1));
  const relevan = $derived(list.filter((t) => t.tier > 0).length);

  const accent = {
    Latihan: '#D6353B',
    Nutrisi: '#31A05F',
    Istirahat: '#2C6BE0',
    Kebiasaan: '#F0B429'
  };
</script>

<header>
  <a class="text-xs text-mute underline underline-offset-4" href="/">&larr; Hari ini</a>
  <h1 class="num mt-2 text-3xl font-bold">Tips sehat</h1>
  <p class="mt-1 text-sm text-mute">
    {tips.length} tips, urutannya diacak ulang tiap hari.
    {#if program}
      Yang berhubungan dengan {program.name} dinaikkan ke atas.
    {:else}
      Pilih program di halaman Program supaya tips yang muncul lebih terarah.
    {/if}
  </p>
</header>

{#if hariIni}
  <article class="card mt-5 border-l-2" style="border-left-color: {accent[hariIni.category]}">
    <div class="flex items-baseline justify-between gap-3">
      <p class="text-[11px] uppercase tracking-wide text-plate-yellow">Tips hari ini</p>
      <p class="text-[11px] text-mute">{hariIni.category}</p>
    </div>
    <h2 class="mt-1 text-lg font-semibold">{hariIni.title}</h2>
    <p class="mt-2 text-sm text-mute">{hariIni.body}</p>
    {#if hariIni.tier > 0 && program}
      <p class="mt-3 text-[11px] text-mute">Dipilih karena kamu sedang menjalani {program.name}.</p>
    {/if}
  </article>
{/if}

<div class="mt-4 flex flex-wrap gap-2">
  {#each tipCategories as c}
    <button
      class="chip {active === c ? 'bg-chalk text-rubber' : 'bg-rack text-mute'}"
      onclick={() => (active = c)}
      aria-pressed={active === c}
    >
      {c}
    </button>
  {/each}
</div>

{#if program && relevan > 0}
  <p class="mt-3 text-[11px] text-mute">
    {relevan} tips di bawah menyangkut program yang sedang kamu jalani, dan muncul lebih dulu.
  </p>
{/if}

<div class="mt-3 space-y-3">
  {#each sisanya as tip (tip.title)}
    <article class="card border-l-2" style="border-left-color: {accent[tip.category]}">
      <div class="flex items-baseline justify-between gap-3">
        <p class="text-[11px] text-mute">{tip.category}</p>
        {#if tip.tier > 0}
          <p class="text-[11px] text-plate-yellow">Sesuai programmu</p>
        {/if}
      </div>
      <h2 class="mt-1 text-base font-semibold">{tip.title}</h2>
      <p class="mt-2 text-sm text-mute">{tip.body}</p>
    </article>
  {/each}
</div>
