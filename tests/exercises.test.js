import { describe, expect, it } from 'vitest';
import { alternativesFor, byGroup, exercises, groups, guideFor } from '$lib/data/exercises.js';
import { programs, tasksFromSession } from '$lib/data/programs.js';

/** Setiap gerakan yang muncul di program bawaan mana pun. */
const usedInPrograms = [
  ...new Set(
    programs.flatMap((p) =>
      Object.values(p.schedule).flatMap((s) => s.exercises.map((e) => e.name))
    )
  )
];

describe('cakupan pustaka gerakan', () => {
  it('setiap gerakan di program bawaan punya panduan', () => {
    const missing = usedInPrograms.filter((name) => !guideFor(name));
    expect(missing).toEqual([]);
  });

  it('kelompok otot di pustaka cocok dengan yang dipakai program', () => {
    const mismatched = programs.flatMap((p) =>
      Object.values(p.schedule).flatMap((s) =>
        s.exercises
          .filter((e) => exercises[e.name] && exercises[e.name].group !== e.group)
          .map((e) => `${e.name}: program=${e.group} pustaka=${exercises[e.name].group}`)
      )
    );
    expect(mismatched).toEqual([]);
  });

  it('setiap entri punya panduan dan kesalahan yang terisi', () => {
    const incomplete = Object.entries(exercises)
      .filter(([, ex]) => !ex.cues?.length || !ex.mistake || !ex.group || !ex.equipment)
      .map(([name]) => name);
    expect(incomplete).toEqual([]);
  });
});

describe('alternativesFor', () => {
  it('hanya menawarkan gerakan dari kelompok otot yang sama', () => {
    const alts = alternativesFor('Back squat');
    expect(alts.length).toBeGreaterThan(0);
    expect(alts.every((a) => a.group === 'kaki')).toBe(true);
  });

  it('tidak menawarkan gerakan itu sendiri', () => {
    expect(alternativesFor('Back squat').some((a) => a.name === 'Back squat')).toBe(false);
  });

  it('mendahulukan alat yang berbeda', () => {
    // Alasan paling umum mengganti gerakan adalah alatnya sedang dipakai orang.
    const alts = alternativesFor('Back squat');
    expect(alts[0].equipment).not.toBe('barbel');
  });

  it('menghormati batas jumlah', () => {
    expect(alternativesFor('Back squat', 3)).toHaveLength(3);
  });

  it('mengembalikan daftar kosong untuk gerakan tak dikenal', () => {
    expect(alternativesFor('Gerakan karangan')).toEqual([]);
  });
});

describe('byGroup dan groups', () => {
  it('mengembalikan kelompok yang ada isinya, terurut', () => {
    const g = groups();
    expect(g).toContain('kaki');
    expect([...g].sort()).toEqual(g);
  });

  it('setiap kelompok berisi minimal satu gerakan', () => {
    expect(groups().every((g) => byGroup(g).length > 0)).toBe(true);
  });
});

describe('tasksFromSession', () => {
  it('menyiapkan slot set kosong sebanyak target', () => {
    const [task] = tasksFromSession({
      exercises: [{ name: 'Back squat', sets: 4, reps: '8', group: 'kaki' }]
    });
    expect(task.logs).toHaveLength(4);
    expect(task.logs.every((s) => s.kg === null && !s.done)).toBe(true);
  });

  it('membuat id yang stabil dan aman', () => {
    const [task] = tasksFromSession({
      exercises: [{ name: 'Inverted row (meja)', sets: 3, reps: '10', group: 'punggung' }]
    });
    expect(task.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('mengembalikan daftar kosong untuk hari istirahat', () => {
    expect(tasksFromSession({ exercises: [] })).toEqual([]);
    expect(tasksFromSession(null)).toEqual([]);
  });
});

describe('keutuhan program bawaan', () => {
  it('setiap program punya id unik', () => {
    const ids = programs.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('daysPerWeek cocok dengan jumlah hari berisi gerakan', () => {
    for (const p of programs) {
      const actual = Object.values(p.schedule).filter((s) => s.exercises.length).length;
      expect(`${p.id}:${actual}`).toBe(`${p.id}:${p.daysPerWeek}`);
    }
  });

  it('kunci jadwal selalu hari 0 sampai 6', () => {
    for (const p of programs) {
      for (const key of Object.keys(p.schedule)) {
        expect(Number(key)).toBeGreaterThanOrEqual(0);
        expect(Number(key)).toBeLessThanOrEqual(6);
      }
    }
  });
});
