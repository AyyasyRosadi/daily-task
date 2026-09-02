import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

/**
 * Tes store pelacak sesi lari/sepeda.
 *
 * Dua hal yang diuji di sini, dan dua-duanya tidak akan pernah ketahuan lewat
 * tes logika murni:
 *
 * - Akuntansi waktu. Waktu aktif dihitung dari stempel waktu, jadi yang harus
 *   dibuktikan adalah jeda benar-benar tidak ikut terhitung — termasuk kalau
 *   sesinya dijeda dan dilanjutkan berkali-kali.
 * - Titik GPS yang masuk lewat callback `watchPosition`, termasuk yang ditolak
 *   penyaring dan izin lokasi yang ditolak pengguna.
 *
 * Berjalan di jsdom karena store-nya menyentuh `document` dan `navigator`.
 */

vi.mock('$app/environment', () => ({ browser: true, dev: false, building: false, version: 'test' }));

let watcher = null;
let errorHandler = null;
let clearWatch;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-02T06:00:00'));

  clearWatch = vi.fn();
  watcher = null;
  errorHandler = null;

  vi.stubGlobal('navigator', {
    geolocation: {
      watchPosition: vi.fn((onOk, onErr) => {
        watcher = onOk;
        errorHandler = onErr;
        return 1;
      }),
      clearWatch
    }
    // `wakeLock` sengaja tidak ada: itulah keadaan di browser yang belum
    // mendukungnya, dan store-nya harus tetap jalan.
  });
});

