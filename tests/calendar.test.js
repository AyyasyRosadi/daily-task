import { beforeEach, describe, expect, it, vi } from 'vitest';

// calendar.js membaca program lewat store yang menyentuh Firebase, jadi lapisan
// itu diganti tiruan. Yang diuji di sini murni pembangkit iCalendar-nya.
const program = {
  id: 'uji',
  name: 'Program Uji',
  weeks: 8,
  goal: 'Menguji ekspor',
  schedule: {
    1: {
      title: 'Dorong A',
      focus: 'Dada, trisep',
      minutes: 55,
      exercises: [{ name: 'Barbell bench press', sets: 3, reps: '8' }]
    },
    3: {
      title: 'Tarik B',
      focus: 'Punggung',
      minutes: 50,
      exercises: [{ name: 'Barbell row', sets: 3, reps: '10' }]
    },
    5: { title: 'Istirahat', focus: 'Pemulihan', minutes: 0, exercises: [] }
  }
};

/** Program kedua untuk menguji urutan hari: Sabtu dan Minggu. */
const weekend = {
  id: 'akhir-pekan',
  name: 'Akhir Pekan',
  weeks: 4,
  goal: 'Uji urutan hari',
  schedule: {
    0: { title: 'Minggu', focus: 'Kaki', minutes: 40, exercises: [{ name: 'Back squat', sets: 3, reps: '8' }] },
    6: { title: 'Sabtu', focus: 'Dada', minutes: 40, exercises: [{ name: 'Push up', sets: 3, reps: '10' }] }
  }
};

vi.mock('$lib/stores/programs', () => ({
  resolveProgram: (id) => (id === 'uji' ? program : id === 'akhir-pekan' ? weekend : null)
}));

const { buildIcs, googleCalendarUrl, icsFileName, trainingDays } = await import(
  '$lib/utils/calendar'
);

const encoder = new TextEncoder();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-02T10:00:00'));
});

describe('trainingDays', () => {
  it('membuang hari tanpa gerakan', () => {
    expect(trainingDays('uji').map((d) => d.dayOfWeek)).toEqual([1, 3]);
  });

  it('menaruh Minggu di akhir, bukan di awal', () => {
    // Nomor hari JavaScript menaruh Minggu di 0; jadwal latihan membacanya terakhir.
    expect(trainingDays('akhir-pekan').map((d) => d.dayOfWeek)).toEqual([6, 0]);
  });

  it('mengembalikan daftar kosong untuk program tak dikenal', () => {
    expect(trainingDays('tidak-ada')).toEqual([]);
  });
});

describe('buildIcs', () => {
  it('membuat satu VEVENT berulang per hari latihan', () => {
    const ics = buildIcs({ programId: 'uji', time: '18:30' });
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=8');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=WE;COUNT=8');
  });

  it('membuka dan menutup setiap blok dengan seimbang', () => {
    const ics = buildIcs({ programId: 'uji' });
    for (const tag of ['VCALENDAR', 'VEVENT', 'VALARM']) {
      expect(ics.match(new RegExp(`BEGIN:${tag}`, 'g')).length).toBe(
        ics.match(new RegExp(`END:${tag}`, 'g')).length
      );
    }
  });

  it('memakai CRLF dan waktu lokal mengambang tanpa Z', () => {
    const ics = buildIcs({ programId: 'uji', time: '18:30' });
    expect(ics).toContain('\r\n');
    expect(ics).toMatch(/DTSTART:\d{8}T183000\r\n/);
    expect(ics).not.toMatch(/DTSTART:[^\r\n]*Z/);
  });

  it('memakai sesi hari ini kalau jamnya belum lewat', () => {
    // 2026-09-02 pukul 10:00 adalah Rabu. Sesi Rabu 18:30 masih di depan,
    // jadi tidak boleh dilempar ke minggu berikutnya.
    const ics = buildIcs({ programId: 'uji', time: '18:30' });
    expect(ics).toContain('DTSTART:20260902T183000');
    expect(ics).toContain('DTSTART:20260907T183000'); // Senin berikutnya
  });

  it('melompat ke minggu depan kalau jam sesinya sudah lewat', () => {
    vi.setSystemTime(new Date('2026-09-02T20:00:00'));
    const ics = buildIcs({ programId: 'uji', time: '18:30' });
    expect(ics).toContain('DTSTART:20260909T183000');
    expect(ics).not.toContain('DTSTART:20260902T183000');
  });

  it('melipat baris pada 75 oktet, bukan 75 karakter', () => {
    const ics = buildIcs({ programId: 'uji' });
    const tooLong = ics.split('\r\n').filter((l) => encoder.encode(l).length > 75);
    expect(tooLong).toEqual([]);
  });

  it('membuka lipatan kembali menjadi teks utuh', () => {
    const unfolded = buildIcs({ programId: 'uji' }).replace(/\r\n /g, '');
    expect(unfolded).toContain('Barbell bench press — 3 x 8');
  });

  it('meng-escape koma dan titik koma sesuai RFC 5545', () => {
    const unfolded = buildIcs({ programId: 'uji' }).replace(/\r\n /g, '');
    expect(unfolded).toContain('Fokus: Dada\\, trisep');
  });

  it('menyisipkan alarm sebelum sesi dimulai', () => {
    expect(buildIcs({ programId: 'uji', alarmMinutes: 45 })).toContain('TRIGGER:-PT45M');
  });

  it('mengembalikan null kalau program tidak ada atau tanpa hari latihan', () => {
    expect(buildIcs({ programId: 'tidak-ada' })).toBeNull();
    expect(buildIcs({ programId: null })).toBeNull();
  });
});

describe('googleCalendarUrl', () => {
  it('menggabungkan seluruh hari latihan dalam satu RRULE', () => {
    const url = googleCalendarUrl({ programId: 'uji', time: '18:30' });
    expect(decodeURIComponent(url)).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=8');
  });

  it('mulai dari hari latihan terdekat', () => {
    // Rabu 2026-09-02 18:30 masih di depan, jadi itulah kemunculan pertama.
    const url = googleCalendarUrl({ programId: 'uji', time: '18:30' });
    expect(decodeURIComponent(url)).toContain('dates=20260902T183000');
  });

  it('mengembalikan null untuk program tak dikenal', () => {
    expect(googleCalendarUrl({ programId: 'tidak-ada' })).toBeNull();
  });
});

describe('icsFileName', () => {
  it('membuat nama berkas yang aman', () => {
    expect(icsFileName('uji')).toBe('gym-daily-program-uji.ics');
  });

  it('punya cadangan saat program tidak ditemukan', () => {
    expect(icsFileName('tidak-ada')).toBe('gym-daily-jadwal.ics');
  });
});
