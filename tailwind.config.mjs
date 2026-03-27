/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        xl: '1240px',
        '2xl': '1240px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#050F68',
          light: '#0A1A8C',
          dark: '#030A45',
        },
        secondary: {
          DEFAULT: '#FB9500',
          light: '#FCA82E',
          dark: '#C97700',
        },
        accent: {
          light: '#E4EFFC',
          DEFAULT: '#B0C4E8',
          dark: '#8FA8D4',
        },
      },
    },
  },
  plugins: [],
}
