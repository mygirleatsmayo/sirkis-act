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
          input: 'rgb(var(--color-bg-input) / <alpha-value>)',
          overlay: 'var(--color-bg-overlay)',
          muted: 'var(--color-muted-bg)',
        },
        content: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          neutral: 'rgb(var(--color-text-neutral) / <alpha-value>)',
          subtle: 'rgb(var(--color-text-subtle) / <alpha-value>)',
          'on-brand': 'rgb(var(--color-text-on-brand) / <alpha-value>)',
        },
        accent: {
          brand: 'rgb(var(--color-brand) / <alpha-value>)',
          'brand-bg': 'var(--color-brand-bg)',
          'brand-accent': 'rgb(var(--color-brand-accent) / <alpha-value>)',
          opm: 'rgb(var(--color-opm) / <alpha-value>)',
          'opm-bg': 'var(--color-opm-bg)',
          returns: 'rgb(var(--color-returns) / <alpha-value>)',
          'returns-bg': 'var(--color-returns-bg)',
          'start-now': 'rgb(var(--color-start-now) / <alpha-value>)',
          loss: 'rgb(var(--color-loss) / <alpha-value>)',
          'loss-bg': 'var(--color-loss-bg)',
          'neutral-bg': 'var(--color-neutral-bg)',
          target: 'rgb(var(--color-target) / <alpha-value>)',
          'target-bg': 'var(--color-target-bg)',
          'self-funded': 'rgb(var(--color-self-funded) / <alpha-value>)',
          'self-funded-bg': 'var(--color-self-funded-bg)',
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
