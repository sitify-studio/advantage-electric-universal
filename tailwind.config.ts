import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'hero-sans': ['var(--font-hero-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'hero-script': ['var(--font-hero-script)', 'cursive'],
      },
      colors: {
        made: {
          navy: '#1a1a1a',
          mint: '#e5ebe6',
          peach: '#fdf2e9',
          lavender: '#f0efff',
          gray: '#f4f6f7',
          white: '#fafbfc',
        },
        lux: {
          matte: 'var(--lux-matte)',
          charcoal: 'var(--lux-charcoal)',
          warm: 'var(--lux-glow-warm)',
          cool: 'var(--lux-glow-cool)',
        },
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
    },
  },
  plugins: [],
}

export default config
