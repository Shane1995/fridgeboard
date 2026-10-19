import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { createContext, useContext, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useConfigurationQuery } from '../../hooks/useConfigurationQuery';
import { setConfiguration } from '../../services/configuration/setConfiguration';
import { MISSING_PROVIDER_MESSAGE } from './constants';

const RemoteConfigContext = createContext<WebConfiguration | null>(null);

export const RemoteConfigProvider = ({ children }: PropsWithChildren) => {
  const { data } = useConfigurationQuery();
  const configuration = data ?? DEFAULT_WEB_CONFIGURATION;

  useEffect(() => {
    setConfiguration(configuration);
  }, [configuration]);

  return (
    <RemoteConfigContext.Provider value={configuration}>{children}</RemoteConfigContext.Provider>
  );
};

export const useRemoteConfig = (): WebConfiguration => {
  const configuration = useContext(RemoteConfigContext);
  if (!configuration) {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  }
  return configuration;
};
