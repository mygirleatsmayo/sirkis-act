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
      colors: {
        surface: {
          DEFAULT: 'var(--color-bg)',
          glass: 'var(--color-bg-glass)',
          card: 'var(--color-bg-card)',
          input: 'var(--color-bg-input)',
          overlay: 'var(--color-bg-overlay)',
          muted: 'var(--color-bg-muted)',
        },
        border: {
          theme: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
        },
        content: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
          'on-brand': 'var(--color-text-on-brand)',
        },
        accent: {
          brand: 'var(--color-brand)',
          'brand-bg': 'var(--color-brand-bg)',
          opm: 'var(--color-opm)',
          returns: 'var(--color-returns)',
          'returns-bg': 'var(--color-returns-bg)',
          'start-now': 'var(--color-start-now)',
          'start-now-bg': 'var(--color-start-now-bg)',
          loss: 'var(--color-loss)',
          'loss-bg': 'var(--color-loss-bg)',
          neutral: 'var(--color-neutral)',
        },
        interactive: {
          focus: 'var(--color-focus-ring)',
          slider: 'var(--color-slider-accent)',
          'slider-hover': 'var(--color-slider-accent-hover)',
          'toggle-off': 'var(--color-toggle-off)',
        },
      },
    },
  },
  plugins: [],
};
