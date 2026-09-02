import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { menusFor } from '$lib/utils/menus';

/**
 * Tes render bagian "Menu harian" di halaman Nutrisi.
 *
 * Halaman ini punya banyak bagian lain (pencatat makan, target harian); yang
 * diuji di sini hanya pemilih tier budget dan tampilan menunya, karena itu yang
 * baru. Firestore dipalsukan supaya tidak ada yang menyentuh jaringan.
 */

const profile = writable(null);
const todayMeals = writable([]);
const todayNutrition = writable({ calories: 0, protein: 0, carbs: 0, fat: 0 });

vi.mock('$lib/stores/data', () => ({
  profile,
  todayMeals,
  todayNutrition,
  addMeal: vi.fn(async () => {}),
  removeMeal: vi.fn(async () => {}),
  saveProfile: vi.fn(async () => {})
}));

const { default: Page } = await import('../../src/routes/nutrisi/+page.svelte');

/** Profil lengkap supaya target harian ikut terhitung. */
function isiProfil(extra = {}) {
  profile.set({
    sex: 'laki-laki',
    age: 28,
    height: 172,
    weight: 70,
    activity: 'moderate',
    goal: 'maintain',
    ...extra
  });
}

/** Bagian menu harian saja, supaya query tidak mengenai bagian lain. */
function bagianMenu() {
  return screen.getByRole('heading', { name: 'Menu harian' }).closest('section');
}

beforeEach(() => isiProfil());

describe('pemilih tier budget', () => {
  it('menawarkan tiga tingkat biaya', () => {
    render(Page);
    const menu = bagianMenu();
    for (const label of ['Hemat', 'Normal', 'Rekomendasi']) {
      expect(within(menu).getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('mulai dari tier normal', () => {
    render(Page);
    expect(within(bagianMenu()).getByRole('button', { name: 'Normal' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('menampilkan kisaran biaya dan keterangan tier yang dipilih', async () => {
    render(Page);
    const menu = bagianMenu();
    expect(within(menu).getByText(/Rp45-75 rb per hari/)).toBeInTheDocument();

    await userEvent.click(within(menu).getByRole('button', { name: 'Hemat' }));
    expect(within(menu).getByText(/Rp25-40 rb per hari/)).toBeInTheDocument();
    expect(within(menu).queryByText(/tanpa batas biaya/)).not.toBeInTheDocument();
  });

  it('mengganti tier mengganti daftar menunya', async () => {
    render(Page);
    const menu = bagianMenu();
    const judulNormal = within(menu).getAllByRole('button', { expanded: false }).map((b) => b.textContent);

    await userEvent.click(within(menu).getByRole('button', { name: 'Hemat' }));
    const judulHemat = within(menu).getAllByRole('button', { expanded: false }).map((b) => b.textContent);

    expect(judulHemat).not.toEqual(judulNormal);
  });
});

describe('daftar menu', () => {
  it('hanya menampilkan menu untuk tujuan yang dipilih', () => {
    render(Page);
    const menu = bagianMenu();
    const jumlah = menusFor('normal', 'maintain').length;
    expect(within(menu).getByText(`${jumlah} pilihan`)).toBeInTheDocument();
  });

  it('melepas saringan tujuan menampilkan lebih banyak menu', async () => {
    render(Page);
    const menu = bagianMenu();
    await userEvent.click(within(menu).getByRole('checkbox'));
    expect(within(menu).getByText(`${menusFor('normal').length} pilihan`)).toBeInTheDocument();
  });

  it('menampilkan kalori dan protein tiap menu', () => {
    render(Page);
    const contoh = menusFor('normal', 'maintain')[0];
    expect(
      within(bagianMenu()).getAllByText(
        new RegExp(`${contoh.total.kcal} kkal .* ${contoh.total.p} g protein`)
      ).length
    ).toBeGreaterThan(0);
  });

  it('mengurutkan dari yang paling dekat target kalori', () => {
    render(Page);
    const menu = bagianMenu();
    // Selisih terhadap target ditampilkan sebagai chip; yang pertama harus
    // punya selisih terkecil.
    const selisih = within(menu)
      .getAllByRole('button', { expanded: false })
      .map((b) => Number(b.textContent.match(/([+-]?\d+)\s*$/)?.[1] ?? 0))
      .map(Math.abs);
    expect(selisih).toEqual([...selisih].sort((a, b) => a - b));
  });

  it('tanpa data tubuh, selisih target tidak ditampilkan', () => {
    profile.set({ goal: 'maintain' });
    render(Page);
    const menu = bagianMenu();
    expect(within(menu).queryByText(/^[+-]\d+$/)).not.toBeInTheDocument();
  });
});

describe('rincian satu menu', () => {
  it('menu tertutup sampai diketuk', () => {
    render(Page);
    expect(within(bagianMenu()).queryByText('Total sehari')).not.toBeInTheDocument();
  });

  it('membuka menu menampilkan tiap waktu makan beserta porsinya', async () => {
    render(Page);
    const menu = bagianMenu();
    const [pertama] = within(menu).getAllByRole('button', { expanded: false });
    await userEvent.click(pertama);

    expect(within(menu).getByText('Sarapan')).toBeInTheDocument();
    expect(within(menu).getByText('Makan siang')).toBeInTheDocument();
    expect(within(menu).getByText('Makan malam')).toBeInTheDocument();
    expect(within(menu).getByText('Camilan')).toBeInTheDocument();
    expect(within(menu).getByText('Total sehari')).toBeInTheDocument();
  });

  it('hanya satu menu terbuka dalam satu waktu', async () => {
    render(Page);
    const menu = bagianMenu();
    const tombol = within(menu).getAllByRole('button', { expanded: false });
    await userEvent.click(tombol[0]);
    await userEvent.click(within(menu).getAllByRole('button', { expanded: false })[0]);
    expect(within(menu).getAllByText('Total sehari')).toHaveLength(1);
  });

  it('mengetuk menu yang sedang terbuka menutupnya kembali', async () => {
    render(Page);
    const menu = bagianMenu();
    const [pertama] = within(menu).getAllByRole('button', { expanded: false });
    await userEvent.click(pertama);
    await userEvent.click(within(menu).getByRole('button', { expanded: true }));
    expect(within(menu).queryByText('Total sehari')).not.toBeInTheDocument();
  });

  it('mengganti tier menutup menu yang sedang terbuka', async () => {
    render(Page);
    const menu = bagianMenu();
    await userEvent.click(within(menu).getAllByRole('button', { expanded: false })[0]);
    await userEvent.click(within(menu).getByRole('button', { name: 'Hemat' }));
    expect(within(menu).queryByText('Total sehari')).not.toBeInTheDocument();
  });

  it('mengatakan bahwa kisaran harganya perkiraan', () => {
    render(Page);
    expect(within(bagianMenu()).getByText(/gambaran kasar, bukan hasil hitungan/)).toBeInTheDocument();
  });
});
