/**
 * Warna netral ditulis sebagai channel RGB di dalam CSS variable supaya tema
 * terang dan gelap bisa ditukar tanpa mengubah satu pun kelas di komponen.
 * Sintaks `<alpha-value>` menjaga modifier opacity Tailwind tetap berfungsi,
 * misalnya `bg-deck/50`.
 *
 * Warna `plate` sengaja tetap hex: itu warna aksen merek yang sama di kedua tema.
 */
const neutral = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte}'],
  theme: {
    extend: {
      colors: {
        rubber: neutral('rubber'),
        deck: neutral('deck'),
        rack: neutral('rack'),
        chalk: neutral('chalk'),
        mute: neutral('mute'),
        // Garis pemisah: putih tipis di tema gelap, hitam tipis di tema terang.
        hair: 'rgb(var(--c-hair) / <alpha-value>)',
        plate: {
          red: '#D6353B',
          blue: '#2C6BE0',
          yellow: '#F0B429',
          green: '#31A05F',
          white: '#E7E3DA'
        }
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
