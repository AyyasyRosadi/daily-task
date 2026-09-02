import { describe, expect, it } from 'vitest';
import {
  acceptPoint,
  compactPoints,
  currentSpeed,
  distanceLabel,
  durationLabel,
  haversine,
  paceLabel,
  paceSeconds,
  routePath,
  simplify,
  speedLabel,
  trackDistance
} from '$lib/utils/geo';

/**
 * Tes perhitungan sesi lari/sepeda.
 *
 * Semua koordinat di sini sekitar Jakarta (lintang -6), jadi angka meter yang
 * diharapkan sudah memperhitungkan penyempitan derajat bujur di lintang itu.
 * Satu derajat lintang selalu sekitar 111,2 km di mana pun.
 */

/** Titik di garis lintang yang sama, digeser ke utara sejauh `deltaLat` derajat. */
function titik(t, lat, lng, acc = 5) {
  return { t, lat, lng, acc };
}

describe('haversine', () => {
  it('0.01 derajat lintang kira-kira 1112 meter', () => {
    const d = haversine({ lat: -6.2, lng: 106.8 }, { lat: -6.19, lng: 106.8 });
    expect(d).toBeGreaterThan(1110);
    expect(d).toBeLessThan(1114);
  });

  it('derajat bujur lebih pendek daripada derajat lintang', () => {
    const utara = haversine({ lat: -6.2, lng: 106.8 }, { lat: -6.19, lng: 106.8 });
    const timur = haversine({ lat: -6.2, lng: 106.8 }, { lat: -6.2, lng: 106.81 });
    expect(timur).toBeLessThan(utara);
  });

  it('titik yang sama berjarak nol', () => {
    expect(haversine({ lat: -6.2, lng: 106.8 }, { lat: -6.2, lng: 106.8 })).toBe(0);
  });

  it('titik kosong tidak melempar', () => {
    expect(haversine(null, { lat: 0, lng: 0 })).toBe(0);
    expect(haversine({ lat: 0, lng: 0 }, undefined)).toBe(0);
  });
});

describe('acceptPoint', () => {
  const awal = titik(0, -6.2, 106.8);

  it('titik pertama selalu diterima kalau akurasinya wajar', () => {
    expect(acceptPoint(null, awal, 'lari')).toBe(true);
  });

  it('menolak titik berakurasi buruk', () => {
    expect(acceptPoint(null, titik(0, -6.2, 106.8, 120), 'lari')).toBe(false);
    // Sepeda mentoleransi akurasi sedikit lebih longgar daripada lari.
    expect(acceptPoint(null, titik(0, -6.2, 106.8, 45), 'lari')).toBe(false);
    expect(acceptPoint(null, titik(0, -6.2, 106.8, 45), 'sepeda')).toBe(true);
  });

  it('menolak lompatan yang menyiratkan kecepatan mustahil', () => {
    // ~111 m dalam 1 detik = 111 m/s. Bukan manusia.
    const lompat = titik(1, -6.199, 106.8);
    expect(acceptPoint(awal, lompat, 'lari')).toBe(false);
  });

  it('menerima kecepatan lari yang wajar', () => {
    // ~22 m dalam 5 detik = 4.4 m/s, sekitar pace 3:47/km.
    expect(acceptPoint(awal, titik(5, -6.1998, 106.8), 'lari')).toBe(true);
  });

  it('batas kecepatan sepeda lebih longgar daripada lari', () => {
    // ~111 m dalam 5 detik = 22 m/s = 80 km/j: di atas batas lari, masih di
    // bawah batas sepeda.
    expect(acceptPoint(awal, titik(5, -6.199, 106.8), 'lari')).toBe(false);
    expect(acceptPoint(awal, titik(5, -6.199, 106.8), 'sepeda')).toBe(true);
    // ~111 m dalam 3 detik = 37 m/s = 133 km/j: mustahil untuk dua-duanya.
    expect(acceptPoint(awal, titik(3, -6.199, 106.8), 'sepeda')).toBe(false);
  });

  it('menolak gerak kecil di bawah ketidakpastian alat', () => {
    // Berdiri di lampu merah: titik bergoyang 2 meter.
    const goyang = titik(3, -6.19998, 106.8, 10);
    expect(haversine(awal, goyang)).toBeLessThan(5);
    expect(acceptPoint(awal, goyang, 'lari')).toBe(false);
  });

  it('menolak titik tanpa koordinat yang sah', () => {
    expect(acceptPoint(null, { t: 0, lat: NaN, lng: 106.8 }, 'lari')).toBe(false);
    expect(acceptPoint(null, null, 'lari')).toBe(false);
  });

  it('menolak titik yang tidak maju waktunya', () => {
    expect(acceptPoint(titik(10, -6.2, 106.8), titik(10, -6.1998, 106.8), 'lari')).toBe(false);
  });

  it('jenis yang tidak dikenal diperlakukan sebagai lari', () => {
    expect(acceptPoint(awal, titik(5, -6.199, 106.8), 'entah')).toBe(false);
  });
});

