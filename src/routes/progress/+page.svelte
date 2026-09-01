<script>
  import StatTile from '$lib/components/StatTile.svelte';
  import { logWeight, dayKey, profile, streak, weights, yearLogs } from '$lib/stores/data';
  import { dayShort, keyToDate, monthShort, weekKeys } from '$lib/utils/date';
  import { exerciseHistory, exerciseNames, personalRecord, trimNumber } from '$lib/utils/workout';

  const year = new Date().getFullYear();

  const week = $derived(
    weekKeys(keyToDate($dayKey)).map((key) => {
      const log = $yearLogs.find((l) => l.id === key) ?? null;
      const total = log?.tasks?.length ?? 0;
      const done = log?.tasks?.filter((t) => t.done).length ?? 0;
      const percent = log?.isRest ? (log.completed ? 100 : 0) : total ? Math.round((done / total) * 100) : 0;
      return { key, day: dayShort[keyToDate(key).getDay()], percent, rest: log?.isRest ?? false, isToday: key === $dayKey };
    })
  );

  const weekDone = $derived(week.filter((d) => d.percent === 100).length);

  const trainingDays = $derived($yearLogs.filter((l) => l.completed && !l.isRest).length);
  const restDays = $derived($yearLogs.filter((l) => l.completed && l.isRest).length);

  const months = $derived(
    Array.from({ length: 12 }, (_, m) => {
      const prefix = `${year}-${String(m + 1).padStart(2, '0')}`;
      const logs = $yearLogs.filter((l) => l.id.startsWith(prefix));
      return {
        label: monthShort[m],
        done: logs.filter((l) => l.completed && !l.isRest).length,
        planned: logs.length
      };
    })
  );

  const peakMonth = $derived(Math.max(4, ...months.map((m) => m.done)));

  const chart = $derived.by(() => {
    const points = $weights.slice(-30);
    if (points.length < 2) return null;
    const values = points.map((p) => p.kg);
    const min = Math.min(...values) - 0.5;
    const max = Math.max(...values) + 0.5;
    const span = max - min || 1;
    const path = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * 300;
        const y = 70 - ((p.kg - min) / span) * 60;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
    return { path, first: points[0], last: points[points.length - 1], min, max };
  });

  // --- Beban per gerakan ---

  const liftNames = $derived(exerciseNames($yearLogs));
  let liftName = $state('');

  // Pilih gerakan pertama begitu ada datanya, lalu biarkan pilihan pengguna bertahan.
  $effect(() => {
    if (!liftName && liftNames.length) liftName = liftNames[0];
  });

  const liftHistory = $derived(liftName ? exerciseHistory($yearLogs, liftName) : []);
  const liftRecord = $derived(liftName ? personalRecord($yearLogs, liftName) : null);

  const liftChart = $derived.by(() => {
    const points = liftHistory.slice(-20);
    if (points.length < 2) return null;
    const values = points.map((p) => p.topKg);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pad = span * 0.15;
    const lo = min - pad;
    const hi = max + pad;
    const coords = points.map((p, i) => ({
      x: (i / (points.length - 1)) * 300,
      y: 70 - ((p.topKg - lo) / (hi - lo)) * 60,
      point: p
    }));
    return {
      coords,
      path: coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' '),
      first: points[0],
      last: points[points.length - 1],
      gain: points[points.length - 1].topKg - points[0].topKg
    };
  });

  let kg = $state('');
  let saved = $state(false);

  async function submitWeight() {
    const value = Number(kg);
    if (!value || value < 25 || value > 300) return;
    await logWeight(value);
    kg = '';
    saved = true;
    setTimeout(() => (saved = false), 2500);
  }
</script>

<header>
  <h1 class="num text-3xl font-bold">Progres</h1>
  <p class="mt-1 text-sm text-mute">Rekap kehadiran latihan dan perubahan berat badan tahun {year}.</p>
  <a class="btn-ghost mt-3 w-full" href="/riwayat">Buka riwayat harian</a>
</header>

<div class="mt-5 grid grid-cols-2 gap-3">
  <StatTile value={$streak} label="Hari beruntun" sub="Berjalan sekarang" />
  <StatTile value={$profile?.bestStreak ?? 0} label="Rekor beruntun" sub="Sepanjang waktu" accent="#E7E3DA" />
  <StatTile value={trainingDays} label="Sesi latihan" sub="Selesai tahun ini" accent="#31A05F" />
  <StatTile value={restDays} label="Hari pulih" sub="Tercatat tahun ini" accent="#2C6BE0" />
</div>

<section class="card mt-4">
  <div class="flex items-baseline justify-between">
    <h2 class="font-semibold">Minggu ini</h2>
    <span class="num text-lg text-mute">{weekDone} / 7 hari tuntas</span>
  </div>
  <div class="mt-4 flex h-32 items-end gap-2">
    {#each week as d}
      <div class="flex flex-1 flex-col items-center gap-2">
        <div class="flex h-24 w-full items-end rounded-md bg-rack">
          <div
            class="w-full rounded-md transition-all"
            style="height: {Math.max(d.percent, 3)}%; background: {d.percent === 100
              ? d.rest
                ? '#2C6BE0'
                : '#31A05F'
              : 'rgba(240,180,41,0.75)'}"
          ></div>
        </div>
        <span class="text-[10px] {d.isToday ? 'text-chalk' : 'text-mute'}">{d.day}</span>
      </div>
    {/each}
  </div>
  <p class="mt-2 text-xs text-mute">Hijau: sesi latihan tuntas. Biru: hari pulih tercatat.</p>
