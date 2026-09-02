import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';

/**
 * Tes render halaman Kardio.
 *
 * Firestore dipalsukan seluruhnya: yang diperiksa di sini adalah halamannya
 * benar-benar terpasang, tiga keadaannya (belum mulai / berjalan / selesai)
 * saling bergantian dengan benar, dan sesi yang disimpan membawa angka yang
 * sama dengan yang tampil di layar.
 */

vi.mock('$app/environment', () => ({ browser: true, dev: false, building: false, version: 'test' }));

const saveActivity = vi.fn(async () => ({ id: '2026-09-02-060000' }));
const deleteActivity = vi.fn(async () => {});

vi.mock('$lib/stores/data', async () => {
  const { writable } = await import('svelte/store');
  return { activities: writable([]), saveActivity, deleteActivity };
});

let watcher = null;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-02T06:00:00'));
  saveActivity.mockClear();
  watcher = null;
  vi.stubGlobal('navigator', {
    geolocation: {
      watchPosition: vi.fn((onOk) => {
        watcher = onOk;
        return 1;
      }),
      clearWatch: vi.fn()
    }
  });
});

afterEach(async () => {
  const { discardActivity } = await import('$lib/stores/tracker');
  discardActivity();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/**
 * userEvent memakai timer sungguhan untuk jeda antar ketukan, sementara tes ini
 * memalsukan waktu. Tanpa `advanceTimers`, setiap klik menggantung selamanya.
 */
const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });

async function halaman() {
  const { default: Page } = await import('../../src/routes/aktivitas/+page.svelte');
  return render(Page);
}

describe('halaman Kardio — sebelum mulai', () => {
  it('menawarkan lari dan sepeda', async () => {
    await halaman();
    expect(screen.getByRole('button', { name: /Lari/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sepeda/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mulai lari/ })).toBeInTheDocument();
  });

  it('memilih sepeda mengubah tombol mulainya', async () => {
    await halaman();
    await user().click(screen.getByRole('button', { name: /🚴 Sepeda/ }));
    expect(screen.getByRole('button', { name: /Mulai sepeda/ })).toBeInTheDocument();
  });

  it('menyebutkan bahwa jarak bisa diisi manual kalau izin ditolak', async () => {
    await halaman();
    expect(screen.getByText(/treadmill atau sepeda statis/)).toBeInTheDocument();
  });

  it('mengatakan belum ada sesi tercatat', async () => {
    await halaman();
    expect(screen.getByText(/Belum ada sesi tercatat/)).toBeInTheDocument();
  });
});

describe('halaman Kardio — sesi berjalan', () => {
  it('menampilkan durasi yang berjalan dan peringatan layar terkunci', async () => {
    await halaman();
    await user().click(screen.getByRole('button', { name: /Mulai lari/ }));

    vi.advanceTimersByTime(65_000);
    await vi.advanceTimersByTimeAsync(0);

    expect(screen.getByText('1:05')).toBeInTheDocument();
    expect(screen.getByText(/layar terkunci/)).toBeInTheDocument();
  });

  it('jeda dan lanjut bertukar tombol', async () => {
    await halaman();
    const u = user();
    await u.click(screen.getByRole('button', { name: /Mulai lari/ }));

    await u.click(screen.getByRole('button', { name: 'Jeda' }));
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: 'Lanjut' }));
    expect(screen.getByRole('button', { name: 'Jeda' })).toBeInTheDocument();
  });

  it('membatalkan sesi mengembalikan halaman ke keadaan awal', async () => {
    await halaman();
    const u = user();
    await u.click(screen.getByRole('button', { name: /Mulai lari/ }));
    await u.click(screen.getByRole('button', { name: 'Batalkan tanpa menyimpan' }));
    expect(screen.getByRole('button', { name: /Mulai lari/ })).toBeInTheDocument();
  });
});

