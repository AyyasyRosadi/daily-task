<script>
  import { goals, mealPlans, proteinSources } from '$lib/data/foods.js';
  import { foodCategories, mealSlots, searchFoods } from '$lib/data/foodItems.js';
  import { addMeal, profile, removeMeal, saveProfile, todayMeals, todayNutrition } from '$lib/stores/data';
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

  // --- Catat makan ---

  let picking = $state(false);
  let search = $state('');
  let category = $state(null);
  let slot = $state(mealSlots[0].id);
  let servings = $state(1);

  const results = $derived(searchFoods(search, category).slice(0, 40));

  /** Sisa kalori terhadap target, dipakai untuk bar dan angka besar. */
  const remaining = $derived(targets ? targets.calories - $todayNutrition.calories : null);

  function pct(value, target) {
    if (!target) return 0;
    return Math.min(100, Math.round((value / target) * 100));
  }

  async function pick(food) {
    await addMeal(food, slot, servings);
    search = '';
    servings = 1;
    picking = false;
  }

  /** Kelompokkan catatan makan per waktu makan supaya mudah dibaca. */
  const grouped = $derived(
    mealSlots
      .map((s) => ({
        ...s,
        items: $todayMeals
          .map((item, index) => ({ ...item, index }))
          .filter((item) => item.slot === s.id)
      }))
      .filter((s) => s.items.length)
  );

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

{#if targets && !editing}
  <section class="card mt-4">
    <div class="flex items-baseline justify-between">
      <h2 class="font-semibold">Makan hari ini</h2>
      <span class="num text-sm {remaining < 0 ? 'text-plate-red' : 'text-mute'}">
        {remaining < 0 ? `${Math.abs(remaining)} kkal lewat` : `sisa ${remaining} kkal`}
      </span>
    </div>

    <p class="num mt-3 text-4xl font-bold">
      {$todayNutrition.calories}<span class="ml-1 text-base text-mute">/ {targets.calories} kkal</span>
    </p>
    <div class="mt-2 h-2 overflow-hidden rounded-full bg-rack">
      <div
        class="h-full rounded-full transition-[width] {remaining < 0 ? 'bg-plate-red' : 'bg-plate-yellow'}"
        style="width: {pct($todayNutrition.calories, targets.calories)}%"
      ></div>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-2">
      {#each [ { label: 'protein', value: $todayNutrition.protein, target: targets.protein, color: '#D6353B' }, { label: 'karbo', value: $todayNutrition.carbs, target: targets.carbs, color: '#2C6BE0' }, { label: 'lemak', value: $todayNutrition.fat, target: targets.fat, color: '#31A05F' } ] as m}
        <div class="rounded-xl bg-rack p-2 text-center">
          <p class="num text-lg font-bold" style="color: {m.color}">{Math.round(m.value)}</p>
          <p class="text-[10px] text-mute">dari {m.target} g {m.label}</p>
          <div class="mt-1 h-1 overflow-hidden rounded-full bg-deck">
            <div class="h-full rounded-full" style="width: {pct(m.value, m.target)}%; background: {m.color}"></div>
          </div>
        </div>
      {/each}
    </div>

    {#if grouped.length}
      <div class="mt-4 space-y-3 border-t border-hair/5 pt-3">
        {#each grouped as g (g.id)}
          <div>
            <p class="text-[11px] uppercase tracking-wide text-mute">{g.label}</p>
            <ul class="mt-1 space-y-1">
              {#each g.items as item (item.index)}
                <li class="flex items-center gap-2 text-sm">
                  <span class="min-w-0 flex-1">
                    <span class="block truncate">{item.name}</span>
                    <span class="block text-[11px] text-mute">
                      {item.servings > 1 ? `${item.servings} × ` : ''}{item.porsi}
                    </span>
                  </span>
                  <span class="num shrink-0 text-xs text-mute">{item.kcal} kkal</span>
                  <button
                    class="chip shrink-0 bg-rack text-plate-red"
                    onclick={() => removeMeal(item.index)}
                    aria-label={`Hapus ${item.name}`}
                  >
                    &times;
                  </button>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    {/if}

    {#if picking}
      <div class="mt-4 rounded-xl bg-rack p-3">
        <div class="grid grid-cols-2 gap-2">
          <label class="text-[11px] text-mute">
            Waktu makan
            <select class="field mt-1 px-3 py-2 text-sm" bind:value={slot}>
              {#each mealSlots as s}<option value={s.id}>{s.label}</option>{/each}
            </select>
          </label>
          <label class="text-[11px] text-mute">
            Jumlah porsi
            <input
              class="field mt-1 px-3 py-2 text-sm"
              type="number"
              inputmode="decimal"
              step="0.5"
              min="0.5"
              bind:value={servings}
            />
          </label>
        </div>

        <input class="field mt-2 text-sm" placeholder="Cari makanan..." bind:value={search} />

        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            class="chip {category === null ? 'bg-plate-yellow text-rubber' : 'bg-deck text-mute'}"
            onclick={() => (category = null)}
          >
            Semua
          </button>
          {#each foodCategories as c}
            <button
              class="chip {category === c.id ? 'bg-plate-yellow text-rubber' : 'bg-deck text-mute'}"
              onclick={() => (category = c.id)}
            >
              {c.label}
            </button>
          {/each}
        </div>

        <ul class="mt-2 max-h-72 space-y-1 overflow-y-auto">
          {#each results as food (food.name)}
            <li>
              <button class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-deck" onclick={() => pick(food)}>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm">{food.name}</span>
                  <span class="block text-[11px] text-mute">{food.porsi}</span>
                </span>
                <span class="num shrink-0 text-right text-[11px] text-mute">
                  {Math.round(food.kcal * (Number(servings) || 1))} kkal<br />
                  {Math.round(food.p * (Number(servings) || 1))} g protein
                </span>
              </button>
            </li>
          {:else}
            <li class="px-2 py-3 text-xs text-mute">Tidak ada makanan yang cocok.</li>
          {/each}
        </ul>

        <button class="mt-2 w-full text-xs text-mute underline underline-offset-4" onclick={() => (picking = false)}>
          Tutup
        </button>
      </div>
    {:else}
      <button class="btn-primary mt-4 w-full" onclick={() => (picking = true)}>Catat makanan</button>
    {/if}

    <p class="mt-3 text-[11px] text-mute">
      Angka makanan adalah perkiraan porsi rumah tangga. Masakan bersantan dan gorengan paling
      bervariasi, jadi anggap ini panduan arah, bukan ukuran pasti.
    </p>
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
            <li class="flex items-start justify-between gap-3 border-t border-hair/5 pt-2 first:border-0 first:pt-0">
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
      <li class="flex items-center justify-between border-t border-hair/5 pt-2 text-sm first:border-0 first:pt-0">
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
