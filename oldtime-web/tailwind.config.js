/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#fff8f4',
          dim: '#e9d7c6',
          bright: '#fff8f4',
          lowest: '#ffffff',
          low: '#fff1e6',
          container: '#feebd9',
          high: '#f8e5d4',
          highest: '#f2dfce',
          variant: '#f2dfce',
        },
        'on-surface': {
          DEFAULT: '#231a0f',
          variant: '#54433a',
        },
        'inverse-surface': '#392e23',
        'inverse-on-surface': '#ffeedf',
        primary: {
          DEFAULT: '#6c2f00',
          container: '#8b4513',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#ffc29f',
        },
        secondary: {
          DEFAULT: '#735c00',
          container: '#fed65b',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#745c00',
        },
        outline: {
          DEFAULT: '#877369',
          variant: '#dac2b6',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        gold: '#d4af37',
        ink: '#2d2318',
        smoke: '#5a4d3f',
        stone: '#a89887',
        ochre: '#8b4513',
        burnt: '#a0522d',
        parchment: '#fff4df',
        antique: '#f8f5ee',
        linen: '#e5dcd1',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', '"Noto Serif SC"', '"Songti SC"', 'Georgia', 'serif'],
        literata: ['Literata', '"Noto Serif SC"', 'Georgia', 'serif'],
        bodoni: ['"Bodoni Moda"', '"Songti SC"', 'Georgia', 'serif'],
      },
      spacing: {
        page: '32px',
        gutter: '24px',
      },
      boxShadow: {
        'museum-sm': '0 2px 8px rgba(45, 35, 24, 0.06)',
        'museum-md': '0 4px 16px rgba(45, 35, 24, 0.08)',
        'museum-lg': '0 8px 24px rgba(45, 35, 24, 0.12)',
        'museum-xl': '0 14px 34px rgba(45, 35, 24, 0.18)',
        'museum-frame': '0 4px 16px rgba(45,35,24,0.08), 0 0 0 1px rgba(212,175,55,0.3)',
        'gold-glow': '0 0 20px rgba(212,175,55,0.25)',
      },
      keyframes: {
        'gold-shimmer': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'book-pulse': {
          '0%, 100%': { transform: 'rotateY(-8deg) translateY(0)' },
          '50%': { transform: 'rotateY(8deg) translateY(-10px)' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.3)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.2)' },
          '60%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'gold-shimmer': 'gold-shimmer 4s ease-in-out infinite',
        'book-pulse': 'book-pulse 2.2s ease-in-out infinite',
        'heart-beat': 'heart-beat 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
