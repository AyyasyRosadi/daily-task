import { goals } from '$lib/data/foods.js';

export const activityLevels = [
  { id: 'sedentary', name: 'Jarang gerak', factor: 1.2, hint: 'Kerja duduk, tanpa olahraga' },
  { id: 'light', name: 'Ringan', factor: 1.375, hint: 'Latihan 1-3 hari per minggu' },
  { id: 'moderate', name: 'Sedang', factor: 1.55, hint: 'Latihan 3-5 hari per minggu' },
  { id: 'high', name: 'Aktif', factor: 1.725, hint: 'Latihan 6-7 hari per minggu' }
];

/** Mifflin-St Jeor. */
export function bmr({ weight, height, age, sex }) {
  if (!weight || !height || !age) return 0;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(sex === 'perempuan' ? base - 161 : base + 5);
}

export function tdee(profile) {
  const level = activityLevels.find((a) => a.id === profile.activity) ?? activityLevels[2];
  return Math.round(bmr(profile) * level.factor);
}

/** Target kalori dan makronutrien harian. */
export function macroTargets(profile) {
  const maintenance = tdee(profile);
  const goal = goals.find((g) => g.id === profile.goal) ?? goals[1];
  const floor = profile.sex === 'perempuan' ? 1200 : 1500;
  const calories = Math.max(floor, Math.round(maintenance * (1 + goal.calorieShift)));
  const protein = Math.round((profile.weight || 0) * goal.proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { maintenance, calories, protein, fat, carbs, goal };
}

/** Target air minum harian dalam gelas 250 ml. */
export function waterGlasses(weight) {
  if (!weight) return 8;
  return Math.max(6, Math.min(16, Math.round((weight * 35) / 250)));
}
