import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';

/**
 * Tes bilah navigasi bawah.
 *
 * Jumlah tab dikunci di sini dengan sengaja. Bilah ini pernah tumbuh sampai
 * tujuh tab dan labelnya berdempetan di layar ponsel; tes ini membuat
 * penambahan tab jadi keputusan sadar, bukan sesuatu yang terjadi diam-diam
 * saat menambah halaman baru.
 */

const page = writable({ url: new URL('http://localhost/') });
vi.mock('$app/stores', () => ({ page }));

const { default: Nav } = await import('$lib/components/Nav.svelte');

/** Render bilah nav seolah pengguna sedang membuka `path`. */
function di(path) {
  page.set({ url: new URL(`http://localhost${path}`) });
  return render(Nav);
}

beforeEach(() => page.set({ url: new URL('http://localhost/') }));

describe('jumlah dan isi tab', () => {
  it('hanya lima tab', () => {
    di('/');
    expect(screen.getAllByRole('link')).toHaveLength(5);
  });

  it('tabnya Hari ini, Program, Progres, Nutrisi, Profil', () => {
    di('/');
    const label = screen.getAllByRole('link').map((a) => a.textContent.trim());
    expect(label).toEqual(['Hari ini', 'Program', 'Progres', 'Nutrisi', 'Profil']);
  });

  it('Kardio dan Tips tidak lagi punya tab sendiri', () => {
    di('/');
    const href = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(href).not.toContain('/aktivitas');
    expect(href).not.toContain('/tips');
  });
});

describe('tab yang sedang aktif', () => {
  it('menandai halaman yang sedang dibuka', () => {
    di('/nutrisi');
    expect(screen.getByRole('link', { name: 'Nutrisi' })).toHaveAttribute('aria-current', 'page');
  });

  it('hanya satu tab aktif dalam satu waktu', () => {
    di('/programs');
    const aktif = screen.getAllByRole('link').filter((a) => a.getAttribute('aria-current') === 'page');
    expect(aktif).toHaveLength(1);
  });

  it('halaman Kardio dan Tips menyalakan tab Hari ini', () => {
    for (const path of ['/aktivitas', '/tips']) {
      const { unmount } = di(path);
      expect(screen.getByRole('link', { name: 'Hari ini' }), path).toHaveAttribute(
        'aria-current',
        'page'
      );
      unmount();
    }
  });

  it('halaman Riwayat dan Ukuran menyalakan tab Progres', () => {
    for (const path of ['/riwayat', '/ukuran']) {
      const { unmount } = di(path);
      expect(screen.getByRole('link', { name: 'Progres' }), path).toHaveAttribute(
        'aria-current',
        'page'
      );
      unmount();
    }
  });

  it('halaman anak yang belum terdaftar tidak menyalakan tab mana pun', () => {
    di('/programs/susun');
    const aktif = screen.getAllByRole('link').filter((a) => a.getAttribute('aria-current') === 'page');
    expect(aktif).toHaveLength(0);
  });
});
