import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: { __BUILD_SHA__: JSON.stringify('test123') },
  resolve: {
    alias: {
      'virtual:pwa-register': fileURLToPath(
        new URL('./src/vitest.pwaRegister.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest.setup.ts'],
  },
});
