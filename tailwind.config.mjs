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
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', '-apple-system', 'sans-serif'],
      },
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
        ink: '#1F2433',
        body: '#5B6478',
        surface: '#F3F4F6',
      },
    },
  },
  plugins: [],
}