</section>

<section class="card mt-4">
  <h2 class="font-semibold">Sepanjang {year}</h2>
  <ul class="mt-4 space-y-2">
    {#each months as m}
      <li class="flex items-center gap-3">
        <span class="num w-8 text-xs text-mute">{m.label}</span>
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-rack">
          <div
            class="h-full rounded-full bg-plate-green transition-all"
            style="width: {(m.done / peakMonth) * 100}%"
          ></div>
        </div>
        <span class="num w-6 text-right text-sm {m.done ? 'text-chalk' : 'text-mute'}">{m.done}</span>
      </li>
    {/each}
  </ul>
</section>

<section class="card mt-4">
  <h2 class="font-semibold">Beban per gerakan</h2>

  {#if !liftNames.length}
    <p class="mt-3 text-sm text-mute">
      Belum ada beban yang tercatat. Buka gerakan di halaman Hari ini, isi beban dan repetisi tiap
      set, lalu grafik kemajuannya muncul di sini.
    </p>
  {:else}
    <select class="field mt-3 text-sm" bind:value={liftName} aria-label="Pilih gerakan">
      {#each liftNames as name}
        <option value={name}>{name}</option>
      {/each}
    </select>

    <div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
      <div class="rounded-xl bg-rack py-2">
        <p class="num text-xl font-bold text-plate-yellow">
          {liftRecord ? trimNumber(liftRecord.topKg) : '—'}
        </p>
        <p class="text-mute">rekor kg</p>
      </div>
      <div class="rounded-xl bg-rack py-2">
        <p class="num text-xl font-bold text-plate-blue">
          {liftHistory.at(-1)?.est1RM ? trimNumber(liftHistory.at(-1).est1RM, 0) : '—'}
        </p>
        <p class="text-mute">perkiraan 1RM</p>
      </div>
      <div class="rounded-xl bg-rack py-2">
        <p class="num text-xl font-bold text-plate-green">{liftHistory.length}</p>
        <p class="text-mute">sesi</p>
      </div>
    </div>

    {#if liftChart}
      <svg viewBox="0 0 300 80" class="mt-4 w-full" role="img" aria-label={`Grafik beban ${liftName}`}>
        <path
          d={liftChart.path}
          fill="none"
          stroke="#31A05F"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        {#each liftChart.coords as c}
          <circle cx={c.x} cy={c.y} r="2.5" fill="#31A05F" />
        {/each}
      </svg>
      <p class="text-xs text-mute">
        {trimNumber(liftChart.first.topKg)} kg pada {liftChart.first.date} sampai
        {trimNumber(liftChart.last.topKg)} kg pada {liftChart.last.date}
        {#if liftChart.gain !== 0}
          <span class={liftChart.gain > 0 ? 'text-plate-green' : 'text-plate-red'}>
            ({liftChart.gain > 0 ? '+' : ''}{trimNumber(liftChart.gain)} kg)
          </span>
        {/if}
      </p>
    {:else}
      <p class="mt-3 text-xs text-mute">
        Catat gerakan ini minimal di dua sesi berbeda untuk melihat grafiknya.
      </p>
    {/if}

    {#if liftHistory.length}
      <ul class="mt-4 space-y-2 border-t border-white/5 pt-3">
        {#each liftHistory.slice(-5).reverse() as row (row.date)}
          <li class="flex items-baseline justify-between gap-3 text-xs">
            <span class="num shrink-0 text-mute">{row.date}</span>
            <span class="num min-w-0 flex-1 truncate text-right">
              {row.sets.map((s) => `${trimNumber(s.kg)}×${s.reps ?? '—'}`).join('  ')}
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</section>

<section class="card mt-4">
  <div class="flex items-baseline justify-between">
    <h2 class="font-semibold">Berat badan</h2>
    {#if $profile?.weight}<span class="num text-lg">{$profile.weight} kg</span>{/if}
  </div>

  {#if chart}
    <svg viewBox="0 0 300 80" class="mt-4 w-full" role="img" aria-label="Grafik berat badan">
      <path d={chart.path} fill="none" stroke="#F0B429" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
    </svg>
    <p class="text-xs text-mute">
      {chart.first.kg} kg pada {chart.first.date} sampai {chart.last.kg} kg pada {chart.last.date}
    </p>
  {:else}
    <p class="mt-3 text-sm text-mute">
      Catat berat badan minimal dua kali untuk melihat grafiknya. Timbang di jam yang sama, misalnya
      pagi setelah bangun tidur.
    </p>
  {/if}

  <div class="mt-4 flex gap-2">
    <input
      class="field"
      type="number"
      inputmode="decimal"
      step="0.1"
      placeholder="Berat hari ini (kg)"
      bind:value={kg}
    />
    <button class="btn-primary shrink-0" onclick={submitWeight}>Simpan</button>
  </div>
  {#if saved}<p class="mt-2 text-xs text-plate-green">Berat tersimpan.</p>{/if}
</section>