afterEach(async () => {
  const { discardActivity } = await import('$lib/stores/tracker');
  discardActivity();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Kirim satu pembacaan GPS ke store. */
function kirim(lat, lng, acc = 5) {
  watcher?.({ coords: { latitude: lat, longitude: lng, accuracy: acc } });
}

describe('tracker — kendali sesi', () => {
  it('sesi dimulai dalam status jalan', async () => {
    const { activity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    expect(get(activity)).toMatchObject({ type: 'lari', status: 'jalan', distance: 0 });
  });

  it('jenis yang tidak dikenal jatuh ke lari', async () => {
    const { activity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('terbang');
    expect(get(activity).type).toBe('lari');
  });

  it('memanggil start dua kali tidak menimpa sesi yang berjalan', async () => {
    const { activity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('sepeda');
    const pertama = get(activity).startedAt;
    vi.advanceTimersByTime(5000);
    await startActivity('lari');
    expect(get(activity)).toMatchObject({ type: 'sepeda', startedAt: pertama });
  });

  it('membuang sesi mengembalikan store ke keadaan kosong', async () => {
    const { activity, discardActivity, elapsed, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    vi.advanceTimersByTime(10_000);
    discardActivity();
    expect(get(activity)).toBeNull();
    expect(get(elapsed)).toBe(0);
    expect(clearWatch).toHaveBeenCalled();
  });
});

describe('tracker — akuntansi waktu', () => {
  it('waktu aktif berjalan mengikuti jam', async () => {
    const { elapsed, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    vi.advanceTimersByTime(65_000);
    expect(get(elapsed)).toBe(65);
  });

  it('waktu berhenti selama jeda', async () => {
    const { elapsed, pauseActivity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    vi.advanceTimersByTime(30_000);
    pauseActivity();
    vi.advanceTimersByTime(120_000);
    expect(get(elapsed)).toBe(30);
  });

  it('waktu lanjut dari tempat berhenti, bukan dari nol', async () => {
    const { elapsed, pauseActivity, resumeActivity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    vi.advanceTimersByTime(30_000);
    pauseActivity();
    vi.advanceTimersByTime(120_000);
    await resumeActivity();
    vi.advanceTimersByTime(10_000);
    expect(get(elapsed)).toBe(40);
  });

  it('jeda berkali-kali tetap terakumulasi benar', async () => {
    const { elapsed, pauseActivity, resumeActivity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(20_000);
      pauseActivity();
      vi.advanceTimersByTime(60_000);
      await resumeActivity();
    }
    vi.advanceTimersByTime(20_000);
    expect(get(elapsed)).toBe(80);
  });

  it('jeda saat sudah terjeda tidak mengubah apa-apa', async () => {
    const { activity, pauseActivity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    vi.advanceTimersByTime(30_000);
    pauseActivity();
    const akumulasi = get(activity).accumulated;
    vi.advanceTimersByTime(60_000);
    pauseActivity();
    expect(get(activity).accumulated).toBe(akumulasi);
  });

  it('menghentikan langganan GPS selama jeda, lalu memasangnya lagi', async () => {
    const { pauseActivity, resumeActivity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    expect(navigator.geolocation.watchPosition).toHaveBeenCalledTimes(1);
    pauseActivity();
    expect(clearWatch).toHaveBeenCalledTimes(1);
    await resumeActivity();
    expect(navigator.geolocation.watchPosition).toHaveBeenCalledTimes(2);
  });

  it('stop mengembalikan durasi tanpa waktu jeda', async () => {
    const { pauseActivity, resumeActivity, startActivity, stopActivity } = await import('$lib/stores/tracker');
    await startActivity('sepeda');
    vi.advanceTimersByTime(45_000);
    pauseActivity();
    vi.advanceTimersByTime(300_000);
    await resumeActivity();
    vi.advanceTimersByTime(15_000);

    const hasil = stopActivity();
    expect(hasil).toMatchObject({ type: 'sepeda', seconds: 60, meters: 0 });
    expect(hasil.startedAt).toBe(new Date('2026-09-02T06:00:00').getTime());
  });

  it('stop tanpa sesi berjalan mengembalikan null', async () => {
    const { stopActivity } = await import('$lib/stores/tracker');
    expect(stopActivity()).toBeNull();
  });
});

describe('tracker — titik GPS', () => {
  it('menambah jarak dari titik yang lolos penyaring', async () => {
    const { activity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');

    kirim(-6.2, 106.8);
    vi.advanceTimersByTime(10_000);
    kirim(-6.1995, 106.8); // ~55 m ke utara

    const s = get(activity);
    expect(s.raw).toHaveLength(2);
    expect(s.distance).toBeGreaterThan(50);
    expect(s.distance).toBeLessThan(60);
  });

  it('titik dengan akurasi buruk tidak menambah jarak tapi tetap memperbarui status sinyal', async () => {
    const { activity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');

    kirim(-6.2, 106.8, 200);
    const s = get(activity);
    expect(s.raw).toHaveLength(0);
    expect(s.distance).toBe(0);
    expect(s.gps).toBe(200);
  });

  it('lompatan GPS yang mustahil dibuang', async () => {
    const { activity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');

    kirim(-6.2, 106.8);
    vi.advanceTimersByTime(1000);
    kirim(-6.19, 106.8); // ~1.1 km dalam 1 detik

    expect(get(activity).raw).toHaveLength(1);
    expect(get(activity).distance).toBe(0);
  });

  it('titik yang datang selama jeda diabaikan', async () => {
    const { activity, pauseActivity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    kirim(-6.2, 106.8);
    pauseActivity();

    // Beberapa perangkat masih mengirim satu-dua posisi setelah clearWatch.
    vi.advanceTimersByTime(10_000);
    kirim(-6.1995, 106.8);

    expect(get(activity).raw).toHaveLength(1);
  });

  it('waktu titik dihitung dari waktu aktif, bukan jam dinding', async () => {
    const { activity, pauseActivity, resumeActivity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');
    kirim(-6.2, 106.8);

    vi.advanceTimersByTime(20_000);
    pauseActivity();
    vi.advanceTimersByTime(600_000); // istirahat sepuluh menit
    await resumeActivity();
    vi.advanceTimersByTime(10_000);
    kirim(-6.1995, 106.8);

    const [, kedua] = get(activity).raw;
    expect(kedua.t).toBeCloseTo(30, 0);
  });

  it('izin lokasi ditolak memberi pesan yang menyebut jalan keluarnya', async () => {
    const { activity, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');

    errorHandler({ code: 1, PERMISSION_DENIED: 1 });
    const s = get(activity);
    expect(s.error).toMatch(/manual/i);
    expect(s.gps).toBeNull();
  });

  it('sinyal belum didapat tidak menghentikan sesi', async () => {
    const { activity, elapsed, startActivity } = await import('$lib/stores/tracker');
    await startActivity('lari');

    errorHandler({ code: 3, PERMISSION_DENIED: 1 });
    vi.advanceTimersByTime(20_000);
    expect(get(activity).status).toBe('jalan');
    expect(get(elapsed)).toBe(20);
  });
});
