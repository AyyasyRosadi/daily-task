import { describe, expect, it } from 'vitest';
import { tipCategories, tips } from '$lib/data/tips.js';
import { programLevels, programPlaces, programs } from '$lib/data/programs.js';
import { dailyTips, scoreTip, seedFromKey, shuffleWithSeed, tipOfDay } from '$lib/utils/tips';

/**
 * Tes tips harian.
 *
 * Yang paling penting dikunci di sini bukan isi tipsnya, melainkan dua sifat
 * urutannya: tetap sepanjang satu hari, dan berbeda antar hari. Dua-duanya
 * mustahil diperiksa dengan mata di layar.
 */

const ppl = programs.find((p) => p.id === 'push-pull-legs');
const rumah = programs.find((p) => p.id === 'home-bodyweight');
const pemula = programs.find((p) => p.id === 'full-body-start');

describe('daftar tips', () => {
  it('berisi lebih dari 50 tips', () => {
    expect(tips.length).toBeGreaterThanOrEqual(50);
  });

  it('tiap kategori terisi cukup banyak', () => {
    for (const c of tipCategories.filter((x) => x !== 'Semua')) {
      expect(tips.filter((t) => t.category === c).length, c).toBeGreaterThanOrEqual(10);
    }
  });

  it('semua kategori yang dipakai ada di daftar kategori', () => {
    for (const t of tips) {
      expect(tipCategories, t.title).toContain(t.category);
    }
  });

  it('tiap tips punya judul dan isi', () => {
    for (const t of tips) {
      expect(t.title?.length, JSON.stringify(t)).toBeGreaterThan(0);
      expect(t.body?.length, t.title).toBeGreaterThan(20);
    }
  });

  it('judulnya tidak ada yang kembar', () => {
    const judul = tips.map((t) => t.title);
    expect(new Set(judul).size).toBe(judul.length);
  });

  it('penanda program menunjuk program yang benar-benar ada', () => {
    const ids = new Set(programs.map((p) => p.id));
    for (const t of tips) {
      for (const id of t.programs ?? []) expect(ids, t.title).toContain(id);
    }
  });

  it('penanda tingkat dan tempat memakai nilai yang dipakai program', () => {
    // Dibandingkan dengan daftar resmi, bukan dengan nilai yang kebetulan
    // dipakai program bawaan: 'Lanjutan' sah walau belum ada program bawaannya.
    const levels = new Set(programLevels);
    const places = new Set(programPlaces);
    for (const t of tips) {
      for (const l of t.levels ?? []) expect(levels, t.title).toContain(l);
      for (const p of t.places ?? []) expect(places, t.title).toContain(p);
    }
  });

  it('tiap program bawaan punya tips yang menyebutnya', () => {
    for (const p of programs) {
      const cocok = tips.filter((t) => t.programs?.includes(p.id));
      expect(cocok.length, p.id).toBeGreaterThan(0);
    }
  });
});

describe('shuffleWithSeed', () => {
  const list = Array.from({ length: 20 }, (_, i) => i);

  it('benih sama menghasilkan urutan sama', () => {
    expect(shuffleWithSeed(list, 42)).toEqual(shuffleWithSeed(list, 42));
  });

  it('benih berbeda menghasilkan urutan berbeda', () => {
    expect(shuffleWithSeed(list, 42)).not.toEqual(shuffleWithSeed(list, 43));
  });

  it('tidak menghilangkan atau menggandakan isi', () => {
    const hasil = shuffleWithSeed(list, 7);
    expect(hasil).toHaveLength(list.length);
    expect([...hasil].sort((a, b) => a - b)).toEqual(list);
  });

  it('tidak mengubah daftar aslinya', () => {
    const asli = [...list];
    shuffleWithSeed(list, 7);
    expect(list).toEqual(asli);
  });

  it('daftar kosong tidak melempar', () => {
    expect(shuffleWithSeed([], 1)).toEqual([]);
    expect(shuffleWithSeed(null, 1)).toEqual([]);
  });
});

describe('seedFromKey', () => {
  it('kunci tanggal jadi angka', () => {
    expect(seedFromKey('2026-09-02')).toBe(20260902);
  });

  it('tanggal berbeda menghasilkan benih berbeda', () => {
    expect(seedFromKey('2026-09-02')).not.toBe(seedFromKey('2026-09-03'));
  });

  it('kunci kosong tetap menghasilkan benih yang sah', () => {
    expect(seedFromKey(null)).toBe(1);
    expect(seedFromKey('')).toBe(1);
  });
});

