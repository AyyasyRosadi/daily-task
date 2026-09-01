<script>
  import { goto } from '$app/navigation';
  import StatTile from '$lib/components/StatTile.svelte';
  import { goals } from '$lib/data/foods.js';
  import { getProgram } from '$lib/data/programs';
  import { logout, user } from '$lib/stores/auth';
  import { profile, saveProfile, streak, yearLogs } from '$lib/stores/data';
  import {
    notificationsSupported,
    permission,
    requestPermission,
    sendTestNotification
  } from '$lib/stores/notifications';
  import { buildIcs, googleCalendarUrl, icsFileName, trainingDays } from '$lib/utils/calendar';
  import { activityLevels } from '$lib/utils/nutrition';
  import { dayLong } from '$lib/utils/date';

  const program = $derived(getProgram($profile?.activeProgram));
  const trainingCount = $derived($yearLogs.filter((l) => l.completed && !l.isRest).length);
  const days = $derived(trainingDays($profile?.activeProgram));
  const dayNames = $derived(days.map((d) => dayLong[d.dayOfWeek]).join(', '));

  let editingBody = $state(false);
  let form = $state({ name: '', sex: 'laki-laki', age: '', height: '', weight: '', activity: 'moderate' });
  let formLoaded = false;

  $effect(() => {
    if ($profile && !formLoaded) {
      form = {
        name: $profile.name || $user?.displayName || '',
        sex: $profile.sex ?? 'laki-laki',
        age: $profile.age ?? '',
        height: $profile.height ?? '',
        weight: $profile.weight ?? '',
        activity: $profile.activity ?? 'moderate'
      };
      formLoaded = true;
    }
  });

  async function saveBody() {
    await saveProfile({
      name: form.name.trim(),
      sex: form.sex,
      age: Number(form.age) || null,
      height: Number(form.height) || null,
      weight: Number(form.weight) || null,
      activity: form.activity
    });
    editingBody = false;
  }

  // --- Pengingat ---

  let reminderNote = $state('');

  async function toggleReminder() {
    if (!$profile) return;
    if (!$profile.reminderEnabled) {
      const result = await requestPermission();
      if (result !== 'granted') {
        reminderNote =
          result === 'denied'
            ? 'Izin notifikasi ditolak. Aktifkan lagi lewat pengaturan situs di browsermu.'
            : 'Notifikasi belum diizinkan.';
        return;
      }
    }
    reminderNote = '';
    await saveProfile({ reminderEnabled: !$profile.reminderEnabled });
  }

  async function setReminderTime(value) {
    if (value) await saveProfile({ reminderTime: value });
  }

  async function testNotification() {
    reminderNote = (await sendTestNotification())
      ? 'Notifikasi percobaan dikirim.'
      : 'Gagal mengirim. Cek izin notifikasi di browsermu.';
  }

  // --- Kalender ---

  let calendarNote = $state('');

  const googleUrl = $derived(
    $profile?.activeProgram
      ? googleCalendarUrl({ programId: $profile.activeProgram, time: $profile.reminderTime ?? '18:00' })
      : null
  );

  function downloadIcs() {
    const content = buildIcs({
      programId: $profile?.activeProgram,
      time: $profile?.reminderTime ?? '18:00'
    });
    if (!content) {
      calendarNote = 'Pilih program latihan dulu supaya ada jadwal yang bisa diekspor.';
      return;
    }
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = icsFileName($profile.activeProgram);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    calendarNote = 'Berkas jadwal diunduh. Buka berkasnya untuk menambahkannya ke kalender.';
  }

  async function handleLogout() {
    await logout();
    goto('/masuk');
  }
</script>

<header>
  <h1 class="num text-3xl font-bold">Profil</h1>
  <p class="mt-1 text-sm text-mute">Data diri, pengingat latihan, dan sambungan ke kalender.</p>
</header>

<section class="card mt-5">
  <div class="flex items-center gap-4">
    <div
      class="num flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-plate-yellow text-2xl font-bold text-rubber"
      aria-hidden="true"
    >
      {($profile?.name || $user?.displayName || $user?.email || '?').trim().charAt(0).toUpperCase()}
    </div>
    <div class="min-w-0">
      <p class="truncate font-semibold">{$profile?.name || $user?.displayName || 'Belum ada nama'}</p>
      <p class="truncate text-xs text-mute">{$user?.email ?? ''}</p>
    </div>
  </div>
</section>

