import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import TaskRow from '$lib/components/TaskRow.svelte';

/**
 * Tes render untuk baris gerakan di halaman Hari ini.
 *
 * Komponen ini tidak menyimpan apa pun sendiri — semua perubahan dikirim lewat
 * callback ke halaman induk. Jadi yang diperiksa di sini adalah: apa yang tampil,
 * dan callback mana yang terpanggil dengan argumen apa.
 */

function task(extra = {}) {
  return {
    id: 't1',
    name: 'Barbell bench press',
    group: 'dada',
    sets: 3,
    reps: '8-10',
    done: false,
    ...extra
  };
}

/** Render dengan panel set terbuka dan semua callback dimata-matai. */
function setup(props = {}) {
  const spies = {
    ontoggle: vi.fn(),
    onlogset: vi.fn(),
    onaddset: vi.fn(),
    onremoveset: vi.fn(),
    onswap: vi.fn(),
    ontoggleexpand: vi.fn()
  };
  const result = render(TaskRow, { task: task(), expanded: true, ...spies, ...props });
  return { ...result, ...spies };
}

describe('TaskRow — tampilan ringkas', () => {
  it('menampilkan nama, jumlah set selesai, dan target repetisi', () => {
    render(TaskRow, { task: task() });
    expect(screen.getByText('Barbell bench press')).toBeInTheDocument();
    expect(screen.getByText(/0\/3 set/)).toBeInTheDocument();
    expect(screen.getByText(/target 8-10/)).toBeInTheDocument();
  });

  it('menghitung set yang sudah selesai dari logs', () => {
    const logs = [
      { kg: 40, reps: 10, done: true },
      { kg: 40, reps: 9, done: true },
      { kg: null, reps: null, done: false }
    ];
    render(TaskRow, { task: task({ logs }) });
    expect(screen.getByText(/2\/3 set/)).toBeInTheDocument();
  });

  it('menampilkan beban sesi lalu kalau ada', () => {
    render(TaskRow, { task: task(), last: { date: '2026-08-30', topKg: 42.5, totalReps: 27 } });
    expect(screen.getByText(/lalu 42\.5 kg/)).toBeInTheDocument();
  });

  it('menyembunyikan panel set sampai baris dibuka', () => {
    render(TaskRow, { task: task() });
    expect(screen.queryByRole('button', { name: 'Tambah set' })).not.toBeInTheDocument();
  });

  it('meminta induk membuka baris saat nama diketuk', async () => {
    const ontoggleexpand = vi.fn();
    render(TaskRow, { task: task(), ontoggleexpand });
    await userEvent.click(screen.getByText('Barbell bench press'));
    expect(ontoggleexpand).toHaveBeenCalledWith('t1');
  });

  it('centang gerakan mengirim ontoggle, bukan onlogset', async () => {
    const { ontoggle, onlogset } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Tandai Barbell bench press selesai' }));
    expect(ontoggle).toHaveBeenCalledWith('t1');
    expect(onlogset).not.toHaveBeenCalled();
  });
});

describe('TaskRow — pencatatan set', () => {
  it('menampilkan satu baris input per target set', () => {
    setup();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(6); // 3 set x (beban + repetisi)
  });

  it('mengirim beban yang diketik sebagai angka', async () => {
    const { onlogset } = setup();
    const kg = screen.getAllByRole('spinbutton')[0];
    await userEvent.type(kg, '42.5');
    await userEvent.tab();
    expect(onlogset).toHaveBeenCalledWith('t1', 0, { kg: 42.5 });
  });

  it('mengosongkan nilai jadi null, bukan 0', async () => {
    const logs = [{ kg: 40, reps: 10, done: false }];
    const { onlogset } = setup({ task: task({ logs }) });
    const kg = screen.getAllByRole('spinbutton')[0];
    await userEvent.clear(kg);
    await userEvent.tab();
    expect(onlogset).toHaveBeenCalledWith('t1', 0, { kg: null });
  });

  it('centang set kosong mengisi acuan dari saran hari ini', async () => {
    const { onlogset } = setup({
      suggestion: { kg: 45, status: 'naik', reason: 'Naik 2.5 kg dari sesi lalu.' }
    });
    await userEvent.click(screen.getByRole('button', { name: 'Selesaikan set 1' }));
    expect(onlogset).toHaveBeenCalledWith('t1', 0, { done: true, kg: 45, reps: 8 });
  });

  it('set kedua memakai beban set pertama sebagai acuan', async () => {
    const logs = [{ kg: 50, reps: 8, done: true }];
    const { onlogset } = setup({ task: task({ logs }) });
    await userEvent.click(screen.getByRole('button', { name: 'Selesaikan set 2' }));
    expect(onlogset).toHaveBeenCalledWith('t1', 1, { done: true, kg: 50, reps: 8 });
  });

  it('centang set yang sudah selesai membatalkannya tanpa menyentuh beban', async () => {
    const logs = [{ kg: 50, reps: 8, done: true }];
    const { onlogset } = setup({ task: task({ logs }) });
    await userEvent.click(screen.getByRole('button', { name: 'Batalkan set 1' }));
    expect(onlogset).toHaveBeenCalledWith('t1', 0, { done: false });
  });

  it('tambah dan hapus set diteruskan ke induk', async () => {
    const { onaddset, onremoveset } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Tambah set' }));
    await userEvent.click(screen.getByRole('button', { name: 'Hapus set terakhir' }));
    expect(onaddset).toHaveBeenCalledWith('t1');
    expect(onremoveset).toHaveBeenCalledWith('t1');
  });

  it('menyembunyikan tombol hapus saat hanya tersisa satu set', () => {
    setup({ task: task({ sets: 1 }) });
    expect(screen.queryByRole('button', { name: 'Hapus set terakhir' })).not.toBeInTheDocument();
  });
});

describe('TaskRow — panduan dan ganti gerakan', () => {
  it('menampilkan aba-aba dan kesalahan umum di panel panduan', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Panduan' }));
    expect(screen.getByText(/Sering salah/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('mematikan tab panduan untuk gerakan tanpa entri panduan', () => {
    setup({ task: task({ name: 'Gerakan Karangan' }) });
    expect(screen.getByRole('button', { name: 'Panduan' })).toBeDisabled();
  });

  it('memilih pengganti mengirim nama baru lalu kembali ke panel set', async () => {
    const { onswap } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Ganti' }));
    const [first] = screen.getAllByText('Pilih');
    await userEvent.click(first.closest('button'));
    expect(onswap).toHaveBeenCalledWith('t1', expect.any(String));
    expect(onswap.mock.calls[0][1]).not.toBe('Barbell bench press');
    expect(screen.getByRole('button', { name: 'Tambah set' })).toBeInTheDocument();
  });
});
