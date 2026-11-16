import { useMemo, useState, type PropsWithChildren } from 'react';
import { AppLoader } from '../../components/AppLoader';
import { ConfigurationError } from '../../components/ConfigurationError';
import { RemoteConfigContext } from './context';
import { useConfigurationQuery } from '../../hooks/useConfigurationQuery';
import { applyFlagOverrides } from '../../services/featureFlagOverrides/applyFlagOverrides';
import { readFlagOverrides } from '../../services/featureFlagOverrides/readFlagOverrides';

export const RemoteConfigProvider = ({ children }: PropsWithChildren) => {
  const { data, isError, refetch } = useConfigurationQuery();
  const [overrides] = useState(readFlagOverrides);
  const configuration = useMemo(
    () =>
      data && {
        ...data,
        featureFlags: applyFlagOverrides({ flags: data.featureFlags, overrides }),
      },
    [data, overrides],
  );

  if (configuration) {
    return (
      <RemoteConfigContext.Provider value={configuration}>{children}</RemoteConfigContext.Provider>
    );
  }
  return isError ? <ConfigurationError onRetry={() => void refetch()} /> : <AppLoader />;
};
