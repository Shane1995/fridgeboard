import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { SessionContext } from '../../Context/Session';
import type { TestProvidersProps } from './types';

export const TestProviders = ({ session, client, children }: TestProvidersProps) => {
  const [ownClient] = useState(() => new QueryClient());
  return (
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={client ?? ownClient}>{children}</QueryClientProvider>
      </SessionContext.Provider>
    </RemoteConfigContext.Provider>
  );
};
