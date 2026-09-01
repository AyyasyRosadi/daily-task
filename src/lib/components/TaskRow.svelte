<script>
  import { groupColor } from '$lib/data/programs.js';

  let { task, ontoggle } = $props();
</script>

<button
  type="button"
  onclick={() => ontoggle(task.id)}
  class="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-rack/60 px-3 py-3 text-left transition-colors hover:bg-rack"
  aria-pressed={task.done}
>
  <span
    class="h-9 w-1.5 shrink-0 rounded-full"
    style="background: {task.done ? (groupColor[task.group] ?? '#E7E3DA') : 'rgba(241,238,231,0.15)'}"
  ></span>
  <span class="min-w-0 flex-1">
    <span class="block truncate text-[15px] font-medium {task.done ? 'text-mute line-through' : 'text-chalk'}">
      {task.name}
    </span>
    <span class="block text-xs text-mute">{task.sets} set &times; {task.reps}</span>
  </span>
  <span
    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border {task.done
      ? 'border-plate-yellow bg-plate-yellow'
      : 'border-white/20'}"
  >
    {#if task.done}
      <svg viewBox="0 0 20 20" class="h-4 w-4 text-rubber" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m5 10 3.5 3.5L15 6.5" />
      </svg>
    {/if}
  </span>
</button>
