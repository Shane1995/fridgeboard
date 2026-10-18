import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'handlers',
          include: ['src/**/*.test.ts', 'scripts/build/**/*.test.ts', 'scripts/smoke/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'admin',
          include: ['scripts/admin/**/*.test.ts'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
});
