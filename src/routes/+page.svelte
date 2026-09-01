<script>
  import BarbellBar from '$lib/components/BarbellBar.svelte';
  import TaskRow from '$lib/components/TaskRow.svelte';
  import { getProgram } from '$lib/data/programs.js';
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
    syncing,
    todayLog,
    yearLogs
  } from '$lib/stores/data';
  import { DEFAULT_REST_SECONDS, startRest } from '$lib/stores/rest';
  import { dayShort, formatLong, keyToDate, weekKeys } from '$lib/utils/date';
  import { waterGlasses } from '$lib/utils/nutrition';
  import { lastPerformance, logVolume, personalRecord, trimNumber } from '$lib/utils/workout';

  const program = $derived(getProgram($profile?.activeProgram));
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
  <div class="rounded-xl border border-white/5 bg-deck px-3 py-2 text-center">
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
        class="h-8 w-full rounded-md border {d.isToday ? 'border-plate-yellow/60' : 'border-white/5'}"
        style="background: {d.log?.completed
          ? '#31A05F'
          : d.log && !d.log.isRest
            ? 'rgba(49,160,95,0.28)'
            : d.future
              ? 'rgba(241,238,231,0.04)'
              : 'rgba(241,238,231,0.08)'}"
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
            last={lastPerformance($yearLogs, task.name, $dayKey)}
            record={personalRecord($yearLogs, task.name)}
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
            : 'border-white/15'}"
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
