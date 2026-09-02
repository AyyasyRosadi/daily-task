<script>
  import { activities, deleteActivity, saveActivity } from '$lib/stores/data';
  import {
    activity,
    discardActivity,
    elapsed,
    liveSpeed,
    pauseActivity,
    resumeActivity,
    startActivity,
    stopActivity
  } from '$lib/stores/tracker';
  import {
    activityTypes,
    distanceLabel,
    durationLabel,
    paceLabel,
    routePath,
    speedLabel
  } from '$lib/utils/geo';
  import { keyToDate, monthShort } from '$lib/utils/date';

  let type = $state('lari');

  // Sesi yang sudah dihentikan tapi belum disimpan. Ditahan di sini supaya
  // pengguna sempat mengisi jarak manual atau membuangnya.
  let finished = $state(null);
  let manualKm = $state('');
  let note = $state('');
  let saving = $state(false);
  let error = $state('');
  let confirmDelete = $state(null);

  const running = $derived($activity);
  const speed = $derived(running ? liveSpeed(running) : 0);

  // Pace dipakai untuk lari, kecepatan untuk sepeda — dua-duanya angka yang
  // sama, tapi tak seorang pun membaca pace sepeda dalam menit per kilometer.
  const paceOrSpeed = (meters, seconds, jenis) =>
    jenis === 'sepeda' ? speedLabel(meters, seconds) : paceLabel(meters, seconds);

  const liveDistance = $derived(running?.distance ?? 0);
  const liveRoute = $derived(routePath(running?.raw ?? [], 100));

  const finishedRoute = $derived(finished ? routePath(finished.raw, 100) : null);
  const finishedMeters = $derived.by(() => {
    if (!finished) return 0;
    if (finished.meters > 0) return finished.meters;
    const km = Number(String(manualKm).replace(',', '.'));
    return Number.isFinite(km) && km > 0 ? Math.round(km * 1000) : 0;
  });

  function stop() {
    finished = stopActivity();
    manualKm = '';
    note = '';
    error = '';
  }

  async function simpan() {
    if (!finished) return;
    saving = true;
    error = '';
    try {
      await saveActivity({ ...finished, meters: finishedMeters, note });
      finished = null;
    } catch {
      error = 'Gagal menyimpan. Cek koneksi lalu coba lagi.';
    } finally {
      saving = false;
    }
  }

  function buang() {
    finished = null;
    error = '';
  }

  async function hapus(id) {
    await deleteActivity(id);
    confirmDelete = null;
  }

  /** "2 Sep, 06:14" untuk daftar riwayat. */
  function waktuSingkat(row) {
    const d = keyToDate(row.date);
    const jam = new Date(row.startedAt ?? 0);
    const hhmm = `${String(jam.getHours()).padStart(2, '0')}:${String(jam.getMinutes()).padStart(2, '0')}`;
    return `${d.getDate()} ${monthShort[d.getMonth()]}, ${hhmm}`;
  }

  const totals = $derived.by(() => {
    const rows = $activities;
    return {
      sesi: rows.length,
      meter: rows.reduce((sum, r) => sum + (Number(r.meters) || 0), 0),
      detik: rows.reduce((sum, r) => sum + (Number(r.seconds) || 0), 0)
    };
  });
</script>

<header>
  <h1 class="num text-3xl font-bold">Kardio</h1>
  <p class="mt-1 text-sm text-mute">
    Rekam sesi lari atau sepeda dengan GPS. Durasi tetap tercatat walau lokasi tidak tersedia.
  </p>
</header>

<!-- --- Pelacak --- -->

