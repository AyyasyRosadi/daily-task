<script>
  let { value, label, sub = '', accent = '#F0B429' } = $props();
</script>

<div class="rounded-2xl border border-white/5 bg-deck p-4">
  <p class="num text-4xl font-bold" style="color: {accent}">{value}</p>
  <p class="mt-1 text-sm font-medium text-chalk">{label}</p>
  {#if sub}<p class="text-xs text-mute">{sub}</p>{/if}
</div>
