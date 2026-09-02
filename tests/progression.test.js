import { describe, expect, it } from 'vitest';
import {
  DELOAD_EVERY,
  isDeloadWeek,
  loadStep,
  programProgress,
  programWeek,
  suggestLoad
} from '$lib/utils/progression';

const task = { name: 'Back squat', sets: 3, reps: '8' };

/** Sesi tiga set pada beban dan repetisi tertentu. */
function session(date, kg, reps, name = 'Back squat', setCount = 3) {
  return {
    id: date,
    tasks: [
      {
        id: 'a',
        name,
        sets: 3,
        reps: '8',
        done: true,
        logs: Array.from({ length: setCount }, () => ({ kg, reps, done: true }))
      }
    ]
  };
}

describe('programWeek', () => {
  const profile = { programStartedAt: '2026-08-05' };

  it('hari pertama sudah masuk minggu 1', () => {
    expect(programWeek(profile, '2026-08-05')).toBe(1);
  });

  it('minggu berganti tepat setiap tujuh hari', () => {
    expect(programWeek(profile, '2026-08-11')).toBe(1);
    expect(programWeek(profile, '2026-08-12')).toBe(2);
    expect(programWeek(profile, '2026-08-19')).toBe(3);
  });

  it('mengembalikan null sebelum program dimulai atau tanpa tanggal mulai', () => {
    expect(programWeek(profile, '2026-08-01')).toBeNull();
    expect(programWeek({}, '2026-08-10')).toBeNull();
    expect(programWeek(profile, null)).toBeNull();
  });
});

describe('minggu pemulihan', () => {
  it(`jatuh setiap kelipatan ${DELOAD_EVERY}`, () => {
    expect(isDeloadWeek(4)).toBe(true);
    expect(isDeloadWeek(8)).toBe(true);
    expect(isDeloadWeek(3)).toBe(false);
    expect(isDeloadWeek(5)).toBe(false);
  });

  it('tidak berlaku saat minggunya tidak diketahui', () => {
    expect(isDeloadWeek(null)).toBe(false);
    expect(isDeloadWeek(0)).toBe(false);
  });
});

describe('programProgress', () => {
  const profile = { programStartedAt: '2026-08-05' };

  it('menghitung posisi dan persentase', () => {
    expect(programProgress(profile, { weeks: 8 }, '2026-09-02')).toMatchObject({
      week: 5,
      total: 8,
      deload: false,
      finished: false,
      percent: 63
    });
  });

  it('menandai program yang sudah lewat durasinya', () => {
    expect(programProgress(profile, { weeks: 2 }, '2026-09-02').finished).toBe(true);
  });

  it('persentase tidak melewati 100', () => {
    expect(programProgress(profile, { weeks: 1 }, '2026-09-02').percent).toBe(100);
  });
});

describe('loadStep', () => {
  it('gerakan besar dengan barbel naik lebih banyak', () => {
    expect(loadStep('Back squat')).toBe(5);
    expect(loadStep('Deadlift')).toBe(5);
  });

  it('gerakan isolasi naik sedikit', () => {
    expect(loadStep('Lateral raise')).toBe(1);
  });

  it('gerakan berat badan dan kardio tidak punya langkah beban', () => {
    expect(loadStep('Push up')).toBe(0);
    expect(loadStep('Jalan cepat')).toBe(0);
  });

  it('gerakan di luar pustaka memakai langkah aman', () => {
    expect(loadStep('Gerakan karangan sendiri')).toBe(2.5);
  });
});

describe('suggestLoad', () => {
  it('menyarankan naik saat semua set tuntas di repetisi target', () => {
    const s = suggestLoad([session('2026-08-25', 100, 8)], task, '2026-09-02');
    expect(s).toMatchObject({ kg: 105, status: 'naik' });
  });

  it('menyarankan tahan saat repetisi belum tercapai', () => {
    const s = suggestLoad([session('2026-08-25', 100, 6)], task, '2026-09-02');
    expect(s).toMatchObject({ kg: 100, status: 'tahan' });
  });

  it('menyarankan tahan saat jumlah set kurang dari target', () => {
    const s = suggestLoad([session('2026-08-25', 100, 8, 'Back squat', 2)], task, '2026-09-02');
    expect(s.status).toBe('tahan');
  });

  it('menyarankan turun setelah dua sesi berturut-turut gagal', () => {
    const logs = [session('2026-08-18', 100, 6), session('2026-08-25', 100, 5)];
    const s = suggestLoad(logs, task, '2026-09-02');
    expect(s).toMatchObject({ kg: 90, status: 'turun' });
  });

  it('memakai sekitar 60 persen beban di minggu pemulihan', () => {
    const s = suggestLoad([session('2026-08-25', 100, 8)], task, '2026-09-02', { deload: true });
    expect(s).toMatchObject({ kg: 60, status: 'pemulihan' });
  });

  it('membulatkan ke kelipatan plat yang nyata', () => {
    const s = suggestLoad([session('2026-08-25', 97, 8)], task, '2026-09-02');
    expect(s.kg % 2.5).toBe(0);
  });

  it('tidak menyarankan apa pun tanpa riwayat', () => {
    expect(suggestLoad([], task, '2026-09-02')).toBeNull();
  });

  it('tidak menyarankan apa pun untuk gerakan berat badan', () => {
    const bodyweight = { name: 'Push up', sets: 3, reps: '10' };
    const logs = [session('2026-08-25', 0, 10, 'Push up')];
    expect(suggestLoad(logs, bodyweight, '2026-09-02')).toBeNull();
  });

  it('mengabaikan sesi pada atau sesudah hari ini', () => {
    const logs = [session('2026-09-02', 100, 8)];
    expect(suggestLoad(logs, task, '2026-09-02')).toBeNull();
  });

  it('target repetisi non-numerik tidak membuat sesi dianggap gagal terus', () => {
    // Reps seperti "sampai lelah" tidak bisa dibandingkan angkanya, jadi sesi
    // dinilai tuntas selama jumlah setnya terpenuhi.
    const swingTask = { name: 'Kettlebell swing', sets: 3, reps: 'sampai lelah' };
    const logs = [
      {
        id: '2026-08-25',
        tasks: [
          {
            id: 'k',
            name: 'Kettlebell swing',
            sets: 3,
            reps: 'sampai lelah',
            logs: Array.from({ length: 3 }, () => ({ kg: 20, reps: 15, done: true }))
          }
        ]
      }
    ];
    expect(suggestLoad(logs, swingTask, '2026-09-02')).toMatchObject({ status: 'naik', kg: 22.5 });
  });
});
