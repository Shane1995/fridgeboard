import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig/context';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { TEST_WEB_CONFIGURATION } from '../webConfiguration';

export const createSessionWrapper =
  (session: SessionContextValue, client: QueryClient) =>
  ({ children }: { children: ReactNode }) => (
    <RemoteConfigContext.Provider value={TEST_WEB_CONFIGURATION}>
      <QueryClientProvider client={client}>
        <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
      </QueryClientProvider>
    </RemoteConfigContext.Provider>
  );