<section class="mt-4 grid grid-cols-3 gap-3">
  <StatTile value={$streak} label="Rentetan" sub="hari" />
  <StatTile value={$profile?.bestStreak ?? 0} label="Terbaik" sub="hari" accent="#31A05F" />
  <StatTile value={trainingCount} label="Latihan" sub="tahun ini" accent="#2C6BE0" />
</section>

<section class="card mt-4">
  <div class="flex items-baseline justify-between">
    <h2 class="font-semibold">Data diri</h2>
    {#if !editingBody}
      <button class="text-xs text-mute underline underline-offset-4" onclick={() => (editingBody = true)}>
        Ubah
      </button>
    {/if}
  </div>

  {#if editingBody}
    <label class="mt-3 block text-xs text-mute">
      Nama panggilan
      <input class="field mt-1 text-sm" bind:value={form.name} autocomplete="name" />
    </label>
    <div class="mt-3 grid grid-cols-2 gap-3">
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
    <div class="mt-4 flex gap-2">
      <button class="btn-primary flex-1" onclick={saveBody}>Simpan</button>
      <button class="btn-ghost flex-1" onclick={() => (editingBody = false)}>Batal</button>
    </div>
  {:else}
    <dl class="mt-3 space-y-2 text-sm">
      <div class="flex justify-between border-t border-white/5 pt-2 first:border-0 first:pt-0">
        <dt class="text-mute">Jenis kelamin</dt>
        <dd>{$profile?.sex ?? '—'}</dd>
      </div>
      <div class="flex justify-between border-t border-white/5 pt-2">
        <dt class="text-mute">Usia</dt>
        <dd class="num">{$profile?.age ? `${$profile.age} tahun` : '—'}</dd>
      </div>
      <div class="flex justify-between border-t border-white/5 pt-2">
        <dt class="text-mute">Tinggi</dt>
        <dd class="num">{$profile?.height ? `${$profile.height} cm` : '—'}</dd>
      </div>
      <div class="flex justify-between border-t border-white/5 pt-2">
        <dt class="text-mute">Berat</dt>
        <dd class="num">{$profile?.weight ? `${$profile.weight} kg` : '—'}</dd>
      </div>
      <div class="flex justify-between border-t border-white/5 pt-2">
        <dt class="text-mute">Aktivitas</dt>
        <dd>{activityLevels.find((a) => a.id === $profile?.activity)?.name ?? '—'}</dd>
      </div>
      <div class="flex justify-between border-t border-white/5 pt-2">
        <dt class="text-mute">Tujuan</dt>
        <dd>{goals.find((g) => g.id === $profile?.goal)?.name ?? '—'}</dd>
      </div>
    </dl>
  {/if}
</section>

<section class="card mt-4">
  <h2 class="font-semibold">Program aktif</h2>
  {#if program}
    <p class="mt-2 text-sm">{program.name}</p>
    <p class="text-xs text-mute">
      {program.level} &middot; {program.daysPerWeek}x seminggu &middot; {program.weeks} minggu
    </p>
    <p class="mt-1 text-xs text-mute">Hari latihan: {dayNames}</p>
  {:else}
    <p class="mt-2 text-sm text-mute">Belum ada program yang dipilih.</p>
  {/if}
  <a class="btn-ghost mt-4 w-full" href="/programs">
    {program ? 'Ganti program' : 'Pilih program'}
  </a>
</section>

<section class="card mt-4">
  <h2 class="font-semibold">Timer istirahat</h2>
  <p class="mt-1 text-xs text-mute">
    Hitungan mundur otomatis mulai setiap kali kamu menandai satu set selesai.
  </p>
  <div class="mt-3 flex gap-2">
    {#each [60, 90, 120, 180] as detik}
      <button
        class="chip flex-1 {($profile?.restSeconds ?? 90) === detik
          ? 'bg-plate-yellow text-rubber'
          : 'bg-rack text-mute'}"
        onclick={() => saveProfile({ restSeconds: detik })}
      >
        {detik < 60 ? `${detik}d` : `${detik / 60} mnt`}
      </button>
    {/each}
  </div>
</section>

<section class="card mt-4">
  <h2 class="font-semibold">Pengingat latihan</h2>
  <p class="mt-1 text-xs text-mute">
    Notifikasi harian dari browser pada jam yang kamu pilih.
  </p>

  {#if !notificationsSupported}
    <p class="mt-3 rounded-xl bg-rack p-3 text-xs text-mute">
      Browser ini tidak mendukung notifikasi. Pakai ekspor kalender di bawah sebagai gantinya.
    </p>
  {:else}
    <div class="mt-4 flex items-center justify-between gap-3">
      <span class="text-sm">Aktifkan pengingat</span>
      <button
        type="button"
        role="switch"
        aria-checked={Boolean($profile?.reminderEnabled)}
        aria-label="Aktifkan pengingat latihan"
        class="relative h-7 w-12 shrink-0 rounded-full transition-colors {$profile?.reminderEnabled
          ? 'bg-plate-green'
          : 'bg-rack'}"
        onclick={toggleReminder}
      >
        <span
          class="absolute top-1 h-5 w-5 rounded-full bg-chalk transition-all {$profile?.reminderEnabled
            ? 'left-6'
            : 'left-1'}"
        ></span>
      </button>
    </div>

    <label class="mt-4 block text-xs text-mute">
      Jam pengingat
      <input
        class="field mt-1 text-sm"
        type="time"
        value={$profile?.reminderTime ?? '18:00'}
        onchange={(e) => setReminderTime(e.currentTarget.value)}
      />
    </label>

    <label class="mt-3 flex items-center justify-between gap-3 text-sm">
      <span>Ingatkan juga di hari istirahat</span>
      <input
        type="checkbox"
        class="h-5 w-5 shrink-0 accent-plate-yellow"
        checked={Boolean($profile?.reminderOnRestDays)}
        onchange={(e) => saveProfile({ reminderOnRestDays: e.currentTarget.checked })}
      />
    </label>

    {#if $permission === 'granted'}
      <button class="btn-ghost mt-4 w-full" onclick={testNotification}>Kirim notifikasi percobaan</button>
    {/if}

    {#if reminderNote}
      <p class="mt-3 text-xs text-plate-yellow">{reminderNote}</p>
    {/if}

    <p class="mt-3 rounded-xl bg-rack p-3 text-xs text-mute">
      Pengingat ini hanya berjalan selama Gym Daily masih terbuka di salah satu tab browser. Kalau
      kamu butuh pengingat yang muncul walau aplikasi tertutup, tambahkan jadwalnya ke kalender di
      bawah.
    </p>
  {/if}
</section>

<section class="card mt-4">
  <h2 class="font-semibold">Sambungkan ke kalender</h2>
  <p class="mt-1 text-xs text-mute">
    Jadwal programmu dikirim sebagai acara berulang lengkap dengan alarm 30 menit sebelum mulai.
    Alarmnya berbunyi lewat kalender ponsel, jadi tetap jalan walau aplikasi ini tertutup.
  </p>

  {#if !program}
    <p class="mt-3 rounded-xl bg-rack p-3 text-xs text-mute">
      Pilih program latihan dulu supaya ada jadwal yang bisa dikirim ke kalender.
    </p>
  {:else}
    <div class="mt-4 space-y-2">
      <button class="btn-primary w-full" onclick={downloadIcs}>
        Unduh untuk Apple Calendar (.ics)
      </button>
      {#if googleUrl}
        <a class="btn-ghost w-full" href={googleUrl} target="_blank" rel="noopener noreferrer">
          Tambahkan ke Google Calendar
        </a>
      {/if}
    </div>

    {#if calendarNote}
      <p class="mt-3 text-xs text-plate-yellow">{calendarNote}</p>
    {/if}

    <details class="mt-4">
      <summary class="cursor-pointer text-xs text-mute underline underline-offset-4">
        Cara memasangnya di ponsel
      </summary>
      <div class="mt-2 space-y-2 text-xs text-mute">
        <p>
          <span class="font-semibold text-chalk">iPhone / iPad / Mac:</span> ketuk "Unduh untuk Apple
          Calendar", lalu buka berkas .ics yang terunduh. Calendar akan menawarkan untuk menambahkan
          semua sesinya sekaligus.
        </p>
        <p>
          <span class="font-semibold text-chalk">Android:</span> pakai "Tambahkan ke Google Calendar".
          Berkas .ics juga bisa dipakai lewat Google Calendar di web melalui menu Setelan &rarr; Impor
          &amp; ekspor.
        </p>
        <p>
          Jadwal ini memakai jam pengingat di atas ({$profile?.reminderTime ?? '18:00'}). Ubah jamnya
          dulu kalau perlu, baru ekspor ulang.
        </p>
      </div>
    </details>
  {/if}
</section>

<section class="mt-4">
  <button class="btn-ghost w-full text-plate-red" onclick={handleLogout}>Keluar</button>
</section>

<p class="mt-5 text-xs text-mute">
  Data tubuh dipakai hanya untuk menghitung perkiraan kebutuhan kalori dan tersimpan di akunmu
  sendiri. Kalau kamu punya kondisi kesehatan tertentu, bicarakan dulu dengan dokter sebelum
  mengubah pola latihan.
</p>
