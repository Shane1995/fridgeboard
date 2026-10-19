import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { CONFIGURATION_KEY } from '../constants';
import { configurationStore } from '../store';

export const getStoredConfiguration = (): WebConfiguration =>
  configurationStore.get(CONFIGURATION_KEY) ?? DEFAULT_WEB_CONFIGURATION;
