<script>
  import { authError, login, register } from '$lib/stores/auth';

  let mode = $state('masuk');
  let email = $state('');
  let password = $state('');
  let name = $state('');
  let error = $state('');
  let busy = $state(false);

  async function submit() {
    error = '';
    if (!email || !password) {
      error = 'Email dan kata sandi wajib diisi.';
      return;
    }
    busy = true;
    try {
      if (mode === 'masuk') await login(email, password);
      else await register(email, password, name);
    } catch (e) {
      error = authError(e?.code);
    } finally {
      busy = false;
    }
  }
</script>

<div class="pt-6">
  <svg viewBox="0 0 120 40" class="h-10" role="img" aria-label="Logo">
    <rect x="4" y="17" width="112" height="6" rx="3" fill="#3A4741" />
    <rect x="16" y="8" width="10" height="24" rx="3" fill="#D6353B" />
    <rect x="30" y="12" width="8" height="16" rx="2" fill="#2C6BE0" />
    <rect x="82" y="12" width="8" height="16" rx="2" fill="#2C6BE0" />
    <rect x="94" y="8" width="10" height="24" rx="3" fill="#D6353B" />
  </svg>

  <h1 class="num mt-6 text-4xl font-bold leading-tight">
    Satu sesi hari ini,<br />dihitung sampai akhir tahun.
  </h1>
  <p class="mt-3 text-sm text-mute">
    Catat latihan harian, jaga streak, dan lihat kemajuanmu per minggu dan per bulan.
  </p>

  <div class="mt-8 space-y-3">
    {#if mode === 'daftar'}
      <input class="field" placeholder="Nama panggilan" bind:value={name} autocomplete="name" />
    {/if}
    <input class="field" type="email" placeholder="Email" bind:value={email} autocomplete="email" />
    <input
      class="field"
      type="password"
      placeholder="Kata sandi"
      bind:value={password}
      autocomplete={mode === 'masuk' ? 'current-password' : 'new-password'}
      onkeydown={(e) => e.key === 'Enter' && submit()}
    />

    {#if error}
      <p class="rounded-xl bg-plate-red/15 px-4 py-3 text-sm text-plate-red">{error}</p>
    {/if}

    <button class="btn-primary w-full" onclick={submit} disabled={busy}>
      {busy ? 'Sebentar...' : mode === 'masuk' ? 'Masuk' : 'Buat akun'}
    </button>
  </div>

  <button
    class="mt-5 w-full text-sm text-mute underline underline-offset-4"
    onclick={() => {
      mode = mode === 'masuk' ? 'daftar' : 'masuk';
      error = '';
    }}
  >
    {mode === 'masuk' ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk'}
  </button>
</div>
