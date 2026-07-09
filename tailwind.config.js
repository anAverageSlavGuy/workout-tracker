/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#141414',
        'surface-high': '#1e1e1e',
        border: '#2a2a2a',
        accent: '#a3e635',
        'accent-dim': '#4d6b19',
        text: '#f5f5f5',
        muted: '#737373',
        dim: '#404040',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
}
