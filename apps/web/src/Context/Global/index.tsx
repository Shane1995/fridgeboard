import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { queryClient } from '../../app/queryClient';
import { RemoteConfigProvider } from '../RemoteConfig';
import { SessionProvider } from '../Session';

export const GlobalContextProvider = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <RemoteConfigProvider>
      <SessionProvider>{children}</SessionProvider>
    </RemoteConfigProvider>
  </QueryClientProvider>
);
