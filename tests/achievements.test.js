import { describe, expect, it } from 'vitest';
import { achievements, earned, nextTarget, recordBoard } from '$lib/utils/achievements';

/** Sesi latihan selesai dengan tiga set pada beban tertentu. */
function session(date, kg, name = 'Back squat') {
  return {
    id: date,
    completed: true,
    isRest: false,
    tasks: [
      {
        id: 'a',
        name,
        sets: 3,
        reps: '8',
        done: true,
        logs: Array.from({ length: 3 }, () => ({ kg, reps: 8, done: true }))
      }
    ]
  };
}

const logs = [session('2026-01-01', 100), session('2026-01-03', 105, 'Deadlift')];

describe('achievements', () => {
  it('menandai lencana yang sudah tercapai', () => {
    const badges = achievements(logs, { bestStreak: 30 });
    const streak7 = badges.find((b) => b.id === 'streak-7');
    const streak100 = badges.find((b) => b.id === 'streak-100');
    expect(streak7.earned).toBe(true);
    expect(streak100.earned).toBe(false);
  });

  it('menghitung persentase kemajuan dan membatasinya di 100', () => {
    const badges = achievements(logs, { bestStreak: 500 });
    expect(badges.find((b) => b.id === 'streak-7').percent).toBe(100);
    expect(achievements(logs, { bestStreak: 3 }).find((b) => b.id === 'streak-7').percent).toBe(43);
  });

  it('hanya menghitung sesi latihan yang selesai, bukan hari istirahat', () => {
    const withRest = [
      ...logs,
      { id: '2026-01-04', completed: true, isRest: true, tasks: [] },
      { id: '2026-01-05', completed: false, isRest: false, tasks: [] }
    ];
    expect(achievements(withRest, {}).find((b) => b.id === 'sesi-10').value).toBe(2);
  });

  it('menjumlahkan volume lintas sesi', () => {
    // 2 sesi x 3 set: (100x8)x3 + (105x8)x3 = 2400 + 2520
    expect(achievements(logs, {}).find((b) => b.id === 'ton-10').value).toBe(4920);
  });

  it('menghitung ragam gerakan yang pernah dicatat berbeban', () => {
    expect(achievements(logs, {}).find((b) => b.id === 'variasi-5').value).toBe(2);
  });

  it('tidak melempar untuk data kosong', () => {
    expect(() => achievements([], {})).not.toThrow();
    expect(() => achievements(null, null)).not.toThrow();
    expect(earned(null, null)).toEqual([]);
  });
});

describe('nextTarget', () => {
  it('memilih lencana yang paling dekat diraih', () => {
    // 2 sesi dari 10 (20%) lebih dekat daripada 4.920 kg dari 10.000 (49%)?
    // Tidak — volume yang lebih dekat, jadi itu yang dipilih.
    expect(nextTarget(logs, {}).id).toBe('ton-10');
  });

  it('mengembalikan null saat semuanya sudah diraih', () => {
    // Nama gerakan sengaja divariasikan supaya lencana ragam ikut terpenuhi.
    const many = Array.from({ length: 300 }, (_, i) =>
      session(`2026-${String(i)}`, 1000, `Gerakan ${i % 20}`)
    );
    expect(nextTarget(many, { bestStreak: 1000 })).toBeNull();
  });
});

describe('recordBoard', () => {
  it('mengurutkan dari beban terberat', () => {
    const board = recordBoard(logs);
    expect(board.map((r) => r.name)).toEqual(['Deadlift', 'Back squat']);
    expect(board[0].topKg).toBe(105);
  });

  it('membuang gerakan tanpa beban', () => {
    const withPlank = [
      ...logs,
      {
        id: '2026-02-01',
        completed: true,
        tasks: [
          { id: 'p', name: 'Plank', sets: 1, reps: '40 detik', logs: [{ kg: null, reps: 40, done: true }] }
        ]
      }
    ];
    expect(recordBoard(withPlank).some((r) => r.name === 'Plank')).toBe(false);
  });
});
