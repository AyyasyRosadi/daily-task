<script>
  import { alternativesFor, equipmentLabel, guideFor } from '$lib/data/exercises.js';
  import { groupColor } from '$lib/data/programs.js';
  import { setsOf, trimNumber } from '$lib/utils/workout';

  let {
    task,
    ontoggle,
    onlogset,
    onaddset,
    onremoveset,
    onswap,
    last = null,
    record = null,
    suggestion = null,
    expanded = false,
    ontoggleexpand
  } = $props();

  const suggestionColor = {
    naik: 'text-plate-green',
    tahan: 'text-plate-yellow',
    turun: 'text-plate-red',
    pemulihan: 'text-plate-blue'
  };

  const sets = $derived(setsOf(task));
  const doneCount = $derived(sets.filter((s) => s.done).length);
  const accent = $derived(groupColor[task.group] ?? '#E7E3DA');
  const guide = $derived(guideFor(task.name));
  const alternatives = $derived(alternativesFor(task.name));

  let panel = $state('set'); // 'set' | 'panduan' | 'ganti'

  /** Beban acuan: set sebelumnya di sesi ini, kalau tidak ada pakai sesi lalu. */
  function suggestedKg(index) {
    for (let i = index - 1; i >= 0; i--) {
      if (Number(sets[i].kg) > 0) return sets[i].kg;
    }
    return suggestion?.kg ?? last?.sets?.[index]?.kg ?? last?.topKg ?? null;
  }

  function commit(index, field, value) {
    const raw = String(value).replace(',', '.').trim();
    const num = raw === '' ? null : Number(raw);
    onlogset?.(task.id, index, { [field]: Number.isFinite(num) ? num : null });
  }

  function completeSet(index) {
    const set = sets[index];
    if (set.done) {
      onlogset?.(task.id, index, { done: false });
      return;
    }
    // Beban dan repetisi kosong diisi acuan supaya satu ketukan sudah cukup.
    const patch = { done: true };
    if (set.kg === null) patch.kg = suggestedKg(index);
    if (set.reps === null) {
      const target = parseInt(task.reps, 10);
      patch.reps = last?.sets?.[index]?.reps ?? (Number.isFinite(target) ? target : null);
    }
    onlogset?.(task.id, index, patch);
  }
</script>