describe('halaman Kardio — menyimpan', () => {
  it('sesi tanpa titik GPS meminta jarak diisi sendiri', async () => {
    await halaman();
    const u = user();
    await u.click(screen.getByRole('button', { name: /Mulai lari/ }));
    vi.advanceTimersByTime(600_000);
    await u.click(screen.getByRole('button', { name: 'Selesai' }));

    expect(screen.getByText(/Tidak ada titik GPS/)).toBeInTheDocument();
    const jarak = screen.getByLabelText(/Jarak \(km\)/);
    await u.type(jarak, '5.2');

    await u.click(screen.getByRole('button', { name: 'Simpan sesi' }));
    expect(saveActivity).toHaveBeenCalledTimes(1);
    expect(saveActivity.mock.calls[0][0]).toMatchObject({
      type: 'lari',
      seconds: 600,
      meters: 5200
    });
  });

  it('sesi dengan titik GPS memakai jarak hasil rekaman', async () => {
    await halaman();
    const u = user();
    await u.click(screen.getByRole('button', { name: /Mulai lari/ }));

    watcher({ coords: { latitude: -6.2, longitude: 106.8, accuracy: 5 } });
    vi.advanceTimersByTime(60_000);
    watcher({ coords: { latitude: -6.1995, longitude: 106.8, accuracy: 5 } });
    await vi.advanceTimersByTimeAsync(0);

    await u.click(screen.getByRole('button', { name: 'Selesai' }));
    // Ada rute, jadi tidak ada lagi kolom jarak manual.
    expect(screen.queryByLabelText(/Jarak \(km\)/)).not.toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: 'Simpan sesi' }));
    const payload = saveActivity.mock.calls[0][0];
    expect(payload.meters).toBeGreaterThan(50);
    expect(payload.meters).toBeLessThan(60);
    expect(payload.raw).toHaveLength(2);
  });

  it('membuang sesi selesai tidak menyimpan apa pun', async () => {
    await halaman();
    const u = user();
    await u.click(screen.getByRole('button', { name: /Mulai lari/ }));
    vi.advanceTimersByTime(30_000);
    await u.click(screen.getByRole('button', { name: 'Selesai' }));
    await u.click(screen.getByRole('button', { name: 'Buang' }));

    expect(saveActivity).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Mulai lari/ })).toBeInTheDocument();
  });

  it('kegagalan penyimpanan ditampilkan tanpa membuang sesinya', async () => {
    saveActivity.mockRejectedValueOnce(new Error('offline'));
    await halaman();
    const u = user();
    await u.click(screen.getByRole('button', { name: /Mulai lari/ }));
    vi.advanceTimersByTime(30_000);
    await u.click(screen.getByRole('button', { name: 'Selesai' }));
    await u.click(screen.getByRole('button', { name: 'Simpan sesi' }));

    expect(screen.getByText(/Gagal menyimpan/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simpan sesi' })).toBeInTheDocument();
  });
});

describe('halaman Kardio — riwayat', () => {
  it('menampilkan sesi tersimpan beserta totalnya', async () => {
    const { activities } = await import('$lib/stores/data');
    activities.set([
      {
        id: '2026-09-02-060000',
        date: '2026-09-02',
        type: 'lari',
        startedAt: new Date('2026-09-02T06:00:00').getTime(),
        seconds: 1800,
        meters: 5200,
        route: [],
        note: 'Keliling komplek'
      }
    ]);
    await halaman();

    expect(screen.getByText(/Lari · 5\.20 km/)).toBeInTheDocument();
    expect(screen.getByText(/2 Sep, 06:00 · 30:00 · 5:46 \/km/)).toBeInTheDocument();
    expect(screen.getByText('Keliling komplek')).toBeInTheDocument();
    activities.set([]);
  });

  it('hapus meminta konfirmasi lebih dulu', async () => {
    const { activities } = await import('$lib/stores/data');
    activities.set([
      {
        id: '2026-09-02-060000',
        date: '2026-09-02',
        type: 'sepeda',
        startedAt: new Date('2026-09-02T06:00:00').getTime(),
        seconds: 3600,
        meters: 24000,
        route: []
      }
    ]);
    await halaman();
    const u = user();

    await u.click(screen.getByRole('button', { name: /Hapus sesi/ }));
    expect(deleteActivity).not.toHaveBeenCalled();

    await u.click(screen.getByRole('button', { name: 'Hapus sesi ini' }));
    expect(deleteActivity).toHaveBeenCalledWith('2026-09-02-060000');
    activities.set([]);
  });
});
