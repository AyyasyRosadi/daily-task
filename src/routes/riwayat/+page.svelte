<script>
  import { page } from '$app/stores';
  import { groupColor } from '$lib/data/programs.js';
  import { allLogs, dayKey, loadYear, weights } from '$lib/stores/data';
  import { formatLong, keyToDate, monthLong } from '$lib/utils/date';
  import { logVolume, setsOf, trimNumber } from '$lib/utils/workout';

  const today = keyToDate($dayKey);

  // ?d=YYYY-MM-DD membuka tanggal tertentu, dipakai strip minggu di halaman Hari ini.
  const requested = $page.url.searchParams.get('d');
  const initial = /^\d{4}-\d{2}-\d{2}$/.test(requested ?? '') ? requested : $dayKey;
  const initialDate = keyToDate(initial);

  let viewYear = $state(initialDate.getFullYear());
  let viewMonth = $state(initialDate.getMonth());
  let selected = $state(initial);

  // Tahun selain tahun berjalan tidak ikut langganan realtime, jadi diambil sekali jalan.
  $effect(() => {
    loadYear(viewYear);
  });

  const logsByKey = $derived(new Map($allLogs.map((l) => [l.id, l])));
  const weightByKey = $derived(new Map($weights.map((w) => [w.id, w])));

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Sel kalender Senin..Minggu, termasuk sel kosong sebelum tanggal 1. */
  const cells = $derived.by(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const lead = (first.getDay() + 6) % 7;
    const total = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= total; d++) {
      const key = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
      out.push({ day: d, key, log: logsByKey.get(key) ?? null, future: key > $dayKey });
    }
    return out;
  });

  const monthLogs = $derived(
    $allLogs.filter((l) => l.id.startsWith(`${viewYear}-${pad(viewMonth + 1)}`))
  );
  const monthTraining = $derived(monthLogs.filter((l) => l.completed && !l.isRest).length);
  const monthRest = $derived(monthLogs.filter((l) => l.completed && l.isRest).length);
  const monthVolume = $derived(monthLogs.reduce((sum, l) => sum + logVolume(l), 0));

  const detail = $derived(logsByKey.get(selected) ?? null);
  const detailWeight = $derived(weightByKey.get(selected) ?? null);
  const detailVolume = $derived(logVolume(detail));

  function shiftMonth(delta) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
  }

  /** Bulan depan hanya bisa dibuka sampai bulan berjalan. */
  const canGoForward = $derived(
    viewYear < today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth < today.getMonth())
  );

  function cellStyle(cell) {
    if (!cell.log) return cell.future ? 'var(--overlay-weak)' : 'var(--overlay)';
    if (cell.log.completed) return cell.log.isRest ? 'rgba(49,160,95,0.35)' : '#31A05F';
    return 'rgba(49,160,95,0.15)';
  }
</script>

<header>
  <h1 class="num text-3xl font-bold">Riwayat</h1>
  <p class="mt-1 text-sm text-mute">Buka tanggal mana pun untuk melihat sesi yang tercatat.</p>
</header>

