import { defineConfig } from 'vitest/config';
import { HANDLER_ENV } from './api/integration/dynamodbLocal/constants.ts';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['api/integration/**/*.test.ts'],
          globalSetup: ['./api/integration/dynamodbLocal/globalSetup/index.ts'],
          setupFiles: ['./api/integration/dynamodbLocal/setup/index.ts'],
          env: HANDLER_ENV,
          testTimeout: 15_000,
        },
      },
    ],
  },
});