describe('trackDistance dan currentSpeed', () => {
  const jalur = [
    titik(0, -6.2, 106.8),
    titik(10, -6.1995, 106.8),
    titik(20, -6.199, 106.8),
    titik(30, -6.1985, 106.8)
  ];

  it('menjumlahkan jarak antar titik berurutan', () => {
    // Tiga ruas @ 0.0005 derajat lintang, masing-masing ~55.6 m.
    expect(trackDistance(jalur)).toBeCloseTo(166.8, 0);
  });

  it('jalur kurang dari dua titik berjarak nol', () => {
    expect(trackDistance([jalur[0]])).toBe(0);
    expect(trackDistance([])).toBe(0);
    expect(trackDistance(null)).toBe(0);
  });

  it('kecepatan sesaat dihitung dari jendela titik terakhir', () => {
    // 166.8 m dalam 30 detik = 5.56 m/s.
    expect(currentSpeed(jalur)).toBeCloseTo(5.56, 1);
  });

  it('kecepatan nol saat titik belum cukup', () => {
    expect(currentSpeed([jalur[0]])).toBe(0);
    expect(currentSpeed([])).toBe(0);
  });
});

describe('label', () => {
  it('pace lari sebagai menit per kilometer', () => {
    expect(paceLabel(5000, 1500)).toBe('5:00 /km');
    expect(paceLabel(1000, 335)).toBe('5:35 /km');
  });

  it('pace tanpa jarak jadi tanda hubung', () => {
    expect(paceLabel(0, 600)).toBe('—');
    expect(paceLabel(5000, 0)).toBe('—');
  });

  it('paceSeconds mengembalikan detik per kilometer', () => {
    expect(paceSeconds(2000, 600)).toBe(300);
    expect(paceSeconds(0, 600)).toBe(0);
  });

  it('kecepatan sepeda sebagai kilometer per jam', () => {
    expect(speedLabel(24000, 3600)).toBe('24.0 km/j');
    expect(speedLabel(0, 0)).toBe('—');
  });

  it('jarak pendek tetap meter, jarak panjang jadi kilometer', () => {
    expect(distanceLabel(850)).toBe('850 m');
    expect(distanceLabel(1000)).toBe('1.00 km');
    expect(distanceLabel(5230)).toBe('5.23 km');
    expect(distanceLabel(0)).toBe('0 m');
  });

  it('durasi memakai jam hanya kalau perlu', () => {
    expect(durationLabel(59)).toBe('0:59');
    expect(durationLabel(1449)).toBe('24:09');
    expect(durationLabel(3849)).toBe('1:04:09');
    expect(durationLabel(-5)).toBe('0:00');
  });
});

