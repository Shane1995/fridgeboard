import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { createContext } from 'react';
import type { PropsWithChildren } from 'react';
import { AppLoader } from '../../components/AppLoader';
import { ConfigurationError } from '../../components/ConfigurationError';
import { useConfigurationQuery } from '../../hooks/useConfigurationQuery';

export const RemoteConfigContext = createContext<WebConfiguration | null>(null);

export const RemoteConfigProvider = ({ children }: PropsWithChildren) => {
  const { data, isError, refetch } = useConfigurationQuery();

  if (data) {
    return <RemoteConfigContext.Provider value={data}>{children}</RemoteConfigContext.Provider>;
  }
  return isError ? <ConfigurationError onRetry={() => void refetch()} /> : <AppLoader />;
};
