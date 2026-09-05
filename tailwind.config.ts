import type { Config } from 'tailwindcss';

/**
 * DevYatra India design tokens.
 * Palette: warm saffron, deep maroon, cream, white, subtle gold.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        maroon: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d8',
          300: '#f2a8b8',
          400: '#e87693',
          500: '#d94a6f',
          600: '#c22a55',
          700: '#a11f46',
          800: '#7a1436',
          900: '#5c0f2a',
        },
        gold: {
          400: '#e8c766',
          500: '#d4af37',
          600: '#b8941f',
        },
        cream: '#fdfaf3',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(92, 15, 42, 0.12)',
        'card-hover': '0 12px 32px -6px rgba(92, 15, 42, 0.20)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
