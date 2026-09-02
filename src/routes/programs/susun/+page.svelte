<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { byGroup, exercises, groups } from '$lib/data/exercises.js';
  import { groupColor } from '$lib/data/programs.js';
  import {
    blankProgram,
    programMap,
    saveCustomProgram,
    uniqueProgramId
  } from '$lib/stores/programs';
  import { dayLong } from '$lib/utils/date';

  const editingId = $page.url.searchParams.get('id');

  // Senin dulu, Minggu terakhir — urutan yang dipakai seluruh aplikasi.
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];

  let draft = $state(blankProgram());
  let loaded = $state(false);
  let openDay = $state(null);
  let picker = $state(null); // { day, group }
  let saving = $state(false);
  let error = $state('');

  // Program yang diubah baru tersedia setelah langganan Firestore masuk.
  $effect(() => {
    if (loaded) return;
    if (!editingId) {
      loaded = true;
      return;
    }
    const found = $programMap.get(editingId);
    if (found) {
      draft = structuredClone({ ...found, custom: true });
      loaded = true;
    }
  });

  const trainingDayCount = $derived(
    weekOrder.filter((d) => draft.schedule?.[d]?.exercises?.length).length
  );

  function sessionFor(day) {
    return draft.schedule?.[day] ?? null;
  }

  function ensureSession(day) {
    if (!draft.schedule[day]) {
      draft.schedule[day] = { title: '', focus: '', minutes: 45, exercises: [] };
    }
    return draft.schedule[day];
  }

  function removeDay(day) {
    delete draft.schedule[day];
    draft.schedule = { ...draft.schedule };
    if (openDay === day) openDay = null;
  }

  function addExercise(day, name) {
    const session = ensureSession(day);
    session.exercises = [
      ...session.exercises,
      { name, sets: 3, reps: '10', group: exercises[name]?.group ?? 'inti' }
    ];
    draft.schedule = { ...draft.schedule };
    picker = null;
  }

  function removeExercise(day, index) {
    const session = draft.schedule[day];
    session.exercises = session.exercises.filter((_, i) => i !== index);
    draft.schedule = { ...draft.schedule };
  }

  function moveExercise(day, index, delta) {
    const session = draft.schedule[day];
    const next = [...session.exercises];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    session.exercises = next;
    draft.schedule = { ...draft.schedule };
  }

  async function save() {
    error = '';
    const name = draft.name.trim();
    if (!name) {
      error = 'Program perlu nama.';
      return;
    }
    if (trainingDayCount === 0) {
      error = 'Tambahkan minimal satu hari latihan dengan gerakan di dalamnya.';
      return;
    }

    // Hari tanpa gerakan dibuang: hari kosong sudah otomatis jadi hari istirahat.
    const schedule = {};
    for (const day of weekOrder) {
      const s = draft.schedule[day];
      if (!s?.exercises?.length) continue;
      schedule[day] = {
        title: s.title.trim() || `Latihan ${dayLong[day]}`,
        focus: s.focus.trim() || 'Latihan',
        minutes: Number(s.minutes) || 45,
        exercises: s.exercises.map((e) => ({
          name: e.name,
          sets: Number(e.sets) || 3,
          reps: String(e.reps || '10'),
          group: e.group
        }))
      };
    }

    saving = true;
    try {
      const id = draft.id || uniqueProgramId(name);
      await saveCustomProgram({
        ...draft,
        id,
        name,
        goal: draft.goal.trim() || 'Program buatan sendiri',
        summary: draft.summary.trim() || `${Object.keys(schedule).length} sesi per minggu.`,
        weeks: Number(draft.weeks) || 8,
        daysPerWeek: Object.keys(schedule).length,
        schedule
      });
      goto('/programs');
    } catch {
      error = 'Gagal menyimpan. Cek koneksi lalu coba lagi.';
    } finally {
      saving = false;
    }
  }
</script>

<header>
  <a class="text-xs text-mute underline underline-offset-4" href="/programs">&larr; Kembali</a>
  <h1 class="num mt-2 text-3xl font-bold">{editingId ? 'Ubah program' : 'Susun program'}</h1>
  <p class="mt-1 text-sm text-mute">
    Tentukan hari latihan dan gerakannya. Hari yang dibiarkan kosong otomatis jadi hari istirahat.
  </p>
