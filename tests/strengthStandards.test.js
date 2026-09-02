import { describe, expect, it } from 'vitest';
import { levelFor, liftOf, standards, thresholds } from '$lib/data/strengthStandards';

/**
 * Tes untuk pembanding standar kekuatan.
 *
 * Sebagian tes di sini menyalin angka dari tabel ExRx supaya salah ketik saat
 * menyalin tabel ketahuan — itu justru risiko terbesar modul ini.
 */

describe('tabel standar', () => {
  it('punya empat gerakan dengan dua tabel jenis kelamin', () => {
    expect(Object.keys(standards).sort()).toEqual(['bench', 'deadlift', 'press', 'squat']);
    for (const lift of Object.values(standards)) {
      expect(Object.keys(lift).sort()).toEqual(['pria', 'wanita']);
    }
  });

  it('setiap baris berisi berat badan dan lima ambang yang menaik', () => {
    for (const [name, lift] of Object.entries(standards)) {
      for (const [sex, rows] of Object.entries(lift)) {
        for (const row of rows) {
          expect(row, `${name}/${sex}`).toHaveLength(6);
          for (const value of row) expect(Number.isFinite(value)).toBe(true);
          const kg = row.slice(1);
          const naik = kg.every((v, i) => i === 0 || v >= kg[i - 1]);
          expect(naik, `${name}/${sex} kelas ${row[0]}: ${kg.join(',')}`).toBe(true);
        }
      }
    }
  });

  it('kelas berat badan berurutan dari ringan ke berat', () => {
    for (const lift of Object.values(standards)) {
      for (const rows of Object.values(lift)) {
        const bw = rows.map((r) => r[0]);
        expect(bw).toEqual([...bw].sort((a, b) => a - b));
      }
    }
  });

  it('cocok dengan angka yang tertulis di tabel ExRx', () => {
    // Squat pria kelas 75 kg dan bench wanita kelas 60 kg, disalin dari sumber.
    expect(standards.squat.pria.find((r) => r[0] === 75)).toEqual([75, 50, 92.5, 112.5, 155, 202.5]);
    expect(standards.bench.wanita.find((r) => r[0] === 60)).toEqual([60, 32.5, 40, 42.5, 57.5, 67.5]);
    expect(standards.deadlift.pria.find((r) => r[0] === 82)).toEqual([82, 67.5, 125, 142.5, 200, 250]);
  });
});

describe('thresholds', () => {
  it('memilih kelas yang menampung berat badan, bukan yang terdekat', () => {
    // 76 kg masuk kelas 82, bukan kelas 75, karena kelas adalah batas atas.
    expect(thresholds('Back squat', 'laki-laki', 76).map((t) => t.kg)).toEqual([
      55, 100, 122.5, 167.5, 217.5
    ]);
    expect(thresholds('Back squat', 'laki-laki', 75).map((t) => t.kg)).toEqual([
      50, 92.5, 112.5, 155, 202.5
    ]);
  });

  it('berat badan di atas kelas terberat memakai baris terakhir', () => {
    const rows = standards.squat.pria;
    expect(thresholds('Back squat', 'laki-laki', 200).map((t) => t.kg)).toEqual(rows.at(-1).slice(1));
  });

  it('memakai tabel perempuan hanya untuk sex "perempuan"', () => {
    const wanita = thresholds('Deadlift', 'perempuan', 60).map((t) => t.kg);
    const pria = thresholds('Deadlift', 'laki-laki', 60).map((t) => t.kg);
    expect(wanita).toEqual([35, 62.5, 72.5, 100, 125]);
    // Nilai sex yang tidak dikenal jatuh ke tabel pria, sama seperti default profil.
    expect(thresholds('Deadlift', undefined, 60).map((t) => t.kg)).toEqual(pria);
  });

  it('mengembalikan null untuk gerakan tanpa pembanding', () => {
    expect(thresholds('Front squat', 'laki-laki', 75)).toBeNull();
    expect(thresholds('Leg press', 'laki-laki', 75)).toBeNull();
  });

  it('mengembalikan null kalau berat badan belum diisi', () => {
    expect(thresholds('Back squat', 'laki-laki', null)).toBeNull();
    expect(thresholds('Back squat', 'laki-laki', 0)).toBeNull();
    expect(thresholds('Back squat', 'laki-laki', '')).toBeNull();
  });

  it('hanya memetakan gerakan yang benar-benar sama dengan lift di tabel', () => {
    expect(liftOf['Back squat']).toBe('squat');
    expect(liftOf['Front squat']).toBeUndefined();
    expect(liftOf['Incline dumbbell press']).toBeUndefined();
  });
});

describe('levelFor', () => {
  it('menyebut level tertinggi yang sudah dilewati', () => {
    // Squat pria 75 kg: menengah 112.5, mahir 155.
    expect(levelFor('Back squat', 'laki-laki', 75, 140).level.id).toBe('menengah');
    expect(levelFor('Back squat', 'laki-laki', 75, 112.5).level.id).toBe('menengah');
    expect(levelFor('Back squat', 'laki-laki', 75, 112.4).level.id).toBe('pemula');
  });

  it('menghitung sisa kilogram ke level berikutnya', () => {
    const r = levelFor('Back squat', 'laki-laki', 75, 140);
    expect(r.next.id).toBe('mahir');
    expect(r.toNext).toBe(15);
    expect(r.percent).toBe(65); // (140-112.5) / (155-112.5)
  });

  it('di bawah ambang terbawah, level kosong tapi kemajuan tetap terhitung', () => {
    const r = levelFor('Back squat', 'laki-laki', 75, 25); // ambang terbawah 50
    expect(r.level).toBeNull();
    expect(r.next.id).toBe('belum');
    expect(r.percent).toBe(50);
  });

  it('di level elit tidak ada target berikutnya', () => {
    const r = levelFor('Back squat', 'laki-laki', 75, 250);
    expect(r.level.id).toBe('elit');
    expect(r.next).toBeNull();
    expect(r.toNext).toBe(0);
    expect(r.percent).toBe(100);
  });

  it('mengembalikan null tanpa beban yang masuk akal', () => {
    expect(levelFor('Back squat', 'laki-laki', 75, null)).toBeNull();
    expect(levelFor('Back squat', 'laki-laki', 75, 0)).toBeNull();
    expect(levelFor('Back squat', 'laki-laki', 75, undefined)).toBeNull();
    expect(levelFor('Front squat', 'laki-laki', 75, 140)).toBeNull();
  });
});
