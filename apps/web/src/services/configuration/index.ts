import { WebConfigurationSchema } from './webConfigurationSchema';
import type { WebConfiguration } from '../../hooks/useRemoteConfigContext/types';
import {
  CONFIGURATION_LOAD_FAILED,
  CONFIGURATION_PATH,
  CONFIGURATION_TIMEOUT_MS,
} from './constants';

export const getConfiguration = async (): Promise<WebConfiguration> => {
  const response = await fetch(CONFIGURATION_PATH, {
    signal: AbortSignal.timeout(CONFIGURATION_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(CONFIGURATION_LOAD_FAILED, { cause: response.status });
  }
  return WebConfigurationSchema.parse(await response.json());
};
