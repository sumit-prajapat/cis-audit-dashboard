/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        bg:      '#0a0e1a',
        surface: '#111827',
        card:    '#1a2235',
        border:  '#1e2d45',
        accent:  '#00ff88',
        cyan:    '#00d4ff',
        red:     '#ff4566',
        yellow:  '#ffc940',
        muted:   '#4a6080',
        text:    '#e2e8f0',
      }
    }
  },
  plugins: []
}
