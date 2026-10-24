import type { PropsWithChildren } from 'react';
import { AppLoader } from '../../components/AppLoader';
import { ConfigurationError } from '../../components/ConfigurationError';
import { RemoteConfigContext } from './context';
import { useConfigurationQuery } from '../../hooks/useConfigurationQuery';

export const RemoteConfigProvider = ({ children }: PropsWithChildren) => {
  const { data, isError, refetch } = useConfigurationQuery();

  if (data) {
    return <RemoteConfigContext.Provider value={data}>{children}</RemoteConfigContext.Provider>;
  }
  return isError ? <ConfigurationError onRetry={() => void refetch()} /> : <AppLoader />;
};
