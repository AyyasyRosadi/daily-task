import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

/**
 * Tes render untuk penyusun program di `/programs/susun`.
 *
 * Yang benar-benar diperiksa adalah bentuk objek yang dikirim ke Firestore:
 * itulah satu-satunya keluaran halaman ini, dan bentuknya harus sama persis
 * dengan program bawaan supaya sisa aplikasi tidak perlu tahu bedanya.
 * `saveCustomProgram` dipalsukan supaya tidak ada yang menyentuh jaringan.
 */

const saveCustomProgram = vi.fn(async () => 'id-tersimpan');
const goto = vi.fn(async () => {});

vi.mock('$lib/stores/programs', async (importOriginal) => ({
  ...(await importOriginal()),
  saveCustomProgram
}));
vi.mock('$app/navigation', () => ({ goto }));

const { default: Builder } = await import('../../src/routes/programs/susun/+page.svelte');

/** Buka hari tertentu di jadwal mingguan. */
async function openDay(name) {
  await userEvent.click(screen.getByText(name));
}

/** Tambah gerakan pertama dari kelompok pertama ke hari yang sedang terbuka. */
async function addFirstExercise() {
  await userEvent.click(screen.getByRole('button', { name: 'Tambah gerakan' }));
  const list = screen.getByRole('list');
  const [first] = within(list).getAllByRole('button');
  const name = first.textContent.trim();
  await userEvent.click(first);
  return name;
}

/** Isi sebuah input berlabel di dalam formulir keterangan. */
async function fill(label, value) {
  const input = screen.getByLabelText(label);
  await userEvent.clear(input);
  await userEvent.type(input, value);
}

beforeEach(() => {
  saveCustomProgram.mockClear();
  goto.mockClear();
});

describe('Penyusun program — keadaan awal', () => {
  it('mulai dari program kosong tanpa hari latihan', () => {
    render(Builder);
    expect(screen.getByRole('heading', { name: 'Susun program' })).toBeInTheDocument();
    expect(screen.getByText('0 hari latihan')).toBeInTheDocument();
    expect(screen.getAllByText('Istirahat')).toHaveLength(7);
  });

  it('menampilkan tujuh hari dengan Senin lebih dulu', () => {
    render(Builder);
    const days = screen.getAllByText(/^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)$/);
    expect(days.map((d) => d.textContent)).toEqual([
      'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
    ]);
  });
});

describe('Penyusun program — menyusun jadwal', () => {
  it('menambah gerakan mengubah hari itu jadi hari latihan', async () => {
    render(Builder);
    await openDay('Senin');
    const name = await addFirstExercise();
    expect(screen.getByText('1 hari latihan')).toBeInTheDocument();
    expect(screen.getByText(name)).toBeInTheDocument();
  });

  it('hari yang dijadikan istirahat kembali kosong', async () => {
    render(Builder);
    await openDay('Senin');
    await addFirstExercise();
    await userEvent.click(screen.getByRole('button', { name: 'Jadikan hari istirahat' }));
    expect(screen.getByText('0 hari latihan')).toBeInTheDocument();
  });

  it('tombol naik dimatikan pada gerakan pertama', async () => {
    render(Builder);
    await openDay('Senin');
    await addFirstExercise();
    expect(screen.getByRole('button', { name: 'Naikkan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Turunkan' })).toBeDisabled();
  });

  it('menghapus gerakan mengosongkan kembali hari itu', async () => {
    render(Builder);
    await openDay('Senin');
    const name = await addFirstExercise();
    await userEvent.click(screen.getByRole('button', { name: 'Hapus gerakan' }));
    expect(screen.queryByText(name)).not.toBeInTheDocument();
    expect(screen.getByText('0 hari latihan')).toBeInTheDocument();
  });
});

describe('Penyusun program — penyimpanan', () => {
  it('menolak menyimpan tanpa nama', async () => {
    render(Builder);
    await openDay('Senin');
    await addFirstExercise();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan program' }));
    expect(screen.getByText('Program perlu nama.')).toBeInTheDocument();
    expect(saveCustomProgram).not.toHaveBeenCalled();
  });

  it('menolak menyimpan tanpa satu pun hari latihan', async () => {
    render(Builder);
    await fill('Nama program', 'Program Saya');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan program' }));
    expect(
      screen.getByText('Tambahkan minimal satu hari latihan dengan gerakan di dalamnya.')
    ).toBeInTheDocument();
    expect(saveCustomProgram).not.toHaveBeenCalled();
  });

  it('mengisi sendiri judul, fokus, ringkasan, dan id yang kosong', async () => {
    render(Builder);
    await fill('Nama program', 'Upper Lower Saya');
    await openDay('Senin');
    const name = await addFirstExercise();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan program' }));

    expect(saveCustomProgram).toHaveBeenCalledTimes(1);
    const saved = saveCustomProgram.mock.calls[0][0];
    expect(saved.id).toBe('upper-lower-saya');
    expect(saved.name).toBe('Upper Lower Saya');
    expect(saved.goal).toBe('Program buatan sendiri');
    expect(saved.summary).toBe('1 sesi per minggu.');
    expect(saved.daysPerWeek).toBe(1);
    expect(saved.schedule[1]).toMatchObject({
      title: 'Latihan Senin',
      focus: 'Latihan',
      minutes: 45,
      exercises: [{ name, sets: 3, reps: '10' }]
    });
    expect(goto).toHaveBeenCalledWith('/programs');
  });

  it('membuang hari yang tidak punya gerakan dari jadwal tersimpan', async () => {
    render(Builder);
    await fill('Nama program', 'Dua Hari');
    await openDay('Senin');
    await addFirstExercise();
    await openDay('Senin'); // tutup lagi
    await openDay('Rabu');
    // Rabu hanya diberi judul, tanpa gerakan — seharusnya tidak ikut tersimpan.
    const judul = screen.getByLabelText('Judul sesi');
    await userEvent.type(judul, 'Kosong');
    await userEvent.tab();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan program' }));

    const saved = saveCustomProgram.mock.calls[0][0];
    expect(Object.keys(saved.schedule)).toEqual(['1']);
    expect(saved.daysPerWeek).toBe(1);
  });

  it('menampilkan pesan kegagalan kalau penyimpanan ditolak', async () => {
    saveCustomProgram.mockRejectedValueOnce(new Error('offline'));
    render(Builder);
    await fill('Nama program', 'Gagal');
    await openDay('Senin');
    await addFirstExercise();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan program' }));
    expect(screen.getByText('Gagal menyimpan. Cek koneksi lalu coba lagi.')).toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();
  });
});