{#if finished}
  <section class="card mt-5">
    <h2 class="font-semibold">Sesi selesai</h2>

    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-2xl font-bold">{durationLabel(finished.seconds)}</p>
        <p class="mt-1 text-[11px] text-mute">durasi</p>
      </div>
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-2xl font-bold text-plate-yellow">{distanceLabel(finishedMeters)}</p>
        <p class="mt-1 text-[11px] text-mute">jarak</p>
      </div>
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-2xl font-bold text-plate-blue">
          {paceOrSpeed(finishedMeters, finished.seconds, finished.type)}
        </p>
        <p class="mt-1 text-[11px] text-mute">
          {finished.type === 'sepeda' ? 'kecepatan' : 'pace'}
        </p>
      </div>
    </div>

    {#if finishedRoute}
      <svg viewBox="0 0 100 100" class="mt-3 h-40 w-full" role="img" aria-label="Rute sesi">
        <path d={finishedRoute.d} fill="none" stroke="#F0B429" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx={finishedRoute.start.x} cy={finishedRoute.start.y} r="2.5" fill="#31A05F" />
        <circle cx={finishedRoute.end.x} cy={finishedRoute.end.y} r="2.5" fill="#D6353B" />
      </svg>
    {:else}
      <label class="mt-3 block text-xs text-mute">
        Jarak (km)
        <input
          class="field mt-1 text-sm"
          type="number"
          inputmode="decimal"
          step="0.01"
          min="0"
          placeholder="Misal: 5.2"
          bind:value={manualKm}
        />
        <span class="mt-1 block text-[11px]">
          Tidak ada titik GPS yang terekam di sesi ini, jadi jaraknya perlu diisi sendiri.
          Kosongkan kalau memang tidak diukur.
        </span>
      </label>
    {/if}

    <label class="mt-3 block text-xs text-mute">
      Catatan
      <input class="field mt-1 text-sm" placeholder="Rute, cuaca, perasaan" bind:value={note} />
    </label>

    {#if error}
      <p class="mt-3 rounded-xl bg-plate-red/15 p-3 text-sm text-plate-red">{error}</p>
    {/if}

    <div class="mt-3 flex gap-2">
      <button class="btn-primary flex-1" onclick={simpan} disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan sesi'}
      </button>
      <button class="btn-ghost" onclick={buang} disabled={saving}>Buang</button>
    </div>
  </section>
{:else if running}
  <section class="card mt-5">
    <div class="flex items-center justify-between">
      <span class="chip bg-rack text-mute">
        {activityTypes[running.type].icon}
        {activityTypes[running.type].label}
      </span>
      <span
        class="chip {running.status === 'jalan' ? 'bg-plate-green/20 text-plate-green' : 'bg-rack text-mute'}"
      >
        {running.status === 'jalan' ? 'Berjalan' : 'Jeda'}
      </span>
    </div>

    <p class="num mt-4 text-center text-6xl font-bold tabular-nums">{durationLabel($elapsed)}</p>

    <div class="mt-4 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-xl font-bold text-plate-yellow">{distanceLabel(liveDistance)}</p>
        <p class="mt-1 text-[11px] text-mute">jarak</p>
      </div>
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-xl font-bold text-plate-blue">
          {paceOrSpeed(liveDistance, $elapsed, running.type)}
        </p>
        <p class="mt-1 text-[11px] text-mute">rata-rata</p>
      </div>
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-xl font-bold">
          {running.type === 'sepeda'
            ? `${(speed * 3.6).toFixed(1)}`
            : paceLabel(speed * 60, 60).replace(' /km', '')}
        </p>
        <p class="mt-1 text-[11px] text-mute">
          {running.type === 'sepeda' ? 'km/j sekarang' : 'pace sekarang'}
        </p>
      </div>
    </div>

    {#if liveRoute}
      <svg viewBox="0 0 100 100" class="mt-3 h-40 w-full" role="img" aria-label="Rute sejauh ini">
        <path d={liveRoute.d} fill="none" stroke="#F0B429" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx={liveRoute.start.x} cy={liveRoute.start.y} r="2.5" fill="#31A05F" />
        <circle cx={liveRoute.end.x} cy={liveRoute.end.y} r="2.5" fill="#D6353B" />
      </svg>
    {/if}

    <p class="mt-3 text-[11px] text-mute">
      {#if running.error}
        {running.error}
      {:else if running.gps === null}
        Menunggu sinyal GPS...
      {:else}
        Akurasi GPS sekitar {Math.round(running.gps)} m &middot; {running.raw.length} titik terekam
      {/if}
    </p>

    <div class="mt-4 flex gap-2">
      {#if running.status === 'jalan'}
        <button class="btn-ghost flex-1" onclick={pauseActivity}>Jeda</button>
      {:else}
        <button class="btn-primary flex-1" onclick={resumeActivity}>Lanjut</button>
      {/if}
      <button class="btn flex-1 bg-plate-red text-chalk hover:bg-plate-red/80" onclick={stop}>
        Selesai
      </button>
    </div>

    <button
      class="mt-2 w-full text-xs text-mute underline underline-offset-4"
      onclick={discardActivity}
    >
      Batalkan tanpa menyimpan
    </button>
  </section>

  <p class="mt-3 rounded-xl bg-rack p-3 text-[11px] text-mute">
    Biarkan layar tetap menyala dan aplikasi ini tetap di depan. Kalau layar terkunci atau kamu
    pindah aplikasi, browser menghentikan perekaman GPS dan jaraknya akan kurang. Layar sudah
    dijaga tetap hidup selama sesi berjalan, tapi itu satu-satunya yang bisa dilakukan aplikasi web.
  </p>
{:else}
  <section class="card mt-5">
    <h2 class="font-semibold">Mulai sesi</h2>

    <div class="mt-3 flex gap-2">
      {#each Object.entries(activityTypes) as [id, t] (id)}
        <button
          class="chip flex-1 {type === id ? 'bg-plate-yellow text-rubber' : 'bg-rack text-mute'}"
          onclick={() => (type = id)}
          aria-pressed={type === id}
        >
          {t.icon}
          {t.label}
        </button>
      {/each}
    </div>

    <button class="btn-primary mt-3 w-full" onclick={() => startActivity(type)}>
      Mulai {activityTypes[type].label.toLowerCase()}
    </button>

    <p class="mt-3 text-[11px] text-mute">
      Aplikasi akan meminta izin lokasi. Kalau ditolak, sesi tetap bisa direkam sebagai durasi saja
      dan jaraknya diisi sendiri di akhir — berguna untuk treadmill atau sepeda statis.
    </p>
  </section>
{/if}

<!-- --- Riwayat --- -->

<section class="card mt-4">
  <div class="flex items-baseline justify-between">
    <h2 class="font-semibold">Sesi tahun ini</h2>
    <span class="num text-lg text-mute">{totals.sesi}</span>
  </div>

  {#if !$activities.length}
    <p class="mt-3 text-sm text-mute">
      Belum ada sesi tercatat. Sesi yang selesai muncul di sini, dan hari itu ikut dihitung sebagai
      hari aktif untuk streak.
    </p>
  {:else}
    <div class="mt-3 grid grid-cols-2 gap-2 text-center">
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-2xl font-bold text-plate-yellow">{distanceLabel(totals.meter)}</p>
        <p class="mt-1 text-[11px] text-mute">total jarak</p>
      </div>
      <div class="rounded-xl bg-rack py-3">
        <p class="num text-2xl font-bold text-plate-green">{durationLabel(totals.detik)}</p>
        <p class="mt-1 text-[11px] text-mute">total waktu</p>
      </div>
    </div>

    <ul class="mt-3 space-y-2">
      {#each $activities as row (row.id)}
        {@const route = routePath(row.route ?? [], 100)}
        <li class="rounded-xl bg-rack p-3">
          <div class="flex items-center gap-3">
            {#if route}
              <svg viewBox="0 0 100 100" class="h-12 w-12 shrink-0" aria-hidden="true">
                <path d={route.d} fill="none" stroke="#F0B429" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            {:else}
              <span class="flex h-12 w-12 shrink-0 items-center justify-center text-2xl" aria-hidden="true">
                {activityTypes[row.type]?.icon ?? '🏃'}
              </span>
            {/if}

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                {activityTypes[row.type]?.label ?? 'Lari'} &middot; {distanceLabel(row.meters)}
              </p>
              <p class="num text-xs text-mute">
                {waktuSingkat(row)} &middot; {durationLabel(row.seconds)} &middot;
                {paceOrSpeed(row.meters, row.seconds, row.type)}
              </p>
              {#if row.note}
                <p class="mt-0.5 truncate text-[11px] text-mute">{row.note}</p>
              {/if}
            </div>

            <button
              class="chip shrink-0 bg-deck text-plate-red"
              onclick={() => (confirmDelete = confirmDelete === row.id ? null : row.id)}
              aria-label={`Hapus sesi ${waktuSingkat(row)}`}
            >
              &times;
            </button>
          </div>

          {#if confirmDelete === row.id}
            <div class="mt-2 flex gap-2">
              <button class="chip flex-1 bg-plate-red text-chalk" onclick={() => hapus(row.id)}>
                Hapus sesi ini
              </button>
              <button class="chip flex-1 bg-deck text-mute" onclick={() => (confirmDelete = null)}>
                Batal
              </button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
