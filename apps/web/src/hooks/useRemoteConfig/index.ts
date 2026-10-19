import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { useContext } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { MISSING_PROVIDER_MESSAGE } from './constants';

export const useRemoteConfig = (): WebConfiguration => {
  const configuration = useContext(RemoteConfigContext);
  if (!configuration) {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  }
  return configuration;
};
