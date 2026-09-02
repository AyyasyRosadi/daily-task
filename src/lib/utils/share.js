import { dateKey, monthLong, startOfWeek } from '$lib/utils/date';
import { exerciseNames, logVolume, topSet, trimNumber } from '$lib/utils/workout';

/**
 * Kartu ringkasan untuk dibagikan keluar aplikasi.
 *
 * Bagian ini sengaja dipecah dua: `summarize` menghitung angka dan sama sekali
 * tidak menyentuh DOM (jadi bisa diuji), `drawSummaryCard` menggambar hasilnya
 * ke canvas. Angkanya sendiri tidak dihitung ulang dengan cara baru — semuanya
 * memakai fungsi yang sudah dipakai halaman Progres, supaya kartu yang dibagikan
 * tidak pernah berbeda dari yang terlihat di layar.
 */

/** Rentang tanggal [awal, akhir] untuk periode, inklusif di kedua ujung. */
export function periodRange(period, today = new Date()) {
  if (period === 'bulan') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      from: dateKey(first),
      to: dateKey(last),
      label: `${monthLong[today.getMonth()]} ${today.getFullYear()}`
    };
  }
  const start = startOfWeek(today);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  return {
    from: dateKey(start),
    to: dateKey(end),
    label: sameMonth
      ? `${start.getDate()}–${end.getDate()} ${monthLong[end.getMonth()]}`
      : `${start.getDate()} ${monthLong[start.getMonth()]} – ${end.getDate()} ${monthLong[end.getMonth()]}`
  };
}

/**
 * Rekor yang baru pecah di dalam periode: beban terberat sebuah gerakan di
 * periode ini melebihi apa pun yang pernah tercatat sebelumnya. Gerakan yang
 * baru pertama kali dicatat tidak dihitung sebagai rekor baru — kalau tidak,
 * setiap gerakan baru akan selalu tampil sebagai pencapaian.
 */
export function newRecords(logs, from, to) {
  const all = logs ?? [];
  const before = all.filter((l) => l.id < from);
  const inside = all.filter((l) => l.id >= from && l.id <= to);
  const bestIn = (list, name) =>
    list.reduce((best, log) => {
      const task = (log.tasks ?? []).find((t) => t.name === name);
      const kg = Number(topSet(task)?.kg) || 0;
      return kg > best ? kg : best;
    }, 0);

  return exerciseNames(inside)
    .map((name) => ({ name, kg: bestIn(inside, name), previous: bestIn(before, name) }))
    .filter((r) => r.previous > 0 && r.kg > r.previous)
    .sort((a, b) => b.kg - a.kg);
}

/** Angka-angka untuk kartu ringkasan satu periode. */
export function summarize(logs, profile, { period = 'minggu', today = new Date() } = {}) {
  const range = periodRange(period, today);
  const inside = (logs ?? []).filter((l) => l.id >= range.from && l.id <= range.to);
  const sessions = inside.filter((l) => l.completed && !l.isRest);

  return {
    period,
    ...range,
    name: profile?.name?.trim() || '',
    sessions: sessions.length,
    volume: inside.reduce((sum, l) => sum + logVolume(l), 0),
    streak: Number(profile?.streak) || 0,
    records: newRecords(logs, range.from, range.to)
  };
}

/** Volume dalam ton kalau sudah besar, kalau belum tetap kilogram. */
export function volumeLabel(kg) {
  const n = Number(kg) || 0;
  return n >= 1000
    ? { value: trimNumber(n / 1000, 1), unit: 'ton diangkat' }
    : { value: trimNumber(n, 0), unit: 'kg diangkat' };
}

const card = {
  width: 1080,
  height: 1080,
  bg: '#12100E',
  fg: '#E7E3DA',
  mute: '#8C867C',
  yellow: '#F0B429',
  green: '#31A05F',
  line: 'rgba(231, 227, 218, 0.12)'
};

/**
 * Gambar kartu ringkasan 1080x1080 ke sebuah canvas.
 *
 * Warnanya dipatok gelap, tidak mengikuti tema aplikasi: kartu ini berakhir di
 * linimasa orang lain, bukan di dalam aplikasi, jadi tampilannya harus tetap
 * sama di mana pun dibuka.
 */
export function drawSummaryCard(canvas, summary) {
  canvas.width = card.width;
  canvas.height = card.height;
  const ctx = canvas.getContext('2d');
  const { width: W } = card;
  const pad = 88;

  ctx.fillStyle = card.bg;
  ctx.fillRect(0, 0, W, card.height);

  // Garis aksen tipis di tepi atas, penanda visual satu-satunya.
  ctx.fillStyle = card.yellow;
  ctx.fillRect(0, 0, W, 12);

  const text = (value, { x = pad, y, size, color = card.fg, weight = '400', align = 'left' }) => {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
    ctx.fillText(String(value), x, y);
  };

  text(summary.period === 'bulan' ? 'RINGKASAN BULAN' : 'RINGKASAN MINGGU', {
    y: 168,
    size: 34,
    color: card.mute,
    weight: '600'
  });
  text(summary.label, { y: 244, size: 62, weight: '700' });
  if (summary.name) {
    text(summary.name, { y: 306, size: 38, color: card.mute });
  }

  const stats = [
    { value: String(summary.sessions), unit: 'sesi selesai' },
    volumeLabel(summary.volume),
    { value: String(summary.streak), unit: 'hari beruntun' }
  ];

  let y = 430;
  for (const stat of stats) {
    text(stat.value, { y, size: 96, weight: '700', color: card.yellow });
    text(stat.unit, { x: W - pad, y, size: 38, color: card.mute, align: 'right' });
    y += 42;
    ctx.fillStyle = card.line;
    ctx.fillRect(pad, y, W - pad * 2, 2);
    y += 96;
  }

  if (summary.records.length) {
    text('REKOR BARU', { y: y + 24, size: 32, color: card.mute, weight: '600' });
    let ry = y + 96;
    for (const record of summary.records.slice(0, 3)) {
      text(record.name, { y: ry, size: 40 });
      text(`${trimNumber(record.kg)} kg`, {
        x: W - pad,
        y: ry,
        size: 40,
        color: card.green,
        weight: '700',
        align: 'right'
      });
      ry += 66;
    }
  }

  text('Gym Daily', { y: card.height - 72, size: 34, color: card.mute });
  return canvas;
}

/** Nama berkas yang aman dipakai di semua sistem berkas. */
export function cardFilename(summary) {
  return `gym-daily-${summary.period}-${summary.from}.png`;
}

/**
 * Bagikan kartu lewat Web Share API, atau unduh kalau tidak didukung.
 *
 * Hasilnya berupa cara yang benar-benar dipakai ('bagikan' | 'unduh' | 'batal'),
 * supaya pemanggilnya bisa memberi tahu pengguna apa yang barusan terjadi —
 * di desktop, tombol "Bagikan" yang diam-diam mengunduh berkas itu
 * membingungkan.
 */
export async function shareCard(canvas, summary) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Kartu gagal dibuat.');

  const filename = cardFilename(summary);
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Gym Daily — ${summary.label}` });
      return 'bagikan';
    } catch (err) {
      // Membatalkan lembar berbagi bukan kegagalan; jangan diam-diam mengunduh.
      if (err?.name === 'AbortError') return 'batal';
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return 'unduh';
}
