/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#0d0d0d',
        panel: '#1a1a1a',
        elevated: '#262626',
        primary: '#ffffff',
        secondary: '#888888',
        muted: '#555555',
        bid: {
          DEFAULT: '#0ecb81',
          bg: 'rgba(14, 203, 129, 0.12)',
          flash: 'rgba(14, 203, 129, 0.22)',
        },
        ask: {
          DEFAULT: '#f6465d',
          bg: 'rgba(246, 70, 93, 0.12)',
          flash: 'rgba(246, 70, 93, 0.22)',
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
