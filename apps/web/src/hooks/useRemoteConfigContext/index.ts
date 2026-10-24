import type { WebConfiguration } from './types';
import { useContext } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig/context';
import { MISSING_PROVIDER_MESSAGE } from './constants';

export const useRemoteConfigContext = (): WebConfiguration => {
  const configuration = useContext(RemoteConfigContext);
  if (!configuration) {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  }
  return configuration;
};
