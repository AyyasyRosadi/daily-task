/**
 * Perhitungan jarak dan rute untuk sesi lari/sepeda.
 *
 * Semua fungsi di sini murni: tidak menyentuh Geolocation, DOM, maupun waktu
 * sekarang. Titik GPS masuk sebagai angka biasa dan keluar sebagai angka biasa,
 * supaya seluruh bagian yang gampang salah — penyaringan titik, akumulasi jarak,
 * penyederhanaan rute — bisa diuji tanpa perlu benar-benar berlari.
 *
 * Bentuk satu titik: { t, lat, lng, acc }
 *   t   detik sejak sesi dimulai (bukan epoch — angkanya jauh lebih kecil)
 *   acc akurasi horizontal dalam meter, apa adanya dari Geolocation
 */

const EARTH_RADIUS_M = 6_371_008.8;
const rad = (deg) => (deg * Math.PI) / 180;

/** Jarak dua titik di permukaan bumi, dalam meter. */
export function haversine(a, b) {
  if (!a || !b) return 0;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Batas kewajaran per jenis aktivitas, dipakai untuk membuang lompatan GPS.
 * Angkanya sengaja longgar — ini penyaring ngawur, bukan penilai performa.
 */
export const activityTypes = {
  lari: { label: 'Lari', icon: '🏃', maxSpeed: 12, accuracy: 40 },
  sepeda: { label: 'Sepeda', icon: '🚴', maxSpeed: 30, accuracy: 50 }
};

/**
 * Apakah sebuah titik baru layak dipakai menambah jarak.
 *
 * Tiga hal yang dibuang, dan semuanya sering terjadi di dunia nyata:
 *
 * - Akurasi buruk. Di antara gedung, GPS sering melaporkan akurasi 100 m lebih;
 *   memakainya membuat jarak melonjak padahal orangnya diam.
 * - Lompatan yang tidak mungkin. Titik yang menyiratkan kecepatan di atas batas
 *   jenis aktivitas hampir pasti pantulan sinyal, bukan sprint.
 * - Gerak kecil di bawah ketidakpastian alatnya sendiri. Berdiri diam di lampu
 *   merah tetap menghasilkan titik yang bergoyang beberapa meter; kalau
 *   dijumlahkan, satu sesi diam bisa "menempuh" ratusan meter.
 */
export function acceptPoint(previous, next, type = 'lari') {
  const limits = activityTypes[type] ?? activityTypes.lari;
  if (!next || !Number.isFinite(next.lat) || !Number.isFinite(next.lng)) return false;
  const acc = Number(next.acc);
  if (Number.isFinite(acc) && acc > limits.accuracy) return false;
  if (!previous) return true;

  const meters = haversine(previous, next);
  const seconds = next.t - previous.t;
  if (seconds <= 0) return false;
  if (meters < Math.max(5, Math.min(acc || 0, limits.accuracy) / 2)) return false;
  return meters / seconds <= limits.maxSpeed;
}

/** Total jarak sederet titik, dalam meter. */
export function trackDistance(points) {
  const list = points ?? [];
  let total = 0;
  for (let i = 1; i < list.length; i++) total += haversine(list[i - 1], list[i]);
  return total;
}

/**
 * Kecepatan sesaat dari beberapa titik terakhir, dalam meter per detik.
 *
 * Sengaja tidak memakai `coords.speed` bawaan Geolocation: nilainya sering null
 * di perangkat tanpa sensor kecepatan, dan sangat berisik saat ada. Rata-rata
 * jendela beberapa titik terakhir jauh lebih tenang dipandang.
 */
export function currentSpeed(points, window = 5) {
  const list = (points ?? []).slice(-Math.max(2, window));
  if (list.length < 2) return 0;
  const seconds = list[list.length - 1].t - list[0].t;
  if (seconds <= 0) return 0;
  return trackDistance(list) / seconds;
}

/** Pace dalam detik per kilometer. Nol jarak berarti belum ada pace. */
export function paceSeconds(meters, seconds) {
  const m = Number(meters) || 0;
  const s = Number(seconds) || 0;
  if (m < 1 || s <= 0) return 0;
  return (s / m) * 1000;
}

/** Pace sebagai "5:30 /km". Tanpa jarak, tanda hubung. */
export function paceLabel(meters, seconds) {
  const pace = paceSeconds(meters, seconds);
  if (!pace || !Number.isFinite(pace)) return '—';
  const total = Math.round(pace);
  const menit = Math.floor(total / 60);
  const detik = total % 60;
  return `${menit}:${String(detik).padStart(2, '0')} /km`;
}

/** Kecepatan rata-rata sebagai "24.3 km/j". */
export function speedLabel(meters, seconds) {
  const s = Number(seconds) || 0;
  if (s <= 0) return '—';
  const kmh = ((Number(meters) || 0) / 1000 / s) * 3600;
  return `${kmh.toFixed(1)} km/j`;
}

/** Jarak sebagai kilometer dua desimal, atau meter bulat kalau masih pendek. */
export function distanceLabel(meters) {
  const m = Number(meters) || 0;
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
}

/** Durasi sebagai "1:04:09" atau "24:09". */
export function durationLabel(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const jam = Math.floor(total / 3600);
  const menit = Math.floor((total % 3600) / 60);
  const detik = total % 60;
  const mm = String(menit).padStart(jam ? 2 : 1, '0');
  const ss = String(detik).padStart(2, '0');
  return jam ? `${jam}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Jarak tegak lurus sebuah titik ke garis a-b, dalam meter. */
function perpendicular(point, a, b) {
  // Di jarak sependek satu rute lari, proyeksi datar sudah cukup teliti dan
  // jauh lebih murah daripada perhitungan bola penuh.
  const scale = Math.cos(rad((a.lat + b.lat) / 2));
  const toXY = (p) => ({ x: p.lng * scale, y: p.lat });
  const P = toXY(point);
  const A = toXY(a);
  const B = toXY(b);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return haversine(point, a);
  const t = Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / lenSq));
  const proj = { lat: A.y + t * dy, lng: (A.x + t * dx) / scale };
  return haversine(point, proj);
}

/**
 * Sederhanakan rute dengan Ramer-Douglas-Peucker.
 *
 * Ini bukan penghematan yang sifatnya opsional: satu jam perekaman 1 Hz itu
 * 3600 titik, dan satu dokumen Firestore dibatasi 1 MiB. Toleransi 8 meter
 * memangkas jauh lebih banyak titik daripada yang terlihat di layar seukuran
 * ponsel. Jarak tidak ikut berubah: jarak dihitung dari titik mentah, hasil
 * penyederhanaan hanya dipakai untuk menggambar.
 */
export function simplify(points, tolerance = 8) {
  const list = points ?? [];
  if (list.length <= 2) return [...list];

  let farthest = 0;
  let index = 0;
  for (let i = 1; i < list.length - 1; i++) {
    const d = perpendicular(list[i], list[0], list[list.length - 1]);
    if (d > farthest) {
      farthest = d;
      index = i;
    }
  }

  if (farthest <= tolerance) return [list[0], list[list.length - 1]];
  return [
    ...simplify(list.slice(0, index + 1), tolerance),
    ...simplify(list.slice(index), tolerance).slice(1)
  ];
}

/** Titik dipadatkan sebelum disimpan: lima desimal sudah sekitar satu meter. */
export function compactPoints(points, tolerance = 8) {
  return simplify(points, tolerance).map((p) => ({
    t: Math.round(p.t),
    lat: Number(p.lat.toFixed(5)),
    lng: Number(p.lng.toFixed(5))
  }));
}

/**
 * Rute sebagai path SVG di dalam kotak `size` x `size`.
 *
 * Bujur dikalikan cos(lintang) supaya rute tidak tampak gepeng — satu derajat
 * bujur di Jakarta jauh lebih pendek daripada satu derajat lintang. Sisi
 * terpanjang mengisi kotak dan sisi lainnya ditengahkan, jadi bentuk rutenya
 * tetap proporsional berapa pun bentangnya.
 */
export function routePath(points, size = 100, padding = 6) {
  const list = (points ?? []).filter((p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng));
  if (list.length < 2) return null;

  const lats = list.map((p) => p.lat);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const scale = Math.cos(rad(midLat));
  const xs = list.map((p) => p.lng * scale);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...lats);
  const maxY = Math.max(...lats);

  const inner = size - padding * 2;
  const span = Math.max(maxX - minX, maxY - minY);
  // Rute yang praktis satu titik: skala nol, semuanya jatuh di tengah kotak.
  const k = span > 0 ? inner / span : 0;
  const offsetX = padding + (inner - (maxX - minX) * k) / 2;
  const offsetY = padding + (inner - (maxY - minY) * k) / 2;

  const coords = list.map((p, i) => ({
    x: offsetX + (xs[i] - minX) * k,
    // Sumbu y SVG menghadap ke bawah sementara lintang menghadap ke atas.
    y: size - (offsetY + (lats[i] - minY) * k)
  }));

  return {
    d: coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' '),
    start: coords[0],
    end: coords[coords.length - 1]
  };
}
