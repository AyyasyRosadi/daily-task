import { describe, expect, it } from 'vitest';
import {
  logsToCsv,
  measurementsToCsv,
  toJsonBackup,
  weightsToCsv
} from '$lib/utils/export';

const logs = [
  {
    id: '2026-02-02',
    title: 'Istirahat',
    isRest: true,
    completed: true,
    water: 4,
    note: '',
    tasks: []
  },
  {
    id: '2026-02-01',
    programId: 'p1',
    title: 'Full Body A',
    focus: 'Dorong, kaki',
    minutes: 55,
    isRest: false,
    completed: true,
    water: 6,
    note: 'Kurang tidur, terasa "berat"',
    tasks: [
      {
        id: 'a',
        name: 'Back squat',
        sets: 2,
        reps: '8',
        group: 'kaki',
        logs: [
          { kg: 100, reps: 8, done: true },
          { kg: 100, reps: 6, done: false }
        ]
      }
    ]
  }
];

/** Pisah baris CSV dengan tetap menghormati pemisah CRLF. */
function rows(csv) {
  return csv.trim().split('\r\n');
}

describe('logsToCsv', () => {
  it('memakai CRLF sesuai konvensi CSV', () => {
    expect(logsToCsv(logs)).toContain('\r\n');
  });

  it('mengurutkan menaik berdasarkan tanggal', () => {
    const [, first, , last] = rows(logsToCsv(logs));
    expect(first.startsWith('2026-02-01')).toBe(true);
    expect(last.startsWith('2026-02-02')).toBe(true);
  });

  it('menulis satu baris per set', () => {
    // header + 2 set latihan + 1 hari istirahat
    expect(rows(logsToCsv(logs))).toHaveLength(4);
  });

  it('membungkus nilai bertanda koma dengan kutip', () => {
    expect(logsToCsv(logs)).toContain('"Dorong, kaki"');
  });

  it('menggandakan tanda kutip di dalam teks', () => {
    expect(logsToCsv(logs)).toContain('"Kurang tidur, terasa ""berat"""');
  });

  it('tetap menulis satu baris untuk hari tanpa gerakan', () => {
    const restRow = rows(logsToCsv(logs)).at(-1);
    expect(restRow).toContain('Istirahat');
    expect(restRow.endsWith(',4,')).toBe(true);
  });

  it('menangani daftar kosong tanpa melempar', () => {
    expect(rows(logsToCsv([]))).toHaveLength(1);
    expect(rows(logsToCsv(null))).toHaveLength(1);
  });
});

describe('weightsToCsv dan measurementsToCsv', () => {
  it('menulis kolom berat', () => {
    const csv = weightsToCsv([{ id: '2026-02-01', kg: 80.5 }]);
    expect(rows(csv)).toEqual(['tanggal,berat_kg', '2026-02-01,80.5']);
  });

  it('mengosongkan field ukuran yang tidak diisi', () => {
    const fields = [{ id: 'pinggang' }, { id: 'dada' }];
    const csv = measurementsToCsv([{ id: '2026-02-01', pinggang: 80 }], fields);
    expect(rows(csv)).toEqual(['tanggal,pinggang,dada', '2026-02-01,80,']);
  });
});

describe('toJsonBackup', () => {
  it('menghasilkan JSON yang bisa dibaca ulang', () => {
    const parsed = JSON.parse(
      toJsonBackup({ profile: { name: 'A' }, logs, weights: [], measurements: [] })
    );
    expect(parsed.aplikasi).toBe('Gym Daily');
    expect(parsed.versiFormat).toBe(1);
    expect(parsed.profil).toEqual({ name: 'A' });
    expect(parsed.logs.map((l) => l.id)).toEqual(['2026-02-01', '2026-02-02']);
  });

  it('tidak melempar saat semua koleksi kosong', () => {
    expect(() => JSON.parse(toJsonBackup({}))).not.toThrow();
  });
});
