/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px (was 12px)
        sm: ['0.9375rem', { lineHeight: '1.375rem' }], // 15px (was 14px)
        base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        xl: ['1.25rem', { lineHeight: '1.875rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eefcf5',
          100: '#d6f7e5',
          200: '#adeecc',
          300: '#78dfad',
          400: '#3fc78b',
          500: '#1aab6f', // primary teal-emerald — health / vitality
          600: '#0f8a5b',
          700: '#0e6d4a',
          800: '#0f573d',
          900: '#0e4834',
          950: '#06291d',
        },
        signal: {
          amber: '#f5a524',
          rose: '#f43f5e',
          sky: '#3b9df5',
        },
        surface: {
          light: '#f7f9f8',
          dark: '#0a0f0d',
          darkcard: '#111714',
        },
      },
      backgroundImage: {
        'aurora-light': 'radial-gradient(60% 50% at 20% 0%, rgba(26,171,111,0.16) 0%, rgba(26,171,111,0) 60%), radial-gradient(50% 40% at 90% 10%, rgba(59,157,245,0.14) 0%, rgba(59,157,245,0) 60%)',
        'aurora-dark': 'radial-gradient(60% 50% at 20% 0%, rgba(26,171,111,0.22) 0%, rgba(26,171,111,0) 60%), radial-gradient(50% 40% at 90% 10%, rgba(59,157,245,0.16) 0%, rgba(59,157,245,0) 60%)',
        'grid-light': 'linear-gradient(rgba(15,23,20,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,20,0.04) 1px, transparent 1px)',
        'grid-dark': 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(6, 41, 29, 0.10)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        glow: '0 0 40px -8px rgba(26,171,111,0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