</header>

{#if editingId && !loaded}
  <p class="mt-10 text-center text-mute">Memuat program...</p>
{:else}
  <section class="card mt-5">
    <h2 class="font-semibold">Keterangan</h2>
    <label class="mt-3 block text-xs text-mute">
      Nama program
      <input class="field mt-1 text-sm" placeholder="Misal: Upper Lower Saya" bind:value={draft.name} />
    </label>
    <div class="mt-3 grid grid-cols-2 gap-3">
      <label class="text-xs text-mute">
        Tingkat
        <select class="field mt-1 text-sm" bind:value={draft.level}>
          <option value="Pemula">Pemula</option>
          <option value="Menengah">Menengah</option>
          <option value="Lanjutan">Lanjutan</option>
        </select>
      </label>
      <label class="text-xs text-mute">
        Durasi (minggu)
        <input class="field mt-1 text-sm" type="number" inputmode="numeric" min="1" max="52" bind:value={draft.weeks} />
      </label>
    </div>
    <label class="mt-3 block text-xs text-mute">
      Tempat
      <select class="field mt-1 text-sm" bind:value={draft.place}>
        <option value="Gym">Gym</option>
        <option value="Rumah">Rumah</option>
        <option value="Gym atau rumah">Gym atau rumah</option>
      </select>
    </label>
    <label class="mt-3 block text-xs text-mute">
      Tujuan
      <input class="field mt-1 text-sm" placeholder="Misal: Menambah massa otot" bind:value={draft.goal} />
    </label>
    <label class="mt-3 block text-xs text-mute">
      Ringkasan
      <textarea class="field mt-1 min-h-16 resize-y text-sm" bind:value={draft.summary}></textarea>
    </label>
  </section>

  <section class="mt-4">
    <div class="flex items-baseline justify-between">
      <h2 class="num text-2xl font-bold">Jadwal mingguan</h2>
      <span class="text-xs text-mute">{trainingDayCount} hari latihan</span>
    </div>

    <div class="mt-3 space-y-2">
      {#each weekOrder as day (day)}
        {@const session = sessionFor(day)}
        {@const count = session?.exercises?.length ?? 0}
        <article class="overflow-hidden rounded-xl border border-hair/5 bg-deck">
          <button
            class="flex w-full items-center gap-3 px-4 py-3 text-left"
            onclick={() => (openDay = openDay === day ? null : day)}
            aria-expanded={openDay === day}
          >
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium">{dayLong[day]}</span>
              <span class="block text-xs text-mute">
                {count ? `${session.title || 'Tanpa judul'} · ${count} gerakan` : 'Istirahat'}
              </span>
            </span>
            <span class="chip shrink-0 {count ? 'bg-plate-green/20 text-plate-green' : 'bg-rack text-mute'}">
              {count ? 'Latihan' : 'Kosong'}
            </span>
          </button>

          {#if openDay === day}
            <div class="border-t border-hair/5 px-4 py-3">
              <div class="grid grid-cols-2 gap-3">
                <label class="col-span-2 text-xs text-mute">
                  Judul sesi
                  <input
                    class="field mt-1 text-sm"
                    placeholder="Misal: Dorong A"
                    value={session?.title ?? ''}
                    onchange={(e) => {
                      ensureSession(day).title = e.currentTarget.value;
                      draft.schedule = { ...draft.schedule };
                    }}
                  />
                </label>
                <label class="text-xs text-mute">
                  Fokus
                  <input
                    class="field mt-1 text-sm"
                    placeholder="Dada + trisep"
                    value={session?.focus ?? ''}
                    onchange={(e) => {
                      ensureSession(day).focus = e.currentTarget.value;
                      draft.schedule = { ...draft.schedule };
                    }}
                  />
                </label>
                <label class="text-xs text-mute">
                  Perkiraan menit
                  <input
                    class="field mt-1 text-sm"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    value={session?.minutes ?? 45}
                    onchange={(e) => {
                      ensureSession(day).minutes = Number(e.currentTarget.value) || 0;
                      draft.schedule = { ...draft.schedule };
                    }}
                  />
                </label>
              </div>

              {#if count}
                <ul class="mt-4 space-y-2">
                  {#each session.exercises as ex, i (i)}
                    <li class="rounded-xl bg-rack p-3">
                      <div class="flex items-center gap-2">
                        <span
                          class="h-8 w-1 shrink-0 rounded-full"
                          style="background: {groupColor[ex.group] ?? '#E7E3DA'}"
                        ></span>
                        <span class="min-w-0 flex-1 truncate text-sm">{ex.name}</span>
                        <button
                          class="chip bg-deck text-mute"
                          onclick={() => moveExercise(day, i, -1)}
                          disabled={i === 0}
                          aria-label="Naikkan"
                        >
                          &uarr;
                        </button>
                        <button
                          class="chip bg-deck text-mute"
                          onclick={() => moveExercise(day, i, 1)}
                          disabled={i === count - 1}
                          aria-label="Turunkan"
                        >
                          &darr;
                        </button>
                        <button
                          class="chip bg-deck text-plate-red"
                          onclick={() => removeExercise(day, i)}
                          aria-label="Hapus gerakan"
                        >
                          &times;
                        </button>
                      </div>
                      <div class="mt-2 grid grid-cols-2 gap-2">
                        <label class="text-[11px] text-mute">
                          Set
                          <input
                            class="field mt-1 px-3 py-2 text-sm"
                            type="number"
                            inputmode="numeric"
                            min="1"
                            max="10"
                            value={ex.sets}
                            onchange={(e) => {
                              ex.sets = Number(e.currentTarget.value) || 1;
                              draft.schedule = { ...draft.schedule };
                            }}
                          />
                        </label>
                        <label class="text-[11px] text-mute">
                          Repetisi
                          <input
                            class="field mt-1 px-3 py-2 text-sm"
                            placeholder="10 atau 40 detik"
                            value={ex.reps}
                            onchange={(e) => {
                              ex.reps = e.currentTarget.value;
                              draft.schedule = { ...draft.schedule };
                            }}
                          />
                        </label>
                      </div>
                    </li>
                  {/each}
                </ul>
              {/if}

              {#if picker?.day === day}
                <div class="mt-3 rounded-xl bg-rack p-3">
                  <div class="flex flex-wrap gap-1.5">
                    {#each groups() as g}
                      <button
                        class="chip {picker.group === g ? 'bg-plate-yellow text-rubber' : 'bg-deck text-mute'}"
                        onclick={() => (picker = { day, group: g })}
                      >
                        {g}
                      </button>
                    {/each}
                  </div>
                  {#if picker.group}
                    <ul class="mt-3 max-h-64 space-y-1 overflow-y-auto">
                      {#each byGroup(picker.group) as ex (ex.name)}
                        <li>
                          <button
                            class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-deck"
                            onclick={() => addExercise(day, ex.name)}
                          >
                            {ex.name}
                          </button>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                  <button
                    class="mt-2 w-full text-xs text-mute underline underline-offset-4"
                    onclick={() => (picker = null)}
                  >
                    Tutup
                  </button>
                </div>
              {:else}
                <button
                  class="btn-ghost mt-3 w-full"
                  onclick={() => (picker = { day, group: groups()[0] })}
                >
                  Tambah gerakan
                </button>
              {/if}

              {#if count}
                <button
                  class="mt-2 w-full text-xs text-plate-red underline underline-offset-4"
                  onclick={() => removeDay(day)}
                >
                  Jadikan hari istirahat
                </button>
              {/if}
            </div>
          {/if}
        </article>
      {/each}
    </div>
  </section>

  {#if error}
    <p class="mt-4 rounded-xl bg-plate-red/15 p-3 text-sm text-plate-red">{error}</p>
  {/if}

  <button class="btn-primary mt-4 w-full" onclick={save} disabled={saving}>
    {saving ? 'Menyimpan...' : editingId ? 'Simpan perubahan' : 'Simpan program'}
  </button>

  <p class="mt-3 text-xs text-mute">
    Mengubah program yang sedang berjalan tidak mengubah catatan hari-hari sebelumnya. Catatan hari
    ini baru ikut berubah setelah kamu menyusun ulang sesi dari halaman Hari ini.
  </p>
{/if}
