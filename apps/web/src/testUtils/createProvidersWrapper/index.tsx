import type { ReactNode } from 'react';
import type { SessionContextValue } from '../../Context/Session/types';
import type { WebConfiguration } from '../../hooks/useRemoteConfigContext/types';
import { TestProviders } from '../TestProviders';
import { TEST_WEB_CONFIGURATION } from '../webConfiguration';

export const createProvidersWrapper =
  (session: SessionContextValue, config: WebConfiguration = TEST_WEB_CONFIGURATION) =>
  ({ children }: { children: ReactNode }) => (
    <TestProviders session={session} config={config}>
      {children}
    </TestProviders>
  );
