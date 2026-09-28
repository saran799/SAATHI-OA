/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--color-surface))',
        ink: 'rgb(var(--color-ink))',
        primary: 'rgb(var(--color-primary))',
        tint: 'rgb(var(--color-tint))',
        secondary: 'rgb(var(--color-secondary))',
        border: 'rgb(var(--color-border))',
        error: 'rgb(var(--color-error))',
        'error-tint': 'rgb(var(--color-error-tint))',
        'error-text': 'rgb(var(--color-error-text))',
        warning: 'rgb(var(--color-warning))',
        'warning-tint': 'rgb(var(--color-warning-tint))',
        'warning-text': 'rgb(var(--color-warning-text))',
        success: 'rgb(var(--color-success))',
        'success-tint': 'rgb(var(--color-success-tint))',
        'success-text': 'rgb(var(--color-success-text))',
      }
    },
  },
  plugins: [],
}
