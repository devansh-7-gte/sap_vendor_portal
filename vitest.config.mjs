import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    // Backend tests are run separately with Jest (backend/tests)
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'node',
  },
});
