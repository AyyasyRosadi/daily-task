// Kelompok otot dipakai untuk warna "plat" di UI.
export const groupColor = {
  dada: '#D6353B',
  punggung: '#2C6BE0',
  kaki: '#31A05F',
  bahu: '#F0B429',
  lengan: '#E7E3DA',
  inti: '#9B6BE0',
  kardio: '#22B8A6'
};

const rest = { title: 'Istirahat', focus: 'Pemulihan', minutes: 0, exercises: [] };

export const programs = [
  {
    id: 'full-body-start',
    name: 'Full Body Pemula',
    level: 'Pemula',
    weeks: 8,
    daysPerWeek: 3,
    place: 'Gym',
    goal: 'Membangun kekuatan dan kebiasaan latihan',
    summary:
      'Tiga sesi seminggu yang melatih seluruh tubuh. Cocok kalau baru mulai atau balik lagi setelah lama libur.',
    schedule: {
      1: {
        title: 'Full Body A',
        focus: 'Dorong + kaki',
        minutes: 55,
        exercises: [
          { name: 'Goblet squat', sets: 3, reps: '10', group: 'kaki' },
          { name: 'Bench press dumbbell', sets: 3, reps: '10', group: 'dada' },
          { name: 'Seated row', sets: 3, reps: '12', group: 'punggung' },
          { name: 'Shoulder press dumbbell', sets: 3, reps: '10', group: 'bahu' },
          { name: 'Plank', sets: 3, reps: '40 detik', group: 'inti' }
        ]
      },
      3: {
        title: 'Full Body B',
        focus: 'Tarik + engsel pinggul',
        minutes: 55,
        exercises: [
          { name: 'Romanian deadlift', sets: 3, reps: '10', group: 'kaki' },
          { name: 'Lat pulldown', sets: 3, reps: '12', group: 'punggung' },
          { name: 'Incline dumbbell press', sets: 3, reps: '10', group: 'dada' },
          { name: 'Leg curl', sets: 3, reps: '12', group: 'kaki' },
          { name: 'Face pull', sets: 3, reps: '15', group: 'bahu' }
        ]
      },
      5: {
        title: 'Full Body C',
        focus: 'Kekuatan + inti',
        minutes: 60,
        exercises: [
          { name: 'Back squat', sets: 4, reps: '8', group: 'kaki' },
          { name: 'Push up', sets: 3, reps: 'sampai 2 sisa', group: 'dada' },
          { name: 'Dumbbell row', sets: 3, reps: '10 / sisi', group: 'punggung' },
          { name: 'Lateral raise', sets: 3, reps: '15', group: 'bahu' },
          { name: 'Hanging knee raise', sets: 3, reps: '12', group: 'inti' },
          { name: 'Jalan cepat', sets: 1, reps: '10 menit', group: 'kardio' }
        ]
      },
      0: rest,
      2: rest,
      4: rest,
      6: rest
    }
  },
  {
    id: 'push-pull-legs',
    name: 'Push Pull Legs',
    level: 'Menengah',
    weeks: 12,
    daysPerWeek: 6,
    place: 'Gym',
    goal: 'Menambah massa otot',
    summary:
      'Enam sesi seminggu dibagi jadi dorong, tarik, dan kaki. Volume tinggi, butuh jadwal yang rapi.',
    schedule: {
      1: {
        title: 'Push A',
        focus: 'Dada, bahu, trisep',
        minutes: 70,
        exercises: [
          { name: 'Barbell bench press', sets: 4, reps: '6-8', group: 'dada' },
          { name: 'Overhead press', sets: 4, reps: '8', group: 'bahu' },
          { name: 'Incline dumbbell press', sets: 3, reps: '10', group: 'dada' },
          { name: 'Cable lateral raise', sets: 3, reps: '15', group: 'bahu' },
          { name: 'Triceps pushdown', sets: 3, reps: '12', group: 'lengan' }
        ]
      },
      2: {
        title: 'Pull A',
        focus: 'Punggung, bisep',
        minutes: 70,
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '5', group: 'punggung' },
          { name: 'Pull up', sets: 4, reps: '6-10', group: 'punggung' },
          { name: 'Barbell row', sets: 3, reps: '10', group: 'punggung' },
          { name: 'Face pull', sets: 3, reps: '15', group: 'bahu' },
          { name: 'Barbell curl', sets: 3, reps: '10', group: 'lengan' }
        ]
      },
      3: {
        title: 'Legs A',
        focus: 'Kuadrisep, betis',
        minutes: 70,
        exercises: [
          { name: 'Back squat', sets: 4, reps: '6-8', group: 'kaki' },
          { name: 'Leg press', sets: 3, reps: '12', group: 'kaki' },
          { name: 'Walking lunge', sets: 3, reps: '12 / sisi', group: 'kaki' },
          { name: 'Leg extension', sets: 3, reps: '15', group: 'kaki' },
          { name: 'Standing calf raise', sets: 4, reps: '15', group: 'kaki' }
        ]
      },
      4: {
        title: 'Push B',
        focus: 'Bahu dominan',
        minutes: 65,
        exercises: [
          { name: 'Seated dumbbell press', sets: 4, reps: '10', group: 'bahu' },
          { name: 'Dip', sets: 3, reps: '8-12', group: 'dada' },
          { name: 'Cable fly', sets: 3, reps: '12', group: 'dada' },
          { name: 'Lateral raise', sets: 4, reps: '15', group: 'bahu' },
          { name: 'Overhead triceps extension', sets: 3, reps: '12', group: 'lengan' }
        ]
      },
      5: {
        title: 'Pull B',
        focus: 'Ketebalan punggung',
        minutes: 65,
        exercises: [
          { name: 'Pendlay row', sets: 4, reps: '8', group: 'punggung' },
          { name: 'Lat pulldown', sets: 3, reps: '12', group: 'punggung' },
          { name: 'Chest supported row', sets: 3, reps: '12', group: 'punggung' },
          { name: 'Rear delt fly', sets: 3, reps: '15', group: 'bahu' },
          { name: 'Hammer curl', sets: 3, reps: '12', group: 'lengan' }
        ]
      },
      6: {
        title: 'Legs B',
        focus: 'Hamstring, glute',
        minutes: 65,
        exercises: [
          { name: 'Romanian deadlift', sets: 4, reps: '8', group: 'kaki' },
          { name: 'Front squat', sets: 3, reps: '8', group: 'kaki' },
          { name: 'Hip thrust', sets: 3, reps: '12', group: 'kaki' },
          { name: 'Leg curl', sets: 3, reps: '15', group: 'kaki' },
          { name: 'Hanging leg raise', sets: 3, reps: '12', group: 'inti' }
        ]
      },
      0: rest
    }
  },
  {
    id: 'upper-lower',
    name: 'Upper Lower Split',
    level: 'Menengah',
    weeks: 10,
    daysPerWeek: 4,
    place: 'Gym',
    goal: 'Kekuatan sekaligus massa',
    summary:
      'Empat sesi: dua badan atas, dua badan bawah. Pilihan seimbang kalau cuma punya empat hari luang.',
    schedule: {
      1: {
        title: 'Upper Kekuatan',
        focus: 'Beban berat, repetisi rendah',
        minutes: 65,
        exercises: [
          { name: 'Barbell bench press', sets: 5, reps: '5', group: 'dada' },
          { name: 'Barbell row', sets: 4, reps: '6', group: 'punggung' },
          { name: 'Overhead press', sets: 3, reps: '6', group: 'bahu' },
          { name: 'Weighted pull up', sets: 3, reps: '6', group: 'punggung' },
          { name: 'Barbell curl', sets: 3, reps: '10', group: 'lengan' }
        ]
      },
      2: {
        title: 'Lower Kekuatan',
        focus: 'Squat dan deadlift',
        minutes: 65,
        exercises: [
          { name: 'Back squat', sets: 5, reps: '5', group: 'kaki' },
          { name: 'Romanian deadlift', sets: 4, reps: '8', group: 'kaki' },
          { name: 'Bulgarian split squat', sets: 3, reps: '10 / sisi', group: 'kaki' },
          { name: 'Calf raise', sets: 4, reps: '12', group: 'kaki' },
          { name: 'Plank', sets: 3, reps: '60 detik', group: 'inti' }
        ]
      },
      4: {
        title: 'Upper Volume',
        focus: 'Repetisi sedang',
        minutes: 60,
        exercises: [
          { name: 'Incline dumbbell press', sets: 4, reps: '10', group: 'dada' },
          { name: 'Lat pulldown', sets: 4, reps: '12', group: 'punggung' },
          { name: 'Seated dumbbell press', sets: 3, reps: '12', group: 'bahu' },
          { name: 'Cable row', sets: 3, reps: '12', group: 'punggung' },
          { name: 'Triceps pushdown', sets: 3, reps: '15', group: 'lengan' }
        ]
      },
      5: {
        title: 'Lower Volume',
        focus: 'Glute dan hamstring',
        minutes: 60,
        exercises: [
          { name: 'Front squat', sets: 4, reps: '10', group: 'kaki' },
          { name: 'Hip thrust', sets: 4, reps: '12', group: 'kaki' },
          { name: 'Leg curl', sets: 3, reps: '15', group: 'kaki' },
          { name: 'Leg extension', sets: 3, reps: '15', group: 'kaki' },
          { name: 'Sepeda statis', sets: 1, reps: '12 menit', group: 'kardio' }
        ]
      },
      0: rest,
      3: rest,
      6: rest
    }
  },
  {
    id: 'home-bodyweight',
    name: 'Kalistenik di Rumah',
    level: 'Pemula',
    weeks: 6,
    daysPerWeek: 5,
    place: 'Rumah',
    goal: 'Bugar tanpa alat',
    summary:
      'Tanpa alat sama sekali. Sesi pendek 25-35 menit, pas untuk hari kerja yang padat.',
    schedule: {
      1: {
        title: 'Badan Atas',
        focus: 'Dorong dan tarik',
        minutes: 30,
        exercises: [
          { name: 'Push up', sets: 4, reps: '12', group: 'dada' },
          { name: 'Pike push up', sets: 3, reps: '10', group: 'bahu' },
          { name: 'Inverted row (meja)', sets: 3, reps: '12', group: 'punggung' },
          { name: 'Superman hold', sets: 3, reps: '30 detik', group: 'punggung' }
        ]
      },
      2: {
        title: 'Badan Bawah',
        focus: 'Kaki dan glute',
        minutes: 30,
        exercises: [
          { name: 'Bodyweight squat', sets: 4, reps: '20', group: 'kaki' },
          { name: 'Reverse lunge', sets: 3, reps: '12 / sisi', group: 'kaki' },
          { name: 'Glute bridge', sets: 3, reps: '15', group: 'kaki' },
          { name: 'Calf raise', sets: 3, reps: '20', group: 'kaki' }
        ]
      },
      3: {
        title: 'Kardio + Inti',
        focus: 'Interval ringan',
        minutes: 25,
        exercises: [
          { name: 'Jumping jack', sets: 4, reps: '45 detik', group: 'kardio' },
          { name: 'Mountain climber', sets: 4, reps: '30 detik', group: 'inti' },
          { name: 'Plank', sets: 3, reps: '45 detik', group: 'inti' },
          { name: 'Russian twist', sets: 3, reps: '20', group: 'inti' }
        ]
      },
      5: {
        title: 'Full Body',
        focus: 'Sirkuit',
        minutes: 35,
        exercises: [
          { name: 'Burpee', sets: 3, reps: '10', group: 'kardio' },
          { name: 'Push up', sets: 3, reps: '15', group: 'dada' },
          { name: 'Squat jump', sets: 3, reps: '12', group: 'kaki' },
          { name: 'Inverted row (meja)', sets: 3, reps: '12', group: 'punggung' },
          { name: 'Hollow hold', sets: 3, reps: '30 detik', group: 'inti' }
        ]
      },
      6: {
        title: 'Mobilitas',
        focus: 'Peregangan aktif',
        minutes: 25,
        exercises: [
          { name: 'Cat cow', sets: 2, reps: '10', group: 'inti' },
          { name: "World's greatest stretch", sets: 2, reps: '8 / sisi', group: 'kaki' },
          { name: 'Hip flexor stretch', sets: 2, reps: '45 detik / sisi', group: 'kaki' },
          { name: 'Jalan santai', sets: 1, reps: '15 menit', group: 'kardio' }
        ]
      },
      0: rest,
      4: rest
    }
  },
  {
    id: 'lean-cut',
    name: 'Bakar Lemak Terjaga',
    level: 'Menengah',
    weeks: 10,
    daysPerWeek: 5,
    place: 'Gym',
    goal: 'Turun lemak, otot tetap terjaga',
    summary:
      'Latihan beban tetap jadi inti, kardio ditambahkan secukupnya. Fokusnya mempertahankan otot selama defisit ringan.',
    schedule: {
      1: {
        title: 'Full Body + HIIT',
        focus: 'Beban lalu interval',
        minutes: 60,
        exercises: [
          { name: 'Back squat', sets: 4, reps: '8', group: 'kaki' },
          { name: 'Dumbbell bench press', sets: 3, reps: '10', group: 'dada' },
          { name: 'Cable row', sets: 3, reps: '12', group: 'punggung' },
          { name: 'Interval treadmill 30/90 detik', sets: 8, reps: '1 putaran', group: 'kardio' }
        ]
      },
      2: {
        title: 'Upper Metabolik',
        focus: 'Superset',
        minutes: 55,
        exercises: [
          { name: 'Lat pulldown', sets: 4, reps: '12', group: 'punggung' },
          { name: 'Incline dumbbell press', sets: 4, reps: '12', group: 'dada' },
          { name: 'Lateral raise', sets: 3, reps: '15', group: 'bahu' },
          { name: 'Rope pushdown', sets: 3, reps: '15', group: 'lengan' },
          { name: 'Sepeda statis santai', sets: 1, reps: '15 menit', group: 'kardio' }
        ]
      },
      3: {
        title: 'Kardio Ringan',
        focus: 'Zona 2',
        minutes: 40,
        exercises: [
          { name: 'Jalan cepat atau sepeda', sets: 1, reps: '35 menit', group: 'kardio' },
          { name: 'Peregangan penuh', sets: 1, reps: '5 menit', group: 'inti' }
        ]
      },
      5: {
        title: 'Lower Metabolik',
        focus: 'Kaki dan glute',
        minutes: 55,
        exercises: [
          { name: 'Romanian deadlift', sets: 4, reps: '10', group: 'kaki' },
          { name: 'Leg press', sets: 3, reps: '15', group: 'kaki' },
          { name: 'Walking lunge', sets: 3, reps: '14 / sisi', group: 'kaki' },
          { name: 'Hanging knee raise', sets: 3, reps: '15', group: 'inti' },
          { name: 'Rowing machine', sets: 1, reps: '10 menit', group: 'kardio' }
        ]
      },
      6: {
        title: 'Sirkuit Penuh',
        focus: 'Denyut jantung stabil tinggi',
        minutes: 45,
        exercises: [
          { name: 'Kettlebell swing', sets: 4, reps: '20', group: 'kaki' },
          { name: 'Push up', sets: 4, reps: '15', group: 'dada' },
          { name: 'Dumbbell row', sets: 4, reps: '12 / sisi', group: 'punggung' },
          { name: 'Battle rope', sets: 4, reps: '30 detik', group: 'kardio' },
          { name: 'Plank', sets: 3, reps: '60 detik', group: 'inti' }
        ]
      },
      0: rest,
      4: rest
    }
  }
];

export function getProgram(id) {
  return programs.find((p) => p.id === id) ?? null;
}

/** Sesi yang dijadwalkan untuk sebuah tanggal. Mengembalikan null kalau program belum dipilih. */
export function sessionForDate(programId, date = new Date()) {
  const program = getProgram(programId);
  if (!program) return null;
  return program.schedule[date.getDay()] ?? rest;
}

/** Ubah sesi jadi daftar tugas harian yang bisa dicentang. */
export function tasksFromSession(session) {
  if (!session || !session.exercises.length) return [];
  return session.exercises.map((ex, i) => ({
    id: `${i}-${ex.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    group: ex.group,
    done: false,
    // Satu slot kosong per set, siap diisi beban dan repetisi aktual.
    logs: Array.from({ length: ex.sets }, () => ({ kg: null, reps: null, done: false }))
  }));
}
