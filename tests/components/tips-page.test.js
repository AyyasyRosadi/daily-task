import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { programs } from '$lib/data/programs.js';

/**
 * Tes render halaman Tips.
 *
 * Yang diperiksa: sorotan "tips hari ini" muncul, penyaring kategori bekerja,
 * dan tips yang berhubungan dengan program terpilih benar-benar naik ke atas —
 * bukan sekadar diberi label.
 */

const profile = writable(null);
const dayKey = writable('2026-09-02');
const programMap = writable(new Map(programs.map((p) => [p.id, p])));

vi.mock('$lib/stores/data', () => ({ profile, dayKey }));
vi.mock('$lib/stores/programs', () => ({ programMap }));

const { default: Page } = await import('../../src/routes/tips/+page.svelte');

beforeEach(() => {
  profile.set({ activeProgram: null });
  dayKey.set('2026-09-02');
});

describe('halaman Tips — tanpa program', () => {
  it('menyorot satu tips hari ini', () => {
    render(Page);
    expect(screen.getByText('Tips hari ini')).toBeInTheDocument();
  });

  it('mengajak memilih program supaya tipsnya terarah', () => {
    render(Page);
    expect(screen.getByText(/Pilih program di halaman Program/)).toBeInTheDocument();
  });

  it('tidak menandai satu tips pun sebagai sesuai program', () => {
    render(Page);
    expect(screen.queryByText('Sesuai programmu')).not.toBeInTheDocument();
  });

  it('menyebutkan jumlah tips yang tersedia', () => {
    render(Page);
    expect(screen.getByText(/tips, urutannya diacak ulang tiap hari/)).toBeInTheDocument();
  });
});

describe('halaman Tips — dengan program', () => {
  beforeEach(() => profile.set({ activeProgram: 'push-pull-legs' }));

  it('menyebut nama program di keterangan atas', () => {
    render(Page);
    // Namanya muncul di keterangan atas dan di catatan kartu sorotan.
    expect(screen.getAllByText(/Push Pull Legs/).length).toBeGreaterThan(0);
  });

  it('menandai tips yang sesuai program', () => {
    render(Page);
    expect(screen.getAllByText('Sesuai programmu').length).toBeGreaterThan(0);
  });

  it('tips yang sesuai program muncul sebelum tips umum', () => {
    const { container } = render(Page);
    const artikel = [...container.querySelectorAll('article')];
    // Artikel pertama adalah kartu sorotan; sisanya daftar biasa.
    const daftar = artikel.slice(1);
    const bertanda = daftar.map((a) => a.textContent.includes('Sesuai programmu'));
    const terakhirBertanda = bertanda.lastIndexOf(true);
    const jumlahBertanda = bertanda.filter(Boolean).length;
    expect(jumlahBertanda).toBeGreaterThan(0);
    expect(terakhirBertanda).toBe(jumlahBertanda - 1);
  });

  it('program di rumah memunculkan tips teratas yang berbeda', async () => {
    const { container: a } = render(Page);
    const judulPpl = a.querySelector('article h2').textContent;

    profile.set({ activeProgram: 'home-bodyweight' });
    const { container: b } = render(Page);
    const judulRumah = b.querySelector('article h2').textContent;

    expect(judulRumah).not.toBe(judulPpl);
  });
});

describe('halaman Tips — kategori dan hari', () => {
  it('menyaring daftar per kategori', async () => {
    const { container } = render(Page);
    const semua = container.querySelectorAll('article').length;

    await userEvent.click(screen.getByRole('button', { name: 'Istirahat' }));
    const istirahat = container.querySelectorAll('article').length;

    expect(istirahat).toBeLessThan(semua);
    expect(istirahat).toBeGreaterThan(0);
  });

  it('kategori aktif ditandai untuk pembaca layar', async () => {
    render(Page);
    const nutrisi = screen.getByRole('button', { name: 'Nutrisi' });
    await userEvent.click(nutrisi);
    expect(nutrisi).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Semua' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('tips hari ini berganti saat tanggalnya berganti', () => {
    const { container: a } = render(Page);
    const hariIni = a.querySelector('article h2').textContent;

    dayKey.set('2026-09-05');
    const { container: b } = render(Page);
    expect(b.querySelector('article h2').textContent).not.toBe(hariIni);
  });
});
