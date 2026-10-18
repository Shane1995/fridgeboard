import type { QueryClient } from '@tanstack/query-core';

export type RouterContext = {
  queryClient: QueryClient;
};

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof import('./index').router;
  }
}
