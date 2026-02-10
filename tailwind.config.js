/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d0d0d',
          secondary: '#1a1a1a',
          tertiary: '#262626',
        },
        text: {
          primary: '#ffffff',
          secondary: '#888888',
          muted: '#555555',
        },
        bid: {
          DEFAULT: '#00c853',
          bg: 'rgba(0, 200, 83, 0.15)',
          flash: 'rgba(0, 200, 83, 0.4)',
        },
        ask: {
          DEFAULT: '#ff1744',
          bg: 'rgba(255, 23, 68, 0.15)',
          flash: 'rgba(255, 23, 68, 0.4)',
        },
      },
      fontFamily: {
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      keyframes: {
        flash: {
          '0%': { backgroundColor: 'var(--flash-color)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        flash: 'flash 300ms ease-out',
      },
    },
  },
  plugins: [],
}
