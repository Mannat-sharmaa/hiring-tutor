/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          DEFAULT: '#1A1A2E', // base surface, deep indigo
        },
        slate: {
          deep: '#0F0F1A', // darkest background layer
        },
        violet: {
          DEFAULT: '#6C63FF', // primary accent, soft purple
        },
        cyan: {
          electric: '#00F2FE', // secondary accent, electric cyan
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6C63FF 0%, #00F2FE 100%)',
        'orb-gradient': 'radial-gradient(circle at 30% 30%, rgba(108,99,255,0.55), rgba(0,242,254,0.15) 60%, transparent 70%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(108, 99, 255, 0.35)',
        'glow-cyan': '0 0 40px rgba(0, 242, 254, 0.3)',
        card: '0 8px 30px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        glass: '20px',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.15) rotate(15deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        breathe: 'breathe 10s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
