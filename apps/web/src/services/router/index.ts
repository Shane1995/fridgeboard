import { createAppRouter } from './utils/createAppRouter';

export const router = createAppRouter();

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
