/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderColor: {
        theme: 'rgb(var(--color-border-default) / <alpha-value>)',
        subtle: 'var(--color-border-subtle)',
      },
      colors: {
        surface: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          glass: 'rgb(var(--color-bg-glass) / <alpha-value>)',
          card: 'rgb(var(--color-bg-card) / <alpha-value>)',
          input: 'rgb(var(--color-bg-input) / <alpha-value>)',
          overlay: 'var(--color-bg-overlay)',
          muted: 'var(--color-bg-muted)',
        },
        content: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          subtle: 'rgb(var(--color-text-subtle) / <alpha-value>)',
          'on-brand': 'rgb(var(--color-text-on-brand) / <alpha-value>)',
        },
        accent: {
          brand: 'rgb(var(--color-brand) / <alpha-value>)',
          'brand-bg': 'var(--color-brand-bg)',
          opm: 'rgb(var(--color-opm) / <alpha-value>)',
          returns: 'rgb(var(--color-returns) / <alpha-value>)',
          'returns-bg': 'var(--color-returns-bg)',
          'start-now': 'rgb(var(--color-start-now) / <alpha-value>)',
          'start-now-bg': 'var(--color-start-now-bg)',
          loss: 'rgb(var(--color-loss) / <alpha-value>)',
          'loss-bg': 'var(--color-loss-bg)',
          neutral: 'var(--color-neutral)',
        },
        interactive: {
          focus: 'rgb(var(--color-focus-ring) / <alpha-value>)',
          slider: 'rgb(var(--color-slider-accent) / <alpha-value>)',
          'slider-hover': 'rgb(var(--color-slider-accent-hover) / <alpha-value>)',
          'toggle-off': 'rgb(var(--color-toggle-off) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
