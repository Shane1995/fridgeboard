import { defineConfig } from 'vitest/config';
import { HANDLER_ENV } from './test/dynamodbLocal/constants.ts';

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
          exclude: ['**/node_modules/**', 'src/**/*.integration.test.ts'],
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
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['src/**/*.integration.test.ts'],
          globalSetup: ['./test/dynamodbLocal/globalSetup/index.ts'],
          env: HANDLER_ENV,
          testTimeout: 15_000,
        },
      },
    ],
  },
});