describe('simplify', () => {
  it('garis lurus disederhanakan jadi dua ujungnya saja', () => {
    const lurus = Array.from({ length: 20 }, (_, i) => titik(i, -6.2 + i * 0.0002, 106.8));
    expect(simplify(lurus, 8)).toHaveLength(2);
  });

  it('belokan tajam dipertahankan', () => {
    const siku = [
      titik(0, -6.2, 106.8),
      titik(10, -6.199, 106.8),
      titik(20, -6.199, 106.801)
    ];
    expect(simplify(siku, 8)).toHaveLength(3);
  });

  it('jalur sangat pendek dikembalikan apa adanya', () => {
    const dua = [titik(0, -6.2, 106.8), titik(5, -6.1999, 106.8)];
    expect(simplify(dua, 8)).toHaveLength(2);
    expect(simplify([], 8)).toEqual([]);
  });

  it('memangkas jauh lebih banyak titik daripada yang dibuang toleransi kecil', () => {
    // Rute berkelok halus, mirip jalan sungguhan.
    const kelok = Array.from({ length: 400 }, (_, i) =>
      titik(i, -6.2 + i * 0.00005, 106.8 + Math.sin(i / 20) * 0.0002)
    );
    const kasar = simplify(kelok, 8);
    const halus = simplify(kelok, 1);
    expect(kasar.length).toBeLessThan(halus.length);
    expect(kasar.length).toBeLessThan(kelok.length / 4);
  });

  it('tidak mengubah titik awal dan akhir', () => {
    const kelok = Array.from({ length: 100 }, (_, i) =>
      titik(i, -6.2 + i * 0.0001, 106.8 + Math.sin(i / 10) * 0.0003)
    );
    const hasil = simplify(kelok, 8);
    expect(hasil[0]).toEqual(kelok[0]);
    expect(hasil.at(-1)).toEqual(kelok.at(-1));
  });
});

describe('compactPoints', () => {
  const kelok = Array.from({ length: 200 }, (_, i) =>
    titik(i + 0.4, -6.2 + i * 0.00005, 106.8 + Math.sin(i / 15) * 0.0002)
  );

  it('membulatkan waktu dan memangkas koordinat ke lima desimal', () => {
    const [first] = compactPoints(kelok, 8);
    expect(Number.isInteger(first.t)).toBe(true);
    expect(String(first.lat).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(5);
    expect(String(first.lng).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(5);
  });

  it('membuang akurasi yang tidak dipakai lagi setelah tersimpan', () => {
    expect(compactPoints(kelok, 8)[0]).not.toHaveProperty('acc');
  });

  it('hasilnya jauh di bawah batas 3000 titik di aturan Firestore', () => {
    const sejam = Array.from({ length: 3600 }, (_, i) =>
      titik(i, -6.2 + i * 0.00002, 106.8 + Math.sin(i / 60) * 0.0003)
    );
    expect(compactPoints(sejam, 8).length).toBeLessThan(3000);
  });

  it('jalur kosong tetap jalur kosong', () => {
    expect(compactPoints([], 8)).toEqual([]);
  });
});

describe('routePath', () => {
  it('mengembalikan null kalau titiknya kurang dari dua', () => {
    expect(routePath([], 100)).toBeNull();
    expect(routePath([titik(0, -6.2, 106.8)], 100)).toBeNull();
  });

  it('menghasilkan path yang mulai dengan M lalu L', () => {
    const r = routePath([titik(0, -6.2, 106.8), titik(10, -6.199, 106.801)], 100);
    expect(r.d).toMatch(/^M[\d.]+ [\d.]+ L/);
  });

  it('seluruh koordinat berada di dalam kotak', () => {
    const kelok = Array.from({ length: 50 }, (_, i) =>
      titik(i, -6.2 + i * 0.0002, 106.8 + Math.sin(i / 5) * 0.0004)
    );
    const angka = routePath(kelok, 100, 6)
      .d.replace(/[ML]/g, ' ')
      .trim()
      .split(/\s+/)
      .map(Number);
    for (const n of angka) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(100);
    }
  });

  it('membalik sumbu y: lintang lebih besar berarti lebih ke atas', () => {
    const r = routePath([titik(0, -6.2, 106.8), titik(10, -6.19, 106.8)], 100);
    expect(r.end.y).toBeLessThan(r.start.y);
  });

  it('rute yang praktis satu titik tidak menghasilkan NaN', () => {
    const diam = [titik(0, -6.2, 106.8), titik(10, -6.2, 106.8)];
    const r = routePath(diam, 100);
    expect(r.d).not.toMatch(/NaN/);
    expect(r.start.x).toBe(50);
    expect(r.start.y).toBe(50);
  });

  it('mengabaikan titik yang koordinatnya rusak', () => {
    const r = routePath(
      [titik(0, -6.2, 106.8), { t: 5, lat: null, lng: 106.8 }, titik(10, -6.199, 106.8)],
      100
    );
    expect(r.d.match(/[ML]/g)).toHaveLength(2);
  });
});
