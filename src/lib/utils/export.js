import { setsOf } from '$lib/utils/workout';

/** Bungkus nilai CSV: tanda kutip, koma, dan baris baru harus di-escape. */
function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows) {
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

/**
 * Satu baris per set, bukan per sesi. Bentuk panjang ini yang paling gampang
 * diputar jadi pivot di spreadsheet.
 */
export function logsToCsv(logs) {
  const rows = [
    ['tanggal', 'program', 'judul', 'fokus', 'menit', 'hari_istirahat', 'selesai',
     'gerakan', 'kelompok', 'set_ke', 'beban_kg', 'repetisi', 'set_selesai', 'air_gelas', 'catatan']
  ];
  for (const log of [...(logs ?? [])].sort((a, b) => a.id.localeCompare(b.id))) {
    const base = [
      log.id, log.programId ?? '', log.title ?? '', log.focus ?? '', log.minutes ?? '',
      log.isRest ? 'ya' : 'tidak', log.completed ? 'ya' : 'tidak'
    ];
    const tasks = log.tasks ?? [];
    if (!tasks.length) {
      rows.push([...base, '', '', '', '', '', '', log.water ?? 0, log.note ?? '']);
      continue;
    }
    for (const task of tasks) {
      setsOf(task).forEach((set, i) => {
        rows.push([
          ...base, task.name, task.group ?? '', i + 1,
          set.kg ?? '', set.reps ?? '', set.done ? 'ya' : 'tidak',
          log.water ?? 0, log.note ?? ''
        ]);
      });
    }
  }
  return toCsv(rows);
}

export function weightsToCsv(weights) {
  const rows = [['tanggal', 'berat_kg']];
  for (const w of [...(weights ?? [])].sort((a, b) => a.id.localeCompare(b.id))) {
    rows.push([w.id, w.kg ?? '']);
  }
  return toCsv(rows);
}

export function measurementsToCsv(measurements, fields) {
  const rows = [['tanggal', ...fields.map((f) => f.id)]];
  for (const m of [...(measurements ?? [])].sort((a, b) => a.id.localeCompare(b.id))) {
    rows.push([m.id, ...fields.map((f) => m[f.id] ?? '')]);
  }
  return toCsv(rows);
}

/** Cadangan lengkap yang bisa dibaca ulang manusia maupun mesin. */
export function toJsonBackup({ profile, logs, weights, measurements }) {
  return JSON.stringify(
    {
      aplikasi: 'Gym Daily',
      versiFormat: 1,
      dieksporPada: new Date().toISOString(),
      profil: profile ?? null,
      logs: [...(logs ?? [])].sort((a, b) => a.id.localeCompare(b.id)),
      berat: [...(weights ?? [])].sort((a, b) => a.id.localeCompare(b.id)),
      ukuran: [...(measurements ?? [])].sort((a, b) => a.id.localeCompare(b.id))
    },
    null,
    2
  );
}

/** Picu unduhan berkas dari string di memori. */
export function downloadText(filename, content, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
