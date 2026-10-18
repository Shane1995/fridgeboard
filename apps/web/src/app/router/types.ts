import type { QueryClient } from '@tanstack/query-core';
import type { SessionContext } from '../../services/session/types';

export type RouterContext = {
  queryClient: QueryClient;
  session: SessionContext;
};

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof import('./index').router;
  }
}
