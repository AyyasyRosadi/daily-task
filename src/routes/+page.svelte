<script>
  import BarbellBar from '$lib/components/BarbellBar.svelte';
  import TaskRow from '$lib/components/TaskRow.svelte';
  import { programMap } from '$lib/stores/programs';
  import { user } from '$lib/stores/auth';
  import {
    addSet,
    completeRestDay,
    dayKey,
    ensureLog,
    logSet,
    profile,
    removeSet,
    resetToday,
    saveNote,
    toggleTask,
    setWater,
    streak,
    swapExercise,
    syncing,
    todayLog,
    yearLogs
  } from '$lib/stores/data';
  import { exercises } from '$lib/data/exercises.js';
  import { DEFAULT_REST_SECONDS, startRest } from '$lib/stores/rest';
  import { dayShort, formatLong, keyToDate, weekKeys } from '$lib/utils/date';
  import { waterGlasses } from '$lib/utils/nutrition';
  import { lastPerformance, logVolume, personalRecord, trimNumber } from '$lib/utils/workout';
  import { programProgress, suggestLoad } from '$lib/utils/progression';
  import { goto } from '$app/navigation';
  import { activity, elapsed, startActivity } from '$lib/stores/tracker';
  import { activityTypes, distanceLabel, durationLabel } from '$lib/utils/geo';
  import { tips } from '$lib/data/tips.js';
  import { tipOfDay } from '$lib/utils/tips';

  const program = $derived($programMap.get($profile?.activeProgram) ?? null);
  const tasks = $derived($todayLog?.tasks ?? []);
  const done = $derived(tasks.filter((t) => t.done).length);
  const percent = $derived(tasks.length ? Math.round((done / tasks.length) * 100) : 0);
  const waterTarget = $derived(waterGlasses($profile?.weight));
  const week = $derived(
    weekKeys(keyToDate($dayKey)).map((key) => ({
      key,
      day: dayShort[keyToDate(key).getDay()],
      log: $yearLogs.find((l) => l.id === key) ?? null,
      isToday: key === $dayKey,
      future: key > $dayKey
    }))
  );

  const volume = $derived(logVolume($todayLog));
  const progress = $derived(programProgress($profile, program, $dayKey));

  let openTask = $state(null);
  const toggleExpand = (id) => (openTask = openTask === id ? null : id);

  /**
   * Menandai set selesai langsung memulai hitungan istirahat, kecuali set terakhir
   * gerakan itu — saat itu istirahatnya sudah beralih ke gerakan berikutnya.
   */
  async function handleLogSet(taskId, index, patch) {
    await logSet(taskId, index, patch);
    if (!patch.done) return;
    const task = ($todayLog?.tasks ?? []).find((t) => t.id === taskId);
    startRest($profile?.restSeconds ?? DEFAULT_REST_SECONDS, task?.name ?? '');
  }

  let note = $state('');
  let noteLoaded = false;

  // Catatan hari ini dibuat otomatis begitu program aktif tersedia.
  $effect(() => {
    if ($profile?.activeProgram && !$todayLog) ensureLog();
  });

  $effect(() => {
    if ($todayLog && !noteLoaded) {
      note = $todayLog.note ?? '';
      noteLoaded = true;
    }
  });

  // Kardio dan Tips tidak punya tab sendiri lagi; dua-duanya hal harian, jadi
  // pintu masuknya ada di halaman ini.
  const tipHariIni = $derived(tipOfDay(tips, { dateKey: $dayKey, program }));

  async function mulaiKardio(type) {
    await startActivity(type);
    await goto('/aktivitas');
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
  };
</script>

<header class="flex items-start justify-between gap-4">
  <div>
    <p class="text-xs text-mute">{formatLong(keyToDate($dayKey))}</p>
    <h1 class="num mt-1 text-3xl font-bold">
      {greeting()}{$user?.displayName ? `, ${$user.displayName.split(' ')[0]}` : ''}
    </h1>
  </div>
  <div class="rounded-xl border border-hair/5 bg-deck px-3 py-2 text-center">
    <p class="num text-2xl font-bold text-plate-yellow">{$streak}</p>
    <p class="text-[10px] text-mute">hari beruntun</p>
  </div>
</header>

