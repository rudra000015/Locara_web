import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Plus Jakarta Sans', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#0E0B08',
          subtle: '#140F0B',
          elevated: '#17120E',
          surface: '#211A14',
          card: '#1B140F',
          card2: '#261D16',
          cardHover: '#2E231B',
        },
        cream: {
          DEFAULT: '#F6EAD7',
          light: '#FBF5EC',
          dark: '#E9D9C1',
          muted: '#D8C4A7',
        },
        gold: {
          DEFAULT: '#C8893F',
          soft: '#E0AF62',
          muted: '#A87335',
          dark: '#8C5E28',
          faint: 'rgba(200, 137, 63, 0.12)',
        },
        emerald: {
          DEFAULT: '#1E5544',
          dark: '#12382D',
          light: '#2D7D64',
          faint: 'rgba(30, 85, 68, 0.15)',
        },
        primary: {
          DEFAULT: '#C8893F',
          light: '#E0AF62',
          dark: '#A87335',
        },
        fg: {
          DEFAULT: '#F6EAD7',
          secondary: '#D8C4A7',
          muted: '#9E8B75',
          faint: '#6E5D4B',
          dark: '#0E0B08',
        },
        border: {
          DEFAULT: 'rgba(246, 234, 215, 0.08)',
          light: 'rgba(246, 234, 215, 0.14)',
          accent: 'rgba(200, 137, 63, 0.3)',
          green: 'rgba(30, 85, 68, 0.35)',
        },
        status: {
          success: '#2A7256',
          warning: '#D9822B',
          error: '#C24136',
          info: '#2F6690',
        },
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        md: '14px',
        lg: '18px',
        xl: '22px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.5)',
        md: '0 6px 24px rgba(0, 0, 0, 0.6)',
        lg: '0 14px 44px rgba(0, 0, 0, 0.75)',
        glow: '0 0 30px rgba(200, 137, 63, 0.22)',
        'glow-sm': '0 0 14px rgba(200, 137, 63, 0.25)',
        'glow-emerald': '0 0 20px rgba(30, 85, 68, 0.3)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ticker': 'ticker 28s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;