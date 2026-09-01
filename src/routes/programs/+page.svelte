<script>
  import { goto } from '$app/navigation';
  import { programs } from '$lib/data/programs.js';
  import { chooseProgram, profile } from '$lib/stores/data';
  import { dayShort } from '$lib/utils/date';

  let openId = $state(null);
  let saving = $state(null);

  const levelColor = {
    Pemula: '#31A05F',
    Menengah: '#F0B429',
    Lanjutan: '#D6353B'
  };

  async function pick(id) {
    saving = id;
    await chooseProgram(id);
    saving = null;
    goto('/');
  }
</script>

<header>
  <h1 class="num text-3xl font-bold">Program latihan</h1>
  <p class="mt-1 text-sm text-mute">
    Satu program berjalan pada satu waktu. Jadwalnya otomatis muncul di halaman Hari ini sesuai hari.
  </p>
</header>

<div class="mt-6 space-y-3">
  {#each programs as p (p.id)}
    {@const active = $profile?.activeProgram === p.id}
    <article class="rounded-2xl border bg-deck p-4 {active ? 'border-plate-yellow/60' : 'border-white/5'}">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="num text-2xl font-bold">{p.name}</h2>
          <p class="text-xs text-mute">
            {p.daysPerWeek} hari per minggu &middot; {p.weeks} minggu &middot; {p.place}
          </p>
        </div>
        <span
          class="chip shrink-0"
          style="background: {levelColor[p.level]}22; color: {levelColor[p.level]}"
        >
          {p.level}
        </span>
      </div>

      <p class="mt-3 text-sm text-mute">{p.summary}</p>
      <p class="mt-2 text-sm"><span class="text-mute">Tujuan:</span> {p.goal}</p>

      <button
        class="mt-3 text-xs text-mute underline underline-offset-4"
        onclick={() => (openId = openId === p.id ? null : p.id)}
      >
        {openId === p.id ? 'Tutup jadwal' : 'Lihat jadwal mingguan'}
      </button>

      {#if openId === p.id}
        <ul class="mt-3 space-y-2 border-t border-white/5 pt-3">
          {#each [1, 2, 3, 4, 5, 6, 0] as d}
            {@const s = p.schedule[d]}
            <li class="flex gap-3 text-sm">
              <span class="num w-10 shrink-0 pt-0.5 text-mute">{dayShort[d]}</span>
              <span class="min-w-0">
                <span class="{s && s.exercises.length ? 'text-chalk' : 'text-mute'}">
                  {s?.title ?? 'Istirahat'}
                </span>
                {#if s && s.exercises.length}
                  <span class="block text-xs text-mute">
                    {s.exercises.map((e) => e.name).join(', ')}
                  </span>
                {/if}
              </span>
            </li>
          {/each}
        </ul>
      {/if}

      {#if active}
        <p class="mt-4 rounded-xl bg-plate-yellow/10 px-4 py-3 text-center text-sm text-plate-yellow">
          Program ini sedang berjalan
        </p>
      {:else}
        <button class="btn-primary mt-4 w-full" onclick={() => pick(p.id)} disabled={saving === p.id}>
          {saving === p.id ? 'Menyiapkan...' : 'Jalankan program ini'}
        </button>
      {/if}
    </article>
  {/each}
</div>

<p class="mt-6 text-xs text-mute">
  Ganti program kapan saja. Catatan hari ini akan disusun ulang mengikuti jadwal program baru, riwayat
  hari sebelumnya tetap tersimpan.
</p>