<div class="overflow-hidden rounded-xl border border-hair/5 bg-rack/60">
  <div class="flex w-full items-center gap-3 px-3 py-3">
    <span
      class="h-9 w-1.5 shrink-0 rounded-full"
      style="background: {task.done ? accent : 'var(--overlay-strong)'}"
    ></span>

    <button
      type="button"
      class="min-w-0 flex-1 text-left"
      onclick={() => ontoggleexpand?.(task.id)}
      aria-expanded={expanded}
    >
      <span class="block truncate text-[15px] font-medium {task.done ? 'text-mute line-through' : 'text-chalk'}">
        {task.name}
      </span>
      <span class="block text-xs text-mute">
        {doneCount}/{sets.length} set &middot; target {task.reps}
        {#if last}
          <span class="text-mute/70">&middot; lalu {trimNumber(last.topKg)} kg</span>
        {/if}
      </span>
    </button>

    <button
      type="button"
      onclick={() => ontoggle?.(task.id)}
      aria-label={task.done ? `Batalkan ${task.name}` : `Tandai ${task.name} selesai`}
      aria-pressed={task.done}
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border {task.done
        ? 'border-plate-yellow bg-plate-yellow'
        : 'border-hair/20'}"
    >
      {#if task.done}
        <svg viewBox="0 0 20 20" class="h-4 w-4 text-rubber" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m5 10 3.5 3.5L15 6.5" />
        </svg>
      {/if}
    </button>
  </div>

  {#if expanded}
    <div class="border-t border-hair/5 px-3 py-3">
      <div class="mb-3 flex gap-2">
        <button
          class="chip flex-1 {panel === 'set' ? 'bg-plate-yellow text-rubber' : 'bg-rack text-mute'}"
          onclick={() => (panel = 'set')}
        >
          Set
        </button>
        <button
          class="chip flex-1 {panel === 'panduan' ? 'bg-plate-yellow text-rubber' : 'bg-rack text-mute'} disabled:opacity-40"
          onclick={() => (panel = 'panduan')}
          disabled={!guide}
        >
          Panduan
        </button>
        <button
          class="chip flex-1 {panel === 'ganti' ? 'bg-plate-yellow text-rubber' : 'bg-rack text-mute'} disabled:opacity-40"
          onclick={() => (panel = 'ganti')}
          disabled={!alternatives.length}
        >
          Ganti
        </button>
      </div>

      {#if panel === 'set'}
        {#if suggestion}
          <div class="mb-3 rounded-xl bg-rack p-3">
            <p class="text-sm">
              <span class="text-mute">Saran hari ini:</span>
              <span class="num font-semibold {suggestionColor[suggestion.status] ?? 'text-chalk'}">
                {trimNumber(suggestion.kg)} kg
              </span>
            </p>
            <p class="mt-0.5 text-[11px] text-mute">{suggestion.reason}</p>
          </div>
        {/if}

        {#if last || record}
          <p class="mb-3 text-[11px] text-mute">
            {#if last}Sesi lalu ({last.date}): {trimNumber(last.topKg)} kg &times; {last.totalReps} rep{/if}
            {#if record}<span class="text-plate-yellow"> &middot; rekor {trimNumber(record.topKg)} kg</span>{/if}
          </p>
        {/if}

        <div class="grid grid-cols-[1.5rem_1fr_1fr_2rem] items-center gap-2 text-[11px] text-mute">
          <span>Set</span>
          <span>Beban (kg)</span>
          <span>Repetisi</span>
          <span class="sr-only">Selesai</span>
        </div>

        <div class="mt-1 space-y-2">
          {#each sets as set, i (i)}
            <div class="grid grid-cols-[1.5rem_1fr_1fr_2rem] items-center gap-2">
              <span class="num text-sm {set.done ? 'text-plate-green' : 'text-mute'}">{i + 1}</span>
              <input
                class="field px-3 py-2 text-sm"
                type="number"
                inputmode="decimal"
                step="0.5"
                min="0"
                placeholder={suggestedKg(i) !== null ? String(trimNumber(suggestedKg(i))) : '—'}
                value={set.kg ?? ''}
                onchange={(e) => commit(i, 'kg', e.currentTarget.value)}
              />
              <input
                class="field px-3 py-2 text-sm"
                type="number"
                inputmode="numeric"
                step="1"
                min="0"
                placeholder={task.reps}
                value={set.reps ?? ''}
                onchange={(e) => commit(i, 'reps', e.currentTarget.value)}
              />
              <button
                type="button"
                onclick={() => completeSet(i)}
                aria-label={set.done ? `Batalkan set ${i + 1}` : `Selesaikan set ${i + 1}`}
                aria-pressed={set.done}
                class="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors {set.done
                  ? 'border-plate-green bg-plate-green'
                  : 'border-hair/20'}"
              >
                <svg viewBox="0 0 20 20" class="h-4 w-4 {set.done ? 'text-rubber' : 'text-mute'}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m5 10 3.5 3.5L15 6.5" />
                </svg>
              </button>
            </div>
          {/each}
        </div>

        <div class="mt-3 flex gap-2">
          <button class="chip flex-1 bg-rack text-chalk" onclick={() => onaddset?.(task.id)}>
            Tambah set
          </button>
          {#if sets.length > 1}
            <button class="chip flex-1 bg-rack text-mute" onclick={() => onremoveset?.(task.id)}>
              Hapus set terakhir
            </button>
          {/if}
        </div>
      {:else if panel === 'panduan' && guide}
        <p class="text-[11px] uppercase tracking-wide text-mute">
          {guide.group} &middot; {equipmentLabel[guide.equipment] ?? guide.equipment}
        </p>
        <ul class="mt-2 space-y-1.5">
          {#each guide.cues as cue}
            <li class="flex gap-2 text-sm">
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-plate-yellow"></span>
              <span>{cue}</span>
            </li>
          {/each}
        </ul>
        <p class="mt-3 rounded-xl bg-rack p-3 text-xs text-mute">
          <span class="font-semibold text-plate-red">Sering salah:</span>
          {guide.mistake}
        </p>
      {:else if panel === 'ganti'}
        <p class="text-xs text-mute">
          Alat sedang dipakai atau gerakannya tidak cocok? Pilih pengganti yang melatih kelompok otot
          sama. Set yang sudah tercatat akan direset.
        </p>
        <ul class="mt-3 space-y-2">
          {#each alternatives as alt (alt.name)}
            <li>
              <button
                class="flex w-full items-center gap-3 rounded-xl bg-rack px-3 py-2.5 text-left"
                onclick={() => {
                  onswap?.(task.id, alt.name);
                  panel = 'set';
                }}
              >
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm">{alt.name}</span>
                  <span class="block text-[11px] text-mute">
                    {equipmentLabel[alt.equipment] ?? alt.equipment}
                  </span>
                </span>
                <span class="chip shrink-0 bg-deck text-mute">Pilih</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>
