import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom' for browser tests
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'], // coverage reporters
      exclude: ['**/*.spec.ts'], // exclude test files
    },
    setupFiles: 'vitest.setup.ts', // optional: setup file
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'], // include test files
    clearMocks: true,
  },
});