import { describe, expect, it } from 'vitest';
import { budgetTiers, dailyMenus, menuGoals, menuSlots } from '$lib/data/menus.js';
import { foodItems } from '$lib/data/foodItems.js';
import { allMenus, menusFor, resolveMenu, sortByCloseness, tierById } from '$lib/utils/menus';

/**
 * Tes kombinasi menu harian.
 *
 * Dua hal yang paling gampang rusak diam-diam, dan dua-duanya dikunci di sini:
 *
 * - Salah ketik nama makanan. Menu hanya menunjuk nama; nama yang meleset akan
 *   jadi menu tanpa kalori, dan di layar tidak kelihatan salah.
 * - Tier yang bocor. Menu "hemat" yang diam-diam berisi salmon membuat seluruh
 *   pembagian budget tidak ada artinya.
 */

const byName = new Map(foodItems.map((f) => [f.name, f]));
const menus = allMenus();

/** Semua entri satu menu, dari seluruh waktu makan. */
function entriesOf(menu) {
  return menuSlots.flatMap((s) => menu[s.id] ?? []);
}

describe('daftar menu', () => {
  it('berisi lebih dari 50 kombinasi', () => {
    expect(dailyMenus.length).toBeGreaterThanOrEqual(50);
  });

  it('terbagi rata ke tiga tier', () => {
    for (const tier of budgetTiers) {
      expect(dailyMenus.filter((m) => m.tier === tier.id).length, tier.id).toBeGreaterThanOrEqual(15);
    }
  });

  it('tiap tier punya menu untuk ketiga tujuan', () => {
    for (const tier of budgetTiers) {
      for (const goal of menuGoals) {
        const rows = dailyMenus.filter((m) => m.tier === tier.id && m.goal === goal.id);
        expect(rows.length, `${tier.id}/${goal.id}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('id-nya unik', () => {
    const ids = dailyMenus.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tier dan tujuannya nilai yang dikenal', () => {
    const tiers = new Set(budgetTiers.map((t) => t.id));
    const goals = new Set(menuGoals.map((g) => g.id));
    for (const m of dailyMenus) {
      expect(tiers.has(m.tier), m.id).toBe(true);
      expect(goals.has(m.goal), m.id).toBe(true);
    }
  });

  it('tiap menu punya nama, catatan, dan keempat waktu makan terisi', () => {
    for (const m of dailyMenus) {
      expect(m.name?.length, m.id).toBeGreaterThan(0);
      expect(m.note?.length, m.id).toBeGreaterThan(0);
      for (const slot of menuSlots) {
        expect(m[slot.id]?.length, `${m.id}/${slot.id}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('nama makanan', () => {
  it('semuanya ada di foodItems', () => {
    const salah = [];
    for (const m of dailyMenus) {
      for (const [name] of entriesOf(m)) {
        if (!byName.has(name)) salah.push(`${m.id}: ${name}`);
      }
    }
    expect(salah).toEqual([]);
  });

  it('tidak ada menu yang berakhir tanpa kalori', () => {
    for (const m of menus) {
      expect(m.missing, m.id).toEqual([]);
      expect(m.total.kcal, m.id).toBeGreaterThan(0);
    }
  });

  it('kelipatan porsinya angka positif yang masuk akal', () => {
    for (const m of dailyMenus) {
      for (const [name, qty] of entriesOf(m)) {
        expect(Number.isFinite(qty), `${m.id}: ${name}`).toBe(true);
        expect(qty, `${m.id}: ${name}`).toBeGreaterThan(0);
        expect(qty, `${m.id}: ${name}`).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe('batasan tier', () => {
  it('menu hemat tidak memakai bahan mahal sama sekali', () => {
    const bocor = [];
    for (const m of menus.filter((x) => x.tier === 'hemat')) {
      for (const e of m.slots.flatMap((s) => s.entries)) {
        if (e.cost > 2) bocor.push(`${m.id}: ${e.name}`);
      }
    }
    expect(bocor).toEqual([]);
  });

  it('menu hemat membatasi jumlah bahan tingkat sedang', () => {
    const batas = tierById('hemat').maxSedang;
    for (const m of menus.filter((x) => x.tier === 'hemat')) {
      const sedang = m.slots.flatMap((s) => s.entries).filter((e) => e.cost === 2);
      expect(sedang.length, `${m.id}: ${sedang.map((e) => e.name)}`).toBeLessThanOrEqual(batas);
    }
  });

  it('menu normal paling banyak satu bahan mahal', () => {
    for (const m of menus.filter((x) => x.tier === 'normal')) {
      const mahal = m.slots.flatMap((s) => s.entries).filter((e) => e.cost === 3);
      expect(mahal.length, `${m.id}: ${mahal.map((e) => e.name)}`).toBeLessThanOrEqual(
        tierById('normal').maxMahal
      );
    }
  });

  it('tier rekomendasi memang memakai bahan yang tidak ada di tier lain', () => {
    const mahalDipakai = menus
      .filter((x) => x.tier === 'pilihan')
      .flatMap((m) => m.slots.flatMap((s) => s.entries))
      .filter((e) => e.cost === 3);
    expect(mahalDipakai.length).toBeGreaterThan(0);
  });

  it('tiap tier punya label dan kisaran biaya untuk ditampilkan', () => {
    for (const t of budgetTiers) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.kisaran.length).toBeGreaterThan(0);
      expect(t.note.length).toBeGreaterThan(0);
    }
  });
});

describe('kalori dan protein', () => {
  const range = (tier, goal) => {
    const k = menus.filter((m) => m.tier === tier && m.goal === goal).map((m) => m.total.kcal);
    return { min: Math.min(...k), max: Math.max(...k) };
  };

  it('menu naik massa selalu lebih besar daripada turun lemak di tier yang sama', () => {
    for (const tier of budgetTiers) {
      expect(range(tier.id, 'bulk').min, tier.id).toBeGreaterThan(range(tier.id, 'cut').max);
    }
  });

  it('menu jaga berat berada di antara keduanya', () => {
    for (const tier of budgetTiers) {
      const jaga = range(tier.id, 'maintain');
      expect(jaga.min, tier.id).toBeGreaterThan(range(tier.id, 'cut').min);
      expect(jaga.max, tier.id).toBeLessThan(range(tier.id, 'bulk').max);
    }
  });

  it('tidak ada menu yang terlalu rendah untuk dipakai seharian', () => {
    for (const m of menus) {
      expect(m.total.kcal, m.id).toBeGreaterThanOrEqual(1400);
    }
  });

  it('proteinnya cukup untuk orang yang latihan beban', () => {
    // Sekitar 1,6 g/kg untuk orang 60 kg adalah ~96 g. Menu hemat tidak selalu
    // sampai situ — itu memang konsekuensi harga, dan halaman menyebutkannya.
    for (const m of menus) {
      const minimum = m.tier === 'hemat' ? 65 : 90;
      expect(m.total.p, `${m.id} (${m.tier})`).toBeGreaterThanOrEqual(minimum);
    }
  });
});

describe('resolveMenu', () => {
  const menu = {
    id: 'uji',
    tier: 'hemat',
    goal: 'cut',
    name: 'Uji',
    note: 'Uji',
    sarapan: [['Telur rebus', 2]],
    siang: [['Nasi putih', 2]],
    malam: [['Tempe kukus', 1]],
    camilan: [['Air putih', 2]]
  };

  it('menghitung total dari tabel makanan, bukan dari angka yang ditulis', () => {
    const r = resolveMenu(menu);
    // Telur rebus 72x2 + nasi 130x2 + tempe kukus 97 + air 0
    expect(r.total.kcal).toBe(72 * 2 + 130 * 2 + 97);
    expect(r.total.p).toBe(Math.round(6.3 * 2 + 2.7 * 2 + 9.5));
  });

  it('memberi subtotal per waktu makan', () => {
    const r = resolveMenu(menu);
    const sarapan = r.slots.find((s) => s.id === 'sarapan');
    expect(sarapan.total.kcal).toBe(144);
    expect(sarapan.entries[0]).toMatchObject({ name: 'Telur rebus', qty: 2, porsi: '1 butir' });
  });

  it('menandai nama yang tidak ada, bukan menghitungnya nol diam-diam', () => {
    const r = resolveMenu({ ...menu, siang: [['Nasi karangan', 1]] });
    expect(r.missing).toEqual(['Nasi karangan']);
    expect(r.slots.find((s) => s.id === 'siang').entries[0].missing).toBe(true);
  });

  it('mencatat tingkat biaya tertinggi yang dipakai', () => {
    expect(resolveMenu(menu).maxCost).toBe(1);
    expect(resolveMenu({ ...menu, camilan: [['Whey protein', 1]] }).maxCost).toBe(3);
  });

  it('waktu makan yang kosong tidak melempar', () => {
    const r = resolveMenu({ ...menu, camilan: undefined });
    expect(r.slots.find((s) => s.id === 'camilan').entries).toEqual([]);
  });
});

describe('menusFor dan sortByCloseness', () => {
  it('menyaring per tier dan tujuan', () => {
    const rows = menusFor('hemat', 'bulk');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((m) => m.tier === 'hemat' && m.goal === 'bulk')).toBe(true);
  });

  it('tanpa tujuan, semua tujuan ikut', () => {
    const rows = menusFor('normal');
    expect(new Set(rows.map((m) => m.goal)).size).toBe(3);
  });

  it('mengurutkan dari yang kalorinya paling dekat target', () => {
    const rows = sortByCloseness(menusFor('normal'), 2000);
    const jarak = rows.map((m) => Math.abs(m.total.kcal - 2000));
    expect(jarak).toEqual([...jarak].sort((a, b) => a - b));
  });

  it('tanpa target, urutannya dibiarkan apa adanya', () => {
    const rows = menusFor('normal');
    expect(sortByCloseness(rows, null)).toBe(rows);
    expect(sortByCloseness(rows, 0)).toBe(rows);
  });

  it('tierById jatuh ke tier pertama untuk id yang tidak dikenal', () => {
    expect(tierById('entah').id).toBe(budgetTiers[0].id);
    expect(tierById('pilihan').id).toBe('pilihan');
  });
});
