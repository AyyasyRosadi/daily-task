/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte}'],
  theme: {
    extend: {
      colors: {
        rubber: '#0F1412',
        deck: '#171E1B',
        rack: '#212A26',
        chalk: '#F1EEE7',
        mute: '#8FA098',
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
