import { describe, expect, it } from 'vitest';
import {
  doneSets,
  epley1RM,
  exerciseHistory,
  exerciseNames,
  hasLoad,
  lastPerformance,
  logVolume,
  personalRecord,
  setsOf,
  taskVolume,
  topSet,
  trimNumber
} from '$lib/utils/workout';

/** Sesi dengan tiga set seragam pada beban tertentu. */
function session(date, kg, reps = 8, name = 'Back squat') {
  return {
    id: date,
    completed: true,
    tasks: [
      {
        id: 'a',
        name,
        sets: 3,
        reps: '8',
        done: true,
        logs: Array.from({ length: 3 }, () => ({ kg, reps, done: true }))
      }
    ]
  };
}

describe('setsOf', () => {
  it('membuat set kosong sebanyak target untuk log lama tanpa field logs', () => {
    const sets = setsOf({ name: 'Back squat', sets: 3, reps: '8', done: true });
    expect(sets).toHaveLength(3);
    expect(sets.every((s) => s.kg === null && s.reps === null && !s.done)).toBe(true);
  });

  it('mempertahankan set tambahan yang melebihi target program', () => {
    const task = {
      sets: 2,
      logs: [
        { kg: 40, reps: 10, done: true },
        { kg: 40, reps: 10, done: true },
        { kg: 40, reps: 8, done: true }
      ]
    };
    expect(setsOf(task)).toHaveLength(3);
  });

  it('mengisi kekurangan saat logs lebih pendek dari target', () => {
    const sets = setsOf({ sets: 4, logs: [{ kg: 50, reps: 5, done: true }] });
    expect(sets).toHaveLength(4);
    expect(sets[0].kg).toBe(50);
    expect(sets[3].done).toBe(false);
  });

  it('tidak pernah mengembalikan kurang dari satu set', () => {
    expect(setsOf({})).toHaveLength(1);
    expect(setsOf(null)).toHaveLength(1);
  });
});

describe('volume', () => {
  it('hanya menghitung set yang ditandai selesai', () => {
    const task = {
      sets: 3,
      logs: [
        { kg: 100, reps: 5, done: true },
        { kg: 100, reps: 5, done: false },
        { kg: 100, reps: 5, done: true }
      ]
    };
    expect(taskVolume(task)).toBe(1000);
    expect(doneSets(task)).toHaveLength(2);
  });

  it('menganggap set tanpa beban sebagai volume nol', () => {
    const task = { sets: 2, logs: [{ kg: null, reps: 40, done: true }] };
    expect(taskVolume(task)).toBe(0);
  });

  it('menjumlahkan seluruh gerakan dalam satu sesi', () => {
    expect(logVolume(session('2026-01-01', 100))).toBe(2400);
    expect(logVolume(null)).toBe(0);
  });
});

describe('epley1RM', () => {
  it('mengembalikan beban apa adanya untuk satu repetisi', () => {
    expect(epley1RM(100, 1)).toBe(100);
  });

  it('menaikkan perkiraan seiring bertambahnya repetisi', () => {
    expect(epley1RM(100, 10)).toBeCloseTo(133.33, 1);
  });

  it('menolak masukan yang tidak masuk akal', () => {
    expect(epley1RM(null, 5)).toBeNull();
    expect(epley1RM(100, 0)).toBeNull();
    expect(epley1RM(-10, 5)).toBeNull();
    expect(epley1RM('berat', 5)).toBeNull();
  });
});

describe('riwayat gerakan', () => {
  const logs = [
    session('2026-02-15', 62.5),
    session('2026-02-01', 60),
    session('2026-02-08', 65),
    { id: '2026-01-05', tasks: [{ id: 'a', name: 'Back squat', sets: 3, reps: '8', done: true }] }
  ];

  it('mengurutkan menaik dan membuang sesi tanpa beban', () => {
    const history = exerciseHistory(logs, 'Back squat');
    expect(history.map((r) => r.date)).toEqual(['2026-02-01', '2026-02-08', '2026-02-15']);
  });

  it('mencatat set terberat dan volume tiap sesi', () => {
    const [first] = exerciseHistory(logs, 'Back squat');
    expect(first.topKg).toBe(60);
    expect(first.volume).toBe(1440);
    expect(first.totalReps).toBe(24);
  });

  it('menemukan rekor pribadi', () => {
    expect(personalRecord(logs, 'Back squat')).toMatchObject({ topKg: 65, date: '2026-02-08' });
  });

  it('mengambil sesi terakhir sebelum tanggal tertentu', () => {
    expect(lastPerformance(logs, 'Back squat', '2026-02-15').date).toBe('2026-02-08');
  });

  it('mengembalikan null kalau belum ada sesi sebelumnya', () => {
    expect(lastPerformance(logs, 'Back squat', '2026-01-01')).toBeNull();
    expect(lastPerformance(logs, 'Gerakan tak dikenal', '2026-12-31')).toBeNull();
  });

  it('hanya mendaftar gerakan yang pernah dicatat dengan beban', () => {
    const withBodyweight = [
      ...logs,
      {
        id: '2026-03-01',
        tasks: [
          {
            id: 'p',
            name: 'Plank',
            sets: 1,
            reps: '40 detik',
            logs: [{ kg: null, reps: 40, done: true }]
          }
        ]
      }
    ];
    expect(exerciseNames(withBodyweight)).toEqual(['Back squat']);
  });
});

describe('topSet dan hasLoad', () => {
  it('mengabaikan set tanpa beban', () => {
    const task = { sets: 2, logs: [{ kg: null, reps: 40, done: true }] };
    expect(topSet(task)).toBeNull();
    expect(hasLoad(task)).toBe(false);
  });

  it('memilih set terberat, bukan yang terakhir', () => {
    const task = {
      sets: 3,
      logs: [
        { kg: 80, reps: 5, done: true },
        { kg: 100, reps: 3, done: true },
        { kg: 60, reps: 8, done: true }
      ]
    };
    expect(topSet(task).kg).toBe(100);
  });
});

describe('trimNumber', () => {
  it('membuang nol di belakang koma', () => {
    expect(trimNumber(60.0)).toBe('60');
    expect(trimNumber(62.5)).toBe('62.5');
    expect(trimNumber(1234.567, 0)).toBe('1235');
  });

  it('mengembalikan string kosong untuk nilai bukan angka', () => {
    expect(trimNumber(null)).toBe('');
    expect(trimNumber('abc')).toBe('');
  });
});