<section class="card mt-5">
  <div class="flex items-center justify-between">
    <button
      class="chip bg-rack text-chalk"
      onclick={() => shiftMonth(-1)}
      aria-label="Bulan sebelumnya"
    >
      &larr;
    </button>
    <h2 class="num text-xl font-bold">{monthLong[viewMonth]} {viewYear}</h2>
    <button
      class="chip bg-rack text-chalk disabled:opacity-30"
      onclick={() => shiftMonth(1)}
      disabled={!canGoForward}
      aria-label="Bulan berikutnya"
    >
      &rarr;
    </button>
  </div>

  <div class="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] text-mute">
    {#each ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as d}
      <span>{d}</span>
    {/each}
  </div>

  <div class="mt-1 grid grid-cols-7 gap-1">
    {#each cells as cell, i (i)}
      {#if !cell}
        <span></span>
      {:else}
        <button
          type="button"
          onclick={() => (selected = cell.key)}
          aria-label={`${cell.day} ${monthLong[viewMonth]}`}
          aria-current={cell.key === selected ? 'date' : undefined}
          class="num flex h-10 items-center justify-center rounded-md border text-xs transition-colors {cell.key ===
          selected
            ? 'border-plate-yellow'
            : cell.key === $dayKey
              ? 'border-hair/30'
              : 'border-hair/5'}"
          style="background: {cellStyle(cell)}"
        >
          {cell.day}
        </button>
      {/if}
    {/each}
  </div>

  <div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
    <div class="rounded-xl bg-rack py-2">
      <p class="num text-xl font-bold text-plate-green">{monthTraining}</p>
      <p class="text-mute">latihan</p>
    </div>
    <div class="rounded-xl bg-rack py-2">
      <p class="num text-xl font-bold text-plate-blue">{monthRest}</p>
      <p class="text-mute">istirahat</p>
    </div>
    <div class="rounded-xl bg-rack py-2">
      <p class="num text-xl font-bold text-plate-yellow">{trimNumber(monthVolume / 1000, 1)}</p>
      <p class="text-mute">ton volume</p>
    </div>
  </div>
</section>

<section class="mt-4">
  <h2 class="num text-2xl font-bold">{formatLong(keyToDate(selected))}</h2>

  {#if !detail}
    <p class="card mt-3 text-sm text-mute">
      Tidak ada catatan untuk tanggal ini.
      {#if selected > $dayKey}
        Tanggalnya belum lewat.
      {/if}
    </p>
  {:else}
    <article class="card mt-3">
      <div class="flex items-baseline justify-between gap-3">
        <div class="min-w-0">
          <h3 class="num truncate text-xl font-bold">{detail.title}</h3>
          <p class="text-xs text-mute">
            {detail.focus}{detail.minutes ? ` · ${detail.minutes} menit` : ''}
          </p>
        </div>
        <span
          class="chip shrink-0 {detail.completed ? 'bg-plate-green/20 text-plate-green' : 'bg-rack text-mute'}"
        >
          {detail.completed ? 'Selesai' : 'Belum selesai'}
        </span>
      </div>

      {#if detail.isRest}
        <p class="mt-3 text-sm text-mute">Hari pemulihan.</p>
      {:else}
        <ul class="mt-4 space-y-3">
          {#each detail.tasks ?? [] as task (task.id)}
            {@const sets = setsOf(task).filter((s) => s.done)}
            <li class="border-t border-hair/5 pt-3 first:border-0 first:pt-0">
              <div class="flex items-center gap-2">
                <span
                  class="h-4 w-1 shrink-0 rounded-full"
                  style="background: {task.done ? (groupColor[task.group] ?? '#E7E3DA') : 'var(--overlay-strong)'}"
                ></span>
                <span class="min-w-0 flex-1 truncate text-sm {task.done ? '' : 'text-mute'}">
                  {task.name}
                </span>
                <span class="num shrink-0 text-xs text-mute">{sets.length}/{task.sets} set</span>
              </div>
              {#if sets.length}
                <p class="num mt-1 pl-3 text-xs text-mute">
                  {sets
                    .map((s) => (s.kg ? `${trimNumber(s.kg)}kg × ${s.reps ?? '—'}` : `${s.reps ?? '—'} rep`))
                    .join('  ·  ')}
                </p>
              {/if}
            </li>
          {/each}
        </ul>

        {#if detailVolume > 0}
          <p class="mt-4 border-t border-hair/5 pt-3 text-xs text-mute">
            Volume sesi <span class="num text-chalk">{trimNumber(detailVolume, 0)}</span> kg
          </p>
        {/if}
      {/if}

      <dl class="mt-4 space-y-1 border-t border-hair/5 pt-3 text-xs">
        <div class="flex justify-between">
          <dt class="text-mute">Air minum</dt>
          <dd class="num">{detail.water ?? 0} gelas</dd>
        </div>
        {#if detailWeight}
          <div class="flex justify-between">
            <dt class="text-mute">Berat badan</dt>
            <dd class="num">{trimNumber(detailWeight.kg)} kg</dd>
          </div>
        {/if}
      </dl>

      {#if detail.note}
        <p class="mt-3 rounded-xl bg-rack p-3 text-sm text-chalk">{detail.note}</p>
      {/if}
    </article>
  {/if}
</section>
