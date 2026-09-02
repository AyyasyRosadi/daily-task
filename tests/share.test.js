import { describe, expect, it } from 'vitest';
import { cardFilename, newRecords, periodRange, summarize, volumeLabel } from '$lib/utils/share';

/**
 * Tes untuk angka di kartu ringkasan. Penggambaran ke canvas tidak diuji di
 * sini — yang bisa salah dan berakibat adalah angkanya, bukan posisi teksnya.
 */

/** Sesi selesai dengan satu gerakan dan set-set yang sudah dicentang. */
function sesi(id, name, sets) {
  return {
    id,
    completed: true,
    isRest: false,
    tasks: [{ id: 'a', name, sets: sets.length, logs: sets.map((s) => ({ ...s, done: true })) }]
  };
}

describe('periodRange', () => {
  it('minggu dimulai Senin dan berakhir Minggu', () => {
    // 2026-09-02 adalah hari Rabu.
    const r = periodRange('minggu', new Date(2026, 8, 2));
    expect(r.from).toBe('2026-08-31');
    expect(r.to).toBe('2026-09-06');
  });

  it('minggu yang menyeberang bulan menyebut kedua bulannya', () => {
    const r = periodRange('minggu', new Date(2026, 8, 2));
    expect(r.label).toBe('31 Agustus – 6 September');
  });

  it('minggu di dalam satu bulan cukup menyebut satu bulan', () => {
    const r = periodRange('minggu', new Date(2026, 8, 9));
    expect(r).toMatchObject({ from: '2026-09-07', to: '2026-09-13', label: '7–13 September' });
  });

  it('bulan mencakup tanggal 1 sampai hari terakhir', () => {
    const r = periodRange('bulan', new Date(2026, 1, 14));
    expect(r).toMatchObject({ from: '2026-02-01', to: '2026-02-28', label: 'Februari 2026' });
  });
});

describe('newRecords', () => {
  const logs = [
    sesi('2026-08-10', 'Deadlift', [{ kg: 100, reps: 5 }]),
    sesi('2026-08-12', 'Back squat', [{ kg: 80, reps: 5 }]),
    sesi('2026-09-02', 'Deadlift', [{ kg: 110, reps: 3 }]),
    sesi('2026-09-03', 'Back squat', [{ kg: 75, reps: 8 }]),
    sesi('2026-09-04', 'Overhead press', [{ kg: 40, reps: 5 }])
  ];

  it('hanya menghitung gerakan yang melampaui catatan sebelumnya', () => {
    const r = newRecords(logs, '2026-09-01', '2026-09-30');
    expect(r).toEqual([{ name: 'Deadlift', kg: 110, previous: 100 }]);
  });

  it('gerakan yang baru pertama kali dicatat bukan rekor baru', () => {
    const r = newRecords(logs, '2026-09-01', '2026-09-30');
    expect(r.map((x) => x.name)).not.toContain('Overhead press');
  });

  it('beban yang sama dengan rekor lama belum terhitung pecah', () => {
    const sama = [...logs, sesi('2026-09-05', 'Back squat', [{ kg: 80, reps: 5 }])];
    expect(newRecords(sama, '2026-09-01', '2026-09-30').map((x) => x.name)).toEqual(['Deadlift']);
  });

  it('mengabaikan sesi di luar rentang', () => {
    expect(newRecords(logs, '2026-08-01', '2026-08-31')).toEqual([]);
  });

  it('urut dari beban terberat', () => {
    const banyak = [
      ...logs,
      sesi('2026-09-06', 'Barbell bench press', [{ kg: 60, reps: 5 }]),
      sesi('2026-09-07', 'Barbell bench press', [{ kg: 70, reps: 5 }])
    ];
    const r = newRecords(banyak, '2026-09-07', '2026-09-30');
    expect(r.map((x) => x.name)).toEqual(['Barbell bench press']);
  });
});

describe('summarize', () => {
  const today = new Date(2026, 8, 2); // Rabu, minggu 31 Agu - 6 Sep
  const logs = [
    sesi('2026-08-25', 'Deadlift', [{ kg: 100, reps: 5 }]),
    sesi('2026-08-31', 'Back squat', [{ kg: 60, reps: 10 }]),
    sesi('2026-09-01', 'Deadlift', [{ kg: 110, reps: 5 }]),
    { id: '2026-09-02', completed: true, isRest: true, tasks: [] },
    { id: '2026-09-03', completed: false, isRest: false, tasks: [] }
  ];
  const profile = { name: '  Ayyas  ', streak: 4 };

  it('menghitung sesi selesai tanpa hari istirahat dan sesi belum tuntas', () => {
    expect(summarize(logs, profile, { period: 'minggu', today }).sessions).toBe(2);
  });

  it('menjumlahkan volume seluruh periode', () => {
    // 60x10 + 110x5 = 1150
    expect(summarize(logs, profile, { period: 'minggu', today }).volume).toBe(1150);
  });

  it('membawa nama yang sudah dirapikan dan streak berjalan', () => {
    const s = summarize(logs, profile, { period: 'minggu', today });
    expect(s.name).toBe('Ayyas');
    expect(s.streak).toBe(4);
  });

  it('periode bulan mencakup lebih banyak sesi daripada minggu', () => {
    const bulan = summarize(logs, profile, { period: 'bulan', today: new Date(2026, 7, 20) });
    expect(bulan.label).toBe('Agustus 2026');
    expect(bulan.sessions).toBe(2); // 25 dan 31 Agustus
  });

  it('tahan terhadap data dan profil yang belum ada', () => {
    const s = summarize([], null, { period: 'minggu', today });
    expect(s).toMatchObject({ sessions: 0, volume: 0, streak: 0, name: '', records: [] });
  });
});

describe('volumeLabel', () => {
  it('memakai ton begitu melewati seribu kilogram', () => {
    expect(volumeLabel(12500)).toEqual({ value: '12.5', unit: 'ton diangkat' });
    expect(volumeLabel(1000)).toEqual({ value: '1', unit: 'ton diangkat' });
  });

  it('di bawah seribu tetap kilogram tanpa desimal', () => {
    expect(volumeLabel(999.4)).toEqual({ value: '999', unit: 'kg diangkat' });
    expect(volumeLabel(0)).toEqual({ value: '0', unit: 'kg diangkat' });
  });
});

describe('cardFilename', () => {
  it('memakai periode dan tanggal awal', () => {
    const s = summarize([], null, { period: 'bulan', today: new Date(2026, 8, 2) });
    expect(cardFilename(s)).toBe('gym-daily-bulan-2026-09-01.png');
  });
});
