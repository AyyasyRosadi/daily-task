<script>
  import { groupColor } from '$lib/data/programs.js';

  let { tasks = [] } = $props();

  // Plat dipasang bergantian kiri-kanan dari tengah, seperti memuat barbel sungguhan.
  const layout = $derived(
    tasks.map((task, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const slot = Math.floor(i / 2);
      const height = Math.max(26, 60 - slot * 9);
      return {
        task,
        x: 160 + side * (30 + slot * 14) - (side === -1 ? 11 : 0),
        y: 48 - height / 2,
        height,
        color: groupColor[task.group] ?? '#E7E3DA'
      };
    })
  );
</script>

<svg viewBox="0 0 320 96" class="w-full" role="img" aria-label="Kemajuan latihan hari ini">
  <rect x="18" y="45" width="284" height="6" rx="3" fill="#3A4741" />
  {#each [140, 148, 172, 180] as x}
    <rect {x} y="42" width="2" height="12" rx="1" fill="#4E5C55" />
  {/each}
  <rect x="18" y="38" width="7" height="20" rx="2" fill="#4E5C55" />
  <rect x="295" y="38" width="7" height="20" rx="2" fill="#4E5C55" />

  {#each layout as plate (plate.task.id)}
    <rect
      x={plate.x}
      y={plate.y}
      width="11"
      height={plate.height}
      rx="3"
      fill={plate.task.done ? plate.color : 'transparent'}
      stroke={plate.task.done ? 'none' : 'rgba(241,238,231,0.18)'}
      stroke-width="1.5"
      class="transition-all duration-300"
    />
  {/each}
</svg>
