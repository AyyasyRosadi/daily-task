<script>
  import { goals, mealPlans, proteinSources } from '$lib/data/foods.js';
  import { profile, saveProfile } from '$lib/stores/data';
  import { activityLevels, macroTargets } from '$lib/utils/nutrition';

  const goal = $derived($profile?.goal ?? 'maintain');
  const ready = $derived(Boolean($profile?.weight && $profile?.height && $profile?.age));
  const targets = $derived(ready ? macroTargets($profile) : null);
  const plan = $derived(mealPlans[goal] ?? mealPlans.maintain);

  let form = $state({ sex: 'laki-laki', age: '', height: '', weight: '', activity: 'moderate' });
  let formLoaded = false;
  let editing = $state(false);

  $effect(() => {
    if ($profile && !formLoaded) {
      form = {
        sex: $profile.sex ?? 'laki-laki',
        age: $profile.age ?? '',
        height: $profile.height ?? '',
        weight: $profile.weight ?? '',
        activity: $profile.activity ?? 'moderate'
      };
      formLoaded = true;
      editing = !($profile.weight && $profile.height && $profile.age);
    }
  });

  async function saveBody() {
    await saveProfile({
      sex: form.sex,
      age: Number(form.age) || null,
      height: Number(form.height) || null,
      weight: Number(form.weight) || null,
      activity: form.activity
    });
    editing = false;
  }
</script>

<header>
  <h1 class="num text-3xl font-bold">Nutrisi</h1>
  <p class="mt-1 text-sm text-mute">
    Target kalori dan contoh menu harian yang menyesuaikan tujuan latihanmu.
  </p>
</header>

<section class="mt-5">
  <h2 class="text-sm font-semibold text-mute">Tujuan</h2>
  <div class="mt-2 flex gap-2">
    {#each goals as g}
      <button
        class="chip flex-1 {goal === g.id ? 'bg-plate-yellow text-rubber' : 'bg-rack text-mute'}"
        onclick={() => saveProfile({ goal: g.id })}
      >
        {g.name}
      </button>
    {/each}
  </div>
  <p class="mt-2 text-xs text-mute">{goals.find((g) => g.id === goal)?.note}</p>
</section>

{#if editing || !ready}
  <section class="card mt-4">
    <h2 class="font-semibold">Data tubuh</h2>
    <p class="mt-1 text-xs text-mute">Dipakai untuk menghitung kebutuhan kalori harian.</p>
    <div class="mt-4 grid grid-cols-2 gap-3">
      <label class="text-xs text-mute">
        Jenis kelamin
        <select class="field mt-1 text-sm" bind:value={form.sex}>
          <option value="laki-laki">Laki-laki</option>
          <option value="perempuan">Perempuan</option>
        </select>
      </label>
      <label class="text-xs text-mute">
        Usia
        <input class="field mt-1 text-sm" type="number" inputmode="numeric" bind:value={form.age} />
      </label>
      <label class="text-xs text-mute">
        Tinggi (cm)
        <input class="field mt-1 text-sm" type="number" inputmode="numeric" bind:value={form.height} />
      </label>
      <label class="text-xs text-mute">
        Berat (kg)
        <input class="field mt-1 text-sm" type="number" inputmode="decimal" step="0.1" bind:value={form.weight} />
      </label>
    </div>
    <label class="mt-3 block text-xs text-mute">
      Tingkat aktivitas
      <select class="field mt-1 text-sm" bind:value={form.activity}>
        {#each activityLevels as a}
          <option value={a.id}>{a.name} &mdash; {a.hint}</option>
        {/each}
      </select>
    </label>
    <button class="btn-primary mt-4 w-full" onclick={saveBody}>Simpan data tubuh</button>
  </section>
{/if}

{#if targets && !editing}
  <section class="card mt-4">
    <div class="flex items-baseline justify-between">
      <h2 class="font-semibold">Target harian</h2>
      <button class="text-xs text-mute underline underline-offset-4" onclick={() => (editing = true)}>
        Ubah data
      </button>
    </div>
    <p class="num mt-3 text-5xl font-bold text-plate-yellow">
      {targets.calories}<span class="ml-1 text-lg text-mute">kkal</span>
    </p>
    <p class="text-xs text-mute">Kebutuhan menjaga berat sekitar {targets.maintenance} kkal per hari.</p>

    <div class="mt-4 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-2xl font-bold text-plate-red">{targets.protein}</p>
        <p class="text-[11px] text-mute">g protein</p>
      </div>
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-2xl font-bold text-plate-blue">{targets.carbs}</p>
        <p class="text-[11px] text-mute">g karbohidrat</p>
      </div>
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-2xl font-bold text-plate-green">{targets.fat}</p>
        <p class="text-[11px] text-mute">g lemak</p>
      </div>
    </div>
  </section>
{/if}

<section class="mt-5">
  <h2 class="num text-2xl font-bold">Menu harian</h2>
  <p class="text-xs text-mute">Dua pilihan tiap waktu makan. Angka kalori adalah perkiraan per porsi.</p>

  <div class="mt-3 space-y-3">
    {#each plan as meal}
      <article class="card">
        <div class="flex items-baseline justify-between">
          <h3 class="font-semibold">{meal.slot}</h3>
          <span class="num text-sm text-mute">{meal.time}</span>
        </div>
        <ul class="mt-3 space-y-2">
          {#each meal.items as item}
            <li class="flex items-start justify-between gap-3 border-t border-white/5 pt-2 first:border-0 first:pt-0">
              <span class="text-sm">{item.name}</span>
              <span class="num shrink-0 text-right text-xs text-mute">
                {item.kcal} kkal<br />{item.protein} g protein
              </span>
            </li>
          {/each}
        </ul>
      </article>
    {/each}
  </div>
</section>

<section class="card mt-5">
  <h2 class="font-semibold">Sumber protein sehari-hari</h2>
  <ul class="mt-3 space-y-2">
    {#each proteinSources as s}
      <li class="flex items-center justify-between border-t border-white/5 pt-2 text-sm first:border-0 first:pt-0">
        <span>{s.name} <span class="text-xs text-mute">/ {s.per}</span></span>
        <span class="num text-mute">{s.protein} g &middot; {s.kcal} kkal</span>
      </li>
    {/each}
  </ul>
</section>

<p class="mt-5 text-xs text-mute">
  Angka di halaman ini adalah perkiraan umum. Kalau kamu punya kondisi kesehatan tertentu atau sedang
  dalam pengobatan, bicarakan dulu dengan dokter atau ahli gizi sebelum mengubah pola makan.
</p>