describe('scoreTip', () => {
  it('nol kalau belum ada program dipilih', () => {
    expect(scoreTip({ programs: ['push-pull-legs'] }, null)).toBe(0);
  });

  it('menyebut program itu langsung memberi skor tertinggi', () => {
    expect(scoreTip({ programs: ['push-pull-legs'] }, ppl)).toBe(4);
  });

  it('tingkat dan tempat memberi skor lebih kecil', () => {
    expect(scoreTip({ levels: ['Menengah'] }, ppl)).toBe(2);
    expect(scoreTip({ places: ['Rumah'] }, rumah)).toBe(1);
  });

  it('penanda jadwal padat hanya berlaku untuk program padat', () => {
    expect(scoreTip({ minDays: 5 }, ppl)).toBe(1); // 6 hari
    expect(scoreTip({ minDays: 5 }, pemula)).toBe(0); // 3 hari
  });

  it('tips tanpa penanda apa pun berskor nol', () => {
    expect(scoreTip({ title: 'Umum' }, ppl)).toBe(0);
  });

  it('program buatan sendiri tetap dapat skor lewat tingkat dan tempat', () => {
    const sendiri = { id: 'program-saya', level: 'Menengah', place: 'Rumah', daysPerWeek: 4 };
    expect(scoreTip({ levels: ['Menengah'], places: ['Rumah'] }, sendiri)).toBe(3);
  });
});

describe('dailyTips', () => {
  it('urutannya tetap sepanjang hari yang sama', () => {
    const a = dailyTips(tips, { dateKey: '2026-09-02', program: ppl });
    const b = dailyTips(tips, { dateKey: '2026-09-02', program: ppl });
    expect(a.map((t) => t.title)).toEqual(b.map((t) => t.title));
  });

  it('urutannya berubah di hari berikutnya', () => {
    const a = dailyTips(tips, { dateKey: '2026-09-02' });
    const b = dailyTips(tips, { dateKey: '2026-09-03' });
    expect(a.map((t) => t.title)).not.toEqual(b.map((t) => t.title));
  });

  it('tidak menghilangkan satu tips pun', () => {
    expect(dailyTips(tips, { dateKey: '2026-09-02', program: ppl })).toHaveLength(tips.length);
  });

  it('tips yang nyambung dengan program naik ke atas', () => {
    const urut = dailyTips(tips, { dateKey: '2026-09-02', program: ppl });
    const relevan = urut.filter((t) => t.tier > 0);
    const posisiTerakhirRelevan = urut.findLastIndex((t) => t.tier > 0);
    expect(relevan.length).toBeGreaterThan(0);
    // Semua yang relevan berada sebelum yang umum, tanpa selang-seling.
    expect(posisiTerakhirRelevan).toBe(relevan.length - 1);
  });

  it('tanpa program, tidak ada yang dianggap lebih relevan', () => {
    const urut = dailyTips(tips, { dateKey: '2026-09-02' });
    expect(urut.every((t) => t.tier === 0)).toBe(true);
  });

  it('program berbeda memunculkan tips teratas yang berbeda', () => {
    const a = dailyTips(tips, { dateKey: '2026-09-02', program: ppl }).slice(0, 6);
    const b = dailyTips(tips, { dateKey: '2026-09-02', program: rumah }).slice(0, 6);
    expect(a.map((t) => t.title)).not.toEqual(b.map((t) => t.title));
  });

  it('menyaring per kategori', () => {
    const urut = dailyTips(tips, { dateKey: '2026-09-02', category: 'Nutrisi' });
    expect(urut.every((t) => t.category === 'Nutrisi')).toBe(true);
    expect(urut.length).toBe(tips.filter((t) => t.category === 'Nutrisi').length);
  });

  it('kategori "Semua" tidak menyaring apa pun', () => {
    expect(dailyTips(tips, { dateKey: '2026-09-02', category: 'Semua' })).toHaveLength(tips.length);
  });

  it('daftar kosong tidak melempar', () => {
    expect(dailyTips([], { dateKey: '2026-09-02' })).toEqual([]);
    expect(dailyTips(null, { dateKey: '2026-09-02' })).toEqual([]);
  });
});

describe('tipOfDay', () => {
  it('mengambil yang teratas hari itu', () => {
    const options = { dateKey: '2026-09-02', program: ppl };
    expect(tipOfDay(tips, options).title).toBe(dailyTips(tips, options)[0].title);
  });

  it('berganti dari hari ke hari walau programnya sama', () => {
    const judul = ['2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06'].map(
      (dateKey) => tipOfDay(tips, { dateKey, program: ppl }).title
    );
    // Tidak harus semuanya berbeda, tapi tidak boleh macet di satu tips saja.
    expect(new Set(judul).size).toBeGreaterThan(1);
  });

  it('tips hari ini selalu yang relevan kalau program dipilih', () => {
    for (const dateKey of ['2026-09-02', '2026-11-20', '2027-01-15']) {
      expect(tipOfDay(tips, { dateKey, program: ppl }).tier, dateKey).toBeGreaterThan(0);
    }
  });

  it('daftar kosong mengembalikan null', () => {
    expect(tipOfDay([], { dateKey: '2026-09-02' })).toBeNull();
  });
});
