import { getProgram } from '$lib/data/programs';

/** Nomor hari JavaScript (0 = Minggu) ke kode hari iCalendar. */
const icsDay = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** Karakter yang harus di-escape di dalam nilai properti iCalendar. */
function escapeText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

const encoder = new TextEncoder();

/**
 * Baris iCalendar dibatasi 75 oktet (bukan 75 karakter), sisanya dilipat dengan
 * spasi di depan. Karakter multi-byte seperti "—" tidak boleh terpotong di tengah.
 */
function foldLine(line) {
  if (encoder.encode(line).length <= 75) return line;

  const parts = [];
  let current = '';
  let bytes = 0;
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = ' ';
      bytes = 1;
      limit = 75;
    }
    current += char;
    bytes += size;
  }
  if (current) parts.push(current);
  return parts.join('\r\n');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/** Waktu lokal mengambang: tanpa Z dan tanpa TZID, jadi ikut zona waktu perangkat. */
function localStamp(d) {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

function utcStamp(d) {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Kemunculan pertama sebuah hari dalam seminggu, mulai dari hari ini. */
function nextOccurrence(dayOfWeek, hour, minute, from = new Date()) {
  const d = new Date(from);
  d.setHours(hour, minute, 0, 0);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  if (diff === 0 && d <= from) d.setDate(d.getDate() + 7);
  else d.setDate(d.getDate() + diff);
  return d;
}

function parseTime(time) {
  const [h, m] = String(time ?? '18:00').split(':').map(Number);
  return { hour: Number.isFinite(h) ? h : 18, minute: Number.isFinite(m) ? m : 0 };
}

/** Hari latihan sebuah program: [{ dayOfWeek, session }] tanpa hari istirahat. */
export function trainingDays(programId) {
  const program = getProgram(programId);
  if (!program) return [];
  return Object.entries(program.schedule)
    .map(([dow, session]) => ({ dayOfWeek: Number(dow), session }))
    .filter((d) => d.session?.exercises?.length)
    .sort((a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7));
}

function describe(session) {
  const lines = [`Fokus: ${session.focus}`, `Perkiraan ${session.minutes} menit`, ''];
  session.exercises.forEach((ex) => lines.push(`- ${ex.name} — ${ex.sets} x ${ex.reps}`));
  lines.push('', 'Dibuat oleh Gym Daily.');
  return lines.join('\n');
}

/**
 * Berkas .ics berisi satu acara berulang per hari latihan.
 * Apple Calendar dan Google Calendar sama-sama membaca format ini.
 */
export function buildIcs({ programId, time = '18:00', alarmMinutes = 30, weeks }) {
  const program = getProgram(programId);
  const days = trainingDays(programId);
  if (!program || !days.length) return null;

  const { hour, minute } = parseTime(time);
  const count = Math.max(1, weeks ?? program.weeks ?? 8);
  const stamp = utcStamp(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gym Daily//Jadwal Latihan//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(`Gym Daily — ${program.name}`)}`
  ];

  days.forEach(({ dayOfWeek, session }) => {
    const start = nextOccurrence(dayOfWeek, hour, minute);
    const end = new Date(start.getTime() + (session.minutes || 60) * 60_000);
    lines.push(
      'BEGIN:VEVENT',
      `UID:gym-daily-${programId}-${dayOfWeek}-${start.getTime()}@gym-daily`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${localStamp(start)}`,
      `DTEND:${localStamp(end)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${icsDay[dayOfWeek]};COUNT=${count}`,
      `SUMMARY:${escapeText(`Latihan: ${session.title}`)}`,
      `DESCRIPTION:${escapeText(describe(session))}`,
      'CATEGORIES:Olahraga',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `TRIGGER:-PT${Math.max(0, alarmMinutes)}M`,
      `DESCRIPTION:${escapeText(`Sebentar lagi ${session.title}`)}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Nama berkas unduhan yang aman untuk semua sistem berkas. */
export function icsFileName(programId) {
  const program = getProgram(programId);
  const slug = (program?.name ?? 'jadwal').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `gym-daily-${slug}.ics`;
}

/**
 * Tautan "tambah ke Google Calendar" untuk satu acara berulang di semua hari latihan.
 * Berguna di Android, tempat berkas .ics kadang tidak langsung dibuka Calendar.
 */
export function googleCalendarUrl({ programId, time = '18:00' }) {
  const program = getProgram(programId);
  const days = trainingDays(programId);
  if (!program || !days.length) return null;

  const { hour, minute } = parseTime(time);
  const first = days.reduce((earliest, d) => {
    const next = nextOccurrence(d.dayOfWeek, hour, minute);
    return !earliest || next < earliest.date ? { date: next, session: d.session } : earliest;
  }, null);

  const end = new Date(first.date.getTime() + (first.session.minutes || 60) * 60_000);
  const byday = days.map((d) => icsDay[d.dayOfWeek]).join(',');
  const count = Math.max(1, program.weeks ?? 8);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Latihan: ${program.name}`,
    dates: `${localStamp(first.date)}/${localStamp(end)}`,
    details: `Jadwal ${program.name} dari Gym Daily.\n${program.goal}`,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${byday};COUNT=${count}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
