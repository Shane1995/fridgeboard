import type { WebConfiguration } from '../../hooks/useRemoteConfigContext/types';
import type { QueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import type { SessionContextValue } from '../../Context/Session/types';

export type TestProvidersProps = PropsWithChildren<{
  session: SessionContextValue;
  client?: QueryClient;
  config?: WebConfiguration;
}>;
