<script>
  import { adjustRest, remaining, rest, stopRest } from '$lib/stores/rest';

  const mmss = $derived.by(() => {
    const s = $remaining;
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });

  const progress = $derived($rest ? Math.min(1, $remaining / $rest.total) : 0);
</script>

{#if $rest}
  <div
    class="fixed inset-x-0 bottom-[68px] z-30 px-4"
    style="padding-bottom: env(safe-area-inset-bottom)"
    role="status"
    aria-live="polite"
  >
    <div class="mx-auto max-w-lg overflow-hidden rounded-2xl border border-hair/10 bg-deck shadow-lg shadow-black/40">
      <div
        class="h-1 bg-plate-yellow transition-[width] duration-300 ease-linear"
        style="width: {progress * 100}%"
      ></div>
      <div class="flex items-center gap-3 px-4 py-3">
        <div class="min-w-0 flex-1">
          <p class="text-[11px] text-mute">Istirahat{$rest.label ? ` · ${$rest.label}` : ''}</p>
          <p class="num text-3xl font-bold text-plate-yellow">{mmss}</p>
        </div>
        <button class="chip bg-rack text-chalk" onclick={() => adjustRest(-15)}>&minus;15d</button>
        <button class="chip bg-rack text-chalk" onclick={() => adjustRest(30)}>+30d</button>
        <button class="chip bg-plate-yellow text-rubber" onclick={stopRest}>Lewati</button>
      </div>
    </div>
  </div>
{/if}
