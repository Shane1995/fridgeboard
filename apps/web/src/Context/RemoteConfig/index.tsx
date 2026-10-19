import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { createContext } from 'react';
import type { PropsWithChildren } from 'react';
import { useConfigurationQuery } from '../../hooks/useConfigurationQuery';

export const RemoteConfigContext = createContext<WebConfiguration | null>(null);

export const RemoteConfigProvider = ({ children }: PropsWithChildren) => {
  const { data } = useConfigurationQuery();
  const configuration = data ?? DEFAULT_WEB_CONFIGURATION;

  return (
    <RemoteConfigContext.Provider value={configuration}>{children}</RemoteConfigContext.Provider>
  );
};