<section class="mt-5 flex justify-between gap-1">
  {#each week as d}
    <a
      href="/riwayat?d={d.key}"
      class="flex flex-1 flex-col items-center gap-1.5"
      aria-label={`Lihat catatan ${d.key}`}
    >
      <span class="text-[10px] {d.isToday ? 'text-chalk' : 'text-mute'}">{d.day}</span>
      <span
        class="h-8 w-full rounded-md border {d.isToday ? 'border-plate-yellow/60' : 'border-hair/5'}"
        style="background: {d.log?.completed
          ? '#31A05F'
          : d.log && !d.log.isRest
            ? 'rgba(49,160,95,0.28)'
            : d.future
              ? 'var(--overlay-weak)'
              : 'var(--overlay)'}"
        title={d.key}
      ></span>
    </a>
  {/each}
</section>

{#if $syncing}
  <p class="mt-10 text-center text-mute">Memuat data...</p>
{:else if !program}
  <section class="card mt-6 text-center">
    <h2 class="num text-2xl font-bold">Belum ada program berjalan</h2>
    <p class="mt-2 text-sm text-mute">
      Pilih satu program dulu. Jadwal latihan harian akan muncul di halaman ini setiap hari.
    </p>
    <a href="/programs" class="btn-primary mt-4 w-full">Lihat daftar program</a>
  </section>
{:else if $todayLog}
  <section class="mt-6">
    <div class="flex items-baseline justify-between">
      <div>
        <p class="text-xs text-mute">{program.name}</p>
        <h2 class="num text-3xl font-bold">{$todayLog.title}</h2>
        <p class="text-sm text-mute">{$todayLog.focus}{$todayLog.minutes ? ` \u00b7 ${$todayLog.minutes} menit` : ''}</p>
      </div>
      {#if !$todayLog.isRest}
        <p class="num text-4xl font-bold" style="color: {percent === 100 ? '#31A05F' : '#F1EEE7'}">
          {percent}<span class="text-lg text-mute">%</span>
        </p>
      {/if}
    </div>

    {#if progress && !progress.finished}
      <div class="mt-4 rounded-xl border px-4 py-3 {progress.deload
        ? 'border-plate-blue/40 bg-plate-blue/10'
        : 'border-hair/5 bg-deck'}">
        <div class="flex items-baseline justify-between gap-3">
          <span class="text-sm font-medium">
            {progress.deload ? 'Minggu pemulihan' : `Minggu ${progress.week}`}
            <span class="text-mute">dari {progress.total}</span>
          </span>
          <span class="num text-xs text-mute">{progress.percent}%</span>
        </div>
        <div class="mt-2 h-1 overflow-hidden rounded-full bg-rack">
          <div
            class="h-full rounded-full {progress.deload ? 'bg-plate-blue' : 'bg-plate-yellow'}"
            style="width: {progress.percent}%"
          ></div>
        </div>
        {#if progress.deload}
          <p class="mt-2 text-xs text-mute">
            Turunkan beban sekitar 40% minggu ini. Pemulihan yang terencana membuat beban naik lebih
            jauh di minggu berikutnya.
          </p>
        {/if}
      </div>
    {:else if progress?.finished}
      <div class="mt-4 rounded-xl border border-plate-green/40 bg-plate-green/10 px-4 py-3">
        <p class="text-sm text-plate-green">
          Program {progress.total} minggu sudah tuntas. Pilih program baru atau ulangi dengan beban
          yang lebih berat.
        </p>
        <a class="btn-ghost mt-3 w-full" href="/programs">Lihat program</a>
      </div>
    {/if}

    {#if $todayLog.isRest}
      <div class="card mt-4">
        <p class="text-sm text-chalk">
          Hari ini jadwalnya pulih. Tidur cukup dan jalan santai sudah termasuk bagian dari program.
        </p>
        <button
          class="btn-primary mt-4 w-full"
          onclick={completeRestDay}
          disabled={$todayLog.completed}
        >
          {$todayLog.completed ? 'Hari istirahat tercatat' : 'Catat hari istirahat'}
        </button>
      </div>
    {:else}
      <div class="mt-3">
        <BarbellBar {tasks} />
        <p class="text-center text-xs text-mute">{done} dari {tasks.length} gerakan selesai</p>
      </div>

      <div class="mt-4 space-y-2">
        {#each tasks as task (task.id)}
          <TaskRow
            {task}
            ontoggle={toggleTask}
            onlogset={handleLogSet}
            onaddset={addSet}
            onremoveset={removeSet}
            onswap={(id, name) => swapExercise(id, name, exercises[name]?.group)}
            last={lastPerformance($yearLogs, task.name, $dayKey)}
            record={personalRecord($yearLogs, task.name)}
            suggestion={suggestLoad($yearLogs, task, $dayKey, { deload: progress?.deload })}
            expanded={openTask === task.id}
            ontoggleexpand={toggleExpand}
          />
        {/each}
      </div>

      {#if volume > 0}
        <p class="mt-3 text-center text-xs text-mute">
          Volume sesi ini <span class="num text-chalk">{trimNumber(volume, 0)}</span> kg terangkat
        </p>
      {/if}

      {#if percent === 100}
        <p class="mt-4 rounded-xl bg-plate-green/15 px-4 py-3 text-center text-sm text-plate-green">
          Sesi selesai. Streak kamu jalan {$streak} hari.
        </p>
      {/if}
    {/if}
  </section>

  <section class="card mt-5">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">Air minum</h3>
      <span class="num text-lg text-mute">{$todayLog.water ?? 0} / {waterTarget} gelas</span>
    </div>
    <div class="mt-3 flex flex-wrap gap-1.5">
      {#each Array.from({ length: waterTarget }) as _, i}
        <button
          type="button"
          aria-label={`Tandai ${i + 1} gelas`}
          onclick={() => setWater(($todayLog.water ?? 0) === i + 1 ? i : i + 1)}
          class="h-8 w-6 rounded-md border transition-colors {i < ($todayLog.water ?? 0)
            ? 'border-plate-blue bg-plate-blue'
            : 'border-hair/15'}"
        ></button>
      {/each}
    </div>
  </section>

  <section class="card mt-4">
    <h3 class="font-semibold">Catatan sesi</h3>
    <textarea
      class="field mt-3 min-h-24 resize-y text-sm"
      placeholder="Beban yang dipakai, sisa tenaga, atau apa pun yang perlu diingat minggu depan."
      bind:value={note}
      onblur={() => saveNote(note)}
    ></textarea>
    <button class="mt-3 text-xs text-mute underline underline-offset-4" onclick={resetToday}>
      Susun ulang sesi hari ini
    </button>
  </section>
{/if}

<!--
  Kardio dan Tips: dua halaman yang dulu punya tab sendiri di bawah. Ditaruh di
  luar blok program supaya tetap muncul walau belum ada program yang dipilih —
  lari pagi tidak perlu menunggu program.
-->

<section class="card mt-4">
  {#if $activity}
    <div class="flex items-center gap-3">
      <span class="text-2xl" aria-hidden="true">{activityTypes[$activity.type].icon}</span>
      <div class="min-w-0 flex-1">
        <p class="text-[11px] text-mute">
          {activityTypes[$activity.type].label}
          {$activity.status === 'jeda' ? 'sedang dijeda' : 'sedang berjalan'}
        </p>
        <p class="num text-2xl font-bold text-plate-yellow">
          {durationLabel($elapsed)}
          <span class="text-base text-mute">{distanceLabel($activity.distance)}</span>
        </p>
      </div>
      <a class="chip shrink-0 bg-plate-yellow text-rubber" href="/aktivitas">Buka</a>
    </div>
  {:else}
    <div class="flex items-baseline justify-between gap-3">
      <h3 class="font-semibold">Kardio</h3>
      <a class="text-xs text-mute underline underline-offset-4" href="/aktivitas">Riwayat sesi</a>
    </div>
    <p class="mt-1 text-xs text-mute">Rekam lari atau sepeda dengan GPS. Hari itu ikut dihitung aktif.</p>
    <div class="mt-3 flex gap-2">
      {#each Object.entries(activityTypes) as [id, t] (id)}
        <button class="btn-ghost flex-1" onclick={() => mulaiKardio(id)}>
          {t.icon} Mulai {t.label.toLowerCase()}
        </button>
      {/each}
    </div>
  {/if}
</section>

{#if tipHariIni}
  <a class="card mt-4 block" href="/tips">
    <div class="flex items-baseline justify-between gap-3">
      <p class="text-[11px] uppercase tracking-wide text-plate-yellow">Tips hari ini</p>
      <p class="text-[11px] text-mute">{tipHariIni.category}</p>
    </div>
    <h3 class="mt-1 font-semibold">{tipHariIni.title}</h3>
    <p class="mt-1 line-clamp-2 text-sm text-mute">{tipHariIni.body}</p>
    <p class="mt-2 text-xs text-mute underline underline-offset-4">Lihat semua tips</p>
  </a>
{/if}
