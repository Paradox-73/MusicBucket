/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#800080',
          dark: '#660066',
          light: '#990099',
        },
        secondary: {
          DEFAULT: '#00cccc',
          dark: '#009999',
          light: '#33ffff',
        },
        gradient: {
          'primary-to-secondary': 'from-[#800080] to-[#00cccc]',
          'secondary-to-primary': 'from-[#00cccc] to-[#800080]',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
