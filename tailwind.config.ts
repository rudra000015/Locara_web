import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#A85420',
          hover: '#873F17',
          light: '#FBF3EE',
          dark: '#6E3210',
          50: '#FDF8F5',
          100: '#FBF3EE',
          200: '#F5DECD',
          500: '#A85420',
          600: '#873F17',
          700: '#6E3210',
        },
        bg: {
          DEFAULT: '#FAFAF8',
          card: '#FFFFFF',
          subtle: '#F5F4F0',
          elevated: '#FFFFFF',
          header: 'rgba(255, 255, 255, 0.96)',
          nav: 'rgba(255, 255, 255, 0.98)',
          input: '#FFFFFF',
          pill: '#F5F4F0',
          pillHover: '#EAE8E2',
        },
        fg: {
          DEFAULT: '#171717',
          heading: '#171717',
          secondary: '#666666',
          muted: '#8A8A8A',
          faint: '#B5B5B5',
          price: '#171717',
          link: '#A85420',
        },
        border: {
          DEFAULT: '#E5E5E5',
          light: '#F0F0F0',
          active: '#A85420',
        },
        status: {
          success: '#16803C',
          'success-light': '#EBF8F0',
          warning: '#D97706',
          'warning-light': '#FEF3C7',
          error: '#DC2626',
          'error-light': '#FEE2E2',
          sale: '#D92D20',
          'sale-light': '#FEF3F2',
        },
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
        md: '0 4px 12px rgba(0, 0, 0, 0.06)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;