import { WebConfigurationSchema } from '@fridgeboard/contract/configuration/web';
import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import {
  WEB_FEATURE_FLAGS,
  DEFAULT_WEB_FLAGS,
} from '@fridgeboard/contract/configuration/flags/constants';
import { resolveServiceUrl } from '@fridgeboard/contract/configuration/resolveServiceUrl';
import {
  DEFAULT_WEB_PARAMS,
  DEFAULT_WEB_SERVICES,
  WEB_SERVICES,
} from '@fridgeboard/contract/configuration/services/constants';
import type { WebService } from '@fridgeboard/contract/configuration/services/types';
import { stripUnknownFlags } from '@fridgeboard/contract/configuration/stripUnknownFlags';
import { stripUnknownServices } from '@fridgeboard/contract/configuration/stripUnknownServices';
import { queryClient } from '../queryClient';
import {
  CONFIGURATION_PATH,
  CONFIGURATION_QUERY_KEY,
  CONFIGURATION_STALE_TIME_MS,
  CONFIGURATION_TIMEOUT_MS,
} from './constants';

export const getConfiguration = async (): Promise<WebConfiguration> => {
  try {
    const response = await fetch(CONFIGURATION_PATH, {
      signal: AbortSignal.timeout(CONFIGURATION_TIMEOUT_MS),
    });
    if (!response.ok) {
      return DEFAULT_WEB_CONFIGURATION;
    }
    const parsed = WebConfigurationSchema.safeParse(
      stripUnknownServices(
        stripUnknownFlags(await response.json(), WEB_FEATURE_FLAGS),
        WEB_SERVICES,
      ),
    );
    if (!parsed.success) {
      return DEFAULT_WEB_CONFIGURATION;
    }
    return {
      ...parsed.data,
      featureFlags: { ...DEFAULT_WEB_FLAGS, ...parsed.data.featureFlags },
      params: { ...DEFAULT_WEB_PARAMS, ...parsed.data.params },
      services: { ...DEFAULT_WEB_SERVICES, ...parsed.data.services },
    };
  } catch {
    return DEFAULT_WEB_CONFIGURATION;
  }
};

export const getServicePath = async (service: WebService): Promise<string> => {
  try {
    const configuration = await queryClient.ensureQueryData({
      queryKey: CONFIGURATION_QUERY_KEY,
      queryFn: getConfiguration,
      staleTime: CONFIGURATION_STALE_TIME_MS,
      revalidateIfStale: true,
    });
    return resolveServiceUrl(configuration.services[service], {}, configuration.params);
  } catch {
    return resolveServiceUrl(DEFAULT_WEB_SERVICES[service], {}, DEFAULT_WEB_PARAMS);
  }
};
