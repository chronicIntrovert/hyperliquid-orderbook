/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'tests'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/setupTests.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/hooks/useOrderbookSocket.ts',
        'src/lib/queryClient.ts',
        'src/config/env.ts',
        'src/types/index.ts',
        'src/components/Orderbook/index.ts',
      ],
      reporter: ['text', 'text-summary', 'html'],
      /** Enforce 80% target per .cursor/rules/05-keep-tests-in-sync.mdc */
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
})
