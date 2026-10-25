import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { queryClient } from '../../app/queryClient';
import { RemoteConfigProvider } from '../RemoteConfig';
import { SessionProvider } from '../Session';
import { ToastProvider } from '../Toast';

export const GlobalContextProvider = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <RemoteConfigProvider>
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </RemoteConfigProvider>
  </QueryClientProvider>
);
