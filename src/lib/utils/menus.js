import { foodItems } from '$lib/data/foodItems.js';
import { budgetTiers, dailyMenus, menuSlots } from '$lib/data/menus.js';

/**
 * Menghitung isi menu harian dari tabel makanan.
 *
 * Menu di `menus.js` hanya menyebut nama dan kelipatan porsi; seluruh angka
 * kalori dan makro datang dari `foodItems.js`. Artinya memperbaiki satu angka
 * makanan otomatis memperbaiki semua menu yang memakainya, dan tidak mungkin ada
 * menu yang angkanya menyimpang dari tabelnya sendiri.
 */

const byName = new Map(foodItems.map((f) => [f.name, f]));

/** Makanan berdasarkan nama persis, atau null kalau tidak ada di tabel. */
export function foodByName(name) {
  return byName.get(name) ?? null;
}

/**
 * Satu baris menu jadi objek lengkap dengan makro terhitung.
 * Nama yang tidak ada di tabel dikembalikan dengan `missing: true` supaya
 * kelihatan di tes, bukan diam-diam dihitung nol.
 */
function resolveEntry([name, qty = 1]) {
  const food = byName.get(name);
  const n = Number(qty) || 1;
  if (!food) return { name, qty: n, missing: true, kcal: 0, p: 0, k: 0, l: 0, cost: 1 };
  return {
    name,
    qty: n,
    porsi: food.porsi,
    cat: food.cat,
    cost: food.cost,
    kcal: food.kcal * n,
    p: food.p * n,
    k: food.k * n,
    l: food.l * n
  };
}

/** Jumlahkan makro sederet entri. */
function sum(entries) {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      p: acc.p + e.p,
      k: acc.k + e.k,
      l: acc.l + e.l
    }),
    { kcal: 0, p: 0, k: 0, l: 0 }
  );
}

const round = (t) => ({
  kcal: Math.round(t.kcal),
  p: Math.round(t.p),
  k: Math.round(t.k),
  l: Math.round(t.l)
});

/**
 * Menu lengkap: tiap waktu makan berisi entri terhitung beserta subtotalnya,
 * ditambah total harian dan tingkat biaya tertinggi yang dipakai.
 */
export function resolveMenu(menu) {
  const slots = menuSlots.map((slot) => {
    const entries = (menu[slot.id] ?? []).map(resolveEntry);
    return { ...slot, entries, total: round(sum(entries)) };
  });

  const semua = slots.flatMap((s) => s.entries);
  return {
    ...menu,
    slots,
    total: round(sum(semua)),
    // Tingkat biaya tertinggi yang muncul di menu ini. Dipakai tes untuk
    // memastikan menu hemat tidak diam-diam berisi bahan mahal.
    maxCost: semua.reduce((max, e) => Math.max(max, e.cost ?? 1), 1),
    missing: semua.filter((e) => e.missing).map((e) => e.name)
  };
}

/** Semua menu, sudah terhitung. */
export function allMenus() {
  return dailyMenus.map(resolveMenu);
}

/**
 * Menu yang cocok dengan tier dan tujuan.
 * `goal` null berarti semua tujuan.
 */
export function menusFor(tier, goal = null) {
  return allMenus().filter((m) => {
    if (tier && m.tier !== tier) return false;
    if (goal && m.goal !== goal) return false;
    return true;
  });
}

export function tierById(id) {
  return budgetTiers.find((t) => t.id === id) ?? budgetTiers[0];
}

/**
 * Seberapa dekat sebuah menu dengan target kalori harian pengguna.
 * Dipakai mengurutkan daftar supaya menu yang paling pas muncul lebih dulu.
 * Tanpa target (profil belum diisi), urutannya dibiarkan apa adanya.
 */
export function sortByCloseness(menus, targetKcal) {
  const target = Number(targetKcal);
  if (!Number.isFinite(target) || target <= 0) return menus;
  return [...menus].sort(
    (a, b) => Math.abs(a.total.kcal - target) - Math.abs(b.total.kcal - target)
  );
}
