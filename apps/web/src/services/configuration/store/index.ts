import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';

export const configurationStore: { current: WebConfiguration } = {
  current: DEFAULT_WEB_CONFIGURATION,
};
