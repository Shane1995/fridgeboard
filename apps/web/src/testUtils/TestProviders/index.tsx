import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig/context';
import { SessionContext } from '../../Context/Session';
import { TEST_WEB_CONFIGURATION } from '../webConfiguration';
import type { TestProvidersProps } from './types';

export const TestProviders = ({
  session,
  client,
  config = TEST_WEB_CONFIGURATION,
  children,
}: TestProvidersProps) => {
  const [ownClient] = useState(() => new QueryClient());
  return (
    <RemoteConfigContext.Provider value={config}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={client ?? ownClient}>{children}</QueryClientProvider>
      </SessionContext.Provider>
    </RemoteConfigContext.Provider>
  );
};
