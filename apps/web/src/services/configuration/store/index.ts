import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { CONFIGURATION_KEY } from '../constants';

export const configurationStore = new Map<typeof CONFIGURATION_KEY, WebConfiguration>([
  [CONFIGURATION_KEY, DEFAULT_WEB_CONFIGURATION],
]);
