import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { writable } from 'svelte/store';

/**
 * Tes pintasan Kardio dan Tips di halaman Hari ini.
 *
 * Sejak bilah nav dipangkas jadi lima tab, dua kartu ini adalah satu-satunya
 * pintu masuk ke halaman Kardio dan Tips. Kalau keduanya hilang dari sini, dua
 * fitur itu jadi tidak bisa dijangkau sama sekali — dan itu tidak akan
 * ketahuan dari tes halaman Kardio maupun halaman Tips, karena keduanya tetap
 * lolos saat dirender langsung.
 */

vi.mock('$app/environment', () => ({ browser: true, dev: false, building: false, version: 'test' }));

const goto = vi.fn(async () => {});
vi.mock('$app/navigation', () => ({ goto }));

const profile = writable({ activeProgram: null, weight: 70 });
const todayLog = writable(null);
const dayKey = writable('2026-09-02');
const yearLogs = writable([]);
const syncing = writable(false);
const streak = writable(0);
const programMap = writable(new Map());

vi.mock('$lib/stores/data', () => ({
  profile,
  todayLog,
  dayKey,
  yearLogs,
  syncing,
  streak,
  addSet: vi.fn(),
  completeRestDay: vi.fn(),
  ensureLog: vi.fn(async () => null),
  logSet: vi.fn(),
  removeSet: vi.fn(),
  resetToday: vi.fn(),
  saveNote: vi.fn(),
  toggleTask: vi.fn(),
  setWater: vi.fn(),
  swapExercise: vi.fn()
}));
vi.mock('$lib/stores/programs', () => ({ programMap }));
vi.mock('$lib/stores/auth', () => ({ user: writable({ uid: 'u1' }) }));

let watchPosition;

beforeEach(() => {
  goto.mockClear();
  watchPosition = vi.fn(() => 1);
  vi.stubGlobal('navigator', { geolocation: { watchPosition, clearWatch: vi.fn() } });
  profile.set({ activeProgram: null, weight: 70 });
});

afterEach(async () => {
  const { discardActivity } = await import('$lib/stores/tracker');
  discardActivity();
  vi.unstubAllGlobals();
});

async function beranda() {
  const { default: Page } = await import('../../src/routes/+page.svelte');
  return render(Page);
}

describe('kartu Kardio', () => {
  it('menawarkan mulai lari dan sepeda langsung dari beranda', async () => {
    await beranda();
    expect(screen.getByRole('button', { name: /Mulai lari/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mulai sepeda/ })).toBeInTheDocument();
  });

  it('tetap muncul walau belum ada program yang dipilih', async () => {
    profile.set({ activeProgram: null });
    await beranda();
    expect(screen.getByRole('heading', { name: 'Kardio' })).toBeInTheDocument();
  });

  it('menyediakan jalan ke riwayat sesi', async () => {
    await beranda();
    expect(screen.getByRole('link', { name: 'Riwayat sesi' })).toHaveAttribute('href', '/aktivitas');
  });

  it('mulai lari langsung merekam lalu pindah ke halaman Kardio', async () => {
    await beranda();
    await userEvent.click(screen.getByRole('button', { name: /Mulai lari/ }));

    const { activity } = await import('$lib/stores/tracker');
    const { get } = await import('svelte/store');
    expect(get(activity)).toMatchObject({ type: 'lari', status: 'jalan' });
    expect(watchPosition).toHaveBeenCalled();
    expect(goto).toHaveBeenCalledWith('/aktivitas');
  });

  it('sesi yang sedang berjalan menggantikan tombol mulai', async () => {
    const { startActivity } = await import('$lib/stores/tracker');
    await startActivity('sepeda');
    await beranda();

    expect(screen.queryByRole('button', { name: /Mulai lari/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Sepeda sedang berjalan/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buka' })).toHaveAttribute('href', '/aktivitas');
  });
});

describe('kartu Tips hari ini', () => {
  it('menampilkan satu tips yang menautkan ke daftar lengkap', async () => {
    await beranda();
    expect(screen.getByText('Tips hari ini')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tips hari ini/ })).toHaveAttribute('href', '/tips');
  });

  it('tipsnya berganti saat tanggalnya berganti', async () => {
    const { container: a } = await beranda();
    const judulAwal = a.querySelector('a[href="/tips"] h3').textContent;

    dayKey.set('2026-09-07');
    const { container: b } = await beranda();
    expect(b.querySelector('a[href="/tips"] h3').textContent).not.toBe(judulAwal);
  });
});
