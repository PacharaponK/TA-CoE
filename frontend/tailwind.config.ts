import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      /* ── shadcn CSS-var bridge (Tailwind v3 / HSL approach) ── */
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          active: '#005bab',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        /* ── Notion semantic colours (direct hex, for custom components) ── */
        canvas: '#ffffff',
        'canvas-soft': '#f6f5f4',
        surface: '#ffffff',
        hairline: '#e6e6e6',
        ink: '#000000',
        'ink-secondary': '#31302e',
        'ink-muted': '#615d59',
        'ink-faint': '#a39e98',
        'on-primary': '#ffffff',

        /* Decorative sticker palette */
        'accent-sky': '#62aef0',
        'accent-purple': '#d6b6f6',
        'accent-purple-deep': '#391c57',
        'accent-pink': '#ff64c8',
        'accent-orange': '#dd5b00',
        'accent-orange-deep': '#793400',
        'accent-teal': '#2a9d99',
        'accent-green': '#1aae39',
        'accent-brown': '#523410',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'var(--font-thai)',
          'Inter',
          '-apple-system',
          'system-ui',
          'Segoe UI',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        geist: [
          'var(--font-geist-sans)',
          'Geist',
          'var(--font-thai)',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-1': ['60px', { lineHeight: '1.12', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-2': ['48px', { lineHeight: '1.14', letterSpacing: '-0.018em', fontWeight: '700' }],
        'heading-1': ['38px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'heading-2': ['26px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-3': ['21px', { lineHeight: '1.35', letterSpacing: '-0.005em', fontWeight: '600' }],
        title:       ['18px', { lineHeight: '1.45', letterSpacing: '0', fontWeight: '600' }],
        'body-md':   ['16px', { lineHeight: '1.6',  letterSpacing: '0' }],
        'body-sm':   ['14.5px', { lineHeight: '1.55', letterSpacing: '0' }],
        button:      ['15px', { lineHeight: '1.4',  letterSpacing: '0', fontWeight: '500' }],
        caption:     ['13px', { lineHeight: '1.5',  letterSpacing: '0' }],
        eyebrow:     ['12px', { lineHeight: '1.4',  letterSpacing: '0.04em', fontWeight: '600' }],
      },
      spacing: {
        xxs: '4px', xs: '8px', sm: '12px', md: '16px',
        lg: '24px', xl: '28px', xxl: '32px',
      },
      boxShadow: {
        soft: '0 0.175px 1.041px rgba(0,0,0,0.01), 0 0.8px 2.925px rgba(0,0,0,0.02), 0 2.025px 7.847px rgba(0,0,0,0.027), 0 4px 18px rgba(0,0,0,0.04)',
        elevated: '0 0.5px 2px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.03), 0 8px 20px rgba(0,0,0,0.04), 0 23px 52px rgba(0,0,0,0.05)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
