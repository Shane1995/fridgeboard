import { WebConfigurationSchema } from '@fridgeboard/contract/configuration/web';
import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import {
  WEB_FEATURE_FLAGS,
  DEFAULT_WEB_FLAGS,
} from '@fridgeboard/contract/configuration/flags/constants';
import { stripUnknownFlags } from '@fridgeboard/contract/configuration/stripUnknownFlags';
import { CONFIGURATION_PATH } from './constants';

export const getConfiguration = async (): Promise<WebConfiguration> => {
  try {
    const response = await fetch(CONFIGURATION_PATH);
    if (!response.ok) {
      return DEFAULT_WEB_CONFIGURATION;
    }
    const parsed = WebConfigurationSchema.safeParse(
      stripUnknownFlags(await response.json(), WEB_FEATURE_FLAGS),
    );
    if (!parsed.success) {
      return DEFAULT_WEB_CONFIGURATION;
    }
    return {
      ...parsed.data,
      featureFlags: { ...DEFAULT_WEB_FLAGS, ...parsed.data.featureFlags },
    };
  } catch {
    return DEFAULT_WEB_CONFIGURATION;
  }
};
