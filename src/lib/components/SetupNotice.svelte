<script>
  const vars = [
    'PUBLIC_FIREBASE_API_KEY',
    'PUBLIC_FIREBASE_AUTH_DOMAIN',
    'PUBLIC_FIREBASE_PROJECT_ID',
    'PUBLIC_FIREBASE_STORAGE_BUCKET',
    'PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'PUBLIC_FIREBASE_APP_ID'
  ];
</script>

<main class="mx-auto max-w-lg px-5 py-16">
  <h1 class="num text-4xl font-bold">Firebase belum tersambung</h1>
  <p class="mt-3 text-mute">
    Aplikasi butuh kunci Firebase sebelum bisa menyimpan data. Salin file <code class="text-chalk">.env.example</code>
    jadi <code class="text-chalk">.env</code>, isi nilainya dari Firebase Console, lalu jalankan ulang server.
  </p>
  <ul class="mt-6 space-y-2">
    {#each vars as v}
      <li class="rounded-lg bg-rack px-3 py-2 font-mono text-xs text-mute">{v}</li>
    {/each}
  </ul>
  <p class="mt-6 text-sm text-mute">
    Di Vercel, isi variabel yang sama di Project Settings lalu deploy ulang.
  </p>
</main>
