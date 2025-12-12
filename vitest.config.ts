import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['lib/*'],
      reporter: ['json-summary', 'text', 'lcov'],
    },
  },
});
