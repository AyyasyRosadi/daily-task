<script>
  import { dayKey, logMeasurement, measurementFields, measurements } from '$lib/stores/data';
  import { trimNumber } from '$lib/utils/workout';

  let form = $state(Object.fromEntries(measurementFields.map((f) => [f.id, ''])));
  let saved = $state(false);
  let selected = $state(measurementFields[0].id);

  const latest = $derived($measurements.at(-1) ?? null);

  /** Selisih terhadap pengukuran sebelumnya, per field. */
  const deltas = $derived.by(() => {
    const out = {};
    for (const field of measurementFields) {
      const series = $measurements.filter((m) => Number.isFinite(Number(m[field.id])));
      if (series.length < 2) continue;
      const last = Number(series.at(-1)[field.id]);
      const prev = Number(series.at(-2)[field.id]);
      out[field.id] = { value: last, change: last - prev, since: series.at(-2).id };
    }
    return out;
  });

  const series = $derived(
    $measurements
      .filter((m) => Number.isFinite(Number(m[selected])))
      .map((m) => ({ date: m.id, value: Number(m[selected]) }))
  );

  const chart = $derived.by(() => {
    const points = series.slice(-20);
    if (points.length < 2) return null;
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const lo = min - span * 0.15;
    const hi = max + span * 0.15;
    const coords = points.map((p, i) => ({
      x: (i / (points.length - 1)) * 300,
      y: 70 - ((p.value - lo) / (hi - lo)) * 60
    }));
    return {
      path: coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' '),
      coords,
      first: points[0],
      last: points.at(-1)
    };
  });

  async function save() {
    await logMeasurement(form);
    form = Object.fromEntries(measurementFields.map((f) => [f.id, '']));
    saved = true;
    setTimeout(() => (saved = false), 2500);
  }

  const hasInput = $derived(Object.values(form).some((v) => String(v).trim() !== ''));
</script>

<header>
  <h1 class="num text-3xl font-bold">Ukuran tubuh</h1>
  <p class="mt-1 text-sm text-mute">
    Timbangan sering diam saat bentuk badan sebenarnya berubah. Ukur sebulan sekali, pagi hari
    sebelum makan, dengan pita ukur yang menempel tapi tidak menekan.
  </p>
</header>

<section class="card mt-5">
  <h2 class="font-semibold">Catat hari ini</h2>
  <p class="mt-1 text-xs text-mute">
    Isi yang kamu ukur saja, satuan sentimeter. Field kosong tidak menghapus angka sebelumnya.
  </p>
  <div class="mt-4 grid grid-cols-2 gap-3">
    {#each measurementFields as field}
      <label class="text-xs text-mute">
        {field.label}
        <input
          class="field mt-1 text-sm"
          type="number"
          inputmode="decimal"
          step="0.5"
          min="0"
          placeholder={latest?.[field.id] ? String(trimNumber(latest[field.id])) : '—'}
          bind:value={form[field.id]}
        />
        <span class="mt-0.5 block text-[10px] text-mute/70">{field.hint}</span>
      </label>
    {/each}
  </div>
  <button class="btn-primary mt-4 w-full disabled:opacity-40" onclick={save} disabled={!hasInput}>
    Simpan ukuran {$dayKey}
  </button>
  {#if saved}<p class="mt-2 text-xs text-plate-green">Ukuran tersimpan.</p>{/if}
</section>

{#if Object.keys(deltas).length}
  <section class="card mt-4">
    <h2 class="font-semibold">Perubahan terakhir</h2>
    <ul class="mt-3 space-y-2">
      {#each measurementFields.filter((f) => deltas[f.id]) as field}
        {@const d = deltas[field.id]}
        <li class="flex items-baseline justify-between border-t border-hair/5 pt-2 text-sm first:border-0 first:pt-0">
          <span>{field.label}</span>
          <span class="num text-right">
            {trimNumber(d.value)} cm
            <span class={d.change > 0 ? 'text-plate-yellow' : d.change < 0 ? 'text-plate-blue' : 'text-mute'}>
              ({d.change > 0 ? '+' : ''}{trimNumber(d.change)})
            </span>
            <span class="block text-[10px] text-mute">sejak {d.since}</span>
          </span>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<section class="card mt-4">
  <h2 class="font-semibold">Grafik</h2>
  {#if !$measurements.length}
    <p class="mt-3 text-sm text-mute">
      Belum ada ukuran tercatat. Simpan pengukuran pertamamu di atas, lalu ulangi bulan depan untuk
      melihat perubahannya.
    </p>
  {:else}
    <select class="field mt-3 text-sm" bind:value={selected} aria-label="Pilih ukuran">
      {#each measurementFields as field}
        <option value={field.id}>{field.label}</option>
      {/each}
    </select>

    {#if chart}
      <svg viewBox="0 0 300 80" class="mt-4 w-full" role="img" aria-label={`Grafik ${selected}`}>
        <path d={chart.path} fill="none" stroke="#2C6BE0" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        {#each chart.coords as c}
          <circle cx={c.x} cy={c.y} r="2.5" fill="#2C6BE0" />
        {/each}
      </svg>
      <p class="text-xs text-mute">
        {trimNumber(chart.first.value)} cm pada {chart.first.date} sampai
        {trimNumber(chart.last.value)} cm pada {chart.last.date}
      </p>
    {:else}
      <p class="mt-3 text-xs text-mute">
        Perlu minimal dua pengukuran pada tanggal berbeda untuk menggambar grafik.
      </p>
    {/if}

    <ul class="mt-4 space-y-1 border-t border-hair/5 pt-3 text-xs">
      {#each series.slice(-6).reverse() as row (row.date)}
        <li class="flex justify-between">
          <span class="num text-mute">{row.date}</span>
          <span class="num">{trimNumber(row.value)} cm</span>
        </li>
      {/each}
    </ul>
  {/if}
</section>
